# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin
from octoprint.server import user_permission
import re
import requests
import json
import jsonpath_rw


class MQTTSubscribePlugin(octoprint.plugin.SettingsPlugin,
						  octoprint.plugin.AssetPlugin,
						  octoprint.plugin.TemplatePlugin,
						  octoprint.plugin.StartupPlugin):

	def __init__(self):
		self.subscribed_topics = []

	##~~ SettingsPlugin mixin

	def get_settings_defaults(self):
		return dict(
			topics=[],
			api_key=""
		)

	def get_settings_version(self):
		return 3

	def on_settings_migrate(self, target, current=None):
		topics_new = self._settings.get(['topics'])
		if current is None or current < 1:
			topics_new = self.get_settings_defaults()["topics"]
		if current == 1:
			for topic in topics_new:
				# Add new fields and remove unused
				if not topic.get("extract", False):
					topic["extract"] = ""
				if not topic.get("rest", False):
					topic["rest"] = "/api/" + topic["topic"]
				if not topic.get("command", False):
					topic["command"] = topic["subscribecommand"]
					topic.pop("subscribecommand", None)
				if not topic.get("disable_popup", False):
					topic["disable_popup"] = False
				if topic.get("idx", False):
					topic.pop("idx", None)

				# Update topic to remain functional
				topic["topic"] = "octoprint/plugins/mqttsubscribe/" + topic["topic"]
		if current == 2:
			for topic in topics_new:
				if not topic.get("disable_popup", False):
					topic["disable_popup"] = False

		self._settings.set(["topics"], topics_new)

	def on_settings_save(self, data):
		octoprint.plugin.SettingsPlugin.on_settings_save(self, data)

		try:
			to_unsubscribe = list(self.subscribed_topics)
			for topic in self._settings.get(["topics"]):
				if topic["topic"] in self.subscribed_topics:
					if topic["topic"] in to_unsubscribe:
						to_unsubscribe.remove(topic["topic"])
				else:
					self.subscribed_topics.append(topic["topic"])
					self._logger.debug('Subscribing to ' + topic["topic"])
					self.mqtt_subscribe(topic["topic"], self._on_mqtt_subscription)
			# Unsubscribe previously subscribed topics that are no longer listed
			for topic in to_unsubscribe:
				self._logger.debug('Unsubscribing from %s' % topic)
				self.mqtt_unsubscribe(self._on_mqtt_subscription, topic)
		except Exception as e:
			self._logger.debug("Exception: %s" % e)

	##~~ StartupPlugin mixin

	def on_startup(self, host, port):
		self.port = port

	def on_after_startup(self):
		helpers = self._plugin_manager.get_helpers("mqtt", "mqtt_publish", "mqtt_subscribe", "mqtt_unsubscribe")
		if helpers:
			if "mqtt_publish" in helpers:
				self.mqtt_publish = helpers["mqtt_publish"]
			if "mqtt_subscribe" in helpers:
				self.mqtt_subscribe = helpers["mqtt_subscribe"]
				for topic in self._settings.get(["topics"]):
					if topic.get("topic", "") != "" and topic["topic"] not in self.subscribed_topics:
						self.subscribed_topics.append(topic["topic"])
						self._logger.debug('Subscribing to ' + topic["topic"])
						self.mqtt_subscribe(topic["topic"], self._on_mqtt_subscription)
			if "mqtt_unsubscribe" in helpers:
				self.mqtt_unsubscribe = helpers["mqtt_unsubscribe"]

			try:
				self.mqtt_publish("octoprint/plugins/mqttsubscribe/debug", "OctoPrint-MQTTSubscribe monitoring.")
			except Exception as e:
				self._plugin_manager.send_plugin_message(self._identifier, dict(error=str(e)))

	def _substitute(self, s, matches):
		# ls = []
		# isEscaped = False
		# for c in s:
		# 	if isEscaped:
		# 		if c == '\\':
		# 			ls.append('\\')
		# 		elif c == '0':
		# 			ls.append(json.dumps(matches))
		# 		elif c.isdigit():
		# 			ls.append(json.dumps(matches[int (c) - 1]))
		# 		else:
		# 			raise ValueError('Command field contains invalid escape syntax: \\' + c)
		# 		isEscaped = False
		# 	else:
		# 		if c == '\\':
		# 			isEscaped = True
		# 		else:
		# 			ls.append(c)
		# return ''.join(ls)
		s=s.replace("{", "{{").replace("}", "}}")
		regex_double_bracket = re.compile("{{([\d]*)}}", re.MULTILINE)
		s = regex_double_bracket.sub(r"{\1}", s)
		return s.format(*matches)

	def _on_mqtt_subscription(self, topic, message, retained=None, qos=None, *args, **kwargs):
		self._logger.debug("Received from %s|%s" % (topic, message))

		for t in self._settings.get(["topics"]):
			if topic == t["topic"]:
				self._logger.debug("Found match " + t["topic"])
				try:
					address = "localhost"
					port = self.port
					headers = {'Content-type': 'application/json', 'X-Api-Key': self._settings.get(["api_key"])}
					# parse message extraction expression
					extract = t["extract"]
					expr = jsonpath_rw.parse(extract if extract else '$')
					# extract data from message
					if octoprint.util.to_native_str(message).startswith("{"):
						args = [match.value for match in expr.find(json.loads(message))]
					else:
						args = [json.dumps(octoprint.util.to_native_str(message))]
					# substitute matches in command
					data = self._substitute(t["command"], args)
					# substitute matches in REST API
					if t["rest"].startswith("/"):
						url = self._substitute("http://%s:%s%s" % (address, port, t["rest"]), args)
					else:
						url = self._substitute("http://%s:%s/%s" % (address, port, t["rest"]), args)
					if t["type"] == "post":
						r = requests.post(url, data=data, headers=headers)
						self.mqtt_publish(t["topic"] + "/response", '{ "status" : %s, "response" : %s "data" : %s }' % (
						r.status_code, r.text, data))
						if not t.get("disable_popup", False):
							self._plugin_manager.send_plugin_message(self._identifier,
																	 dict(topic=t["topic"], message=message,
																		  command="Status code: %s" % r.status_code))
					if t["type"] == "get":
						r = requests.get(url, headers=headers)
						self.mqtt_publish(t["topic"] + "/response",
										  '{ "status" : %s, "response" : %s }' % (r.status_code, r.text))
						if not t.get("disable_popup", False):
							self._plugin_manager.send_plugin_message(self._identifier,
																	 dict(topic=t["topic"], message=message,
																		  command="Response: %s" % r.text))

				except Exception as e:
					self._logger.error(e)
					self._plugin_manager.send_plugin_message(self._identifier, dict(error=str(e)))

	##~~ AssetPlugin mixin

	def get_assets(self):
		return dict(
			js=["js/jquery-ui.min.js", "js/knockout-sortable.1.2.0.js", "js/mqttsubscribe.js"]
		)

	##~~ TemplatePlugin mixin

	def get_template_configs(self):
		return [
			dict(type="settings", custom_bindings=True)
		]

	##~~ Softwareupdate hook

	def get_update_information(self):
		return dict(
			mqttsubscribe=dict(
				displayName="MQTT Subscribe",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="jneilliii",
				repo="OctoPrint-MQTTSubscribe",
				current=self._plugin_version,
				stable_branch=dict(
					name="Stable", branch="master", comittish=["master"]
				),
				prerelease_branches=[
					dict(
						name="Release Candidate",
						branch="rc",
						comittish=["rc", "master"],
					)
				],

				# update method: pip
				pip="https://github.com/jneilliii/OctoPrint-MQTTSubscribe/archive/{target_version}.zip"
			)
		)


__plugin_name__ = "MQTT Subscribe"
__plugin_pythoncompat__ = ">=2.7,<4"


def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = MQTTSubscribePlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}

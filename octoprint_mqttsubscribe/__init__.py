# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin
from octoprint.server import user_permission
import re
import requests
import json

class MQTTSubscribePlugin(octoprint.plugin.SettingsPlugin,
                         octoprint.plugin.AssetPlugin,
                         octoprint.plugin.TemplatePlugin,
						 octoprint.plugin.StartupPlugin):

	##~~ SettingsPlugin mixin

	def get_settings_defaults(self):
		return dict(
			topics = [dict(idx="1",topic="topic",subscribecommand = "subscribecommand",type="post")],
			api_key = ""
		)

	def get_settings_version(self):
		return 1

	def on_settings_migrate(self, target, current=None):
		if current is None or current < self.get_settings_version():
			self._settings.set(['topics'], self.get_settings_defaults()["topics"])

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
					self._logger.debug('Subscribing to ' + topic["topic"])
					self.mqtt_subscribe("octoprint/plugins/mqttsubscribe/" + topic["topic"], self._on_mqtt_subscription, kwargs=dict(top=topic["topic"],cmd=topic["subscribecommand"],type=topic["type"]))
			if "mqtt_unsubscribe" in helpers:
				self.mqtt_unsubscribe = helpers["mqtt_unsubscribe"]

			try:
				self.mqtt_publish("octoprint/plugins/mqttsubscribe/debug", "OctoPrint-MQTTSubscribe monitoring.")
			except Exception, e:
				self._plugin_manager.send_plugin_message(self._identifier, dict(error=str(e)))

	def _on_mqtt_subscription(self, topic, message, retained=None, qos=None, *args, **kwargs):
		self._logger.debug('Received from ' + topic + '|' + message)

		for t in self._settings.get(["topics"]):
			if topic == "octoprint/plugins/mqttsubscribe/" + t["topic"] and message == t["subscribecommand"]:
				try:
					address = "localhost"
					port = self.port
					headers = {'Content-type': 'application/json','X-Api-Key': self._settings.get(["api_key"])}
					data = "{cmd}".format(**kwargs)
					url = "http://%s:%s/api/%s" % (address,port,"{top}".format(**kwargs))
					if "{type}".format(**kwargs) == "post":
						r = requests.post(url, data=data, headers=headers)
						self.mqtt_publish("octoprint/plugins/mqttsubscribe/status/%s" % r.status_code)
						self.mqtt_publish("octoprint/plugins/mqttsubscribe/response/%s" % r.text)
						self._plugin_manager.send_plugin_message(self._identifier, dict(topic="{top}".format(**kwargs),message=message,subscribecommand="Status code: %s" % r.status_code))
					if "{type}".format(**kwargs) == "get":
						r = requests.get(url, headers=headers)
						self.mqtt_publish("octoprint/plugins/mqttsubscribe/status/%s" % r.status_code)
						self.mqtt_publish("octoprint/plugins/mqttsubscribe/response/%s" % r.text)
						self._plugin_manager.send_plugin_message(self._identifier, dict(topic="{top}".format(**kwargs),message=message,subscribecommand="Response: %s" % r.text))

				except Exception, e:
					self._plugin_manager.send_plugin_message(self._identifier, dict(error=str(e)))

	##~~ AssetPlugin mixin

	def get_assets(self):
		return dict(
			js=["js/mqttsubscribe.js"]
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

				# update method: pip
				pip="https://github.com/jneilliii/OctoPrint-MQTTSubscribe/archive/{target_version}.zip"
			)
		)


__plugin_name__ = "MQTT Subscribe"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = MQTTSubscribePlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}


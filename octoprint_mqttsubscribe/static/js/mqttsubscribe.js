/*
 * View model for OctoPrint-MQTTSubscribe
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function() {
	function MQTTSubscribeViewModel(parameters) {
		var self = this;

		self.loginStateViewModel = parameters[0];
		self.settingsViewModel = parameters[1];

		self.topics = ko.observableArray();
		self.selectedTopic = ko.observable();

		self.onBeforeBinding = function() {
			self.topics(self.settingsViewModel.settings.plugins.mqttsubscribe.topics());
		}

		self.onEventSettingsUpdated = function(payload) {
			self.topics(self.settingsViewModel.settings.plugins.mqttsubscribe.topics());
		}

		self.onDataUpdaterPluginMessage = function(plugin, data) {
			if (plugin != "mqttsubscribe") {
				return;
			}

			if(data.topic) {
				new PNotify({
					title: 'MQTT Command Received for ' + data.topic,
					text: 'message: <pre>' + data.message + '</pre>',
					type: 'info',
					hide: true
					});
			}

			if(data.error) {
				new PNotify({
					title: 'MQTTSubscribe Error',
					text: '<pre>' + data.error + '</pre>',
					type: 'error',
					hide: false
					});
			}
		};

		self.addTopic = function(data) {
			self.settingsViewModel.settings.plugins.mqttsubscribe.topics.push({'topic':ko.observable(''),'extract':ko.observable(''),'type':ko.observable('post'),'rest':ko.observable(''),'command':ko.observable('')});
		}

		self.copyTopic = function(data) {
			self.settingsViewModel.settings.plugins.mqttsubscribe.topics.push({'topic':ko.observable(data.topic()),'extract':ko.observable(data.extract()),'type':ko.observable(data.type()),'rest':ko.observable(data.rest()),'command':ko.observable(data.command())});
		}

		self.removeTopic = function(data) {
			self.settingsViewModel.settings.plugins.mqttsubscribe.topics.remove(data);
		}
	}

	OCTOPRINT_VIEWMODELS.push({
		construct: MQTTSubscribeViewModel,
		dependencies: ["loginStateViewModel", "settingsViewModel"],
		elements: ["#settings_plugin_mqttsubscribe"]
	});
});

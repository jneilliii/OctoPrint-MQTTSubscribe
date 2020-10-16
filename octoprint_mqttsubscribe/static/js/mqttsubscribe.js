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
		self.selected_topic = ko.observable();

		self.retrieving_key = ko.observable(false);

		self.onBeforeBinding = function() {
			self.topics(self.settingsViewModel.settings.plugins.mqttsubscribe.topics());
		}

		self.onEventSettingsUpdated = function(payload) {
			self.topics(self.settingsViewModel.settings.plugins.mqttsubscribe.topics());
		}

		self.onDataUpdaterPluginMessage = function(plugin, data) {
			if (plugin !== "mqttsubscribe") {
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

		self.getAppKey = function() {
			self.retrieving_key(true);
			OctoPrint.plugins.appkeys.authenticate("MQTT Subscribe", self.loginStateViewModel.userMenuText())
				.done(function(api_key) {
					self.settingsViewModel.settings.plugins.mqttsubscribe.api_key(api_key);
					self.retrieving_key(false);
				})
				.fail(function() {
					self.retrieving_key(false);
					new PNotify({
						title: 'MQTTSubscribe Error',
						text: 'There was an error requesting an API key or the request was denied.',
						type: 'error',
						hide: true
						});
				});
		}

		self.showEditor = function(data) {
			self.selected_topic(data);
			$('#mqttTopicEditor').modal('show');
		};

		self.copyKey = function(data){
			copyToClipboard(data.settingsViewModel.settings.plugins.mqttsubscribe.api_key());
		}

		self.removeKey = function(data){
			self.settingsViewModel.settings.plugins.mqttsubscribe.api_key('');
		}

		self.addTopic = function(data) {
			self.selected_topic({'topic':ko.observable(''),
								'extract':ko.observable(''),
								'type':ko.observable('post'),
								'rest':ko.observable(''),
								'command':ko.observable(''),
								'disable_popup':ko.observable(false)
								});
			self.settingsViewModel.settings.plugins.mqttsubscribe.topics.push(self.selected_topic());
			$('#mqttTopicEditor').modal('show');
		}

		self.copyTopic = function(data) {
			self.selected_topic({'topic':ko.observable(data.topic()),
							'extract':ko.observable(data.extract()),
							'type':ko.observable(data.type()),
							'rest':ko.observable(data.rest()),
							'command':ko.observable(data.command()),
							'disable_popup':ko.observable(data.disable_popup())
							});
			self.settingsViewModel.settings.plugins.mqttsubscribe.topics.push(self.selected_topic());
			$('#mqttTopicEditor').modal('show');
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

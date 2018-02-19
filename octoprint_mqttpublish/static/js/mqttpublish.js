/*
 * View model for OctoPrint-MQTTPublish
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function() {
    function MQTTPublishViewModel(parameters) {
        var self = this;

		$("#navbar_plugin_mqttpublish").toggleClass("dropdown");
		
        self.loginStateViewModel = parameters[0];
        self.settingsViewModel = parameters[1];

        self.topics = ko.observableArray();
		self.icon = ko.observable();
		self.enableGCODE = ko.observable();
		self.enableM117 = ko.observable();
		self.topicM117 = ko.observable();
		self.processing = ko.observableArray([]);
		self.selectedTopic = ko.observable();
		self.menugroupat = ko.observable();
		self.groupedTopics = ko.computed(function () {
				var rows = [], current = [];
				rows.push(current);
				for (var i = 0; i < self.topics().length; i += 1) {
					current.push(self.topics()[i]);
					if ((((i + 1) % self.menugroupat()) === 0) && ((i + 1) < self.topics().length)) {
						current = [];
						rows.push(current);
					}
				}
				return rows;
		});
		
		self.onBeforeBinding = function() {
			self.topics(self.settingsViewModel.settings.plugins.mqttpublish.topics());
			self.icon(self.settingsViewModel.settings.plugins.mqttpublish.icon());
			self.enableGCODE(self.settingsViewModel.settings.plugins.mqttpublish.enableGCODE());
			self.enableM117(self.settingsViewModel.settings.plugins.mqttpublish.enableM117());
			self.topicM117(self.settingsViewModel.settings.plugins.mqttpublish.topicM117());
			self.menugroupat(self.settingsViewModel.settings.plugins.mqttpublish.menugroupat());
        }
		
		self.onEventSettingsUpdated = function(payload) {
			self.topics(self.settingsViewModel.settings.plugins.mqttpublish.topics());
			self.icon(self.settingsViewModel.settings.plugins.mqttpublish.icon());
			self.enableGCODE(self.settingsViewModel.settings.plugins.mqttpublish.enableGCODE());
			self.enableM117(self.settingsViewModel.settings.plugins.mqttpublish.enableM117());
			self.topicM117(self.settingsViewModel.settings.plugins.mqttpublish.topicM117());
			self.menugroupat(self.settingsViewModel.settings.plugins.mqttpublish.menugroupat());
		}
		
		self.onDataUpdaterPluginMessage = function(plugin, data) {
			if (plugin != "mqttpublish") {
				return;
			}
			
			if(data.noMQTT) {
				new PNotify({
							title: 'MQTTPublish Error',
							text: 'Missing the <a href="https:\/\/plugins.octoprint.org\/plugins\/mqtt\/" target="_blank">MQTT<\/a> plugin. Please install that plugin to make MQTTPublish operational.',
							type: 'error',
							hide: false
							});
			}
			self.processing.remove(data.topic+'|'+data.publishcommand);
        };
		
		self.mqttpublishClick = function(data) {
			self.processing.push(data.topic()+'|'+data.publishcommand());
			if (data.confirm()) {
				self.selectedTopic(data);
				$("#mqttpublish_confirm").modal("show");
			} else {
				self.sendMQTTmessage(data);
			}
        };
		
		self.sendMQTTmessage = function(data) {
            $.ajax({
                url: API_BASEURL + "plugin/mqttpublish",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "publishcommand",
					topic: data.topic(),
					publishcommand: data.publishcommand()
                }),
                contentType: "application/json; charset=UTF-8"
            }).done(function(){$("#mqttpublish_confirm").modal("hide");});
		}
		
		self.cancelClick = function(data) {
			self.processing.remove(data.topic() + '|' + data.publishcommand());
		}
		
		self.addTopic = function(data) {
			self.settingsViewModel.settings.plugins.mqttpublish.topics.push({'topic':ko.observable(''),'publishcommand':ko.observable(''),'label':ko.observable(''),'icon':ko.observable(''),'confirm':ko.observable(false)});
		}
		
		self.copyTopic = function(data) {
			self.settingsViewModel.settings.plugins.mqttpublish.topics.push({'topic':ko.observable(data.topic()),'publishcommand':ko.observable(data.publishcommand()),'label':ko.observable(data.label()),'icon':ko.observable(data.icon()),'confirm':ko.observable(data.confirm())});
		}
		
		self.removeTopic = function(data) {
			self.settingsViewModel.settings.plugins.mqttpublish.topics.remove(data);
		}
    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: MQTTPublishViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: ["loginStateViewModel", "settingsViewModel"],
        // Elements to bind to, e.g. #settings_plugin_tasmota-mqtt, #tab_plugin_tasmota-mqtt, ...
        elements: ["#settings_plugin_mqttpublish","#navbar_plugin_mqttpublish"]
    });
});

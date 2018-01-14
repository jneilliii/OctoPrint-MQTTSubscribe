/*
 * View model for OctoPrint-MQTTPublish
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function() {
    function MQTTPublishViewModel(parameters) {
        var self = this;

        self.loginStateViewModel = parameters[0];
        self.settingsViewModel = parameters[1];

        self.topics = ko.observableArray();
		self.processing = ko.observableArray([]);
		
		self.onBeforeBinding = function() {
			self.topics(self.settingsViewModel.settings.plugins.mqttpublish.topics());
        }
		
		self.onEventSettingsUpdated = function(payload) {
			self.topics(self.settingsViewModel.settings.plugins.mqttpublish.topics());
		}
		
		self.onDataUpdaterPluginMessage = function(plugin, data) {
			if (plugin != "mqttpublish") {
				return;
			}
			self.processing.remove(data.topic+'|'+data.publishcommand);
        };
		
		self.mqttpublishClick = function(data) {
			self.processing.push(data.topic()+'|'+data.publishcommand());
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
            });
        };
		
		self.addTopic = function(data) {
			self.settingsViewModel.settings.plugins.mqttpublish.topics.push({'topic':ko.observable(''),'publishcommand':ko.observable(''),'icon':ko.observable('icon-play')});
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

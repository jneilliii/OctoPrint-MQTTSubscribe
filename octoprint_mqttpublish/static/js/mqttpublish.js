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

        self.topic = ko.observable();
		self.publishcommand = ko.observable();
		self.processing = ko.observable(false);
		
		self.onBeforeBinding = function() {
			self.topic(self.settingsViewModel.settings.plugins.mqttpublish.topic());
			self.publishcommand(self.settingsViewModel.settings.plugins.mqttpublish.publishcommand());
        }
		
		self.onEventSettingsUpdated = function(payload) {
			self.topic(self.settingsViewModel.settings.plugins.mqttpublish.topic());
			self.publishcommand(self.settingsViewModel.settings.plugins.mqttpublish.publishcommand());
		}
		
		self.onDataUpdaterPluginMessage = function(plugin, data) {
			if (plugin != "mqttpublish") {
				return;
			}
			self.processing(false);
        };
		
		self.mqttpublishClick = function(data) {
			self.processing(true);
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
            }).done(function(){
				console.log('command "'+data.publishcommand()+'" was sent to "'+data.topic()+'".');
				});
        };
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

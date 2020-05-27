# OctoPrint-MQTTSubscribe

This plugin will subscribe to configured topics published to the server configured in the [MQTT Plugin](https://plugins.octoprint.org/plugins/mqtt/) and submit the configured command in settings for that topic to the [OctoPrint REST API](http://docs.octoprint.org/en/master/api/index.html).

## Prerequisites

Install the [MQTT](https://github.com/OctoPrint/OctoPrint-MQTT) plugin via the Plugin Manager or manually using this url:

	https://github.com/OctoPrint/OctoPrint-MQTT/archive/master.zip

## Setup

Install via the Plugin Manager or manually using this URL:

    https://github.com/jneilliii/OctoPrint-MQTTSubscribe/archive/master.zip

## Configuration

Once the MQTT plugin and this plugin are installed, configure the MQTT plugin for connecting to your MQTT server.  Then in this plugin's settings configure the topics/commands you want to subscribe to and generate your API key.

## Settings

![screenshot](settings.png)

### Topics
- List of configured topics
  - Click the plus button to add new topics
  - Click the pencil button to edit a configured topic
  - Click the copy button to duplicate a topic
  - Click the trash icon to delete a topic
### General
- API Key: API key to use to authenticate to the [OctoPrint REST API](http://docs.octoprint.org/en/master/api/index.html)
  - Click the plus button to generate your API key and accept the request
  - Click the trash icon to clear your API key
  - Click the copy button to copy the API key to your clipboard

## MQTT Topic Editor

![screenshot](settings_topic_editor.png)

- Topic: MQTT topic to subscribe to for commands
- JSONPath Extract: JSON Path expression to extract from sent data
- Type: The type of REST API submission, either post or get.
- REST API: The [OctoPrint REST API](http://docs.octoprint.org/en/master/api/index.html) command that you want to submit
- REST Parameters: The `JSON parameters` to submit to the REST API configured above

## Get Help

If you experience issues with this plugin or need assistance please use the issue tracker at the plugin's Homepage linked on the right.

### Additional Plugins

Check out my other plugins [here](https://plugins.octoprint.org/by_author/#jneilliii)

### Support My Efforts
I, jneilliii, programmed this plugin for fun and do my best effort to support those that have issues with it, please return the favor and leave me a tip or become a Patron if you find this plugin helpful and want me to continue future development.

[![Patreon](patreon-with-text-new.png)](https://www.patreon.com/jneilliii) [![paypal](paypal-with-text.png)](https://paypal.me/jneilliii)

<small>No paypal.me? Send funds via PayPal to jneilliii&#64;gmail&#46;com</small>

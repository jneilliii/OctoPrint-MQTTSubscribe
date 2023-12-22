# MQTT Subscribe

This plugin can control OctoPrint by submitting commands to the [OctoPrint REST API](http://docs.octoprint.org/en/master/api/index.html).

## Prerequisites

Install the [MQTT](https://github.com/OctoPrint/OctoPrint-MQTT) plugin via the Plugin Manager or manually using this url:

	https://github.com/OctoPrint/OctoPrint-MQTT/archive/master.zip

Once installed configure the MQTT server connection in the MQTT plugin's settings. This will be the same server that the MQTT Subscribe plugin will connect to for subscribing configured topics.

## Setup

Install via the Plugin Manager or manually using this URL:

    https://github.com/jneilliii/OctoPrint-MQTTSubscribe/archive/master.zip

## Configuration

Once both plugins are installed configure the topics/commands you want to subscribe/submit to and generate your API key.

## Settings

![settings screenshot](settings.png)

### Topics
- List of configured topics
  - Click the plus button in the top right to add new topics
  - Click the pencil button to edit a configured topic
  - Click the copy button to duplicate a topic
  - Click the trash icon to delete a topic
### General
- API Key: API key to use to authenticate to the [OctoPrint REST API](http://docs.octoprint.org/en/master/api/index.html)
  - Click the plus button to generate your API key and accept the request
  - Click the trash icon to clear your API key
  - Click the copy button to copy the API key to your clipboard

## MQTT Topic Editor

![topic editor screenshot](settings_topic_editor.png)

- Topic: MQTT topic to subscribe
- JSONPath Extract: JSON Path expression to extract from sent data, see [here](https://github.com/jneilliii/OctoPrint-MQTTSubscribe/issues/7#issuecomment-582166178) for an example, leave blank if substitution is not necessary in the `REST Parameters` described below
- Type: The type of REST API submission, either post or get
- REST API: The [OctoPrint REST API](http://docs.octoprint.org/en/master/api/index.html) command that you want to submit
- REST Parameters: The `JSON parameters` to submit to the REST API configured above.

To substitute a portion of the REST parameters or the REST API URL for a parameter from the output of JSONPath Extract, use Python-style string-substitution, like e.g. below:  

JSON the plugin receives via the MQTT topic: `{"mycommand":"disconnect"}`  
JSONPath Extract: `$.mycommand`  
Rest Parameters: `{"command":"{0}"}`  
The output that gets sent to the API: `{"command":"disconnect"}`

## Most Recent Release

**[0.1.7](https://github.com/jneilliii/OctoPrint-MQTTSubscribe/releases/tag/0.1.7)** (3/26/2022)

**Updated**

* remove whitespace requirements with opening/closing curly brackets in REST parameters

### [All Releases](https://github.com/jneilliii/OctoPrint-MQTTSubscribe/releases)

## Get Help

If you experience issues with this plugin or need assistance please use the issue tracker by clicking issues above.

### Additional Plugins

Check out my other plugins [here](https://plugins.octoprint.org/by_author/#jneilliii)

### Sponsors
- Andreas Lindermayr
- [@TheTuxKeeper](https://github.com/thetuxkeeper)
- [@tideline3d](https://github.com/tideline3d/)
- [SimplyPrint](https://simplyprint.io/)
- [Andrew Beeman](https://github.com/Kiendeleo)
- [Calanish](https://github.com/calanish)
- [Lachlan Bell](https://lachy.io/)
- [Jonny Bergdahl](https://github.com/bergdahl)
- [Leigh Johnson](https://github.com/leigh-johnson)
- [Stephen Berry](https://github.com/berrystephenw)
- [Steve Dougherty](https://github.com/Thynix)
## Support My Efforts
I, jneilliii, programmed this plugin for fun and do my best effort to support those that have issues with it, please return the favor and leave me a tip or become a Patron if you find this plugin helpful and want me to continue future development.

[![Patreon](patreon-with-text-new.png)](https://www.patreon.com/jneilliii) [![paypal](paypal-with-text.png)](https://paypal.me/jneilliii)

<small>No paypal.me? Send funds via PayPal to jneilliii&#64;gmail&#46;com</small>

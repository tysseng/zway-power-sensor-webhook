/*** PowerSensorWebhook Z-Way Home Automation module *************************************

 Version: 1.0.1
 (c) Z-Wave.Me, 2014

 -----------------------------------------------------------------------------
 Author: Poltorak Serguei <ps@z-wave.me>
 Description:
 Log sensor value in JSON file

 ******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function PowerSensorWebhook(id, controller) {
  // Call superconstructor first (AutomationModule)
  PowerSensorWebhook.super_.call(this, id, controller);
};

inherits(PowerSensorWebhook, AutomationModule);

_module = PowerSensorWebhook;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

PowerSensorWebhook.prototype.init = function (config) {
  console.log("Kickstarted Power Sensor Webhook");
  // Call superclass' init (this will process config argument and so on)
  PowerSensorWebhook.super_.prototype.init.call(this, config);

  // Remember "this" for detached callbacks (such as event listener callbacks)
  var self = this;

  this.handler = function (vDev) {
    var id = vDev.id;
    var value = vDev.get('metrics:level');

    var alias = self.config.alias || '';
    var urlOn = self.config.urlOn;
    var urlOff = self.config.urlOff;
    var urlChange = self.config.urlChange;
    var tresholdOff = self.config.tresholdOff || 0;
    var tresholdOn = self.config.tresholdOn || 0.1;

    if (urlChange && urlChange !== '') {
      console.log("Sensor changed, updating: " + id + '=' + value);
      http.request({
        method: 'GET',
        url: urlChange
          .replace("${id}", id)
          .replace("${value}", value)
          .replace("${alias}", alias)
      });
    }
    if (urlOn && urlOn !== '') {
      if (value >= tresholdOn) {
        console.log("Sensor value is on, updating: " + id + '=' + value);
        http.request({
          method: 'GET',
          url: urlOn
            .replace("${id}", id)
            .replace("${value}", value)
            .replace("${alias}", alias)
        });
      }
    }
    if (urlOff && urlOff !== '') {
      if (value <= tresholdOff) {
        console.log("Sensor value is off, updating: " + id + '=' + value);
        http.request({
          method: 'GET',
          url: urlOff
            .replace("${id}", id)
            .replace("${value}", value)
            .replace("${alias}", alias)
        });
      }
    }
  };

  // Setup metric update event listener
  this.controller.devices.on(this.config.device, "change:metrics:level", this.handler);
};

PowerSensorWebhook.prototype.stop = function () {
  PowerSensorWebhook.super_.prototype.stop.call(this);

  this.controller.devices.off(this.config.device, "change:metrics:level", this.handler);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

// This module doesn't have any additional methods

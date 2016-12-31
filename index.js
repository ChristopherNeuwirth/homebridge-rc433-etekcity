const rpi433    = require('rpi-433');
const rfEmitter = rpi433.emitter({pin: 0, pulseLength: 179});

let Service;
let Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-rc433-etekcity', 'RC433EtekcitySwitch', RC433EtekcitySwitch);
};

class RC433EtekcitySwitch {
  constructor(log, config) {

    // config
    this.name = config['name'];
    this.id = config['id'];
    this.pulse = config['pulse'];
    this.signalOn = config['on'];
    this.signalOff = config['off'];

    // setup
    this.log = log;
    this.service = new Service.Switch(this.name);
    this.setupRcSwitchService(this.service);

    // information service
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Name, 'RC433EtekcitySwitch')
      .setCharacteristic(Characteristic.Manufacturer, 'CN')
      .setCharacteristic(Characteristic.Model, 'Etekcity ' + this.name)
      .setCharacteristic(Characteristic.SerialNumber, '1337-' + this.id);

  }

  getServices() {
    return [this.informationService, this.service];
  }

  setupRcSwitchService(service) {
    let state = false;

    service
      .getCharacteristic(Characteristic.On)
      .on('set', (value, callback) => {
        state = value;
        if(state) {
          this.toggleSwitch(this.signalOn);
        } else {
          this.toggleSwitch(this.signalOff);
        }
        callback();
      });

    service
      .getCharacteristic(Characteristic.On)
      .on('get', (callback) => {
        callback(null, state);
      });
  }

  toggleSwitch(signal) {
    rfEmitter.sendCode(signal, function(error, stdout) {
      if(error) {
        console.log('error ' + error);
      } else {
        console.log('success ' + stdout);
      };
    });
  }

}

'use strict';

const socket = require('abstract-socket');
const dbus = require('dbus').getBus('session');
const tap = require('@rokid/tapdriver');
const EventEmitter = require('events').EventEmitter;
const meta = {
  objectPath: '/rokid/openvoice',
  interface: 'rokid.openvoice.AmsExport',
};

function createTapReceiver(onready, handler) {
  const server = socket.createServer((socket) => {
    let data = [];
    socket.on('data', function(chunk) {
      let code, i = 0;
      while (code = chunk[i]) {
        if (code !== 10) {
          data.push(code);
        } else {
          const linestr = new Buffer(data).toString('utf8');
          handler(linestr);
          data = [];
        }
        i += 1;
      }
    });
  });
  server.on('listening', onready);
  server.listen(tap.namespace);
  return server;
}

/**
 * @class VoiceDispatcher
 */
class VoiceDispatcher extends EventEmitter {
  /**
   * @method constructor
   * @param {Function} onstart
   */
  constructor(onstart) {
    super();
    this._task = [];
    this._apis = null;
    this._onstart = onstart;
    dbus.getInterface('com.rokid.AmsExport', meta.objectPath, meta.interface, (err, apis) => {
      if (err) {
        throw err;
      }
      this._apis = apis;
      this._receiver = createTapReceiver(
        () => this.start(), this.onReceiveLine.bind(this));
    });
  }
  /**
   * @method onReceiveLine
   */
  onReceiveLine(line) {
    if (line === 'ok') {
      const hasCb = !!this._onstart.length;
      if (hasCb) {
        this._onstart(this.finish.bind(this));
      } else {
        this._onstart();
        this.finish();
      }
    } else {
      this.emit('line', line);
    }
  }
  /**
   * @method start
   */
  start() {
    if (!this._apis)
      throw new Error('API does not get initialized');
    this._apis.SetTesting(true);
  }
  /**
   * @method finish
   */
  finish(cb) {
    if (!this._apis)
      throw new Error('API does not get initialized');
    this._apis.SetTesting(false, () => {
      this._receiver.close();
      dbus.disconnect();
      if (typeof cb === 'function') cb();
    });
  }
  /**
   * @method sendVoiceCommand
   * @param {String} asr
   * @param {Object} nlp
   * @param {Object} action
   */
  sendVoiceCommand(asr, nlp, action) {
    if (!this._apis)
      throw new Error('API does not get initialized');
    nlp.testing = true;
    this._apis.SendIntentRequest(asr, 
      JSON.stringify(nlp, null, 0), 
      JSON.stringify(action, null, 0));
  }
}

exports.VoiceDispatcher = VoiceDispatcher;

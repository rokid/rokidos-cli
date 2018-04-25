'use strict';

const Agent = require('./agent').Agent;
let ovsInstance = null;

/**
 * @class OpenVoiceService
 */
class OpenVoiceService {
  constructor() {
    this._agent = new Agent();
  }
  login(username, password) {
    return this._agent.login(username, password);
  }
  listSkills() {
    return this._agent.listSkills();
  }
  listIntents(id) {
    return this._agent.listIntents(id);
  }
  uploadIntents(id, intents, autoCompile) {
    return this._agent.uploadIntents(id, intents, autoCompile);
  }
  testIntents(appId, sentence) {
    return this._agent.testIntents(appId, sentence);
  }
}

function getClient() {
  if (!ovsInstance)
    ovsInstance = new OpenVoiceService();
  return ovsInstance;
}

exports.getClient = getClient;
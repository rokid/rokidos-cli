'use strict';

const fs = require('fs');
const ora = require('ora');
const axios = require('axios');
const crypto = require('crypto');

const SKILL_ENDPOINT = 'https://developer.rokid.com';
const CONFIG_PATH = `/Users/${process.env.USER}/.rokid`;

class Agent {
  constructor() {
    this._cookies = null;
    this.ensureConfigDir();
    this.loadConfig();
    this.init();
  }
  async login(username, password) {
    const body = {
      userName: username,
      password: crypto.createHash('md5').update(password).digest('hex'),
    };
    const response = await axios.post(
      'https://account.rokid.com/login.do', body);
    this._cookies = response.headers['set-cookie'];
    this.saveConfig();
    this.init();
  }
  async listSkills() {
    const response = await this.$http.get(
      '/skill/apps.do?page_num=1&page_size=20');
    return response.data;
  }
  async listIntents(id) {
    const skill = await this.getSkillByAppId(id);
    const response = await this.$http.get(
      `${SKILL_ENDPOINT}/skill/domains/${id}/${skill.domainId}.do`);
    return response.data;
  }
  async getSkillByAppId(id) {
    const response = await this.$http.get(`/skill/apps/${id}.do`);
    return response.data;
  }
  async uploadIntents(id, intents, autoCompile) {
    const skill = await this.getSkillByAppId(id);
    await this.$http.post(
      `/skill/domains/${id}/${skill.appDetailId}/${skill.domainId}/intents.do`, intents);

    if (autoCompile) {
      await this.compile(skill.domainId);
    }
    return skill;
  }
  async compile(domainId) {
    const spinner = ora('正在上传').start();
    const response = await this.$http.get(`/skill/domains/${domainId}/compile.do`);
    return new Promise((resolve, reject) => {
      spinner.text = '编译中';
      const checker = setInterval(async () => {
        const pending = await this.$http.get('/skill/apps/nlpsc/sc/query.do', {
          params: { domainId },
        });
        if (pending.data.status === 2) {
          clearInterval(checker);
          spinner.succeed(pending.data.msg || '编译成功');
          resolve(true);
        }
      }, 2000);
    });
  }
  async testIntents(appId, sentence) {
    const response = await this.$http.get(`/skill/integration-test/nlp/test.do`, {
      params: {
        appId,
        sentence,
      },
    });
    return response.data;
  }
  init() {
    this.$http = axios.create({
      baseURL: SKILL_ENDPOINT,
      headers: {
        cookie: this._cookies.join('; '),
      }
    });
  }
  ensureConfigDir() {
    var exists = fs.existsSync(CONFIG_PATH);
    if (!exists) {
      fs.mkdirSync(CONFIG_PATH);
    }
    var profileExists = fs.existsSync(CONFIG_PATH + '/profile.json');
    if (!profileExists) {
      fs.writeFileSync(CONFIG_PATH + '/profile.json', '{}');
    }
  }
  saveConfig() {
    if (this._cookies) {
      fs.writeFileSync(CONFIG_PATH + '/profile.json', JSON.stringify({
        cookies: this._cookies
      }))
    }
  }
  loadConfig() {
    var data = require(CONFIG_PATH + '/profile.json');
    this._cookies = data.cookies;
  }
}

exports.Agent = Agent;
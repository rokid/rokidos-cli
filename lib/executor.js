#!/usr/bin/env node

const fs = require('fs');
const VoiceDispatcher = require('./utils').VoiceDispatcher;

const appid = process.argv[2] || 'rokidcloudappclient';
const asserts = [];
const redify = (text) => '\033[31m' + text + '\033[0m';
const greyify = (text) => '\033[33m' + text + '\033[0m';

const dispatcher = new VoiceDispatcher(appid, function(done) {
  function testApi(description, callback) {
    console.info(description);
    callback({
      send: dispatcher.sendVoiceCommand.bind(dispatcher),
      assert: (name, expect, callback) => {
        asserts.push({name, expect, callback});
      }
    });
  }
  process.stdin.on('data', (chunk) => {
    if (chunk == 'exit\n') {
      done();
    }
  });

  const tests = fs.readdirSync('/tmp/tests/tests');
  for (let i = 0; i < tests.length; i++) {
    const script = fs.readFileSync(`/tmp/tests/tests/${tests[i]}`, 'utf8');
    const exec = new Function('test', 'require', script);
    exec(testApi, require);
  }
});

dispatcher.on('line', (line) => {
  const parsed = line.split(' ');
  let name = parsed[1];
  let val = JSON.parse(parsed[2] || '');
  if (typeof val === 'string') {
    val = val.replace(/^"/, '').replace(/"&/, '');
  }
  const item = asserts[0];
  if (!item) {
    console.info(greyify(` skip ${name} ${JSON.stringify(val)}`));
    return;
  }
  if (item.name !== name) {
    console.info(greyify(` skip ${name} ${JSON.stringify(val)}`));
    return;
  }
  asserts.shift();

  // FIXME(yazhong): deepAssert
  if (JSON.stringify(item.expect) !== JSON.stringify(val)) {
    console.error(redify(` notOk expect ${name} to be ${JSON.stringify(item.expect)}, but ${JSON.stringify(val)}`))
  } else {
    if (typeof item.callback === 'function') item.callback();
    console.info(' .' + line.replace(/\n/, ''));
  }
});
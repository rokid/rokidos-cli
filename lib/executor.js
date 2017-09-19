#!/usr/bin/env node

const fs = require('fs');
const assert = require('assert');
const VoiceDispatcher = require('./utils').VoiceDispatcher;

const appid = process.argv[2] || 'rokidcloudappclient';
const asserts = [];
const redify = (text) => '\033[31m' + text + '\033[0m';
const greyify = (text) => '\033[33m' + text + '\033[0m';

const dispatcher = new VoiceDispatcher(appid, function(done) {
  function testApi(description, callback) {
    console.info(description);
    const props = {
      send: dispatcher.sendVoiceCommand.bind(dispatcher),
      events: [],
      assert: (name, expect, callback) => {
        if (typeof expect === 'function') {
          callback = expect;
          expect = null;
        }
        return new Promise((resolve) => {
          function onresult(err, name, res) {
            props.events.push(name);
            if (err) {
              resolve(false, name, res);
            } else {
              resolve(true, name, res);
              if (typeof callback === 'function') 
                return callback(res);
            }
          }
          asserts.push({ name, expect, onresult });
        });
      },
      // instance
      fail: assert.fail.bind(assert),
      ok: assert.ok.bind(assert),
      equal: assert.equal.bind(assert),
      notEqual: assert.equal.bind(assert),
      deepEqual: assert.deepEqual.bind(assert),
      notDeepEqual: assert.notDeepEqual.bind(assert),
      throws: assert.throws.bind(assert),
      doesNotThrow: assert.doesNotThrow.bind(assert),
      ifError: assert.ifError.bind(assert),
    };
    callback(props);
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

  let expect = item.expect;
  let actual = val;
  let called = false;

  if (!item.expect) {
    expect = true;
    actual = item.onresult(null, actual);
    called = true;
  }

  try {
    assert.deepEqual(expect, actual);
    console.info(' .' + line.replace(/\n/, ''));
    if (!called)
      item.onresult(null, name, val);
  } catch (err) {
    console.error(redify(` notOk ${err.message}`));
    item.onresult(err, name);
  }
});
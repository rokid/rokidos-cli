#!/usr/bin/env node

const fs = require('fs');
const assert = require('assert');
const VoiceDispatcher = require('./utils').VoiceDispatcher;

const appid = process.argv[2] || 'rokidcloudappclient';
const cases = [];
const asserts = [];
const redify = (text) => '\033[31m' + text + '\033[0m';
const greyify = (text) => '\033[1;30m' + text + '\033[0m';
const greenify = (text) => '\033[32m' + text + '\033[0m';

class TestCase {
  constructor(dispatcher, success, fail) {
    // this._asserts = [];
    this._events = [];
    this._dispatcher = dispatcher;
    this._success = success;
    this._fail = fail;
  }
  get events() {
    return this._events;
  }
  send(...args) {
    const d = this._dispatcher;
    return d.sendVoiceCommand.apply(d, args);
  }
  assert(name, expect, callback) {
    if (typeof expect === 'function') {
      callback = expect;
      expect = null;
    }
    return new Promise((resolve, reject) => {
      function onresult(err, name, res) {
        if (err) {
          reject(err);
        } else {
          resolve(true, name, res);
          if (typeof callback === 'function') 
            return callback(res);
        }
      }
      asserts.push({
        name, 
        expect, 
        onresult
      });
    });
  }
  fail(...args) {
    assert.fail.apply(assert, args);
    this._fail();
  }
  ok(...args) {
    return assert.ok.apply(assert, args);
  }
  equal(...args) {
    return assert.equal.apply(assert, args);
  }
  notEqual(...args) {
    return assert.notEqual.apply(assert, args);
  }
  deepEqual(...args) {
    return assert.deepEqual.apply(assert, args);
  }
  notDeepEqual(...args) {
    return assert.notDeepEqual.apply(assert, args);
  }
  throws(...args) {
    return assert.throws.apply(assert, args);
  }
  doesNotThrow(...args) {
    return assert.doesNotThrow.apply(assert, args);
  }
  ifError(...args) {
    return assert.ifError.apply(assert, args);
  }
  done() {
    this._success();
  }
}

const dispatcher = new VoiceDispatcher(appid, function(done) {
  function test(title, callback) {
    cases.push({
      title,
      callback
    });
  }
  process.stdin.on('data', (chunk) => {
    if (chunk == 'exit\n') 
      done();
  });

  const tests = fs.readdirSync('/tmp/tests/tests');
  for (let i = 0; i < tests.length; i++) {
    const script = fs.readFileSync(`/tmp/tests/tests/${tests[i]}`, 'utf8');
    const exec = new Function('test', 'require', script);
    exec(test, require);
  }

  let ctest;
  function runTest() {
    ctest = cases.shift();
    return new Promise((resolve, reject) => {
      const { title, callback } = ctest;
      const timeout = setTimeout(() => {
        reject(new Error(`"${title}" timeout, please use t.done()`));
      }, 150*1000);
      console.info(title);
      function success(...args) {
        clearTimeout(timeout);
        resolve.apply(null, args);
      }
      function fail(...args) {
        clearTimeout(timeout);
        reject.apply(null, args);
      }
      callback(new TestCase(dispatcher, success, fail));
    }).then(() => {
      if (cases.length === 1) 
        return runTest();
    });
  }

  // Run test
  runTest().then(() => {
    process.exit();
  }).catch((err) => {
    console.error(err && err.stack);
    process.exit();
  });
});

dispatcher.on('line', (line) => {
  const parsed = line.split(' ');
  let name = parsed[1];
  let val = JSON.parse(parsed[2] || '');
  // events.push(name);

  if (typeof val === 'string') {
    val = val.replace(/^"/, '').replace(/"&/, '');
  }
  const item = asserts[0];
  if (!item) {
    console.info(greyify(` .skip ${name} ${JSON.stringify(val)}`));
    return;
  }
  if (item.name !== name) {
    console.info(greyify(` .skip ${name} ${JSON.stringify(val)}`));
    return;
  }
  asserts.shift();

  let expect = item.expect;
  let actual = val;
  let called = false;

  if (!item.expect) {
    expect = true;
    actual = item.onresult(null, name, val);
    called = true;
  }

  try {
    assert.deepEqual(expect, actual);
    console.info(greenify(' .' + line.replace(/\n/, '')));
    if (!called)
      item.onresult(null, name, val);
  } catch (err) {
    console.error(redify(` notOk ${err.message}`));
    item.onresult(err, name);
  }
});
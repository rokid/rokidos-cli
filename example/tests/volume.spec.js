'use strict';
const volume = require('@rokid/volume');

test('test voice mute', (t) => {
  t.send('若琪我要静音', {
    "appId": "7D0F5E5D5",
    "asr": "我要静音",
    "cloud": false,
    "intent": "volumemute",
    "pattern": "($nowtime|$datetime$parttime?|$twoday|$period|$parttime)?($location)的?$weather$how?",
    "slots": {}
  }, {});

  t.assert('voice', '音量已调到5');
  t.assert('app.statechange', (data) => {
    let vol = volume.volumeGet();
    t.equal(data.state, 'exit');
    t.equal(vol, 5);
    t.done();
    return true;
  });
});
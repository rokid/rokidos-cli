'use strict';

test('test natc', (t) => {
  t.send('若琪我要静音', {
    'appId': 'natc',
    'asr': '我要静音',
    'close': true,
    'cloud': false,
    'intent': 'volumemute',
    'pattern': '($nowtime|$datetime$parttime?|$twoday|$period|$parttime)?($location)的?$weather$how?',
    'slots': {}
  }, {});

});
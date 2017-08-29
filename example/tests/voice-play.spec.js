'use strict';

test('test voice play', (t) => {
  t.send('若琪我要听歌', {
    "appId": "R233A4F187F34C94B93EE3BAECFCE2E3",
    "asr": "我要听音乐",
    "cloud": true,
    "intent": "play_random",
    "pattern": "^$iwant?$play$one?$keyword$",
    "slots":{}
  }, {
    "appId": "R233A4F187F34C94B93EE3BAECFCE2E3",
    "response": {
      "action": {
        "shouldEndSession": false,
        "type": "NORMAL",
        "version": "2.0.0",
        "voice": {
          "item": {}
        }
      },
      "resType": "INTENT",
      "respId": "9B8224CFB466464B8375BCF1BC3A52D2"
    },
    "session":{},
    "startWithActiveWord": true,
    "version": "2.0.0"
  });
  t.assert('tts', '音乐继续');
  t.assert('media.stop', true);
  // t.assert('media.play', );
});
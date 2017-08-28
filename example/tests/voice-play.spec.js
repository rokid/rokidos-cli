'use strict';

test('test voice play', (t) => {
  t.send('若琪我要听音乐', {
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
        "form": "scene",
        "media": {
          "action": "PLAY",
          "disableEvent": false,
          "item": {
            "itemId": "play_random$$ULT$$1245352",
            "offsetInMilliseconds": 0,
            "token": "play_random$$ULT$$1245352",
            "type": "AUDIO",
            "url": "https://music-proxy.rokid-inc.com/content/01/245/1245352-MP3-320K-FTD.mp3?sign=p8sDiQmqAYkZ9jR5wiWTSw8CAnFhPTEwMDM5ODY3Jms9QUtJRE1Fdm53SXdwNFlqUlU1NHhxd3VLQlRYMExOOWdJVFNRJmU9MTUwMzY0Njk1MSZ0PTE1MDM0NzQxNTEmcj0xOTU3OTgxMjMzJmY9L2NvbnRlbnQvMDEvMjQ1LzEyNDUzNTItTVAzLTMyMEstRlRELm1wMyZiPXVsdGltYXRl&transDeliveryCode=RK@21829674@1503474151@S"
          }
        },
        "shouldEndSession": false,
        "type": "NORMAL",
        "version": "2.0.0",
        "voice": {
          "action": "PLAY",
          "disableEvent": true,
          "item": {
            "tts": "音乐继续"
          }
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
'use strict';

test('test 7 play', (t) => {
  t.send('若琪我要听音乐', {
    'appId': 'RCAC74F187F34C94B93EE3BAECFCE2E3',
    'asr': '我要听音乐',
    'cloud': true,
    'intent': 'play_random',
    'pattern': '^$iwant?$play$one?$keyword$',
    'slots': {}
  }, {  
    'appId':'RCAC74F187F34C94B93EE3BAECFCE2E3',
    'response': {     
      'action': {
        'version': '2.0.0',
        'type': 'NORMAL',
        'form': 'scene',
        'shouldEndSession': true,
        'directives': [{
          'type':'voice',
          'action': 'PLAY',
          'disableEvent':false,
          'item': {
            'itemId':'newstestitemid',
            'tts': '晚上好，若琪为您播放晚间新闻摘要，首先我们来看看社会新闻。'
          }
        }, {
          'type':'confirm',
          'confirmIntent': 'nlp intent to confirm',
          'confirmSlot': 'nlp slot to confirm',
          'optionWords': ['word1', 'word2']
        }]
      }
    },
    'startWithActiveWord':false,
    'version':'2.0.0'
  });

  Promise.all([
    t.assert('Voice.FINISHED', {voice: {item: 'newstestitemid'}}),
    t.assert('siren.statechange', 'open'),
  ]).then(() => {
    t.done();
  });
});
/**
 * IntentPatterns (split1ce) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 * T2 thicken split1ce: +enter 我擰門把入去／擰把推門先; +wait 等我唾多陣／俾我唾一陣先; +ask_want 你到底想我點做好呀; +ask_memory 頭先嗰句你記唔記得呀; +off 而家幾點鐘呀喂
 */
(function (global) {
  "use strict";
  var INTENTS = ["ask_want","agree","refuse","enter_door","wait","apologize","flirt","challenge","ask_memory","off_topic","unclear"];
  var PATTERNS = {
    enter_door: [
      /推門/, /開門/, /入去/, /進去/, /推門啦/, /我入去/, /入去先/, /進去看看/,
      /行入/, /go inside/i, /enter/i,
      /開門先/, /推開/, /行入去/, /入去啦/, /開門啦/, /推門先/,
      /我行入去/, /打開門/, /推開佢/, /入去先啦/, /開門吧/,
      /推門入去/, /我推門/, /開門入去/, /扭開門/, /把門扭開/, /扭門入去/, /我去扭門/,
      /門把扭一下/, /扭門把入/, /手扭門把/, /手握把一轉/, /把一轉/, /轉把入/,
      /門把一扭入/, /扭把推入/, /手按把一推/, /把門輕輕推/,
      /輕輕推門入/, /輕輕扭把入/, /手按門把一扭/,
      /手輕輕扭把入/, /輕輕扭門把入/, /手握把輕輕推/, /把輕輕一扭入/, /門把輕輕一推入/,
      /手輕輕推門把入/, /把一擷輕輕入/, /門把輕輕扭推入/, /輕輕一擷門把入/, /把一掛輕輕入/, /輕輕一掛門把入/,
      /幫我開門/, /門打開/, /入屋先/, /推佢入去/, /掛門把入/, /行過去開門/, /手按把推入/, /過咩度入/,
      /我過去開門/, /去開門先/, /幫你推門/, /門畀我開/, /我去開門/,
      /我去推門/, /幫你開門/, /門我四開/, /入去睇下/, /過四開門/, /去推門先/, /開門喎/, /推門吕/,
      /我行過去推門/, /等我去開門/, /門我開啦/, /行前開門/, /過四推門/, /我行前開門/,
      /我去開門啦/, /我四開門/, /門由我開/, /行過去入/, /我行過去入/, /過四入去/,
      /等我推門先/, /我嚟開門/, /門我嚟開/, /行埋去入/, /我行埋去開門/, /過嚟入先/,
      /我幫你推門先/, /等我扭開門先/, /行埋去推/, /我入去睇先/, /過嚟開門/, /開門喎/,
      /我幫你扭門/, /行埋去開門先/, /門我幫你推/, /過嚟推門先/,
      /等我擴門把先/, /我擴把入去/, /行前擴門/, /門把我擴/,
      /我擰門把入去/, /擰把推門先/, /門把我擰開/, /擰門入去/
    ],
    wait: [
      /等等/, /停一停/, /停低/, /未準備/, /我未準備好/, /hold on/i, /wait/i,
      /等陣/, /等一下/, /等一等/, /慢啲/, /唔好急/, /等我一陣/, /稍等/, /等我先/,
      /等我唾吓氣先/, /唔好催住先/, /我要唾吓氣先/, /慢啲唔好趕我/,
      /等我唾多兩秒/, /等我唾吓先/, /唔好迫住我/, /等陣唔好趕/, /慢住先唔好迫/,
      /等我唾多陣/, /俾我唾一陣先/, /唔好趕住先/, /俾我唾吓先/
    ],
    ask_want: [
      /你想我點/, /而家點/, /下一步/, /跟住點/, /what now/i,
      /你想我點做好先呀/, /究竟跟住點/, /你究竟要我點先/,
      /你到底要我點做好/, /跟住究竟點先/, /你而家想我點樣/,
      /你到底想我點做好呀/, /而家究竟要我點/
    ],
    agree: [/^(?:好|係|ok|yes|得)$/i],
    refuse: [/唔入/, /我唔入/, /唔想推門/, /我唔想/, /\bno\b/i, /唔得/, /唔想入/, /唔開門/, /我唔推/, /唔好入/],
    apologize: [/對唔住/, /sorry/i],
    flirt: [/面/],
    challenge: [/憑呀/],
    ask_memory: [
      /記得/, /你記得/, /你記得我頭先講呀/, /頭先講/,
      /你記唔記得我頭先講過啲乜/, /頭先嗰句我講咩嚟/, /頭先嗰句講過乜/,
      /頭先嗰句你仲記唔記/, /我頭先講嗰句重記得未/,
      /頭先嗰句你記唔記得呀/, /你重記唔記得頭先/
    ],
    off_topic: [/天氣/, /今日天氣/, /chatgpt/i, /你係咪 AI/, /落雨/, /openai/i, /chatbot/i, /而家幾點/, /而家幾點鐘喎/, /而家幾點呀喂/, /出面凍到震未/, /而家幾點鐘呀喂/]
  };
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:{},KEY_SYNONYMS:{},ACCEPTANCE_SOFT:[{text:"開門啦",intent:"enter_door"},{text:"我入去先",intent:"enter_door"},{text:"進去看看",intent:"enter_door"},{text:"等等",intent:"wait"},{text:"我未準備好",intent:"wait"},{text:"你想我點？",intent:"ask_want"},{text:"今日天氣點呀",intent:"off_topic"},{text:"你記得我頭先講呀",intent:"ask_memory"},{text:"推門",intent:"enter_door"},{text:"停一停",intent:"wait"},{text:"我幫你扭門",intent:"enter_door"},{text:"行埋去開門先",intent:"enter_door"},{text:"等我唾吓先",intent:"wait"},{text:"唔好迫住我",intent:"wait"},{text:"你想我點做好先呀",intent:"ask_want"},{text:"頭先嗰句我講咩嚟",intent:"ask_memory"},{text:"而家幾點鐘喎",intent:"off_topic"},{text:"等我擴門把先",intent:"enter_door"},{text:"等我唾多兩秒",intent:"wait"},{text:"你到底要我點做好",intent:"ask_want"},{text:"頭先嗰句你仲記唔記",intent:"ask_memory"},{text:"而家幾點呀喂",intent:"off_topic"},{text:"我擰門把入去",intent:"enter_door"},{text:"擰把推門先",intent:"enter_door"},{text:"等我唾多陣",intent:"wait"},{text:"俾我唾一陣先",intent:"wait"},{text:"你到底想我點做好呀",intent:"ask_want"},{text:"頭先嗰句你記唔記得呀",intent:"ask_memory"},{text:"而家幾點鐘呀喂",intent:"off_topic"}],version:"split1ce"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);

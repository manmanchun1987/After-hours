/**
 * IntentPatterns (split1bq) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 * T2 thicken split1bq: +enter 手輕輕推門把入／把一擰輕輕入／門把輕輕扭推入／輕輕一擰門把入; +wait 等我唞吓／唞一陣／唞一唞; +ask_memory 頭先嗰句講咩嚟; +ask_want 而家跟住點做好先
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
      /手輕輕推門把入/, /把一擷輕輕入/, /門把輕輕扭推入/, /輕輕一擷門把入/, /把一擰輕輕入/, /輕輕一擰門把入/
    ],
    wait: [
      /等等/, /停一停/, /停低/, /未準備/, /我未準備好/, /hold on/i, /wait/i,
      /等陣/, /等一下/, /等一等/, /慢啲/, /唔好急/, /等我一陣/, /稍等/, /等我先/,
      /等我唍吓/, /唍一陣/, /唍一唍/, /等我唍一唍/, /唍吓先/,
      /等我唞吓/, /唞一陣/, /唞一唞/, /等我唞一唞/, /唞吓先/
    ],
    ask_want: [
      /你想我點/, /而家點/, /下一步/, /跟住點/, /而家跟住點/, /what now/i,
      /而家跟住點做好啦/, /你而家要我點做好/, /而家跟住點做好/,
      /而家跟住點做好先/, /你而家要我點做先/
    ],
    agree: [/^(?:好|係|ok|yes|得)$/i],
    refuse: [/唔入/, /我唔入/, /唔想推門/, /我唔想/, /\bno\b/i, /唔得/, /唔想入/, /唔開門/, /我唔推/, /唔好入/],
    apologize: [/對唔住/, /sorry/i],
    flirt: [/靤/],
    challenge: [/憑呀/],
    ask_memory: [
      /記得/, /你記得/, /你記得我頭先講呀/, /頭先講/,
      /溫書未/, /背過未/, /你記唔記得頭先/,
      /頭先講過呀/, /頭先嗰句講咩嚟/, /你頭先講過嗰句嚟/, /頭先講嗰句係咩嚟/
    ],
    off_topic: [/天氣/, /今日天氣/, /chatgpt/i, /你係咪 AI/, /落雨/, /openai/i, /chatbot/i, /而家幾點/, /出面熱唔熱/]
  };
  var SOFT_LEXICON = {
    enter_door: ["開門", "入去", "推門", "進去", "開門啦", "扭開門", "手輕輕推門把入", "把一擰輕輕入", "門把輕輕扭推入", "輕輕一擰門把入"],
    wait: ["等等", "停低", "未準備", "等我唍吓", "等我唞吓", "唞一陣", "唞一唞"],
    refuse: ["唔入", "唔想推", "唔得"],
    agree: ["好", "得", "ok"],
    flirt: ["靤"],
    ask_want: ["你想", "而家點", "跟住點", "而家跟住點做好先", "你而家要我點做先"],
    apologize: ["sorry", "對唔住"],
    off_topic: ["天氣", "chatgpt", "AI"],
    ask_memory: ["記得", "頭先講過呀", "頭先嗰句講咩嚟"]
  };
  var KEY_SYNONYMS = {
    enter_door: ["開門", "入去", "推門", "手輕輕推門把入", "把一擰輕輕入"],
    wait: ["等等", "停", "等我唞吓", "唞一唞"],
    refuse: ["唔入"],
    agree: ["好"],
    flirt: ["靤"],
    ask_want: ["想", "而家點", "跟住點", "而家跟住點做好先"],
    apologize: ["sorry"],
    ask_memory: ["記得", "頭先嗰句講咩嚟"]
  };
  var ACCEPTANCE_SOFT = [
    {text:"開門啦",intent:"enter_door"},
    {text:"我入去先",intent:"enter_door"},
    {text:"進去看看",intent:"enter_door"},
    {text:"等等",intent:"wait"},
    {text:"我未準備好",intent:"wait"},
    {text:"你想我點？",intent:"ask_want"},
    {text:"今日天氣點呀",intent:"off_topic"},
    {text:"你記得我頭先講呀",intent:"ask_memory"},
    {text:"推門",intent:"enter_door"},
    {text:"停一停",intent:"wait"},
    {text:"手輕輕推門把入",intent:"enter_door"},
    {text:"把一擰輕輕入",intent:"enter_door"},
    {text:"門把輕輕扭推入",intent:"enter_door"},
    {text:"輕輕一擰門把入",intent:"enter_door"},
    {text:"等我唞吓",intent:"wait"},
    {text:"唞一陣",intent:"wait"},
    {text:"唞一唞",intent:"wait"},
    {text:"頭先嗰句講咩嚟",intent:"ask_memory"},
    {text:"你頭先講過嗰句嚟",intent:"ask_memory"},
    {text:"頭先講嗰句係咩嚟",intent:"ask_memory"},
    {text:"而家跟住點做好先",intent:"ask_want"},
    {text:"你而家要我點做先",intent:"ask_want"}
  ];
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:SOFT_LEXICON,KEY_SYNONYMS:KEY_SYNONYMS,ACCEPTANCE_SOFT:ACCEPTANCE_SOFT,version:"split1bq"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);

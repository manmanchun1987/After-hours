/**
 * IntentPatterns (split1w) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 * T2 thicken: memory family 記得/記住/記低/聽低/寫低/抄低/複述/講返/頭先講/講過未
 */
(function (global) {
  "use strict";
  var INTENTS = ["ask_want","agree","refuse","enter_door","wait","apologize","flirt","challenge","ask_memory","off_topic","unclear"];
  var PATTERNS = {
    enter_door: [
      /推門/, /開門/, /入去/, /進去/, /推門啦/, /我入去/, /入去先/, /進去看看/,
      /行入/, /推門啦/, /go inside/i, /enter/i
    ],
    wait: [
      /等等/, /停一停/, /停低/, /未準備/, /我未準備好/, /諸吓/, /諳吓/,
      /hold on/i, /wait/i
    ],
    ask_want: [
      /你想我點/, /我而家應該做咩/, /應該做咩/, /你想我點樣/, /what now/i
    ],
    agree: [/^(好|係|ok|yes|得)$/i],
    refuse: [/唔入/, /我唔入/, /唔想推門/, /我唔想/, /\bno\b/i],
    apologize: [/對唔住/, /對唔住呀/, /sorry/i],
    flirt: [/靚/, /好靚/],
    challenge: [/憑咩/, /你憑咩/],
    ask_memory: [
      /記得/, /你記得/, /你記得我頭先講咩/, /頭先講咩/, /頭先講/,
      /講返出嚟/, /講返/, /記住咋未/, /記住未/, /有冇記住/, /有冇記得/,
      /有冇記低/, /記低未/, /記低咋未/, /記低哉未/, /聽低未/, /寫低未/,
      /抄低未/, /抄低/, /複述吓/, /複述一次/, /重講一次/, /聽到未呀/,
      /有冇記住/, /講過未/, /我頭先話/, /你記唔記得/, /記唔記得我想開門/
    ],
    off_topic: [/天氣/, /今日天氣/, /chatgpt/i, /你係咪 AI/, /你係咪程式/]
  };
  var SOFT_LEXICON = {
    enter_door: ["開門", "入去", "推門", "進去", "入去先"],
    wait: ["等等", "停低", "未準備", "諳吓"],
    refuse: ["唔入", "唔想推"],
    agree: ["好", "得", "ok"],
    flirt: ["靚"],
    ask_want: ["你想", "應該做"],
    apologize: ["sorry", "對唔住"],
    off_topic: ["天氣", "chatgpt", "AI"],
    ask_memory: ["記得", "講返", "記低", "聽低", "寫低", "抄低", "複述", "頭先講", "講過未", "記住"]
  };
  var KEY_SYNONYMS = {
    enter_door: ["開門", "入去", "推門"],
    wait: ["等等", "停"],
    refuse: ["唔入"],
    agree: ["好"],
    flirt: ["靚"],
    ask_want: ["想", "應該"],
    apologize: ["sorry"],
    ask_memory: ["記得", "講返", "記低", "頭先"]
  };
  var ACCEPTANCE_SOFT = [
    {text:"開門啦",intent:"enter_door"},
    {text:"我入去先",intent:"enter_door"},
    {text:"進去看看",intent:"enter_door"},
    {text:"等等",intent:"wait"},
    {text:"我未準備好",intent:"wait"},
    {text:"你想我點？",intent:"ask_want"},
    {text:"今日天氣點呀",intent:"off_topic"},
    {text:"講返出嚟",intent:"ask_memory"},
    {text:"你記得我頭先講咩",intent:"ask_memory"},
    {text:"記低未",intent:"ask_memory"},
    {text:"講過未",intent:"ask_memory"},
    {text:"我頭先話開門",intent:"ask_memory"}
  ];
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:SOFT_LEXICON,KEY_SYNONYMS:KEY_SYNONYMS,ACCEPTANCE_SOFT:ACCEPTANCE_SOFT,version:"split1w"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);

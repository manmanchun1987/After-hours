/**
 * IntentPatterns — Lane A (split1ff)
 * 粵語同義／模糊／錯字 → 結構化意圖
 * Soft-pass: 非原文亦過關。推門唔係唯一認法。
 */
(function (global) {
  "use strict";

  var INTENTS = [
    "enter_door", "wait", "ask_want", "off_topic", "refuse", "agree",
    "apologize", "flirt", "challenge", "ask_memory", "unclear"
  ];

  var PATTERNS = {
    enter_door: [
      /開門(啦|喇|呀|吧)?/,
      /我入(去|嚟)先/,
      /進去看看/,
      /行入去/,
      /推門(入|去)?/,
      /入門/,
      /進入/,
      /入嚟/,
      /入去睇下/,
      /開個門/,
      /推開(佢|門)/,
      /我入/,
      /入定/,
      /行入/,
      /開門入/,
      /推入去/
    ],
    wait: [
      /等等/,
      /我未準備好/,
      /停(一停|低|住)?/,
      /等(陣|一等|下)/,
      /企定/,
      /站住/,
      /再推/,
      /未準備/,
      /猶豫/,
      /停一下/,
      /等我/,
      /先停/,
      /唔好入住/
    ],
    ask_want: [
      /你想我點/,
      /你想(我|點)/,
      /應該點(做|樣)/,
      /點算/,
      /指引/,
      /你想點/,
      /教我/,
      /點做先/,
      /你要我點/,
      /想我點樣/
    ],
    off_topic: [
      /天氣/,
      /今日天氣/,
      /食咗飯未/,
      /幾點/,
      /邊度/,
      /做乜/,
      /傾計/,
      /閒話/,
      /天色/,
      /熱唔熱/
    ],
    refuse: [
      /唔入/,
      /唔推/,
      /走(喇|啦)/,
      /返去/,
      /唔要/,
      /拒絕/,
      /唔得/
    ],
    agree: [
      /好(呀|啦|嘅)?/,
      /係(呀|啦)?/,
      /得(啦|嘅)?/,
      /繼續/,
      /明白/,
      /跟你/
    ]
  };

  var SOFT_LEXICON = {
    enter_door: [
      "開門", "入去", "入嚟", "推門", "入門", "進入", "行入", "開門啦",
      "我入去", "進去", "推開", "入定", "開門入", "入睇", "行入去",
      "開個門", "推入", "入嚟先", "開門喇", "入去先", "睇下入面"
    ],
    wait: [
      "等等", "未準備", "停低", "等陣", "企定", "站住", "再推", "猶豫",
      "停一停", "等我", "先停", "唔好入住", "等下", "停住", "未得",
      "準備好未", "停一下", "企住", "等等先"
    ],
    ask_want: [
      "你想我點", "你想點", "應該點", "點算", "指引", "教我", "點做",
      "你要我點", "想我點樣", "你想我點做", "點先", "教下我"
    ],
    off_topic: [
      "天氣", "今日天氣", "食飯", "幾點", "邊度", "做乜", "傾計", "閒話",
      "熱唔熱", "天色", "天氣點", "食咗未", "而家幾點"
    ],
    refuse: [
      "唔入", "唔推", "走喇", "返去", "唔要", "拒絕", "唔得", "唔入去",
      "離開", "唔想入"
    ],
    agree: [
      "好", "係", "得", "繼續", "明白", "跟你", "好呀", "係呀", "得啦",
      "繼續啦", "OK", "ok"
    ]
  };

  var KEY_SYNONYMS = {
    enter_door: ["開門", "推門", "入去", "進入", "行入"],
    wait: ["等等", "停", "等", "未準備"],
    ask_want: ["你想我點", "點做", "指引"],
    off_topic: ["天氣", "閒話"],
    refuse: ["唔入", "走"],
    agree: ["好", "係", "得"]
  };

  var ACCEPTANCE_SOFT = [
    { text: "開門啦", expect: "enter_door" },
    { text: "我入去先", expect: "enter_door" },
    { text: "進去看看", expect: "enter_door" },
    { text: "等等", expect: "wait" },
    { text: "我未準備好", expect: "wait" },
    { text: "你想我點？", expect: "ask_want" },
    { text: "今日天氣點呀", expect: "off_topic" },
    { text: "推門", expect: "enter_door" },
    { text: "開門喇", expect: "enter_door" },
    { text: "停一停", expect: "wait" },
    { text: "等陣先", expect: "wait" },
    { text: "入嚟", expect: "enter_door" }
  ];

  global.IntentPatterns = {
    INTENTS: INTENTS,
    PATTERNS: PATTERNS,
    SOFT_LEXICON: SOFT_LEXICON,
    KEY_SYNONYMS: KEY_SYNONYMS,
    ACCEPTANCE_SOFT: ACCEPTANCE_SOFT,
    version: "split1ff"
  };
  global.INTENT_PATTERNS = global.IntentPatterns;
})(typeof window !== "undefined" ? window : globalThis);

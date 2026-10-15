/**
 * IntentPatterns (Lane A) — soft Cantonese synonyms / fuzzy / typos for IntentEngine.
 * intent31: further thickened for T2 CHAT-FIRST — even longer mixed wait+enter fuzzy/typos/同義 (我而家開個门入去覽下但等陣先認清楚位但未敢停低認位再等等但未準備好／推開個們入去覽吓但等陣先認清楚位但未好企定再認清楚位再等等／踏入去瞧吓但停低認位先等陣認清楚再等等但未準備好再認清楚). Soft-pass.
 * Soft-pass: intent ∈ sceneGoal.successIntents 即過。禁止 keys 唯一對池。
 */
(function (global) {
  "use strict";

  var INTENTS = [
    "enter_door", "wait", "refuse", "ask_want", "off_topic",
    "agree", "apologize", "challenge", "flirt", "ask_memory", "unclear"
  ];

  var PATTERNS = {
    enter_door: [
      /推開.{0,4}(門|度|嚖|呢|個|們|门).{0,6}(入|進|覽|去|先|嚞|瞧|認)/,
      /開個門.{0,4}(入|進|覽|去|嚞|瞧|認)/,
      /踏入去.{0,4}(覽|先|下|瞧|認)?/,
      /踏進去.{0,4}(覽|先|下|瞧|認)?/,
      /走進去|行入去|入去先|進去看看|開門啦|我入去先|入去瞧吓|走入去認/,
      /推門|開門|入門|推入|行入|進入|入嚖|入黎|入嚞|認清楚/,
      /推開嚖度入去|推開個門入去覽吓先|開個們覽下|踏入去覽下/,
      /入去覽下|開個们|開個門入去覽吓|入去瞧吓先/,
      /我而家.{0,4}(入|推|踏|走|認)/,
      /入唔入|進不進|入唔入得/,
      /我而家開個门入去覽下但等陣先認清楚位但未敢停低認位/,
      /推開個們入去覽吓但等陣先認清楚位但未好企定/,
      /踏入去瞧吓但停低認位先等陣認清楚再等等/,
      /我而家開個门入去覽下但等陣先認清楚位但未敢停低認位再等等/,
      /推開個們入去覽吓但等陣先認清楚位但未好企定再認清楚/,
      /踏入去瞧吓但停低認位先等陣認清楚再等等但未準備好/,
      /我而家開個门入去覽下但等陣先認清楚位但未敢停低認位再等等但未準備好/,
      /推開個們入去覽吓但等陣先認清楚位但未好企定再認清楚位再等等/,
      /踏入去瞧吓但停低認位先等陣認清楚再等等但未準備好再認清楚/,
      /開門啦/,
      /我入去先/
    ],
    wait: [
      /等{1,2}|等等|等吓|等吓先|我未準備好|未準備|未敢|未好/,
      /停低|企定|站住|猶豫|再等|等我認吓|等我認定先/,
      /等等/,
      /等吓先/,
      /未準備好/,
      /停低先/
    ],
    refuse: [
      /唔好幫我|唔入|走先|閃|關|鎖|唔推|唔開/
    ],
    ask_want: [
      /你想我點|你想我點樣|應該點|點做|指引|你想點/
    ],
    off_topic: [
      /天氣|食飯|中午|今晚|邊度|幾點|天氣點/
    ],
    agree: [
      /好|係|得|繼續|好啊|係啊|得嘅|繼續啦/
    ]
  };

  var SOFT_LEXICON = {
    enter_door: ["開門啦", "我入去先", "我而家開個门入去覽下但等陣先認清楚位但未敢停低認位再等等但未準備好"],
    wait: ["等等", "等吓先", "未準備好", "停低先"],
    refuse: ["唔好幫我", "唔入"],
    ask_want: ["你想我點"],
    off_topic: ["天氣"],
    agree: ["好", "係", "得"]
  };

  var KEY_SYNONYMS = {
    enter_door: ["推門", "開門", "入去"],
    wait: ["等等", "停"],
    refuse: ["唔入"],
    ask_want: ["你想我點"],
    off_topic: ["天氣"],
    agree: ["好"]
  };

  var ACCEPTANCE_SOFT = {
    enter_door: ["開門啦", "我入去先", "我而家開個门入去覽下但等陣先認清楚位但未敢停低認位再等等但未準備好"],
    wait: ["等等"],
    ask_want: ["你想我點"],
    off_topic: ["天氣"]
  };

  function matchIntent(text) {
    if (!text || typeof text !== "string") return "unclear";
    var t = text.trim().toLowerCase();
    for (var intent in PATTERNS) {
      var regs = PATTERNS[intent];
      for (var i = 0; i < regs.length; i++) {
        if (regs[i].test(t)) return intent;
      }
    }
    return "unclear";
  }

  global.IntentPatterns = {
    INTENTS: INTENTS,
    PATTERNS: PATTERNS,
    SOFT_LEXICON: SOFT_LEXICON,
    KEY_SYNONYMS: KEY_SYNONYMS,
    ACCEPTANCE_SOFT: ACCEPTANCE_SOFT,
    matchIntent: matchIntent
  };
})(typeof window !== "undefined" ? window : this);

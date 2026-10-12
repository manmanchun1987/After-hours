/**
 * IntentPatterns — Lane A (intent2)
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
      /推門|開門|入去|入嚟|入嚕|進去|走入|步入|跳入|爬入|跑入|衝進去|躍入|溜進去|潛進去|鑽入|走入嚟|進去看看|我入去先|開門啦|入嚟先|飛入|衝入嚟|開問門|入去嘅/
    ],
    wait: [
      /等等|停低|未準備|我未準備好|等陣|停|等一等|未好|企定|猶豫|先等/
    ],
    ask_want: [
      /你想我點|想我點先呀|你想點|應該點做|你要我點/
    ],
    off_topic: [
      /天氣|飯|今日天氣|聽日|飯店|車|工|作|家人|电话/
    ],
    refuse: [
      /唔好|唔入|唔幫|唔想|企定唔|關門|鎖門|走先|閃/
    ],
    agree: [
      /好|係|得|繼續|好呀|係呀|得嘅/
    ]
  };

  var SOFT_LEXICON = {
    enter_door: ["推門", "開門", "入去", "入嚟", "入嚕", "進去", "走入", "步入", "跳入", "爬入", "跑入", "衝進去", "躍入", "溜進去", "潛進去", "鑽入", "走入嚟", "進去看看", "我入去先", "開門啦", "入嚟先", "飛入", "衝入嚟", "開問門", "入去嘅", "行入", "跨檻"],
    wait: ["等等", "停低", "未準備", "我未準備好", "等陣", "停", "等一等", "未好", "企定", "猶豫", "先等", "未敢", "再等"],
    ask_want: ["你想我點", "想我點先呀", "你想點", "應該點做", "你要我點", "點先"],
    off_topic: ["天氣", "飯", "今日天氣", "聽日", "飯店", "車", "工作", "家人"],
    refuse: ["唔好", "唔入", "唔幫", "唔想", "企定唔", "關門", "鎖門", "走先", "閃"],
    agree: ["好", "係", "得", "繼續", "好呀", "係呀"]
  };

  var KEY_SYNONYMS = {
    enter_door: SOFT_LEXICON.enter_door,
    wait: SOFT_LEXICON.wait,
    ask_want: SOFT_LEXICON.ask_want,
    off_topic: SOFT_LEXICON.off_topic,
    refuse: SOFT_LEXICON.refuse,
    agree: SOFT_LEXICON.agree
  };

  var ACCEPTANCE_SOFT = {
    enter_door: ["開門啦", "我入去先", "進去看看", "入嚟", "步入去", "走進去"],
    wait: ["等等", "我未準備好", "停低", "等陣"],
    ask_want: ["你想我點", "想我點先呀"],
    off_topic: ["天氣", "今日天氣點呀"]
  };

  global.IntentPatterns = {
    INTENTS: INTENTS,
    PATTERNS: PATTERNS,
    SOFT_LEXICON: SOFT_LEXICON,
    KEY_SYNONYMS: KEY_SYNONYMS,
    ACCEPTANCE_SOFT: ACCEPTANCE_SOFT
  };
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));

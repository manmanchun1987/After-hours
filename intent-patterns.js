/**
 * IntentPatterns (Lane A) — soft Cantonese synonyms / fuzzy / typos for IntentEngine.
 * intent12: thickened for T2 CHAT-FIRST — more 推開嚟度入去／開個門入去睇吓先／踏入去睇下 + typos/fuzzy.
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
      /推開.{0,4}(門|度|嚟|個|啲).{0,6}(入|進|睇|去|先)/,
      /開個門.{0,4}(入|進|睇|去)/,
      /踏入去.{0,4}(睇|先|下)?/,
      /踏進去.{0,4}(睇|先|下)?/,
      /走進去|行入去|入去先|進去看看|開門啦|我入去先/,
      /推門|開門|入門|推入|行入|進入|入嚐|入黎/,
      /推開嚟度入去|推開個門入去睇吓先|開個們睇下|踏入去睇下/,
      /入去睇下|開個们|開個門入去睇吓/,
      /推開.{0,2}(度|嚟|個).{0,4}入/,
      /我而家.{0,4}(入|推|踏|走)/,
      /入唔入|進不進|入唔入得/
    ],
    wait: [
      /等{1,2}|等等|等吓|等吓先|我未準備好|未準備|未敢|未好/,
      /停低|企定|站住|猶豫|再等|等我認吓|等我認定先/,
      /等我認吓先|等我想吓/,
      /停|等一等|等等先/
    ],
    refuse: [
      /唔好幫我|唔入|走先|閃|關|鎖|唔推|唔開/,
      /唔好幫我開個門|唔好幫我踏進去|唔好幫我入/,
      /唔入去|唔想入|閃人|走啦/
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
    enter_door: [
      "推開嚟度入去", "開個門入去睇吓先", "踏入去睇下", "踏進去睇下",
      "推開個門入去睇吓", "開個們睇下", "入去睇下", "推開個門",
      "開門啦", "我入去先", "進去看看", "行入去", "走進去",
      "推門", "開門", "入去", "入嚐", "進入", "踏進去", "推開度",
      "開個门", "開個们", "踏入", "行入", "入門"
    ],
    wait: [
      "等等", "等吓先", "我未準備好", "未準備", "停低", "企定",
      "等我認吓先", "等我認定先", "猶豫", "再等", "等一等", "等等先"
    ],
    refuse: [
      "唔好幫我", "唔好幫我開個門", "唔好幫我踏進去", "唔入", "走先",
      "閃", "關", "鎖", "唔推", "唔想入"
    ],
    ask_want: ["你想我點", "你想點", "應該點", "點做", "指引"],
    off_topic: ["天氣", "食飯", "中午好", "邊度", "幾點"],
    agree: ["好", "係", "得", "繼續", "好啊", "係啊"]
  };

  var KEY_SYNONYMS = {
    enter_door: ["推門", "開門", "入去", "入嚐", "進去", "進入", "行入", "踏入", "推開"],
    wait: ["等等", "停", "猶豫", "未準備", "企定"],
    refuse: ["唔入", "走", "閃", "關", "鎖"],
    ask_want: ["你想我點", "點樣"],
    off_topic: ["天氣", "飯"],
    agree: ["好", "係", "得"]
  };

  var ACCEPTANCE_SOFT = {
    enter_door: ["開門啦", "我入去先", "進去看看", "推開嚟度入去", "開個門入去睇吓先", "踏入去睇下"],
    wait: ["等等", "我未準備好", "等我認吓先"],
    ask_want: ["你想我點？"]
  };

  global.IntentPatterns = {
    INTENTS: INTENTS,
    PATTERNS: PATTERNS,
    SOFT_LEXICON: SOFT_LEXICON,
    KEY_SYNONYMS: KEY_SYNONYMS,
    ACCEPTANCE_SOFT: ACCEPTANCE_SOFT
  };
})(typeof window !== "undefined" ? window : this);

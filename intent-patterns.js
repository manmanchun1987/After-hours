/**
 * IntentPatterns (split1) — Lane A data: intents, regex pools, soft lexicon, synonyms, acceptance.
 * Consumed by IntentEngine. Hourly default lane may thicken this file without touching engine core.
 */
(function (global) {
  "use strict";

  var INTENTS = [
    "ask_want",
    "agree",
    "refuse",
    "enter_door",
    "wait",
    "apologize",
    "flirt",
    "challenge",
    "ask_memory",
    "off_topic",
    "unclear"
  ];

  // Pattern groups: scored hits (not whole-string equality).
  // Soft paraphrases must classify by intent vs sceneGoal — never require exact choice labels.
  var PATTERNS = {
    enter_door: [
      /推門/, /推開門/, /開門/, /開吓門/, /開門啦/, /開門呀/, /開門先/,
      /入去/, /入嚟/, /入來/, /入来/, /推入/, /入門/, /進門/, /進去/, /進入/, /進來/,
      /推入去/, /打開門/, /打开门/, /我推/, /推啦/, /推啊/, /入啊/, /入啦/, /入未/, /入去未/, /入去先/, /入去睇/,
      /行入/, /走入/, /踏入/, /行過去入/, /行入去/, /我入/, /我入去/, /入辦公室/, /入房/, /間房/, /入佢/,
      /進去看/, /進去睇/, /入去看/, /入去看看/, /進去看看/, /入屋/, /入到/, /入先/,
      /過嚟/, /過去入/, /推開/, /推啦門/, /門.*推|推.*門/, /入.*辦公室|辦公室.*入/,
      /\benter\b/i, /\bgo in\b/i, /\bgo into\b/i, /\bopen( the)? door\b/i, /push( the)? door/i,
      /\bcome in\b/i, /\bwalk in\b/i, /\bhead in\b/i
    ],
    wait: [
      /猶豫/, /停一秒/, /停一停/, /停低/, /唔敢/, /再推/, /等等/, /企(喇|喺)度/,
      /站住/, /等陣/, /等一下/, /等一等/, /等等先/, /等我/, /等一吓/, /稍等/,
      /未敢/, /再等/, /停一停先/, /^停$/, /未準備/, /未準備好/, /未 ready/i, /我未/,
      /未夠膽/, /再諗/, /諗清楚/, /未好/, /未得/, /未得閒/, /等陣先/, /hold on/i, /\bwait\b/i,
      /not ready/i, /還沒準備/, /还没准备/, /我未準備/, /未夠/, /慢啲/, /等等我/
    ],
    ask_want: [
      /你想(要|點|我)/, /想(要|點)(乜|咩|我|點)/, /我(應該|要)點/, /點樣(先|做)/,
      /我做咩/, /你要我/, /教我/, /指引/, /點算/, /應該點/, /我想知你想/,
      /你想要乜/, /你想要咩/, /想我點做/, /你想我點/, /點先得/, /我點做/,
      /what do you want/i, /what should i/i, /how should i/i, /tell me what/i,
      /你究竟想/, /想點啊/, /想點呀/, /跟你想/, /照你想/
    ],
    agree: [
      /^(好|係|係呀|係喎|得|得啦|嗯|嗯哼|繼續|聽你講|想聽|好呀|得喎|ok|okay|yes|y)$/i,
      /好啊/, /可以/, /同意/, /跟你/, /聽你/, /我跟/, /係咁/, /就咁/
    ],
    refuse: [
      /唔入/, /唔要/, /不要/, /拒絕/, /鎖門/, /關門/, /走先/, /閃/, /唔得/,
      /算吧/, /算了/, /唔敢入/, /我走/, /離開/, /\bno\b/i, /refuse/i, /唔想入/, /唔想去/
    ],
    apologize: [
      /對唔住/, /唔好意思/, /抱歉/, /sorry/i, /道歉/, /我錯/, /原諒/
    ],
    flirt: [
      /靚/, /好靚/, /想錫/, /想親/, /心口/, /你香/, /今晚留/, /想要你/,
      /誘惑/, /可愛/, /sexy/i, /kiss/i, /抱你/, /近啲/, /坐近/
    ],
    challenge: [
      /憑咩/, /唔服/, /頂嘴/, /你錯/, /無理/, /專橫/, /挑戰/, /憑什麼/,
      /你以為/, /你睇唔起/, /誰怕誰/, /challenge/i
    ],
    ask_memory: [
      /記得/, /之前/, /頭先/, /今晚.*記/, /你知唔知/, /你記/, /memory/i,
      /記唔記得/, /頭先嗰/
    ],
    off_topic: [
      /天氣/, /食咗/, /食乜/, /午餐/, /晚餐/, /足球/, /遊戲/, /game/i,
      /chatgpt/i, /你係唔係ai/i, /人工智能/, /機械人/, /机器人/, /同ai/i, /係ai/i, /\bai\b/i, /傾偈.*ai|ai.*傾/i,
      /薪水/, /人工幾多/, /加班費/, /家人/, /老婆/, /女朋友/, /男友/,
      /天氣點/, /落雨/, /天氣預報/, /whats the weather/i, /how are you$/i,
      /你好嗎$/, /食飯未/, /中午/, /八卦/, /同事私/
    ]
  };

  // Soft lexicon tokens: substring / ordered-chars / light typo — never whole-string == key.
  var SOFT_LEXICON = {
    enter_door: [
      "推門", "開門", "入去", "入嚟", "進去", "進入", "行入", "走入", "入門", "進門",
      "入房", "入辦公室", "推入", "入來", "入来", "入去先", "入去未", "開門啦", "我入",
      "間房", "入佢", "過去入", "行過去", "進去看", "進去睇", "入屋", "踏入", "推開", "入先"
    ],
    wait: [
      "等等", "停", "猶豫", "停低", "企", "站住", "等陣", "未準備", "未敢", "再諗",
      "諗清楚", "未好", "稍等", "等我", "慢啲", "未夠膽", "等一等", "停一停"
    ],
    refuse: ["唔入", "走先", "閃", "關門", "鎖門", "離開", "我走", "唔想入"],
    agree: ["好", "係", "繼續", "得", "ok", "yes"],
    flirt: ["近啲", "坐近", "想要你", "錫", "親"],
    ask_want: ["你想", "點做", "指引", "教我", "應該點", "想我點"],
    apologize: ["對唔住", "唔好意思", "抱歉", "sorry", "道歉"],
    off_topic: ["天氣", "食飯", "足球", "薪水", "chatgpt"]
  };

  // Soft synonyms that boost mapping onto node.intent keys (substring, not ==).
  var KEY_SYNONYMS = {
    enter_door: ["推門", "開門", "入去", "入嚟", "進去", "進入", "行入", "走入", "推", "入門", "進門", "入", "間房", "辦公室"],
    wait: ["停", "猶豫", "等等", "停低", "企", "站住", "未準備", "等陣", "再諗"],
    refuse: ["唔入", "走", "閃", "關門", "鎖門", "離開"],
    agree: ["好", "係", "繼續", "得"],
    flirt: ["近", "坐近", "想要"],
    ask_want: ["想", "點", "指引", "教"],
    apologize: ["對唔住", "抱歉", "sorry"]
  };

  /**
   * Acceptance soft phrases (intentsoft1) — must classify → goal intent, not exact keys:
   * enter_door: 開門啦 / 入去未 / 我行入辦公室 / 進去看看 / 我入去先 / 行入佢間房
   * wait: 等等 / 我未準備好
   * Legacy exact 推門 / 停一停 still pass; advance = intent ∈ sceneGoal.successIntents.
   */
  var ACCEPTANCE_SOFT = [
    { text: "開門啦", intent: "enter_door" },
    { text: "入去未", intent: "enter_door" },
    { text: "我行入辦公室", intent: "enter_door" },
    { text: "進去看看", intent: "enter_door" },
    { text: "我入去先", intent: "enter_door" },
    { text: "行入佢間房", intent: "enter_door" },
    { text: "等等", intent: "wait" },
    { text: "我未準備好", intent: "wait" },
    { text: "推門", intent: "enter_door" },
    { text: "停一停", intent: "wait" }
  ];

  var api = {
    INTENTS: INTENTS,
    PATTERNS: PATTERNS,
    SOFT_LEXICON: SOFT_LEXICON,
    KEY_SYNONYMS: KEY_SYNONYMS,
    ACCEPTANCE_SOFT: ACCEPTANCE_SOFT,
    version: "split1"
  };

  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);

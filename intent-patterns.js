/**
 * IntentPatterns (split1c) — Lane A data: intents, regex pools, soft lexicon, synonyms, acceptance.
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

  var PATTERNS = {
    enter_door: [
      /\u63a8\u9580/, /\u63a8\u958b\u9580/, /\u958b\u9580/, /\u958b\u5413\u9580/, /\u958b\u9580\u5566/, /\u958b\u9580\u5440/, /\u958b\u9580\u5148/,
      /\u5165\u53bb/, /\u5165\u569f/, /\u5165\u4f86/, /\u5165\u6765/, /\u63a8\u5165/, /\u5165\u9580/, /\u9032\u9580/, /\u9032\u53bb/, /\u9032\u5165/, /\u9032\u4f86/,
      /\u63a8\u5165\u53bb/, /\u6253\u958b\u9580/, /\u6253\u5f00\u95e8/, /\u6211\u63a8/, /\u63a8\u5566/, /\u63a8\u554a/, /\u5165\u554a/, /\u5165\u5566/, /\u5165\u672a/, /\u5165\u53bb\u672a/, /\u5165\u53bb\u5148/, /\u5165\u53bb\u7747/,
      /\u884c\u5165/, /\u8d70\u5165/, /\u8e0f\u5165/, /\u884c\u904e\u53bb\u5165/, /\u884c\u5165\u53bb/, /\u6211\u5165/, /\u6211\u5165\u53bb/, /\u5165\u8fa6\u516c\u5ba4/, /\u5165\u623f/, /\u9593\u623f/, /\u5165\u4f62/,
      /\u9032\u53bb\u770b/, /\u9032\u53bb\u7747/, /\u5165\u53bb\u770b/, /\u5165\u53bb\u770b\u770b/, /\u9032\u53bb\u770b\u770b/, /\u5165\u5c4b/, /\u5165\u5230/, /\u5165\u5148/,
      /\u904e\u569f/, /\u904e\u53bb\u5165/, /\u63a8\u958b/, /\u63a8\u5566\u9580/, /\u9580.*\u63a8|\u63a8.*\u9580/, /\u5165.*\u8fa6\u516c\u5ba4|\u8fa6\u516c\u5ba4.*\u5165/,
      /\benter\b/i, /\bgo in\b/i, /\bgo into\b/i, /\bopen( the)? door\b/i, /push( the)? door/i,
      /\bcome in\b/i, /\bwalk in\b/i, /\bhead in\b/i,
      /\u5e6b\u6211\u958b\u9580/, /\u6211\u54d2\u5165\u53bb/, /\u6211\u884c\u904e\u53bb\u5148/, /\u884c\u904e\u53bb\u5148/, /\u6211\u53bb\u63a8/, /\u53bb\u958b\u9580/,
      /\u5165\u53bb\u5566/, /\u5165\u569f\u5566/, /\u6211\u800c\u5bb6\u5165/, /\u800c\u5bb6\u5165\u53bb/
    ],
    wait: [
      /\u7336\u8c6b/, /\u505c\u4e00\u79d2/, /\u505c\u4e00\u505c/, /\u505c\u4f4e/, /\u5514\u6562/, /\u518d\u63a8/, /\u7b49\u7b49/, /\u4f01(\u558e|\u558f)\u5ea6/,
      /\u7ad9\u4f4f/, /\u7b49\u9663/, /\u7b49\u4e00\u4e0b/, /\u7b49\u4e00\u7b49/, /\u7b49\u7b49\u5148/, /\u7b49\u6211/, /\u7b49\u4e00\u5413/, /\u7a0d\u7b49/,
      /\u672a\u6562/, /\u518d\u7b49/, /\u505c\u4e00\u505c\u5148/, /^\u505c$/, /\u672a\u6e96\u5099/, /\u672a\u6e96\u5099\u597d/, /\u672a ready/i, /\u6211\u672a/,
      /\u672a\u5920\u81bd/, /\u518d\u8af8/, /\u8af8\u6e05\u695a/, /\u672a\u597d/, /\u672a\u5f97/, /\u672a\u5f97\u9592/, /\u7b49\u9663\u5148/, /hold on/i, /\bwait\b/i,
      /not ready/i, /\u9084\u6c92\u6e96\u5099/, /\u8fd8\u6ca1\u51c6\u5907/, /\u6211\u672a\u6e96\u5099/, /\u672a\u5920/, /\u6162\u5572/, /\u7b49\u7b49\u6211/,
      /\u6211\u8981\u8af8\u5413/, /\u8af8\u5413\u5148/, /\u7b49\u6211\u8af8/, /\u6211\u518d\u8af8\u5413/, /\u672a\u5b9a/, /\u672a\u6c7a\u5b9a/, /\u518d\u7b49\u4e00\u9663/
    ],
    ask_want: [
      /\u4f60\u60f3(\u8981|\u9ede|\u6211)/, /\u60f3(\u8981|\u9ede)(\u4e5c|\u54a5|\u6211|\u9ede)/, /\u6211(\u61c9\u8a72|\u8981)\u9ede/, /\u9ede\u6a23(\u5148|\u505a)/,
      /\u6211\u505a\u54a5/, /\u4f60\u8981\u6211/, /\u6559\u6211/, /\u6307\u5f15/, /\u9ede\u7b97/, /\u61c9\u8a72\u9ede/, /\u6211\u60f3\u77e5\u4f60\u60f3/,
      /\u4f60\u60f3\u8981\u4e5c/, /\u4f60\u60f3\u8981\u54a5/, /\u60f3\u6211\u9ede\u505a/, /\u4f60\u60f3\u6211\u9ede/, /\u9ede\u5148\u5f97/, /\u6211\u9ede\u505a/,
      /what do you want/i, /what should i/i, /how should i/i, /tell me what/i,
      /\u4f60\u7a76\u7adf\u60f3/, /\u60f3\u9ede\u554a/, /\u60f3\u9ede\u5440/, /\u8ddf\u4f60\u60f3/, /\u7167\u4f60\u60f3/,
      /\u61c9\u8a72\u505a\u54a5/, /\u800c\u5bb6\u61c9\u8a72/, /\u6211\u800c\u5bb6\u61c9\u8a72/, /\u6211\u61c9\u8a72\u505a/, /\u61c9\u8a72\u9ede\u505a/, /\u800c\u5bb6\u9ede\u505a/,
      /\u9ede\u5148\u597d/, /\u6211\u800c\u5bb6\u9ede/, /\u6559\u4e0b\u6211/, /\u8a71\u6211\u77e5\u9ede/,
      /\u800c\u5bb6\u9ede\u7b97/, /\u6211\u8ddf\u4f4f\u505a\u54a5/, /\u8ddf\u4f4f\u9ede/, /\u4e0b\u4e00\u6b65/, /\u4f60\u60f3\u6211\u505a\u54a5/, /\u6211\u60f3\u77e5\u9ede\u884c/
    ],
    agree: [
      /^(好|係|係呀|係喎|得|得啦|嗯|嗯哼|繼續|聽你講|想聽|好呀|得喎|ok|okay|yes|y)$/i,
      /好啊/, /可以/, /同意/, /跟你/, /聽你/, /我跟/, /係咁/, /就咁/
    ],
    refuse: [
      /唔入/, /唔要/, /不要/, /拒絕/, /鎖門/, /關門/, /走先/, /閃/, /唔得/,
      /算吧/, /算了/, /唔敢入/, /我走/, /離開/, /\bno\b/i, /refuse/i, /唔想入/, /唔想去/,
      /我唔入/, /唔想推/, /唔推/, /我唔去/, /走喇/, /閃先/, /算數/, /唔得喇/,
      /唔想入去/, /我唔推/, /唔入去/, /走啦/, /我閃/,
      /我唔想而家入/, /而家唔入/, /唔想而家推/, /我而家唔入/
    ],
    apologize: [
      /對唔住/, /唔好意思/, /抱歉/, /sorry/i, /道歉/, /我錯/, /原諒/,
      /對唔住呀/, /唔好意思呀/, /我有錯/, /請原諒/,
      /對唔住我遲/, /遲咗對唔住/, /sorry 遲/i
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
      /記唔記得/, /頭先嗰/, /你記得我/, /記得我講/, /我頭先講/, /記得我頭先/,
      /你記唔記得/, /頭先講過/, /我講過咩/, /記得先前提/,
      /你仲記唔記得/, /頭先我講/, /記得我話/, /你記得未/,
      /你記唔記得我話想入/, /記得我想推/, /記得我話入/
    ],
    off_topic: [
      /天氣/, /食咗/, /食乜/, /午餐/, /晚餐/, /足球/, /遊戲/, /game/i,
      /chatgpt/i, /你係唔係ai/i, /人工智能/, /機械人/, /机器人/, /同ai/i, /係ai/i, /\bai\b/i, /傾偈.*ai|ai.*傾/i,
      /薪水/, /人工幾多/, /加班費/, /家人/, /老婆/, /女朋友/, /男友/,
      /天氣點/, /落雨/, /天氣預報/, /whats the weather/i, /how are you$/i,
      /你好嗎$/, /食飯未/, /中午/, /八卦/, /同事私/,
      /你係咪ai/i, /你係咪 AI/i, /你係咪程式/i, /係咪ai/i, /係咪程式/i, /你係程式/i,
      /係咪機械人/i, /你係唔係程式/i, /你係咪人工智能/i, /係咪機器人/i
    ]
  };

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
    refuse: ["唔入", "走先", "閃", "關門", "鎖門", "離開", "我走", "唔想入", "唔推", "我唔入", "走喇", "唔入去"],
    agree: ["好", "係", "繼續", "得", "ok", "yes"],
    flirt: ["近啲", "坐近", "想要你", "錫", "親"],
    ask_want: ["你想", "點做", "指引", "教我", "應該點", "想我點", "應該做咩", "而家應該", "點先好"],
    apologize: ["對唔住", "唔好意思", "抱歉", "sorry", "道歉", "對唔住呀"],
    off_topic: ["天氣", "食飯", "足球", "薪水", "chatgpt", "ai", "程式", "機械人", "人工智能"],
    ask_memory: ["記得", "頭先", "記唔記得", "我講過"]
  };

  var KEY_SYNONYMS = {
    enter_door: ["推門", "開門", "入去", "入嚟", "進去", "進入", "行入", "走入", "推", "入門", "進門", "入", "間房", "辦公室"],
    wait: ["停", "猶豫", "等等", "停低", "企", "站住", "未準備", "等陣", "再諗"],
    refuse: ["唔入", "走", "閃", "關門", "鎖門", "離開"],
    agree: ["好", "係", "繼續", "得"],
    flirt: ["近", "坐近", "想要"],
    ask_want: ["想", "點", "指引", "教", "應該"],
    apologize: ["對唔住", "抱歉", "sorry"]
  };

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
    { text: "停一停", intent: "wait" },
    { text: "我而家應該做咩", intent: "ask_want" },
    { text: "你係咪 AI", intent: "off_topic" },
    { text: "而家點算", intent: "ask_want" },
    { text: "我跟住做咩", intent: "ask_want" },
    { text: "我哋入去", intent: "enter_door" },
    { text: "我行過去先", intent: "enter_door" },
    { text: "我要諗吓", intent: "wait" },
    { text: "我唔想而家入", intent: "refuse" },
    { text: "你記唔記得我話想入", intent: "ask_memory" }
  ];

  var api = {
    INTENTS: INTENTS,
    PATTERNS: PATTERNS,
    SOFT_LEXICON: SOFT_LEXICON,
    KEY_SYNONYMS: KEY_SYNONYMS,
    ACCEPTANCE_SOFT: ACCEPTANCE_SOFT,
    version: "split1c"
  };

  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);

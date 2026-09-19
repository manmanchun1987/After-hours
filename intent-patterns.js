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

  // Pattern groups: scored hits (not whole-string equality).
  // Soft paraphrases must classify by intent vs sceneGoal — never require exact choice labels.
  var PATTERNS = {
    enter_door: [
      /推門/, /推開門/, /開門/, /開吓門/, /開門啦/, /開門呀/, /開門先/,
      /入去/, /入嚟/, /入來/, /入来/, /推入/, /入門/, /進門/, /進去/, /進入/, /進來/,
      /推入去/, /打開門/, /打开门/, /我推/, /推啦/, /推啊/, /入啊/, /入啦/, /入未/, /入去未/, /入去先/, /入去睇/,
      /行入/, /走入/, /踏入/, /行過去入/, /行入去/, /我入/, /我入去/, /入辦事處/, /入房/, /間房/, /入佢/,
      /進去看/, /進去睇/, /入去看/, /入去看看/, /進去看看/, /入屋/, /入到/, /入先/,
      /過嚟/, /過去入/, /推開/, /推啦門/, /門.*推|推.*門/, /入.*辦事處|辦事處.*入/,
      /\benter\b/i, /\bgo in\b/i, /\bgo into\b/i, /\bopen( the)? door\b/i, /push( the)? door/i,
      /\bcome in\b/i, /\bwalk in\b/i, /\bhead in\b/i,
      /開門喎/, /開門嘑/, /開門喎/, /開門囉/, /開門咯/, /開門吧/,
      /入去睇下/, /入去先啦/, /入去囉/, /入去咯/, /入去啦/, /入去呀/,
      /我推開門/, /推開扇門/, /行過去推/, /去入面/, /入入去/, /入返去/,
      /打開扇門/, /擰開門/, /拉開門/, /帶我入/, /跟住入/, /入去一睇/,
      /step in/i, /walk inside/i, /go inside/i, /head inside/i
    ],
    wait: [
      /優豫/, /停一秒/, /停一停/, /停低/, /唔敢/, /再推/, /等等/, /企(喎|喏)度/,
      /站住/, /等陣/, /等一下/, /等一等/, /等等先/, /等我/, /等一吓/, /稍等/,
      /未敢/, /再等/, /停一停先/, /^\u505c$/, /未準備/, /未準備好/, /未 ready/i, /我未/,
      /未夠膽/, /再諶/, /諶清楚/, /未好/, /未得/, /未得閒/, /等陣先/, /hold on/i, /\bwait\b/i,
      /not ready/i, /還沒準備/, /还没准备/, /我未準備/, /未夠/, /慢啲/, /等等我/,
      /等一等先/, /我再諶下/, /未想好/, /企喏度先/, /我遲啲/, /慢住/, /唔急/,
      /再睇下/, /未決定/, /諶下先/, /停住先/, /先停/, /等等啊/, /等等呀/,
      /give me a (sec|second|min|minute)/i, /hang on/i, /not yet/i
    ],
    ask_want: [
      /你想(要|點|我)/, /想(要|點)(乜|咥|我|點)/, /我(應該|要)點/, /點樣(先|做)/,
      /我做咥/, /你要我/, /教我/, /指引/, /點算/, /應該點/, /我想知你想/,
      /你想要乜/, /你想要咥/, /想我點做/, /你想我點/, /點先得/, /我點做/,
      /what do you want/i, /what should i/i, /how should i/i, /tell me what/i,
      /你究竟想/, /想點啊/, /想點呀/, /跟你想/, /照你想/,
      /應該做咥/, /而家應該/, /我而家應該/, /我應該做/, /應該點做/, /而家點做/,
      /點先好/, /我而家點/, /教下我/, /話我知點/,
      /而家我要做咥/, /跟住點/, /下一步/, /你想我做邊/, /我跟你定/,
      /而家做咥/, /跟住做咥/, /你要我做/, /點先啲/, /點先對/,
      /what now/i, /what next/i, /your move/i, /你話事/
    ],
    agree: [
      /^(好|係|係呀|係喎|得|得啦|嗯|嗯哮|繼續|聽你講|想聽|好呀|得喎|ok|okay|yes|y)$/i,
      /好啊/, /可以/, /同意/, /跟你/, /聽你/, /我跟/, /係咁/, /就咁/,
      /好喎/, /得喎/, /跟住啦/, /跟你啦/, /聽你話/, /照做/
    ],
    refuse: [
      /唔入/, /唔要/, /不要/, /拒絕/, /鎖門/, /關門/, /走先/, /閃/, /唔得/,
      /算吧/, /算了/, /唔敢入/, /我走/, /離開/, /\bno\b/i, /refuse/i, /唔想入/, /唔想去/,
      /我唔入/, /唔想推/, /唔推/, /我唔去/, /走喎/, /閃先/, /算數/, /唔得喎/,
      /唔想入去/, /我唔推/, /唔入去/, /走啦/, /我閃/,
      /唔好入/, /我唔過/, /我唔推門/, /今日唔入/, /我唔入去/,
      /唔入喎/, /唔入啦/, /算啦唔入/, /我唔行入/, /唔過門/
    ],
    apologize: [
      /對唔住/, /唔好意思/, /抱歉/, /sorry/i, /道歉/, /我錯/, /原諒/,
      /對唔住呀/, /唔好意思呀/, /我有錯/, /請原諒/,
      /對唔住喎/, /唔好意思啊/, /我講錯/, /my bad/i, /對唔住啊/,
      /唔好意思喎/, /sorry呀/i, /sorry啊/i
    ],
    flirt: [
      /靚/, /好靚/, /想錫/, /想親/, /心口/, /你香/, /今晚留/, /想要你/,
      /誘惑/, /可愛/, /sexy/i, /kiss/i, /抱你/, /近啲/, /坐近/,
      /錫我/, /親我/, /靠近/, /望住我/
    ],
    challenge: [
      /憑咥/, /唔服/, /頂嘴/, /你錯/, /無理/, /專橫/, /挑戰/, /憑什麼/,
      /你以為/, /你睇唔起/, /誰怕誰/, /challenge/i,
      /你憑乜/, /邊個怕/, /唔使你管/
    ],
    ask_memory: [
      /記得/, /之前/, /頭先/, /今晚.*記/, /你知唔知/, /你記/, /memory/i,
      /記唔記得/, /頭先嗰/, /你記得我/, /記得我講/, /我頭先講/, /記得我頭先/,
      /你記唔記得/, /頭先講過/, /我講過咥/, /記得先前提/,
      /你仲記唔記得/, /頭先我講/, /記得我話/, /你記得未/,
      /頭先我講過/, /你有無聽/, /仲記唔記/, /記唔記我/,
      /我頭先話/, /你聽唔聽到/, /你記到未/
    ],
    off_topic: [
      /天氣/, /食咋/, /食乜/, /午餐/, /晚餐/, /足球/, /遊戲/, /game/i,
      /chatgpt/i, /你係唔係ai/i, /人工智能/, /機械人/, /机器人/, /同ai/i, /係ai/i, /\bai\b/i, /傾偈.*ai|ai.*傾/i,
      /薪水/, /人工幾多/, /加班費/, /家人/, /老婆/, /女朋友/, /男友/,
      /天氣點/, /落雨/, /天氣預報/, /whats the weather/i, /how are you$/i,
      /你好嗎$/, /食飯未/, /中午/, /八卦/, /同事私/,
      /你係咪ai/i, /你係咪 AI/i, /你係咪程式/i, /係咪ai/i, /係咪程式/i, /你係程式/i,
      /係咪機械人/i, /你係唔係程式/i, /你係咪人工智能/i, /係咪機器人/i,
      /幾多度/, /落唔落雨/, /股市/, /球賽/, /\bgrok\b/i, /chatgpt/i,
      /今日幾多度/, /有無波睇/, /買股票/, /你係bot/i
    ]
  };

  var SOFT_LEXICON = {
    enter_door: [
      "推門", "開門", "入去", "入嚟", "進去", "進入", "行入", "走入", "入門", "進門",
      "入房", "入辦事處", "推入", "入來", "入来", "入去先", "入去未", "開門啦",
      "間房", "過去入", "行過去", "進去看", "進去睇", "入屋", "踏入", "推開", "入先",
      "開門喎", "入去睇下", "去入面", "入返去", "擰開門"
    ],
    wait: [
      "等等", "停", "優豫", "停低", "企", "站住", "等陣", "未準備", "未敢", "再諶",
      "諶清楚", "未好", "稍等", "等我", "慢啲", "未夠膽", "等一等", "停一停",
      "未想好", "慢住", "唔急", "諶下先"
    ],
    refuse: ["唔入", "走先", "閃", "關門", "鎖門", "離開", "我走", "唔想入", "唔推", "我唔入", "走喎", "唔入去", "今日唔入"],
    agree: ["好", "係", "繼續", "得", "ok", "yes", "照做"],
    flirt: ["近啲", "坐近", "想要你", "錫", "親"],
    ask_want: ["你想", "點做", "指引", "教我", "應該點", "想我點", "應該做咥", "而家應該", "點先好", "跟住點", "下一步"],
    apologize: ["對唔住", "唔好意思", "抱歉", "sorry", "道歉", "對唔住呀", "我講錯"],
    off_topic: ["天氣", "食飯", "足球", "薪水", "chatgpt", "ai", "程式", "機械人", "人工智能", "股市", "grok"],
    ask_memory: ["記得", "頭先", "記唔記得", "我講過", "有無聽", "仲記"]
  };

  var KEY_SYNONYMS = {
    enter_door: ["推門", "開門", "入去", "入嚟", "進去", "進入", "行入", "走入", "推", "入門", "進門", "入", "間房", "辦事處"],
    wait: ["停", "優豫", "等等", "停低", "企", "站住", "未準備", "等陣", "再諶", "唔急"],
    refuse: ["唔入", "走", "閃", "關門", "鎖門", "離開"],
    agree: ["好", "係", "繼續", "得"],
    flirt: ["近", "坐近", "想要"],
    ask_want: ["想", "點", "指引", "教", "應該"],
    apologize: ["對唔住", "抱歉", "sorry"]
  };

  var ACCEPTANCE_SOFT = [
    { text: "開門啦", intent: "enter_door" },
    { text: "入去未", intent: "enter_door" },
    { text: "我行入辦事處", intent: "enter_door" },
    { text: "進去看看", intent: "enter_door" },
    { text: "我入去先", intent: "enter_door" },
    { text: "行入佢間房", intent: "enter_door" },
    { text: "等等", intent: "wait" },
    { text: "我未準備好", intent: "wait" },
    { text: "推門", intent: "enter_door" },
    { text: "停一停", intent: "wait" },
    { text: "我而家應該做咥", intent: "ask_want" },
    { text: "你係咪 AI", intent: "off_topic" },
    { text: "開門喎", intent: "enter_door" },
    { text: "入去睇下", intent: "enter_door" },
    { text: "我再諶下", intent: "wait" },
    { text: "跟住點", intent: "ask_want" },
    { text: "走先", intent: "refuse" },
    { text: "對唔住喎", intent: "apologize" },
    { text: "頭先我講過啲咥", intent: "ask_memory" },
    { text: "你係咪程式", intent: "off_topic" }
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

/**
 * IntentPatterns (split1g) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 */
(function (global) {
  "use strict";
  var INTENTS = ["ask_want","agree","refuse","enter_door","wait","apologize","flirt","challenge","ask_memory","off_topic","unclear"];
  var PATTERNS = {
    enter_door: [/推門/, /推開門/, /開門/, /開門啦/, /開門吖/, /開門喎/, /開門呀/, /入去/, /入嚟/, /進來/, /進去/, /進入/, /推入/, /入門/, /進門/, /入去先/, /入去未/, /入去睇/, /進去看/, /進去看看/, /行入/, /走入/, /踏入/, /我入/, /我入去/, /我哋入去/, /而家入去/, /行過去先/, /過門/, /打開門/, /\benter\b/i, /\bgo in\b/i, /open( the)? door/i, /push( the)? door/i, /let me in/i],
    wait: [/猶豫/, /停一秒/, /停一停/, /停低/, /唔敢/, /再推/, /等等/, /等等先/, /企喎度/, /站住/, /等陣/, /等一等/, /未準備/, /未準備好/, /再諸/, /諸清楚/, /諸吓/, /諸一諸/, /我要諸/, /未夠膽/, /未定/, /未決定/, /慢啲/, /慢住/, /hold on/i, /\bwait\b/i, /not ready/i, /hang on/i],
    ask_want: [/你想我點/, /你想要/, /我想知你想/, /我應該點/, /應該做咩/, /而家應該/, /而家點算/, /而家點做/, /點樣先/, /點先好/, /點行先/, /點算/, /教我/, /指引/, /我做乜/, /你要我/, /跟住做咩/, /跟住點/, /下一步/, /你想我做咩/, /what do you want/i, /what should i/i, /what now/i, /what next/i],
    agree: [/^(好|係|係呀|係喎|得|得啦|嗯|繼續|好呀|得喎|ok|okay|yes|y)$/i, /好啊/, /可以/, /同意/, /跟你/, /聽你/, /我跟你/, /係咁/, /就咁/],
    refuse: [/唔入/, /唔要/, /不要/, /拒絕/, /鎖門/, /關門/, /走先/, /閃/, /唔得/, /算吧/, /算了/, /唔敢入/, /我走/, /離開/, /\bno\b/i, /唔想入/, /唔想去/, /我唔入/, /唔想推/, /唔推/, /我唔去/, /走ᖴ/, /唔想入去/, /我唔想而家入/, /而家唔入/, /^唔想$/, /唔想啦/, /我唔想推門/, /not going in/i],
    apologize: [/對唔住/, /唔好意思/, /抱歉/, /sorry/i, /道歉/, /我錯/, /原諒/, /對唔住呀/],
    flirt: [/靣/, /好靣/, /想錫/, /想親/, /心口/, /你香/, /今晚留/, /想要你/, /可愛/, /sexy/i, /kiss/i, /抱你/, /近啲/, /坐近/],
    challenge: [/憑咥/, /唔服/, /頂嘴/, /你錯/, /無理/, /專橫/, /挑戰/, /你以為/, /challenge/i],
    ask_memory: [/記得/, /之前/, /頭先/, /你記/, /memory/i, /記唔記得/, /你記得我/, /記得我講/, /我頭先講/, /記得我頭先/, /頭先講過/, /我講過咩/, /你仲記唔記得/, /記得我話/, /你記得我頭先講咩/, /記得我想推/, /記得門口/],
    off_topic: [/天氣/, /食咁/, /午餐/, /晚餐/, /足球/, /遊戲/, /chatgpt/i, /人工智能/, /機械人/, /\bai\b/i, /薪水/, /落雨/, /食飯未/, /你係咪ai/i, /你係咪 AI/i, /你係咪程式/i, /你係程式/i, /今日幾多度/, /\bgpt\b/i]
  };
  var SOFT_LEXICON = {
    enter_door: ["推門","開門","入去","入嚟","進去","進入","行入","開門啦","開門吖","開門喎","我入","入去先","進去看"],
    wait: ["等等","停","猶豫","停低","等陣","未準備","再諸","諸吓","等等先","諸一諸"],
    refuse: ["唔入","走先","閃","關門","離開","我走","唔想入","唔推","我唔入","唔想","我唔想推門"],
    agree: ["好","係","繼續","得","ok","yes"],
    flirt: ["近啲","坐近","想要你"],
    ask_want: ["你想","點做","指引","教我","應該點","想我點","應該做咩","而家應該","點行先","跟住點"],
    apologize: ["對唔住","唔好意思","抱歉","sorry"],
    off_topic: ["天氣","食飯","足球","chatgpt","ai","程式"],
    ask_memory: ["記得","頭先","記唔記得","我講過","頭先講咩"]
  };
  var KEY_SYNONYMS = {
    enter_door: ["推門","開門","入去","進去","推","入"],
    wait: ["停","猶豫","等等","停低","未準備"],
    refuse: ["唔入","走","閃","關門"],
    agree: ["好","係","繼續","得"],
    flirt: ["近","坐近"],
    ask_want: ["想","點","指引","教","應該"],
    apologize: ["對唔住","抱歉","sorry"]
  };
  var ACCEPTANCE_SOFT = [
    {text:"開門啦",intent:"enter_door"},{text:"入去未",intent:"enter_door"},{text:"我行入辦公室",intent:"enter_door"},
    {text:"進去看看",intent:"enter_door"},{text:"我入去先",intent:"enter_door"},{text:"行入佢間房",intent:"enter_door"},
    {text:"等等",intent:"wait"},{text:"我未準備好",intent:"wait"},{text:"推門",intent:"enter_door"},{text:"停一停",intent:"wait"},
    {text:"我而家應該做咩",intent:"ask_want"},{text:"你係咪 AI",intent:"off_topic"},{text:"而家點算",intent:"ask_want"},
    {text:"我跟住做咩",intent:"ask_want"},{text:"我哋入去",intent:"enter_door"},{text:"我行過去先",intent:"enter_door"},
    {text:"我要諸吓",intent:"wait"},{text:"我唔想而家入",intent:"refuse"},{text:"你記唔記得我話想入",intent:"ask_memory"},
    {text:"開門吖",intent:"enter_door"},{text:"唔想",intent:"refuse"},{text:"點行先",intent:"ask_want"},{text:"今日幾多度",intent:"off_topic"},
    {text:"你記得我頭先講咩",intent:"ask_memory"},{text:"開門喎",intent:"enter_door"},{text:"等等先",intent:"wait"},
    {text:"我要諸一諸",intent:"wait"},{text:"我唔想推門",intent:"refuse"}
  ];
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:SOFT_LEXICON,KEY_SYNONYMS:KEY_SYNONYMS,ACCEPTANCE_SOFT:ACCEPTANCE_SOFT,version:"split1g"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);

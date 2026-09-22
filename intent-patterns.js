/**
 * IntentPatterns (split1v) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 */
(function (global) {
  "use strict";
  var INTENTS = ["ask_want","agree","refuse","enter_door","wait","apologize","flirt","challenge","ask_memory","off_topic","unclear"];
  var PATTERNS = {
    enter_door: [/\u63a8\u9580/, /\u958b\u9580/, /\u5165\u53bb/, /\u9032\u53bb/, /\u63a8\u9580\u5566/, /go inside/i],
    wait: [/\u7b49\u7b49/, /\u505c/, /\u672a\u6e96\u5099/, /hold on/i],
    ask_want: [/\u4f60\u60f3\u6211\u9ede/, /what now/i],
    agree: [/^(\u597d|\u4fc2|ok|yes)$/i],
    refuse: [/\u5514\u5165/, /\bno\b/i],
    apologize: [/\u5c0d\u5514\u4f4f/, /sorry/i],
    flirt: [/\u975a/],
    challenge: [/\u6191\u54a9/],
    ask_memory: [/\u8a18\u5f97/, /\u8b1b\u8fd4\u51fa\u569f/, /\u8a18\u4f4f\u548b\u672a/, /\u6709\u5187\u8a18\u4f4f/, /\u8907\u8ff0\u4e00\u6b21/],
    off_topic: [/\u5929\u6c23/, /chatgpt/i]
  };
  var SOFT_LEXICON = {enter_door:["\u958b\u9580","\u5165\u53bb"],wait:["\u7b49\u7b49"],refuse:["\u5514\u5165"],agree:["\u597d"],flirt:[],ask_want:["\u4f60\u60f3"],apologize:["sorry"],off_topic:["\u5929\u6c23"],ask_memory:["\u8a18\u5f97","\u8b1b\u8fd4"]};
  var KEY_SYNONYMS = {enter_door:["\u958b\u9580"],wait:["\u7b49\u7b49"],refuse:["\u5514\u5165"],agree:["\u597d"],flirt:[],ask_want:["\u60f3"],apologize:["sorry"],ask_memory:["\u8a18\u5f97","\u8b1b\u8fd4"]};
  var ACCEPTANCE_SOFT = [{text:"\u958b\u9580\u5566",intent:"enter_door"},{text:"\u7b49\u7b49",intent:"wait"},{text:"\u8b1b\u8fd4\u51fa\u569f",intent:"ask_memory"}];
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:SOFT_LEXICON,KEY_SYNONYMS:KEY_SYNONYMS,ACCEPTANCE_SOFT:ACCEPTANCE_SOFT,version:"split1v"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);

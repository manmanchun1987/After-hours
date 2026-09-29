/**
 * GuideLines (split1cd) — Lane B reply/thought pools for GuidePolicy.
 * T2 split1cd: +等我擴門把先／等我唎多兩秒／你到底要我點做好／頭先嗰句你仲記唔記 仍導向推定停；anti-repeat。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "門就哼前面。推定停——你擁。",
    "開門啦——咀就推。唔係就企。",
    "我入去先？門縫在。手落去。",
    "等等可以。等等完門都喊度。",
    "你想我點？我想你撿：入，定停。",
    "等我擴門把先得。把凉。擴完推定企。",
    "等我唎多兩秒得。唎完門仲哼前面。",
    "你到底要我點做好？淨係推門定停低。",
    "頭先嗰句你仲記唔記？記完手落把。",
    "而家幾點呀喂？走廊内鐘。面對縫。",
    "今日天氣點呀？走廊内窗。手對把。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "夠講等我唎多兩秒。唎完推。",
    "第二次頭先嗰句你仲記唔記。記完手落把。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次唎多兩秒。把凉。你擁。我靜。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。",
    "係。係完要推，定講停。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……唎多兩秒得。唎完該面對把。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……夠講唎多兩秒。推。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮揽。我靜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "你講過等我唎多兩秒。唎完仲係推定停。"
  ];
  var FALLBACK_REPLY = "門就哼度。推定停。";
  var CS_BLOCK_REPLY = "我唔做客服。門——推定停。";
  var api = {
    HINT_REPLIES: HINT_REPLIES,
    PRESSURE_REPLIES: PRESSURE_REPLIES,
    CALLOUT_REPLIES: CALLOUT_REPLIES,
    OPTIONAL_AGREE: OPTIONAL_AGREE,
    THOUGHTS_HINT: THOUGHTS_HINT,
    THOUGHTS_PRESSURE: THOUGHTS_PRESSURE,
    THOUGHTS_CALLOUT: THOUGHTS_CALLOUT,
    MEM_NUDGE: MEM_NUDGE,
    FALLBACK_REPLY: FALLBACK_REPLY,
    CS_BLOCK_REPLY: CS_BLOCK_REPLY,
    version: "split1cd"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

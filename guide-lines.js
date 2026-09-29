/**
 * GuideLines (split1cg) — Lane B reply/thought pools for GuidePolicy.
 * T2/T3 split1cg: +我去擸門入／擸門把推入先／等我唾一唾先／唔好催我住先／
 * 你究竟想我點做好先／頭先我講嗎句你仲記唔記得／出面落唔落雨呀 仍導向推定停；anti-repeat。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "門就喺前面。推定停——你擬。",
    "開門啦——手就推。唔係就企。",
    "我入去先？門縫在。手落去。",
    "等等可以。等等完門都喺度。",
    "你想我點？我想你擬：入，定停。",
    "等我擸門把先得。把凉。擸完推定企。",
    "等我唾多兩秒得。唾完門仲喺前面。",
    "你到底要我點做好？淨係推門定停低。",
    "頭先嗎句你仲記唔記？記完手落把。",
    "而家幾點呀喊？走廊內鐘。面對縫。",
    "今日天氣點呀？走廊冇窗。手對把。",
    "我擴門把入去得。把凉。擴完推定企。",
    "等我唾多陣得。唾完門仲喺度。",
    "你到底想我點做好呀？推門，定停低。",
    "頭先嗎句你記唔記得呀？記完手落把。",
    "而家幾點鐘呀喊？走廊鐘唔改 rank。面對縫。",
    "我去擸門入得。把仲凉。擸完推定企。",
    "擸門把推入先得。推完先講第二句。",
    "等我唾一唾先。唾完門都喺度。",
    "唔好催我住先。催完都係推定停。",
    "你究竟想我點做好先？入，定企喺度。",
    "頭先我講嗎句你仲記唔記得？記完手落把。",
    "出面落唔落雨呀？走廊冇天。面對縫。",
    "我行埋去開門先得。縫在。手落去。",
    "過嚟推門先。推完先講第二句。",
    "等陣唔好趕。趕完門都喺前面。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "夠講等我唾多兩秒。唾完推。",
    "第二次頭先嗎句你仲記唔記。記完手落把。",
    "夠講等我唾多陣。唾完推。",
    "第二次頭先嗎句你記唔記得呀。記完手落把。",
    "夠講等我唾一唾先。唾完推。",
    "第二次你究竟想我點做好先。入，定企。",
    "夠講唔好催我住先。催完都係推定停。",
    "第二次出面落唔落雨。走廊冇天。手對把。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次唾多兩秒。把凉。你擬。我靜。",
    "第三次唾多陣。把凉。你擬。",
    "第三次唾一唾先。把凉。你擬。我靜。",
    "第三次你究竟想我點。入，定企。亮描。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。",
    "係。係完要推，定講停。",
    "嗯。嗯完手落把，定企喺度。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……唾多兩秒得。唾完該面對把。",
    "……擴把得。擴完該推。",
    "……擸門入得。擸完該面對縫。",
    "……唔好催。催完都係推定停。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……夠講唾多兩秒。推。",
    "……夠講唾多陣。推。",
    "……夠講唾一唾先。推。",
    "……夠講落雨。走廊冇天。推。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮描。我靜。",
    "……第三次。入定企。我靜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "你講過等我唾多兩秒。唾完仲係推定停。",
    "你講過等我唾多陣。唾完仲係推定停。",
    "你講過等我唾一唾先。唾完仲係推定停。",
    "你頭先問我想你點。答案冇變：入，定企。"
  ];
  var FALLBACK_REPLY = "門就喺度。推定停。";
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
    version: "split1cg"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

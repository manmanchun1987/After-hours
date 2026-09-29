/**
 * GuideLines (split1cg) — Lane B reply/thought pools for GuidePolicy.
 * T2 split1cg: +我去推把入／等我唶多吓先／你而家究竟想我點／頭先講嗰句你記唔記得 仍導向推定停；anti-repeat。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "門就喺前面。推定停——你揃。",
    "開門啦——手就推。唔係就企。",
    "我入去先？門縫喺。手落去。",
    "等等可以。等等完門都喺度。",
    "你想我點？我想你揃：入，定停。",
    "等我擴門把先得。把涼。擴完推定企。",
    "等我唾多兩秒得。唾完門仲喺前面。",
    "你到底要我點做好？淨係推門定停低。",
    "頭先嗰句你仲記唔記？記完手落把。",
    "而家幾點呀喂？走廊冇鐘。面對縫。",
    "今日天氣點呀？走廊冇窗。手對把。",
    "我撚門把入去得。把涼。撚完推定企。",
    "等我唾多陣得。唾完門仲喺度。",
    "你到底想我點做好呀？推門，定停低。",
    "頭先嗰句你記唔記得呀？記完手落把。",
    "而家幾點鐘呀喂？走廊鐘唔改 rank。面對縫。",
    "我去推把入得。把涼。推完推定企。",
    "等我唶多吓先得。唶完門仲喺度。",
    "你而家究竟想我點？推門，定停低。",
    "頭先講嗰句你記唔記得？記完手落把。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "夠講等我唾多兩秒。唾完推。",
    "第二次頭先嗰句你仲記唔記。記完手落把。",
    "夠講等我唾多陣。唾完推。",
    "第二次頭先嗰句你記唔記得呀。記完手落把。",
    "夠講等我唶多吓先。唶完推。",
    "第二次頭先講嗰句你記唔記得。記完手落把。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次唾多兩秒。把涼。你揃。我靜。",
    "第三次唾多陣。把涼。你揃。",
    "第三次唶多吓。把涼。你揃。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲涼。",
    "係。係完要推，定講停。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲涼。",
    "……唾多兩秒得。唾完該面對把。",
    "……撚把得。撚完該推。",
    "……推把入得。推完該面對縫。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……夠講唾多兩秒。推。",
    "……夠講唾多陣。推。",
    "……夠講唶多吓。推。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮揭。我靜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "你講過等我唾多兩秒。唾完仲係推定停。",
    "你講過等我唾多陣。唾完仲係推定停。",
    "你講過等我唶多吓先。唶完仲係推定停。"
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

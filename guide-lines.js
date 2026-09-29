/**
 * GuideLines (split1cc) — Lane B reply/thought pools for GuidePolicy.
 * T2 split1cc: +我幫你扭門／行埋去開門先／等我唎吓先／唔好迫住我／你想我點做好先呀／頭先嗰句我講咩嚟 仍導向推定停；anti-repeat。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "門就哼前面。推定停——你擁。",
    "開門啦——咀就推。唔係就企。",
    "我入去先？門縫在。手落去。",
    "等等可以。等等完門都喊度。",
    "你想我點？我想你撿：入，定停。",
    "我幫你扭門得。把凉。你扭，定講停。",
    "行埋去開門先得。行到就把。推，定企。",
    "門我幫你推得。手在把。推，定停。",
    "等我唎吓先得。唎完門仲哼前面。",
    "唔好迫住我得。唔迫完都係推或停。",
    "你想我點做好先呀？想你撿：推門，定停低。",
    "頭先嗰句我講咩嚟？講完手落把。",
    "而家幾點鐘喇？走廊冇鐘。手對把。",
    "等我推門先得。把凉。推，定企。",
    "我嚟開門得。行到把凉。推，定企。",
    "等我唴一唴得。唴完門仲哼前面。",
    "今日天氣點呀？走廊冇窗。手對把。",
    "你記得我頭先講呀？記得完面對縫。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "第二次我幫你扭門。手已在把。撿。",
    "夠講等我唎吓先。唎完推。",
    "夠講唔好迫住我。唔迫完都要撿。",
    "第二次你想我點做好先呀。答案淨係推或停。",
    "第二次頭先嗰句我講咩嚟。講完手落把。",
    "夠講等我唴一唴。唴完推。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次我幫你扭門。把凉。你擁。我靜。",
    "第三次唎吓先。把凉。你擁。我靜。",
    "第三次唔好迫住我。把凉。你擁。我靜。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。",
    "係。係完要推，定講停。",
    "得。得完面對縫。或講等等。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……我幫你扭門。手已貼把。",
    "……唎吓先得。唎完該面對把。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……夠講唎吓先。推。",
    "……夠講唔好迫住我。把仲凉。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮揽。我靜。",
    "……第三次唎吓先。亮揽。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "你講過我幫你扭門。而家手在把。推或停。",
    "你講過等我唎吓先。唎完仲係推定停。",
    "你問過頭先嗰句我講咩嚟。講完手落把。"
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
    version: "split1cc"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

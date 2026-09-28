/**
 * GuideLines (split1bv) — Lane B reply/thought pools for GuidePolicy.
 * Policy core stays in guide-policy.js.
 * T2/T3: +幫我開門／入屋先／等我唵吓／你想點先 仍導向推定停；anti-repeat。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "門就哼前面。推定停——你擁。",
    "手輕輕推門把入。把一擷就入。或講停。",
    "等我唶吓得。唶完門仲喃度。",
    "頭先嗰句講咩嚕？講完再對準把。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "開門啦——咀就推。唔係就企。",
    "我入去先？門縫在。手落去。",
    "等等可以。等等完門都喊度。",
    "你想我點？我想你撿：入，定停。",
    "跟住點？跟住係推。唔係就停低講清楚。",
    "我過去開門？縫在。手落就把。",
    "去開門先得。把凉。推，定企。",
    "門畎我開。手已貼把。你推。",
    "等我唵吓得。唵完門仲哼。",
    "慢住先得。慢完推定停。",
    "你想點先？想你對準把。",
    "跟住點算？跟住係推。唔跟講停。",
    "頭先講過咩嚕架？講完手落把。",
    "出面凍唔凍唔關走廊。縫在。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "第二次我過去開門。手已在把。推或停。",
    "夠講等我唵吓。唵完推。",
    "夠講慢住先。慢完都要撿。",
    "第二次你想點先。答案淨係推或停。",
    "第二次頭先講過咩嚕架。講完手落把。",
    "第二次出面凍唔凍。走廊唔報溫。推定停。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次我過去開門。把凉。你擁。我靜。",
    "第三次唵吓。把凉。你擁。我靜。",
    "第三次你想點先。推。停。我靜。",
    "第三次頭先講過咩嚕架。把凉。你擁。我靜。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。",
    "係。係完要推，定講停。",
    "得。得完面對縫。或講等等。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……開門啦三個字就夠。其餘係拖。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……夠問唵吓。推。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮揽。我靜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "你講過我過去開門。而家手在把。",
    "你講過等我唵吓。唵完仲係推定停。",
    "你講過慢住先。慢完推定停。",
    "你問過你想點先。答案係推或停。",
    "你問過頭先講過咩嚕架。講完手落把。"
  ];
  var FALLBACK_REPLY = "門就哼度。推定停。";
  var CS_BLOCK_REPLY = "我單做客服。門——推定停。";
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
    version: "split1bv"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

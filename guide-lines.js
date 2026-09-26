/**
 * GuideLines (split1ay) — Lane B reply/thought pools for GuidePolicy.
 * Policy core stays in guide-policy.js.
 * T2/T3: MEM_NUDGE + miss escalate 仍門錨；扭開門／唵吓／溫書未都導向 sceneGoal。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "門就哼前面。推定停——你擁。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "開門啦——咀就推。唔係就企。",
    "我入去先？門縫在。手落去。",
    "等等可以。等等完門都喂度。",
    "你想我點？我想你撿：入，定停。",
    "扭開門？手落把。或講停。",
    "等我唵吓可以。唵完門仲嘁度。",
    "唵一陣得。一陣完推定停。",
    "溫書未。溫完手落把。",
    "書溫未。溫完推，定停。",
    "功課溫未。溫完就把位。",
    "好係咪推吓門。推吓就落手。",
    "繼續？繼續係推。唔係就停低講清楚。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "夠講等我唵吓。唵完推。",
    "第二次溫書未。溫完就入。或講停。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次唵吓。把凉。你擁。我無口。",
    "第三次溫書。把凉。你擁。我靜。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。",
    "係。係完要推，定講停。",
    "得。得完面對縫。或講等等。",
    "繼續？繼續係推。唔係就停低講清楚。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……開門啦三個字就夠。其餘係拖。",
    "……溫書未。溫完該面對把。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……夠問溫書。推。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮揽。我靜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "你講過扭開門。而家手落縫。",
    "你講過等我唵吓。唵完仲係推定停。",
    "溫書未。溫完：推定停。",
    "書溫未。溫完手按把。",
    "功課溫未。溫完就把位。而家手。"
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
    version: "split1ay"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

/**
 * GuideLines (split1) — Lane B reply/thought pools for GuidePolicy.
 * Policy core (sceneGoal / miss / advance) stays in guide-policy.js.
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門就喺前面。推定停——你揀。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "指引？入去。定企定望我。",
    "手按門——或停一秒。其餘之後講。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "我唔代你揀。門。推，定停？",
    "再岔開我當你退。門把凉。",
    "正事係入唔入。推，或停。",
    "少廢話。對準門。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撳下面都得。",
    "夠問。選——入，定企。",
    "門開住。你仲企喺度做乜。",
    "……最後一次：推，定停。",
    "唔好聽閑話。門。而家。"
  ];
  var OPTIONAL_AGREE = [
    "「好」唔等於推。門把仲凉。",
    "同意？跟住——推門，定停低。",
    "嗯。決定落喇手上——入定企。",
    "得。手按門，或停一秒。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "佢喺問界線。定問許可。",
    "想要？先對準門。",
    "……指引唔喺嘴——喺門把。"
  ];
  var THOUGHTS_PRESSURE = [
    "……你打岔。門仲開住。",
    "離題。佢仲企門口。",
    "再迴避，當你退。"
  ];
  var THOUGHTS_CALLOUT = [
    "……再離題，當你退。",
    "夠。亮選擇畀佢。",
    "門——推定停。唔再兜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "記得你講推門。手按落去。"
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
    version: "split1"
  };

  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

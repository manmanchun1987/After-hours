/**
 * GuideLines (split1ak) — Lane B reply/thought pools for GuidePolicy.
 * Policy core (sceneGoal / miss / advance) stays in guide-policy.js.
 * In-character Vera; steer to door/wait; no CS tone; anti-repeat via larger pools.
 * T2/T3: MEM_NUDGE + miss escalate still 門錨；天氣／程式／問句都導向 sceneGoal。
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門就哽前面。推定停——你擁。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。"
  ];
  var THOUGHTS_PRESSURE = [
    "……你打尔。門仲開住。"
  ];
  var THOUGHTS_CALLOUT = [
    "……再離題，當你退。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？"
  ];
  var FALLBACK_REPLY = "門就哽度。推定停。";
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
    version: "split1ak"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

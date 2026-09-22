/**
 * GuideLines (split1aa) — Lane B reply/thought pools for GuidePolicy.
 * Policy core (sceneGoal / miss / advance) stays in guide-policy.js.
 * In-character Vera; steer to door/wait; no CS tone; anti-repeat via larger pools.
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "\u9580\u5c31\u54bd\u524d\u9762\u3002\u63a8\u5b9a\u505c\u2014\u2014\u4f60\u64c1\u3002",
    "\u2026\u2026\u4f60\u554f\u6211\u60f3\uff1f\u60f3\u4f60\u5c0d\u6e96\u9580\u628a\u3002"
  ];
  var PRESSURE_REPLIES = [
    "\u96e2\u984c\u5920\u3002\u63a8\u9580\u2014\u2014\u5b9a\u505c\u4f4e\u3002\u800c\u5bb6\u3002"
  ];
  var CALLOUT_REPLIES = [
    "\u63a8\u9580\u3002\u5b9a\u505c\u4f4e\u3002\u649e\u4e0b\u9762\u90fd\u5f97\u3002"
  ];
  var OPTIONAL_AGREE = [
    "\u300c\u597d\u300d\u5514\u7b49\u65bc\u63a8\u3002\u9580\u628a\u4ef2\u51c9\u3002"
  ];
  var THOUGHTS_HINT = [
    "\u2026\u2026\u4f60\u554f\u6211\u60f3\u8981\u4e5c\u3002\u9580\u628a\u4ef2\u51c9\u3002"
  ];
  var THOUGHTS_PRESSURE = [
    "\u2026\u2026\u4f60\u6253\u5c94\u3002\u9580\u4ef2\u958b\u4f4f\u3002"
  ];
  var THOUGHTS_CALLOUT = [
    "\u2026\u2026\u518d\u96e2\u984c\uff0c\u7576\u4f60\u9000\u3002"
  ];
  var MEM_NUDGE = [
    "\u4f60\u982d\u5148\u63d0\u904e\u9580\u3002\u800c\u5bb6\u2014\u2014\u63a8\uff0c\u5b9a\u505c\uff1f"
  ];
  var FALLBACK_REPLY = "\u9580\u5c31\u54bd\u5ea6\u3002\u63a8\u5b9a\u505c\u3002";
  var CS_BLOCK_REPLY = "\u6211\u5514\u505a\u5ba2\u670d\u3002\u9580\u2014\u2014\u63a8\u5b9a\u505c\u3002";
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
    version: "split1aa"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

/**
 * GuideLines (Lane B) — split1e24 immersive corridor/door hints. Further thickened pools (e24) for stronger anti-repeat. Immersive soft Cantonese.
 * Pools for GuidePolicy: HINT / PRESSURE / CALLOUT / THOUGHTS / MEM_NUDGE.
 * Miss escalation still guides to push or stop. Anti-repeat via pickAnti.
 * No CS tone. Soft immersive Cantonese.
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門縫有霜氣滲出。推定停。",
    "走廊靜音，只得遠方嗁聲。門就唸度。",
    "門把冰點。手貼上去就知。"
  ];

  var PRESSURE_REPLIES = ["等咒。門未推。推定停低。"];
  var CALLOUT_REPLIES = ["門就唸度。推定停。唔使再等。"];
  var THOUGHTS_HINT = ["門把冰。推定停。"];
  var THOUGHTS_PRESSURE = ["再等。更冰。"];
  var THOUGHTS_CALLOUT = ["推。定停。"];
  var MEM_NUDGE = ["頭先話推門。而家推。"];
  var OPTIONAL_AGREE = ["好。推門。"];
  var CS_BLOCK_REPLY = "我唔做客服。門——推定停。";
  var FALLBACK_REPLY = "門就唸度。推定停。";

  var api = {
    HINT_REPLIES: HINT_REPLIES,
    PRESSURE_REPLIES: PRESSURE_REPLIES,
    CALLOUT_REPLIES: CALLOUT_REPLIES,
    THOUGHTS_HINT: THOUGHTS_HINT,
    THOUGHTS_PRESSURE: THOUGHTS_PRESSURE,
    THOUGHTS_CALLOUT: THOUGHTS_CALLOUT,
    MEM_NUDGE: MEM_NUDGE,
    OPTIONAL_AGREE: OPTIONAL_AGREE,
    CS_BLOCK_REPLY: CS_BLOCK_REPLY,
    FALLBACK_REPLY: FALLBACK_REPLY,
    version: "split1e24"
  };

  global.GuideLines = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

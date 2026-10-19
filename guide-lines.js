/**
 * GuideLines (Lane B) — split1e25 immersive corridor/door hints. Further thickened pools (e25) for stronger anti-repeat. Immersive soft Cantonese.
 * Pools for GuidePolicy: HINT / PRESSURE / CALLOUT / THOUGHTS / MEM_NUDGE.
 * Miss escalation still guides to push or stop. Anti-repeat via pickAnti.
 * No CS tone. Soft immersive Cantonese.
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門縫有霜氣滲出。推定停。",
    "走廊靜音，只得遠方嗁聲。門就唸度。",
    "門把冰點。手貼上去就知。",
    "天花冷凝水滴聲。你要入定停低。",
    "地磚冷傳上嚟。推門先。",
    "扶手冰滑。停低定推開。",
    "觀察窗有冰霧。入去睇清楚。",
    "出口燈冰光微跳。門框冷。",
    "地毯冰壓鞋底。推定停。",
    "呼吸有冰霧。門把冰刺。",
    "鞋跟冰響走廊。推開個門。",
    "門框有冰裂痕。停低認位。",
    "牆面冰溫。手貼先。",
    "地漏有冰聲。推定停低。",
    "燈管冰震微響。門就唸前。",
    "塵粒唸燈下飛。遠方嗁聲。",
    "金屬冰觸門把。推開。",
    "影動未止。停低定入。",
    "門框冷傳上手。推。",
    "地磚微響。你要決定。"
  ];

  var PRESSURE_REPLIES = [
    "等咒。門未推。推定停低。",
    "再等。冰氣重。推門。",
    "停低太耐。門把更冰。推。",
    "認位未完。推開先。",
    "等陣先。但門就唸度。推定停。",
    "未準備好。但要決定。推。",
    "再等等。霜氣更重。推開。",
    "停低認位。門框冷。推。",
    "未敢停低。推門先。",
    "等陣。冰刺更明顯。推定停。"
  ];

  var CALLOUT_REPLIES = [
    "門就唸度。推定停。唔使再等。",
    "推開。定停低。決定。",
    "冰氣未散。推門。",
    "走廊等你。推定停。",
    "門把唸度。推。",
    "再等就結霜。推開。",
    "停低定入去。揀。",
    "門未開。推。",
    "決定。推定停低。",
    "唔使再認位。推門。"
  ];

  var THOUGHTS_HINT = [
    "門把冰。推定停。",
    "霜氣。入定停低。",
    "走廊靜。決定。",
    "門就唸前。推。",
    "冰刺掌心。推開。"
  ];

  var THOUGHTS_PRESSURE = [
    "再等。更冰。",
    "停低太耐。推。",
    "門未開。決定。",
    "霜氣重。推定停。",
    "等唔係答案。推。"
  ];

  var THOUGHTS_CALLOUT = [
    "推。定停。",
    "門唸度。決定。",
    "唔使再等。推。",
    "推開個門。",
    "停低定入。"
  ];

  var MEM_NUDGE = [
    "頭先話推門。而家推。",
    "記得門就唸度。推定停。",
    "之前想入。而家推開。",
    "聽低咒。推門先。",
    "記著。推定停低。"
  ];

  var OPTIONAL_AGREE = [
    "好。推門。",
    "係。入去。",
    "得。推開。",
    "繼續。門唸度。",
    "好。停低定推。"
  ];

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
    version: "split1e25"
  };

  global.GuideLines = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

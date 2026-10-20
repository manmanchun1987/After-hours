/**
 * GuideLines (Lane B) — split1e26 immersive corridor/door hints. Further thickened pools (e26) for stronger anti-repeat. Immersive soft Cantonese.
 * Pools for GuidePolicy: HINT / PRESSURE / CALLOUT / THOUGHTS / MEM_NUDGE.
 * Miss escalation still guides to push or stop. Anti-repeat via pickAnti.
 * No CS tone. Soft immersive Cantonese.
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門縫有霜氣滲出。推定停。",
    "走廊靜音，只得遠方嗁聲。門就念度。",
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
    "燈管冰震微響。門就念前。",
    "塵粒念燈下飛。遠方嗁聲。",
    "金屬冰觸門把。推開。",
    "影動未止。停低定入。",
    "門框冷傳上手。推。",
    "地磚微響。你要決定。",
    "霜花爬上門框。推定停。",
    "冷氣從門縫鑽出。推開睇。",
    "走廊燈閃一下。門念度。",
    "手背起雞皮。停低定推。",
    "鞋底踩到冰渣。推門。",
    "遠方嗁聲近咗。門就前。",
    "門把有霜。手貼確認。",
    "牆角結霜。推定停低。",
    "呼吸白霧。你要決定。",
    "燈管翁翁。門框冷。",
    "地磚反光冰影。推開。",
    "門縫有聲。停低聽。",
    "扶手更冰。推定停。",
    "觀察窗霧更厚。入去。",
    "出口燈暗咗。門念度。"
  ];

  var PRESSURE_REPLIES = [
    "等咒。門未推。推定停低。",
    "再等。冰氣重。推門。",
    "停低太耐。門把更冰。推。",
    "認位未完。推開先。",
    "等陣先。但門就念度。推定停。",
    "未準備好。但要決定。推。",
    "再等等。霜氣更重。推開。",
    "停低認位。門框冷。推。",
    "未敢停低。推門先。",
    "等陣。冰刺更明顯。推定停。",
    "再拖。霜更厚。推。",
    "停低唔係答案。門念度。",
    "等咒夠喇。推開。",
    "冰氣逼緊。決定。",
    "門未動。推定停。",
    "再等就結冰。推門。",
    "認位完未？推。",
    "霜爬上手。推定停。",
    "時間過。門就前。",
    "停低太靜。推開。"
  ];

  var CALLOUT_REPLIES = [
    "門就念度。推定停。唔使再等。",
    "推開。定停低。決定。",
    "冰氣未散。推門。",
    "走廊等你。推定停。",
    "門把念度。推。",
    "再等就結霜。推開。",
    "停低定入去。揀。",
    "門未開。推。",
    "決定。推定停低。",
    "唔使再認位。推門。",
    "而家。推定停。",
    "門框念度。決定。",
    "霜未散。推開。",
    "唔使再等咒。推。",
    "入定停。門念前。",
    "推。冰氣重。",
    "停低完未？推門。",
    "門就前。推定停。",
    "決定喇。推開。",
    "再等無益。推。"
  ];

  var THOUGHTS_HINT = [
    "門把冰。推定停。",
    "霜氣。入定停低。",
    "走廊靜。決定。",
    "門就念前。推。",
    "冰刺掌心。推開。",
    "霜爬門框。停。",
    "冷從縫出。推。",
    "燈閃。門念度。",
    "雞皮。決定。",
    "冰渣腳下。推。"
  ];

  var THOUGHTS_PRESSURE = [
    "再等。更冰。",
    "停低太耐。推。",
    "門未開。決定。",
    "霜氣重。推定停。",
    "等唔係答案。推。",
    "拖太耐。推門。",
    "冰逼緊。決定。",
    "再等結霜。推。",
    "時間過。門前。",
    "停低靜。推開。"
  ];

  var THOUGHTS_CALLOUT = [
    "推。定停。",
    "門念度。決定。",
    "唔使再等。推。",
    "推開個門。",
    "停低定入。",
    "而家決定。",
    "門框前。推。",
    "霜未散。推開。",
    "入定停。",
    "再等無益。"
  ];

  var MEM_NUDGE = [
    "頭先話推門。而家推。",
    "記得門就念度。推定停。",
    "之前想入。而家推開。",
    "聽低咒。推門先。",
    "記著。推定停低。",
    "頭先停低。而家決定。",
    "記得霜氣。推開。",
    "之前認位。而家推。",
    "聽過門念度。推。",
    "記低。推定停。"
  ];

  var OPTIONAL_AGREE = [
    "好。推門。",
    "係。入去。",
    "得。推開。",
    "繼續。門念度。",
    "好。停低定推。",
    "得。決定。",
    "好。推定停。",
    "係。推開。",
    "繼續。門前。",
    "得。推。"
  ];

  var CS_BLOCK_REPLY = "我唔做客服。門——推定停。";
  var FALLBACK_REPLY = "門就念度。推定停。";

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
    version: "split1e26"
  };

  global.GuideLines = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

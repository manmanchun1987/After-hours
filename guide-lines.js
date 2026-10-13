/**
 * GuideLines (split1e6) — Lane B reply/thought pools for GuidePolicy.
 * T3 split1e3: 開門啦／我入去先／進去看看／等等／未準備好／想我點／
 * 天氣／記頭先；靠入／論多十五陣／想我點先呀咖／聽日天氣點呀咖／停一停；
 * miss 升級仍導向推或停；anti-repeat；禁客服腔。
 * 新批已加：噴淋頭／走廊鏡／防滑套／出口箭／門底縫／冷氣口／樓層指示／防火貼紙／門框螺絲／地毯絨——唔重複閉門器臂／門磁／喇叭／扶手／格柱／門檻石／緊急照明／對講。
 * split1e5: 加厚門軸鏽／閾石凉／地毯毛／縫風／燈閃／銅綠再／鞋底黏／呼吸白氣／指印／門號反光；miss仍導向推或停；anti-repeat。
 * split1e6: 再加厚鈩鍊油／地腳線裂／冷氣聲／門牌反光／扶手冷／鏡面指紋／噴淋頭水潰／出口箭黃／門底塵／地毯邊毛；miss升級仍導向推或停；anti-repeat；禁客服。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "開門啦。門腳止未踢。踢完——推，定停？",
    "我入去先。防煙條未貼。入完仲係推定停。",
    "進去看看。出口燈綠。睇完面對縫。",
    "等等得。靜音條未貼。等完門仲喺前面。",
    "我未準備好。門榆未低。準備完仲係推定停。",
    "你想我點？觀察窗暗。入，定企喺鈤鏈蓋前。",
    "今日天氣點呀？走廊唔窗。地漏唔係天。面對縫。",
    "你記得我頭先講呀？記完手落把。門腳止唔係門。",
    "門縫有風。你擁入，定企喺消防喉轎側。",
    "感應燈閃完。手對把，定講停。",
    "門軸有鏽。鏽屑落手。落完——推，定停？",
    "閾石凉。腳未踏。踏完面對縫。",
    "地毯毛未壓。壓完先講第二句。",
    "縫風吹腳踝。吹完手落把，定講停。",
    "燈管閃兩下。閃完門仲喺前面。",
    "銅綠再摸都凉。摸完推定企。",
    "鞋底黏住絨。黏完跨檻，定停低。",
    "呼吸有白氣。氣消完都係推或停。",
    "指印留喺把。留完你擁，定企。",
    "門號反光。反完面對縫。",
    "鈩鍊有油。油未乾。乾完——推，定停低。",
    "地腳線裂。裂紋入塵。塵完手落把。",
    "冷氣聲低。低完門仲喺前面。面對縫。",
    "門牌反光。反完你推，定企喺側。",
    "扶手冷。冷完跨檻，定講停。",
    "鏡面有指紋。指紋未抹。抹完推定停。",
    "噴淋頭有水潰。水潰未乾。乾完入，定停。",
    "出口箭黃。黃完門腳止未踢。踢完推。",
    "門底有塵。塵未掃。掃完面對縫。",
    "地毯邊毛起。起完你擁入，定停低。"
  ];
  var PRESSURE_REPLIES = [
    "門就喺前面。你仲企。推，定停低。",
    "門軸鏽未落。落完——而家推，定停？",
    "鈩鍊油未乾。乾完你入，定企喺走廊。",
    "縫風未停。停完手落把，定講停。",
    "燈閃完。閃完門仲喺度。而家推。"
  ];
  var CALLOUT_REPLIES = [
    "你仲喺走廊。門軸鏽喺度。",
    "你企咗好耐。門就前面。推，定停。",
    "走廊燈暗。門縫有風。而家決定。"
  ];
  var THOUGHTS_HINT = [
    "門就喺前面。你仲企。",
    "鏽喺軸。風喺縫。而家。",
    "油喺鈩。塵喺底。推或停。"
  ];
  var THOUGHTS_PRESSURE = [
    "企太耐。門唔會自己開。",
    "風仲吹。你仲未決定。"
  ];
  var THOUGHTS_CALLOUT = [
    "你仲喺度。門喺度。",
    "唔推唔停。走廊等你。"
  ];
  var OPTIONAL_AGREE = [
    "好。入嚟認位。門開咗。",
    "得。你嚟。跨檻。"
  ];
  var MEM_NUDGE = [
    "頭先你講推。而家推，定改口停。",
    "記得門口。而家面對縫。"
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
    version: "split1e6"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

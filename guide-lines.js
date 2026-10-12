/**
 * GuideLines (split1e5) — Lane B reply/thought pools for GuidePolicy.
 * T3 split1e3: 開門啦／我入去先／進去看看／等等／未準備好／想我點／
 * 天氣／記頭先；靠入／論多十五陣／想我點先呀啡／聽日天氣點呀啡／停一停；
 * miss 升級仍導向推或停；anti-repeat；禁客服腔。
 * 新批已加：噴淋頭／走廊鏡／防滑套／出口箭／門底縫／冷氣口／樓層指示／防火貼紙／門框螺絲／地毯絨——唔重複閉門器臂／門磁／喇叭／扶手／格柱／門檻石／緊急照明／對講。
 * split1e5: 加厚門軸鏽／閾石凉／地毯毛／縫風／燈閃／銅綠再／鞋底黏／呼吸白氣／指印／門號反光；miss仍導向推或停；anti-repeat。
 */
(function (global) {
  "use strict";
  var HINT_REPLIES = [
    "開門啦。門腳止未踢。踢完——推，定停？",
    "我入去先。防煙條未貼。入完仲係推定停。",
    "進去看看。出口燈綠。睇完面對縫。",
    "等等得。靜音條未貼。等完門仲喺前面。",
    "我未準備好。門榆未低。準備完仲係推定停。",
    "你想我點？觀察窗暗。入，定企喺鉁鏈蓋前。",
    "今日天氣點呀？走廊冇窗。地漏唔係天。面對縫。",
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
    "門號反光。反完面對縫。"
  ];
  var PRESSURE_REPLIES = [
    "門就喺前面。你仲企。推，定停低。",
    "門軸鏽未落。落完——而家推，定停？"
  ];
  var CALLOUT_REPLIES = [
    "你仲喺走廊。門軸鏽喺度。"
  ];
  var THOUGHTS_HINT = [
    "門就喺前面。你仲企。",
    "鏽喺軸。風喺縫。而家。"
  ];
  var THOUGHTS_PRESSURE = [];
  var THOUGHTS_CALLOUT = [];
  var OPTIONAL_AGREE = [];
  var MEM_NUDGE = [];
  var FALLBACK_REPLY = "門就嗎度。推定停。";
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
    version: "split1e5"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

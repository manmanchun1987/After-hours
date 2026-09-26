/**
 * GuideLines (split1aw) — Lane B reply/thought pools for GuidePolicy.
 * Policy core (sceneGoal / miss / advance) stays in guide-policy.js.
 * In-character Vera; steer to door/wait; no CS tone; anti-repeat via larger pools.
 * T2/T3: MEM_NUDGE + miss escalate 仍門錨；複課／背功課／溫返功課／等我唶吓 都導向 sceneGoal。
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門就哼前面。推定停——你擁。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "指引？入去。定企定望我。",
    "手按門—或停一秒。其餘之後講。",
    "你問我想你點？推門，或企哼度。",
    "門把在你手邊。你單係只可以問。",
    "我單會替你走入去。但門仲開住。",
    "你想知道下一步？推門。或停低。",
    "講多都係一句：入，定企。",
    "開門啦——咀就推。唔係就企。",
    "我入去先？門縫在。手落去。",
    "等等可以。等等完門都喂度。",
    "你想我點？我想你撿：入，定停。",
    "我唔做客服清單。我等人推門。",
    "複課未。複完就把。手落。",
    "背功課未。背完面對縫。",
    "溫返功課未。溫返就把位。",
    "功課溫返未。溫完推，定停。",
    "等我唶吓可以。唶完門仲喂度。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "天氣唔開呢度門。你開。",
    "第二次離題。我冷過冷氣。手落把。",
    "夠問複課未。複完推。",
    "第二次背功課。背完就入。或講停。",
    "夠講等我唶吓。唶完推。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次。亮揽。推門。停低。我靜。",
    "第三次。複課都要擁。我靜。",
    "第三次唶吓。把凉。你擁。我無口。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。",
    "係。係完要推，定講停。",
    "得。得完面對縫。或講等等。",
    "繼續？繼續係推。唔係就停低講清楚。",
    "好係咪推吓門。推吓就落手。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……複課未。複完該面對把。",
    "……背功課未。背完該推。",
    "……等我唶吓。唶完該手落。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……夠問複課。推。",
    "……第二次唶吓。聲短。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮揽。我靜。",
    "……第三次。複課都要擁。我靜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "記得你講推門。手按落去。",
    "複課未。複完：推定停。",
    "背功課未。背完手按把。",
    "溫返功課未。溫返就把位。而家手。",
    "功課溫返未。溫完面對縫。",
    "你講過等我唶吓。唶完仲係推定停。",
    "溫功課未。溫功課：你頭先對準縫。而家擁。",
    "你講過拉開門先。而家手落縫。"
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
    version: "split1aw"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

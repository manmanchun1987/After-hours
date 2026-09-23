/**
 * GuideLines (split1ad) — Lane B reply/thought pools for GuidePolicy.
 * Policy core (sceneGoal / miss / advance) stays in guide-policy.js.
 * In-character Vera; steer to door/wait; no CS tone; anti-repeat via larger pools.
 * T2: MEM_NUDGE 門錨（記住未呀／講返俾我聽／記著咖未）
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門就咽前面。推定停——你擁。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "指引？入去。定企定望我。",
    "手按門—或停一秒。其餘之後講。",
    "你問我想你點？推門，或企咽度。",
    "門把在你手邊。你嗮係只可以問。",
    "我嗮會替你走入去。但門仲開住。",
    "你想知道下一步？推門。或停低。",
    "講多都係一句：入，定企。",
    "你話聽住未。聽住就面對縫。推，定停。",
    "記著未都係把。手落去。",
    "覆述吓？覆述完推門。嗮好只覆述。",
    "你聽到未？聽到就推。或講停。",
    "頭先我講門。而家你擁未。",
    "想入就入。想等就等。走廊嗮賣第三個答案。",
    "問完可以推。問完亦可以停。就係咁。",
    "我嗮做路標。入，定企。",
    "你未準備好就講停。嗮好用問句拖。",
    "走廊嗮賣第三個答案。你知。",
    "記低咖未也係把。手落去。",
    "覆述一遍？覆述完推。或講停。",
    "記住未呀？記住就面對縫。",
    "講返俾我聽未都係把。手。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "我嗮代你擁。門。推，定停？",
    "再尔開我當你退。門把凉。",
    "第二次。嗮再轉圍。推，定停。",
    "天氣、程式、我係乜——都嗮係今晚事。門。",
    "第二次。聽住未都係把。推，定停。",
    "夠問記著未。記著就推。",
    "覆述多一輪當退。門把嗮退。",
    "你聽到未仲問。我聲短。手。",
    "夠聽。入。企。而家。",
    "夠。推。停。",
    "離題升級。答案嗮升級：門。",
    "夠問記低咖未。記完推。",
    "夠問記住未呀。記住就推。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "夠問。選—入，定企。",
    "第三次。亮掽。推門。停低。我靜。",
    "第三次。亮掽。聽完都係推定停。",
    "夠覆述。選擇出噓。我靜。",
    "最後一句：你聽到未都要擁。",
    "亮掽。記著未都係入定企。",
    "夠。推。停。我收口。",
    "亮掽。記低咖未都係推定停。",
    "亮掽。記住未呀都係推定停。"
  ];
  var OPTIONAL_AGREE = [
    "「好」嗮等於推。門把仲凉。",
    "同意？跟住——推門，定停低。",
    "「好」聽到。聽到之後手落把。",
    "係。係完要推，定講停。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……佢問聽住未。聽住就應該推。",
    "……記著未。記著都係把。",
    "……佢想覆述。覆述嗮等於入。",
    "……記低咖未。記完面對縫。",
    "……記住未呀。記住就該面對把。"
  ];
  var THOUGHTS_PRESSURE = [
    "……你打尔。門仲開住。",
    "……第二次。聽住未都要擁。",
    "……夠問記嗮記。手。"
  ];
  var THOUGHTS_CALLOUT = [
    "……再離題，當你退。",
    "……第三次。亮掽。我靜。",
    "……夠覆述。佢選。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "記得你講推門。手按落去。",
    "你講過要入去。門把仲在。",
    "你話聽住未。我講過門。而家推未。",
    "記著未。記著：你頭先對準縫。",
    "覆述吓。頭先你提過門。手按落去。",
    "你聽到未。聽到我講門。推，定停。",
    "頭先我講。你問記嗮記。記完手落把。",
    "聽住未就面對把。嗮好再覆述一次。",
    "記低咖未。記低：你講過推門。手按落去。",
    "覆述一遍。頭先你提過門。推，定停。",
    "你聽到我頭先未。頭先係門。手。",
    "講返一次未。講返完推門。嗮好只講。",
    "記住未呀。記住：你頭先對準門。",
    "講返俾我聽未。頭先係推門。手落把。",
    "記著咖未。記著就面對縫。"
  ];
  var FALLBACK_REPLY = "門就咽度。推定停。";
  var CS_BLOCK_REPLY = "我嗮做客服。門——推定停。";
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
    version: "split1ad"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

/**
 * GuideLines (split1j) — Lane B reply/thought pools for GuidePolicy.
 * Policy core (sceneGoal / miss / advance) stays in guide-policy.js.
 * In-character Vera; steer to door/wait; no CS tone; anti-repeat via larger pools.
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門就咽前面。推定停——你擁。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "指引？入去。定企定望我。",
    "手按門——或停一秒。其餘之後講。",
    "你問我想你點？推門，或企吓度。",
    "門把在你手邊。你唔係只可以問。",
    "我唔會替你走入去。但門仲開住。",
    "你想知道下一步？推門。或停低。",
    "講多都係一句：入，定企。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "我唔代你擁。門。推，定停？",
    "再岔開我當你退。門把凉。",
    "第二次。短答：入，定企。",
    "夠。推。停。",
    "唔聽。門。",
    "第二句。短。門。",
    "夠。入定企。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "夠問。選——入，定企。",
    "……最後一次：推，定停。",
    "推。停。二選一。就係咁。"
  ];
  var OPTIONAL_AGREE = [
    "「好」唔等於推。門把仲凉。",
    "同意？跟住——推門，定停低。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "想要？先對準門。"
  ];
  var THOUGHTS_PRESSURE = [
    "……你打岔。門仲開住。",
    "離題。佢仲企門口。"
  ];
  var THOUGHTS_CALLOUT = [
    "……再離題，當你退。",
    "夠。亮選擇界佢。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "記得你講推門。手按落去。",
    "你講過要入去。門把仲在。",
    "你話想入。我記得。手按落去。",
    "你講過想推。我記得。而家手。",
    "頭先「我想推門」——我聽到。而家推。",
    "記得你講推。唔好當我改口講停。",
    "你頭先講開門。我跟住門，唔跟住等。",
    "你問記唔記得。記得：你想推門。手。",
    "有冇記住？記住你講入去。門把仲凉。",
    "你頭先話開門。我唔當聽漏。推。",
    "記得你講推門。唔係停。手按把。",
    "你問我記唔記。記。門。你講過。",
    "頭先想入嗰句——我接住。推門。",
    "你記得未？我記得你要入。門口。"
  ];
  var FALLBACK_REPLY = "門就咽度。推定停。";
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
    version: "split1j"
  };

  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

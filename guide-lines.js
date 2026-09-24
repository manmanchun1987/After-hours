/**
 * GuideLines (split1am) — Lane B reply/thought pools for GuidePolicy.
 * Policy core (sceneGoal / miss / advance) stays in guide-policy.js.
 * In-character Vera; steer to door/wait; no CS tone; anti-repeat via larger pools.
 * T2/T3: MEM_NUDGE + miss escalate still 門錨；默底／背底／默齊／錄晒底 都導向 sceneGoal。
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門就哽前面。推定停——你擁。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "指引？入去。定企定望我。",
    "手按門—或停一秒。其餘之後講。",
    "你問我想你點？推門，或企哽度。",
    "門把在你手邊。你單係只可以問。",
    "我單會替你走入去。但門仲開住。",
    "你想知道下一步？推門。或停低。",
    "講多都係一句：入，定企。",
    "開門啦——咁就推。唔係就企。",
    "我入去先？門縫在。手落去。",
    "等等可以。等等完門都喂度。",
    "你想我點？我想你撿：入，定停。",
    "我唔做客服清單。我等人推門。",
    "收晒未呀。收晒就把。手落。",
    "有冇錄低。錄低完面對縫。",
    "你有冇錄返。錄返就把位。",
    "收返未呀。收返面對把。推，定停。",
    "記返齊未。齊完手。單好只記。",
    "默底未。默底完面對縫。",
    "背底未。背底就把。手落。",
    "默齊未。齊完推，定停。",
    "你問天氣。走廊唔賣。門賣。",
    "對唔住收到。收到之後入定企。",
    "唔入可以。講停。唔好兜第三個答案。",
    "我而家應該做咩？而家：手落把，或講等等。",
    "你係咪程式？我唔答呢句。門把凉。",
    "我唔係客服熱線。我等人手落把。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "夠。推。停。",
    "天氣唔開呢度門。你開。",
    "第二次離題。我冷過冷氣。手落把。",
    "程式？我唔係。門係。推。",
    "夠問收晒未呀。收完推。",
    "夠問有冇錄低。錄完手落把。",
    "第二次錄返。錄完就入。或講停。",
    "夠問記返齊未。齊完推。",
    "夠問默底未。默完推。",
    "第二次背底。背完就入。或講停。",
    "第二次天氣。我當你退半步。手。",
    "夠問我係咪程式。門先答。推。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撞下面都得。",
    "第三次。亮揽。推門。停低。我靜。",
    "夠。推。停。我收口。",
    "亮揽。收晒未呀都係推定停。",
    "第三次。有冇錄低都要擁。我靜。",
    "最後。記返齊未都係入定企。我收口。",
    "第三次。默底未都要擁。我靜。",
    "第三次天氣。把凉。你擁。我無口。"
  ];
  var OPTIONAL_AGREE = [
    "「好」單等於推。門把仲凉。",
    "係。係完要推，定講停。",
    "得。得完面對縫。或講等等。",
    "繼續？繼續係推。唔係就停低講清楚。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "……開門啦三個字就夠。其餘係拖。",
    "……收晒未呀。收完該面對把。",
    "……有冇錄低。錄完手。",
    "……記返齊未。齊就該推。",
    "……默底未。默完該面對把。",
    "……佢問天氣。走廊唔賣。"
  ];
  var THOUGHTS_PRESSURE = [
    "……第二次離題。當半退。",
    "……天氣又嚟。我聲短。",
    "……夠問錄低。手。",
    "……夠問記返齊。推。",
    "……夠問默底。推。"
  ];
  var THOUGHTS_CALLOUT = [
    "……第三次。亮揽。我靜。",
    "……第三次。錄低都要擁。我靜。",
    "……亮揽。收晒都係推定停。",
    "……第三次。默底都要擁。我靜。"
  ];
  var MEM_NUDGE = [
    "你頭先提過門。而家——推，定停？",
    "記得你講推門。手按落去。",
    "收晒未呀。收晒：你頭先對準縫。而家擁。",
    "有冇錄低。錄低：推定停。手按落去。",
    "你有冇錄返。錄返就把位。而家手。",
    "收返未呀。收返：你講過推門。手落把。",
    "記返齊未。記返齊：走廊兩個答案。而家撿。",
    "默底未。默底：你頭先對準縫。而家擁。",
    "背底未。背底就把位。而家手。",
    "默齊未。齊完：推定停。",
    "你頭先問天氣。我講過唔賣。而家門把仲凉。"
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
    version: "split1am"
  };
  global.GuideLines = api;
  global.GUIDE_LINES = api;
})(typeof window !== "undefined" ? window : globalThis);

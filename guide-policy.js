/**
 * GuidePolicy (guide1) — steers freeChat toward node.sceneGoal.
 * Input: classified intent + sceneGoal + memory + missCount
 * Output: { strategy, reply, advance, showChoices, thought, missCount }
 * Loaded after IntentEngine so it can reuse classify pools / anti-repeat.
 */
(function (global) {
  "use strict";

  var HINT_REPLIES = [
    "門就喺前面。推定停——你揀。",
    "……你問我想？想你對準門把。",
    "走廊兩個選項：推門，或停低。",
    "指引？入去。定企定望我。",
    "手按門——或停一秒。其餘之後講。"
  ];
  var PRESSURE_REPLIES = [
    "離題夠。推門——定停低。而家。",
    "我唔代你揀。門。推，定停？",
    "再岔開我當你退。門把凉。",
    "正事係入唔入。推，或停。",
    "少廢話。對準門。"
  ];
  var CALLOUT_REPLIES = [
    "推門。定停低。撳下面都得。",
    "夠問。選——入，定企。",
    "門開住。你仲企喺度做乜。",
    "……最後一次：推，定停。",
    "唔好聽閑話。門。而家。"
  ];
  var OPTIONAL_AGREE = [
    "「好」唔等於推。門把仲凉。",
    "同意？跟住——推門，定停低。",
    "嗯。決定落喇手上——入定企。",
    "得。手按門，或停一秒。"
  ];
  var THOUGHTS_HINT = [
    "……你問我想要乜。門把仲凉。",
    "佢喺問界線。定問許可。",
    "想要？先對準門。",
    "……指引唔喺嘴——喺門把。"
  ];
  var THOUGHTS_PRESSURE = [
    "……你打岔。門仲開住。",
    "離題。佢仲企門口。",
    "再迴避，當你退。"
  ];
  var THOUGHTS_CALLOUT = [
    "……再離題，當你退。",
    "夠。亮選擇畀佢。",
    "門——推定停。唔再兜。"
  ];

  function recentOf(state) {
    return (state && state.recentBotReplies) || [];
  }

  function pickAnti(pool, recent) {
    var list = (pool || []).filter(Boolean);
    if (!list.length) return "";
    recent = recent || [];
    if (global.IntentEngine && typeof global.IntentEngine.pickReply === "function") {
      // IntentEngine.pickFrom is private; local anti-repeat mirrors it
    }
    var fresh = list.filter(function (l) { return recent.indexOf(l) < 0; });
    var use = fresh.length ? fresh : list;
    return use[Math.floor(Math.random() * use.length)];
  }

  function getGoal(node) {
    return (node && node.sceneGoal) || null;
  }

  function isSuccess(id, goal) {
    return !!(goal && Array.isArray(goal.successIntents) && goal.successIntents.indexOf(id) >= 0);
  }

  function isOptional(id, goal) {
    return !!(goal && Array.isArray(goal.optionalIntents) && goal.optionalIntents.indexOf(id) >= 0);
  }

  function strategyFor(missCount, maxMisses, intentId) {
    if (missCount <= 1) return "hint";
    if (missCount === 2) return "pressure";
    if (missCount >= Math.max(3, maxMisses || 3)) return "callout";
    return "pressure";
  }

  function poolFor(strategy, intentId) {
    if (intentId === "agree") return OPTIONAL_AGREE;
    if (strategy === "callout") return CALLOUT_REPLIES;
    if (strategy === "pressure") return PRESSURE_REPLIES;
    return HINT_REPLIES;
  }

  function thoughtFor(strategy) {
    if (strategy === "callout") return pickAnti(THOUGHTS_CALLOUT, []);
    if (strategy === "pressure") return pickAnti(THOUGHTS_PRESSURE, []);
    return pickAnti(THOUGHTS_HINT, []);
  }

  /**
   * @param {object} input
   * @param {object} input.intent - classified { id, text, ... }
   * @param {object} input.sceneGoal
   * @param {array}  [input.memory]
   * @param {number} [input.missCount]
   * @param {object} [input.state]
   * @param {object} [input.node]
   * @param {string} [input.tone]
   */
  function decide(input) {
    input = input || {};
    var intent = input.intent || {};
    var id = intent.id || "unclear";
    var goal = input.sceneGoal || getGoal(input.node);
    if (!goal) return null;

    var state = input.state || null;
    var recent = recentOf(state);
    var missCount = typeof input.missCount === "number"
      ? input.missCount
      : (state && state.guideMissCount) || 0;
    var maxMisses = goal.maxMisses || 3;
    var memory = input.memory || (state && state.chatMemory) || [];

    // Only success intents advance the scene.
    if (isSuccess(id, goal)) {
      return {
        strategy: "close",
        reply: null,
        advance: true,
        showChoices: false,
        thought: null,
        missCount: 0,
        resetMisses: true
      };
    }

    // Non-success → miss (optional ask_want/agree still steer; do not advance)
    var nextMiss = missCount + 1;
    var strategy = strategyFor(nextMiss, maxMisses, id);

    // Prefer IntentEngine materials when available (anti-repeat via recentBotReplies)
    var reply = null;
    if (global.IntentEngine && typeof global.IntentEngine.pickReply === "function") {
      var engLine = global.IntentEngine.pickReply(intent, {
        node: input.node,
        state: state,
        tone: input.tone || (state && state.chatTone) || "cold"
      });
      if (engLine) reply = engLine;
    }
    if (!reply) reply = pickAnti(poolFor(strategy, id), recent);

    // Escalate colder on 2nd+ miss: if engine returned a soft line, prefer pressure/callout pool
    if (nextMiss >= 2) {
      var cold = pickAnti(poolFor(strategy, id), recent.concat(reply ? [reply] : []));
      if (cold) reply = cold;
    }

    // Light memory nudge: if player mentioned door earlier, acknowledge once
    try {
      var memStr = JSON.stringify(memory || []).slice(0, 400);
      if (/推門|門口|入去/.test(memStr) && nextMiss <= 2 && id === "ask_want") {
        var memLine = pickAnti([
          "你頭先提過門。而家——推，定停？",
          "記得你講推門。手按落去。"
        ], recent);
        if (memLine) reply = memLine;
      }
    } catch (e) {}

    // Strip CS leakage (do not flag Vera's "我唔做客服")
    if (/(有什麼可以幫|很樂意為你|AI助手|語言模型|請重試|我唔明白你)/i.test(reply || "") ||
        (/客服/.test(reply || "") && !/唔做客服/.test(reply || ""))) {
      reply = "我唔做客服。門——推定停。";
    }

    var showChoices = false;
    // ask_want: reveal poles early; off_topic/unclear escalate to choices by miss 2+
    if (id === "ask_want") showChoices = true;
    if (nextMiss >= 2) showChoices = true;
    if (nextMiss >= maxMisses) showChoices = true;
    if (strategy === "callout") showChoices = true;

    var thought = null;
    if (id === "ask_want" || nextMiss === 1) {
      thought = thoughtFor("hint");
    } else if (nextMiss >= 2) {
      thought = thoughtFor(strategy);
    }

    return {
      strategy: strategy,
      reply: reply || "門就喺度。推定停。",
      advance: false,
      showChoices: showChoices,
      thought: thought,
      missCount: nextMiss,
      resetMisses: false,
      intentId: id
    };
  }

  function applyMissToState(state, decision) {
    if (!state || !decision) return;
    if (decision.resetMisses) {
      state.guideMissCount = 0;
      state.offTopicStreak = 0;
    } else if (typeof decision.missCount === "number") {
      state.guideMissCount = decision.missCount;
      if (decision.intentId === "off_topic") {
        state.offTopicStreak = (state.offTopicStreak || 0) + 1;
      }
    }
  }

  var api = {
    decide: decide,
    getGoal: getGoal,
    isSuccess: isSuccess,
    isOptional: isOptional,
    applyMissToState: applyMissToState,
    version: "guide1"
  };

  global.GuidePolicy = api;
})(typeof window !== "undefined" ? window : globalThis);

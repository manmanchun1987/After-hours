/**
 * GuidePolicy (split1 / intentsoft1 soft-pass) — steers freeChat toward node.sceneGoal.
 * Pass/advance = intent ∈ successIntents (soft paraphrase OK); never CS「請輸入正確選項」.
 * Line pools live in guide-lines.js (Lane B); this file keeps sceneGoal/miss/advance rules.
 * Input: classified intent + sceneGoal + memory + missCount
 * Output: { strategy, reply, advance, showChoices, thought, missCount }
 * Requires GuideLines; IntentEngine optional for pickReply reuse.
 */
(function (global) {
  "use strict";

  var L = global.GuideLines || global.GUIDE_LINES;
  if (!L) {
    throw new Error("GuidePolicy: GuideLines must load before guide-policy.js");
  }


  function looksNonsense(text) {
    var raw = String(text || "").trim();
    if (!raw) return true;
    var compact = raw.replace(/\s+/g, "");
    if (compact.length <= 1) {
      if (/^[推開入進停等門走好係得睇]$/.test(compact)) return false;
      return true;
    }
    if (/^[\s\u3000.,!?;:'"~`…。，！？、；：「」『』（）()\[\]{}<>\/\\|@#$%^&*+=_\-]+$/.test(raw)) return true;
    if (/^(哈|呵|嘻|嘿|哼|哇|咯|咯咯|lol|haha|ha|kk|www)+$/i.test(compact)) return true;
    if (/^(.)\1{3,}$/.test(compact)) return true;
    if (/^(..)\1{2,}$/.test(compact)) return true;
    if (/^[asdfjkl;]+$/i.test(compact) || /^[qwertyuiop]+$/i.test(compact) || /^[zxcvbnm]+$/i.test(compact)) return true;
    if (/^[a-z0-9]{2,24}$/i.test(compact) && !/^(ok|hi|hey|yes|no|go|in|out|wait|push|door|enter|stop|open)$/i.test(compact)) {
      if (!/[aeiou]{2}/i.test(compact) || compact.length >= 5) {
        if (!/door|wait|enter|push|stop|open/i.test(compact)) return true;
      }
    }
    if (!/[\u4e00-\u9fff]/.test(compact) && /^[\x00-\x7F]+$/.test(compact) && compact.length <= 24) {
      if (!/push|door|wait|enter|stop|open|go|in|out/i.test(compact)) return true;
    }
    return false;
  }

  function nonsensePoolFor(strategy) {
    if (strategy === "callout") return L.NONSENSE_CALLOUT || L.CALLOUT_REPLIES;
    if (strategy === "pressure") return L.NONSENSE_PRESSURE || L.PRESSURE_REPLIES;
    return L.NONSENSE_HINT || L.HINT_REPLIES;
  }

  function recentOf(state) {
    return (state && state.recentBotReplies) || [];
  }

  function pickAnti(pool, recent) {
    var list = (pool || []).filter(Boolean);
    if (!list.length) return "";
    recent = recent || [];
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
    if (intentId === "agree") return L.OPTIONAL_AGREE;
    if (strategy === "callout") return L.CALLOUT_REPLIES;
    if (strategy === "pressure") return L.PRESSURE_REPLIES;
    return L.HINT_REPLIES;
  }

  function thoughtFor(strategy) {
    if (strategy === "callout") return pickAnti(L.THOUGHTS_CALLOUT, []);
    if (strategy === "pressure") return pickAnti(L.THOUGHTS_PRESSURE, []);
    return pickAnti(L.THOUGHTS_HINT, []);
  }

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

    var nextMiss = missCount + 1;
    var strategy = strategyFor(nextMiss, maxMisses, id);

    var userText = intent.text || input.text || input.userText || "";
    var nonsense = looksNonsense(userText) || id === "unclear" && looksNonsense(userText);
    if (nonsense && id !== "enter_door" && id !== "wait" && id !== "refuse" && id !== "ask_want" && id !== "agree") {
      // keep miss escalation; never dump literary / CS lines for empty meaning
      if (id === "off_topic") id = "unclear";
      nonsense = true;
    }

    var reply = null;
    if (nonsense) {
      reply = pickAnti(nonsensePoolFor(strategy), recent);
      if (nextMiss >= 2) {
        var coldN = pickAnti(nonsensePoolFor(strategy), recent.concat(reply ? [reply] : []));
        if (coldN) reply = coldN;
      }
    } else {
      if (global.IntentEngine && typeof global.IntentEngine.pickReply === "function") {
        var engLine = global.IntentEngine.pickReply(intent, {
          node: input.node,
          state: state,
          tone: input.tone || (state && state.chatTone) || "cold"
        });
        if (engLine) reply = engLine;
      }
      if (!reply) reply = pickAnti(poolFor(strategy, id), recent);

      if (nextMiss >= 2) {
        var cold = pickAnti(poolFor(strategy, id), recent.concat(reply ? [reply] : []));
        if (cold) reply = cold;
      }
    }

    try {
      var memStr = JSON.stringify(memory || []).slice(0, 400);
      if (/推門|門口|入去/.test(memStr) && nextMiss <= 2 && id === "ask_want") {
        var memLine = pickAnti(L.MEM_NUDGE || [], recent);
        if (memLine) reply = memLine;
      }
    } catch (e) {}

    if (/(有什麼可以幫|很樂意為你|AI助手|語言模型|請重試|我唔明白你|請輸入正確)/i.test(reply || "") ||
        (/客服/.test(reply || "") && !/唔做客服/.test(reply || ""))) {
      reply = L.CS_BLOCK_REPLY || "我唔做客服。門——推定停。";
    }

    var showChoices = false;
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
      reply: reply || L.FALLBACK_REPLY || "門就喺度。推定停。",
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
    looksNonsense: looksNonsense,
    getGoal: getGoal,
    isSuccess: isSuccess,
    isOptional: isOptional,
    applyMissToState: applyMissToState,
    version: "split1-clear1"
  };

  global.GuidePolicy = api;
})(typeof window !== "undefined" ? window : globalThis);

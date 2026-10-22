/**
 * GuidePolicy (fakeai4) — steers freeChat toward node.sceneGoal.
 * Pass/advance = intent ∈ successIntents (soft paraphrase OK); never CS「請輸入正確選項」.
 * Thin goal-hint from sceneGoal.hints / successIntents labels. Memory = skim full chatUserLines/chatBotLines in state (cap 50), not a second brain.
 * Line pools live in guide-lines.js (Lane B); this file keeps sceneGoal/miss/advance rules.
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


  var INTENT_HINT_LABELS = {
    enter_door: "推門入去",
    wait: "停低等等",
    agree: "應承繼續",
    refuse: "唔入／離開",
    ask_want: "講清楚你想點",
    flirt: "再近啲",
    challenge: "頂真講",
    apologize: "認錯收斂",
    ask_memory: "提頭先嗰句",
    follow: "跟住入"
  };

  /** Thin clear hint from current sceneGoal (hints map, ask, or successIntents labels). */
  function goalSteerPhrase(goal) {
    if (!goal) return "";
    if (goal.ask && String(goal.ask).trim()) return String(goal.ask).trim();
    var hints = goal.hints || {};
    var parts = [];
    var seen = {};
    function pushLabel(lab) {
      lab = String(lab || "").trim();
      if (!lab || seen[lab]) return;
      seen[lab] = 1;
      parts.push(lab);
    }
    var successes = Array.isArray(goal.successIntents) ? goal.successIntents : [];
    for (var i = 0; i < successes.length; i++) {
      var id = successes[i];
      pushLabel(hints[id] || INTENT_HINT_LABELS[id] || "");
    }
    if (!parts.length) {
      for (var k in hints) {
        if (Object.prototype.hasOwnProperty.call(hints, k)) pushLabel(hints[k]);
      }
    }
    if (!parts.length) return "講清楚你想點。";
    if (parts.length === 1) return parts[0] + "。講清楚。";
    if (parts.length === 2) return parts[0] + "，定" + parts[1] + "？講清楚。";
    return parts.slice(0, 3).join("／") + "。講清楚。";
  }

  function applyGoalSteer(reply, goal, strategy) {
    var steer = goalSteerPhrase(goal);
    if (!steer) return reply;
    // If pool line already names a success action, keep it; else append thin steer.
    var successes = (goal && goal.successIntents) || [];
    var labels = [];
    var hints = (goal && goal.hints) || {};
    for (var i = 0; i < successes.length; i++) {
      labels.push(hints[successes[i]] || INTENT_HINT_LABELS[successes[i]] || "");
    }
    var joined = labels.join("");
    var hasAction = false;
    if (/推門|停低|入去|等等|講清楚你想點/.test(reply || "")) hasAction = true;
    for (var j = 0; j < labels.length; j++) {
      if (labels[j] && reply && reply.indexOf(labels[j].replace(/[。？?]/g, "")) >= 0) hasAction = true;
    }
    if (hasAction) return reply;
    if (strategy === "callout" || strategy === "pressure") {
      return (reply ? reply.replace(/[。．.\s]+$/, "") + "。" : "") + steer;
    }
    // hint: prefer steer-forward cold boss line
    return steer;
  }

  var HISTORY_SKIM_CAP = 50; // safety only — use full chat history available in state

  /** Skim full available dialogue transcript in state (user+bot), cap HISTORY_SKIM_CAP. Light reflect, not a second brain. */
  function skimRecentDetail(state, memory) {
    var lines = [];
    if (state && Array.isArray(state.chatUserLines)) {
      for (var u = 0; u < state.chatUserLines.length; u++) lines.push("U:" + state.chatUserLines[u]);
    }
    if (state && Array.isArray(state.chatBotLines)) {
      for (var b = 0; b < state.chatBotLines.length; b++) lines.push("B:" + state.chatBotLines[b]);
    }
    if (Array.isArray(memory)) {
      for (var i = 0; i < memory.length; i++) {
        var m = memory[i];
        if (typeof m === "string") lines.push(m);
        else if (m && m.text) lines.push(String(m.text));
        else if (m && m.line) lines.push(String(m.line));
      }
    }
    if (lines.length > HISTORY_SKIM_CAP) lines = lines.slice(-HISTORY_SKIM_CAP);
    var blob = lines.join("\n");
    if (!blob) return null;
    // Prefer the most recent matching detail by scanning from the end
    for (var r = lines.length - 1; r >= 0; r--) {
      var row = lines[r];
      if (/^B:/.test(row)) continue; // reflect player detail primarily
      if (/停低|等等|等陣|未準備|企定|猶豫/.test(row)) return "wait";
      if (/推門|開門|入去|入嚟|進去|推開/.test(row)) return "enter";
      if (/記得|頭先|之前|聽到未/.test(row)) return "memory";
      if (/天氣|食飯|幾點/.test(row)) return "off";
    }
    // Fallback: whole transcript
    if (/停低|等等|等陣|未準備|企定|猶豫/.test(blob)) return "wait";
    if (/推門|開門|入去|入嚟|進去|推開/.test(blob)) return "enter";
    if (/記得|頭先|之前|聽到未/.test(blob)) return "memory";
    if (/天氣|食飯|幾點/.test(blob)) return "off";
    return null;
  }

  function reflectFromHistory(detail, goal, recent) {
    var steer = goalSteerPhrase(goal);
    var pool = L.MEM_NUDGE || [];
    if (detail === "wait") {
      var w = pickAnti([
        "你頭先話想等等。咁停低等等，定改推門入去？",
        "記你講過停低。而家繼續等，定推門？講清楚。",
        "你提過未準備好。停低等等，定推門入去？"
      ].concat(pool.filter(function (l) { return /停|等/.test(l); })), recent);
      return w || steer;
    }
    if (detail === "enter") {
      var e = pickAnti([
        "你頭先提過推門。而家推門入去，定仲停低？",
        "記你講過入去。推門入去，定停低等等？",
        "你提過開門。推定停，講清楚。"
      ].concat(pool.filter(function (l) { return /推|入|門/.test(l); })), recent);
      return e || steer;
    }
    if (detail === "memory") {
      return pickAnti(pool, recent) || ("頭先嗰句我聽到。" + (steer ? steer : "推定停？"));
    }
    return pickAnti(pool, recent) || steer;
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

    // Prefer current sceneGoal actions in the spoken line
    reply = applyGoalSteer(reply, goal, strategy);

    // Full-history skim (chatUserLines/chatBotLines, cap 50) — occasional reflect, no second brain
    try {
      var detail = skimRecentDetail(state, memory);
      if (detail && nextMiss <= 2 && (id === "ask_want" || id === "unclear" || id === "ask_memory" || id === "off_topic")) {
        var reflected = reflectFromHistory(detail, goal, recent);
        if (reflected) reply = reflected;
      } else if (detail && nextMiss === 1 && Math.random() < 0.45) {
        var softRef = reflectFromHistory(detail, goal, recent);
        if (softRef) reply = softRef;
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
    goalSteerPhrase: goalSteerPhrase,
    version: "split1-fakeai4"
  };

  global.GuidePolicy = api;
})(typeof window !== "undefined" ? window : globalThis);

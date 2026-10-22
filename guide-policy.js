/**
 * GuidePolicy (p0-steer-20261022) — steers freeChat toward *current* node.sceneGoal.
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

  function goalIsDoorish(goal) {
    var s = (goal && goal.successIntents) || [];
    // Corridor-style only when enter_door is a success (wait alone e.g. sam/s1 is mid-node)
    return s.indexOf("enter_door") >= 0;
  }

  var INTENT_STEER_TOKENS = {
    enter_door: ["推門", "入去", "入嚟", "開門", "進去", "推開"],
    wait: ["停低", "等等", "等陣", "企定"],
    agree: ["應承", "繼續", "配合"],
    refuse: ["唔入", "離開"],
    ask_want: ["講清楚", "你想點", "想點"],
    flirt: ["近", "站近", "靠近", "坐近"],
    challenge: ["頂真", "點解"],
    apologize: ["認錯", "道歉"],
    ask_memory: ["頭先", "記得", "之前"]
  };

  function replyHasGoalAction(reply, goal) {
    if (!reply || !goal) return false;
    var successes = Array.isArray(goal.successIntents) ? goal.successIntents : [];
    var hints = goal.hints || {};
    var i, j, lab, toks, t;
    var doorish = goalIsDoorish(goal);
    var hasDoorLex = /推門|停低|入去|開門|推定停|門把|走廊/.test(reply);
    var hasMidLex = /應承|配合|頂真|點解|企近|靠近|站近|坐近|認錯|唔入|離開/.test(reply);
    // Mid-node: corridor door lines (even with bare 講清楚) do not count as goal action
    if (!doorish && hasDoorLex && !hasMidLex) {
      var hitSpecific = false;
      if (goal.ask) {
        var askCore = String(goal.ask).replace(/[，,／\/定？?。.\s講清楚你想點]+/g, "");
        if (askCore.length >= 2 && reply.indexOf(askCore.slice(0, Math.min(4, askCore.length))) >= 0) {
          // fall through to label checks below
        }
      }
      for (i = 0; i < successes.length; i++) {
        if (successes[i] === "ask_want" || successes[i] === "ask_memory") continue;
        lab = String(hints[successes[i]] || INTENT_HINT_LABELS[successes[i]] || "").replace(/[。？?！!]/g, "").trim();
        if (lab && reply.indexOf(lab) >= 0) { hitSpecific = true; break; }
        toks = INTENT_STEER_TOKENS[successes[i]] || [];
        for (j = 0; j < toks.length; j++) {
          if (toks[j] && toks[j] !== "講清楚" && toks[j] !== "想點" && toks[j] !== "你想點" && reply.indexOf(toks[j]) >= 0) {
            hitSpecific = true; break;
          }
        }
        if (hitSpecific) break;
      }
      if (!hitSpecific) return false;
    }
    if (goal.ask) {
      var askBits = String(goal.ask).split(/[，,／\/定？?。.\s]+/);
      for (i = 0; i < askBits.length; i++) {
        t = String(askBits[i] || "").replace(/[。？?！!]/g, "").trim();
        if (t.length >= 2 && reply.indexOf(t) >= 0) {
          if (!doorish && hasDoorLex && !hasMidLex && /^(講清楚|你想點|想點)$/.test(t)) continue;
          return true;
        }
      }
    }
    for (i = 0; i < successes.length; i++) {
      var sid = successes[i];
      lab = String(hints[sid] || INTENT_HINT_LABELS[sid] || "").replace(/[。？?！!]/g, "").trim();
      if (lab && reply.indexOf(lab) >= 0) return true;
      // Mid-node: do not let corridor wait/enter lexicon (停低/推門) rubber-stamp door pool lines
      if (!doorish && (sid === "enter_door" || sid === "wait")) {
        if (lab) {
          var frag = lab.replace(/[／\/定，,].*$/, "").trim();
          if (frag.length >= 2 && reply.indexOf(frag) >= 0) return true;
        }
        continue;
      }
      toks = INTENT_STEER_TOKENS[sid] || [];
      for (j = 0; j < toks.length; j++) {
        if (!toks[j] || reply.indexOf(toks[j]) < 0) continue;
        if (!doorish && hasDoorLex && !hasMidLex && (toks[j] === "講清楚" || toks[j] === "想點" || toks[j] === "你想點" || toks[j] === "繼續")) continue;
        return true;
      }
    }
    // Door defaults only count when current goal is door-ish
    if (doorish && /推門|停低|入去|等等|推定停/.test(reply)) return true;
    return false;
  }

  function applyGoalSteer(reply, goal, strategy) {
    var steer = goalSteerPhrase(goal);
    if (!steer) return reply;
    if (replyHasGoalAction(reply, goal)) return reply;
    // Mid-node / non-door goals: never keep corridor door pool lines — speak current sceneGoal
    if (!goalIsDoorish(goal)) {
      if (strategy === "callout") {
        var cCue = pickAnti([
          "而家決定。", "短答。", "唔再拖。", "即刻。", "講清楚。",
          "夠喇。", "而家。", "答我。", "二揀一。", "最後一次。"
        ], []);
        return (cCue || "而家決定。") + steer;
      }
      if (strategy === "pressure") {
        var pCue = pickAnti([
          "再講一次。", "重複：", "唔好再兜。", "快啲。", "壓力嚟喇：",
          "時間緊。", "再模糊無用。", "短句：", "聽清楚。", "而家要你揀："
        ], []);
        return (pCue || "再講一次。") + steer;
      }
      return steer;
    }
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
      if (/應承|答應|同意|繼續/.test(row)) return "agree";
      if (/頂真|點解|質疑/.test(row)) return "challenge";
      if (/企近|靠近|站近|坐近/.test(row)) return "flirt";
      if (/記得|頭先|之前|聽到未/.test(row)) return "memory";
      if (/天氣|食飯|幾點/.test(row)) return "off";
    }
    // Fallback: whole transcript
    if (/停低|等等|等陣|未準備|企定|猶豫/.test(blob)) return "wait";
    if (/推門|開門|入去|入嚟|進去|推開/.test(blob)) return "enter";
    if (/應承|答應|同意|繼續/.test(blob)) return "agree";
    if (/頂真|點解|質疑/.test(blob)) return "challenge";
    if (/企近|靠近|站近|坐近/.test(blob)) return "flirt";
    if (/記得|頭先|之前|聽到未/.test(blob)) return "memory";
    if (/天氣|食飯|幾點/.test(blob)) return "off";
    return null;
  }

  function reflectFromHistory(detail, goal, recent) {
    var steer = goalSteerPhrase(goal);
    var pool = L.MEM_NUDGE || [];
    // History MEM must NOT force door lines when current goal is not enter/wait
    if (!goalIsDoorish(goal)) {
      var pref = "";
      if (detail === "wait") pref = "你頭先似想停低。";
      else if (detail === "enter") pref = "你頭先提過入去。";
      else if (detail === "agree") pref = "你頭先似應承。";
      else if (detail === "challenge") pref = "你頭先頂真問過。";
      else if (detail === "flirt") pref = "你頭先想近啲。";
      else if (detail === "memory") pref = "頭先嗰句我聽到。";
      else if (detail === "off") pref = "閒話收低。";
      return pref + (steer || "講清楚你想點。");
    }
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
    // Door-ish goal but non-door detail: still prefer steer over door MEM_NUDGE alone
    var mem = pickAnti(pool, recent);
    if (mem && replyHasGoalAction(mem, goal)) return mem;
    return (mem ? mem.replace(/[。．.\s]+$/, "") + "。" : "") + (steer || "");
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
      // Reflect must still carry *current* sceneGoal steer (never leave door-only on mid-node)
      reply = applyGoalSteer(reply, goal, strategy);
    } catch (e) {}

    if (/(有什麼可以幫|很樂意為你|AI助手|語言模型|請重試|我唔明白你|請輸入正確)/i.test(reply || "") ||
        (/客服/.test(reply || "") && !/唔做客服/.test(reply || ""))) {
      var csSteer = goalSteerPhrase(goal);
      reply = "我唔做客服。" + (csSteer || L.CS_BLOCK_REPLY || "門——推定停。");
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
      reply: reply || goalSteerPhrase(goal) || L.FALLBACK_REPLY || "講清楚你想點。",
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
    version: "split1-p0-steer-20261022"
  };

  global.GuidePolicy = api;
})(typeof window !== "undefined" ? window : globalThis);

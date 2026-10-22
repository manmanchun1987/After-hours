/**
 * GuidePolicy (human-step-20261022) — one spoken next step toward *current* node.sceneGoal.
 * Pass/advance = intent ∈ successIntents (soft paraphrase OK); never CS「請輸入正確選項」.
 * 錯法（假 AI 要記住並反應）：亂打／無意思、離題、含糊、客服腔 → 先認「咩錯」再講清楚而家目標（口語）。
 * Thin goal-hint from sceneGoal.hints / successIntents labels. Memory = skim chat history cap 50.
 * Line pools in guide-lines.js; this file keeps sceneGoal/miss/advance + wrong-case reactions.
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
    if (/^[\s\u3000.,!?;:'"~`…。，！？、；：「」『』（）()\[\]{}<>\/\\|@#$%^&*+=_\-]+$/.test(raw)) return true;
    if (compact.length <= 1) {
      // Real one-word speech, not a smashed key.
      if (/^[推開入進停等門走好係得睇嗯啊哦噢呃唔吓咩]$/.test(compact)) return false;
      return true;
    }
    if (/^(哈|呵|嘻|嘿|哼|哇|咯|lol|haha|hahaha|ha|kk|kkk|www)+$/i.test(compact)) return true;
    if (/^(.)\1{3,}$/.test(compact)) return true;
    if (/^(..)\1{2,}$/.test(compact) && compact.length >= 6) return true;
    if (/^[asdfjkl;]+$/i.test(compact) || /^[qwertyuiop]+$/i.test(compact) || /^[zxcvbnm]+$/i.test(compact)) return true;
    if (/^[a-z0-9'’]+$/i.test(compact)) {
      var folded = compact.toLowerCase().replace(/['’]/g, "");
      if (/^(ok|okay|oklah|okla|hi|hey|hello|yo|yes|yeah|yep|no|nah|nope|bye|huh|what|wait|go|stop|sure|fine|next|open|enter|push|door|hmm|um|uh|eh|oh)$/.test(folded)) {
        return false;
      }
      if (!/[aeiou]/i.test(folded)) return true;
    }
    return false;
  }

  function nonsensePoolFor(strategy) {
    if (strategy === "callout") return L.NONSENSE_CALLOUT || L.CALLOUT_REPLIES;
    if (strategy === "pressure") return L.NONSENSE_PRESSURE || L.PRESSURE_REPLIES;
    return L.NONSENSE_HINT || L.HINT_REPLIES;
  }

  /** Playtest + live: reply must show we noticed the wrong input. */
  function hasWrongAck(reply) {
    return /聽唔明|亂打|亂碼|無意思|無內容|砸字|哈+|鍵盤|無意義|呢句無|温吞|唔好再|離題|閒話|無重點|講清楚你想點/.test(String(reply || ""));
  }

  function wrongAckCue(kind, strategy) {
    var nonsense = [
      "聽唔明。", "呢句無意思。", "亂打唔算。", "無內容。", "聽唔明你講乜。",
      "唔好再砸鍵盤。", "哈完未？", "亂碼夠喇。"
    ];
    var off = [
      "閒話收低。", "離題啦。", "而家唔傾呢啲。", "收返嚟。", "無重點。嗰句當未講。"
    ];
    var vague = [
      "太含糊。", "聽唔明重點。", "講清楚你想點。", "呢句無重點。"
    ];
    var pool = nonsense;
    if (kind === "off_topic") pool = off;
    else if (kind === "unclear") pool = vague;
    if (strategy === "callout") pool = pool.concat(["夠喇。", "最後一次。"]);
    return pool[Math.floor(Math.random() * pool.length)] || "聽唔明。";
  }

  /** One ack + the current scene ask. Never a second question. */
  function reactToWrong(kind, goal, strategy, recent) {
    var mapped = kind === "nonsense" ? "nonsense" : kind === "off_topic" ? "off_topic" : "confuse";
    return composeFresh(mapped, strategy || "hint", goal, recent || []);
  }


  function recentOf(state) {
    return (state && state.recentBotReplies) || [];
  }

  function pickAnti(pool, recent) {
    var list = (pool || []).filter(Boolean);
    if (!list.length) return "";
    recent = recent || [];
    var i, line, head, r, clash;
    for (i = 0; i < list.length; i++) {
      line = list[(recent.length + i) % list.length];
      if (recent.indexOf(line) >= 0) continue;
      head = String(line).slice(0, 4);
      clash = false;
      for (r = Math.max(0, recent.length - 4); r < recent.length; r++) {
        if (String(recent[r]).slice(0, 4) === head) clash = true;
      }
      if (!clash) return line;
    }
    for (i = 0; i < list.length; i++) {
      line = list[(recent.length + i) % list.length];
      if (recent.indexOf(line) < 0) return line;
    }
    return list[recent.length % list.length];
  }

  function questionCount(text) {
    return (String(text || "").match(/[？?]/g) || []).length;
  }

  function steerText(goal) {
    var steer = goalSteerPhrase(goal);
    return steer || L.FALLBACK_REPLY || "你話我知下一步。";
  }

  function joinAckSteer(ack, steer) {
    ack = String(ack || "").replace(/[。．.\s]+$/g, "").trim();
    steer = String(steer || "").trim();
    ack = ack.replace(/[？?]/g, "").trim();
    if (!ack) return steer;
    if (!steer) return ack + "。";
    if (steer.indexOf(ack) === 0) return steer;
    return ack + "。" + steer;
  }

  function ackPool(kind, strategy) {
    var acks = L.ACKS || {};
    var bucket = acks[kind] || acks.generic || {};
    var pool = bucket[strategy] || bucket.hint || (acks.generic && acks.generic[strategy]) || [];
    if (!pool.length && acks.generic) pool = acks.generic.hint || [];
    return pool;
  }

  function composeFresh(kind, strategy, goal, recent) {
    recent = recent || [];
    var pool = ackPool(kind, strategy);
    var steer = steerText(goal);
    var i, ack, line;
    for (i = 0; i < pool.length; i++) {
      ack = pool[(recent.length + i) % pool.length];
      line = joinAckSteer(ack, steer);
      if (recent.indexOf(line) >= 0) continue;
      if (questionCount(line) > 1) continue;
      if (line.replace(/\s/g, "").length < 8) continue;
      return line;
    }
    ack = pool.length ? pool[recent.length % pool.length] : "我聽緊";
    return joinAckSteer(ack, steer);
  }

  function memoryAck(detail) {
    if (detail === "wait") return "你頭先似想停低";
    if (detail === "enter") return "你頭先提過入去";
    if (detail === "agree") return "你頭先似應承";
    if (detail === "challenge") return "你頭先頂真問過";
    if (detail === "flirt") return "你頭先想近啲";
    if (detail === "memory") return "頭先嗰句我聽到";
    if (detail === "off") return "閒話我聽到，收低";
    return "";
  }

  function kindOf(id, text, nonsense) {
    if (nonsense) return "nonsense";
    if (id === "off_topic") return "off_topic";
    if (id === "greet") return "greet";
    if (id === "flirt") return "flirt";
    if (id === "challenge") return "challenge";
    if (id === "refuse") return "refuse";
    if (id === "ask_want") return "ask";
    if (id === "agree") return "agree";
    if (id === "enter_door") return "enter";
    if (id === "wait") return "wait";
    if (id === "ask_memory") return "memory";
    if (id === "apologize") return "apologize";
    var compact = String(text || "").replace(/\s+/g, "").replace(/[。．.…？?！!]/g, "");
    if (/^(嗯|啊|哦|噢|呃)+$/.test(compact)) return "filler";
    if (/^(吓|咩話|唔明|huh|eh|um|hmm)$/i.test(compact)) return "confuse";
    if (id === "unclear") return compact.length <= 2 ? "filler" : "confuse";
    return "generic";
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
    if (!parts.length) return "你話我知下一步。";
    if (parts.length === 1) return parts[0] + "。";
    if (parts.length === 2) return parts[0] + "，定" + parts[1] + "？";
    return parts[0] + "，定" + parts[1] + "，定" + parts[2] + "？";
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
    var ask = goal.ask ? String(goal.ask).trim() : "";
    if (ask) {
      var askCore = ask.replace(/[？?。．!\s]+$/g, "");
      if (askCore && reply.indexOf(askCore) >= 0) return true;
    }
    // Door lexicon only counts on a door scene. 「停低」inside a corridor line
    // must not pretend a mid-node goal was answered.
    if (!goalIsDoorish(goal)) return false;
    return /推門|停低|入去|等等|開門/.test(reply);
  }

  function applyGoalSteer(reply, goal, strategy) {
    if (!goal) return reply;
    if (reply && replyHasGoalAction(reply, goal) && questionCount(reply) <= 1) return reply;
    var kind = "generic";
    if (strategy === "callout" || strategy === "pressure") kind = "generic";
    return composeFresh(kind, strategy || "hint", goal, []);
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
    // Player lines only. Bot steers mention 停低/推門 and must not echo as the player's intent.
    var userRows = [];
    for (var u = 0; u < lines.length; u++) {
      if (/^B:/.test(lines[u])) continue;
      userRows.push(lines[u]);
    }
    if (!userRows.length) return null;
    for (var r = userRows.length - 1; r >= 0; r--) {
      var row = userRows[r];
      if (/停低|等等|等陣|未準備|企定|猶豫/.test(row)) return "wait";
      if (/推門|開門|入去|入嚟|進去|推開/.test(row)) return "enter";
      if (/應承|答應|同意|繼續/.test(row)) return "agree";
      if (/頂真|點解|質疑/.test(row)) return "challenge";
      if (/企近|靠近|站近|坐近/.test(row)) return "flirt";
      if (/記得|頭先|之前|聽到未/.test(row)) return "memory";
      if (/天氣|食飯|幾點/.test(row)) return "off";
    }
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

    var kind = kindOf(id, userText, nonsense);
    var reply = composeFresh(kind, strategy, goal, recent);

    // Light memory: one clause, same single ask. Skip if that line was just said.
    try {
      var detail = skimRecentDetail(state, memory);
      var canReflect = detail && nextMiss <= 2 &&
        (kind === "filler" || kind === "confuse" || kind === "memory" || kind === "ask" || kind === "generic");
      if (canReflect) {
        var mAck = memoryAck(detail);
        var mLine = joinAckSteer(mAck, steerText(goal));
        if (mAck && mLine && recent.indexOf(mLine) < 0 && questionCount(mLine) <= 1) reply = mLine;
      }
    } catch (e) {}

    if (/(有什麼可以幫|很樂意為你|AI助手|語言模型|請重試|我唔明白你|請輸入正確)/i.test(reply || "") ||
        (/客服/.test(reply || "") && !/唔做客服/.test(reply || ""))) {
      var csSteer = goalSteerPhrase(goal);
      reply = joinAckSteer("我唔做客服", csSteer || L.CS_BLOCK_REPLY || "你話我知下一步。");
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
      reply: reply || goalSteerPhrase(goal) || L.FALLBACK_REPLY || "你話我知下一步。",
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
    hasWrongAck: hasWrongAck,
    reactToWrong: reactToWrong,
    getGoal: getGoal,
    isSuccess: isSuccess,
    isOptional: isOptional,
    applyMissToState: applyMissToState,
    goalSteerPhrase: goalSteerPhrase,
    version: "human-step-20261022"
  };

  global.GuidePolicy = api;
})(typeof window !== "undefined" ? window : globalThis);

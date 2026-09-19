/**
 * IntentEngine (split1) — soft Cantonese intent → sceneGoal (not exact keys).
 * Pattern data lives in intent-patterns.js (Lane A); this file is the thinner core.
 * Reply pools are materials only; selection is driven by intent + scene + Vera tone.
 * Requires IntentPatterns loaded first. Soft-pass intentsoft1 semantics preserved.
 */
(function (global) {
  "use strict";

  var P = global.IntentPatterns || global.INTENT_PATTERNS;
  if (!P) {
    throw new Error("IntentEngine: IntentPatterns must load before intent-engine.js");
  }
  var INTENTS = P.INTENTS;
  var PATTERNS = P.PATTERNS;
  var SOFT_LEXICON = P.SOFT_LEXICON;
  var KEY_SYNONYMS = P.KEY_SYNONYMS;
  var ACCEPTANCE_SOFT = P.ACCEPTANCE_SOFT;

  var ASK_WANT_REPLIES = {
    cold: [
      "你問我想？門就喺前面。",
      "推定停。我唔代你揀。",
      "指引？入去。或企定。",
      "我點想唔緊要。你企喺門口。",
      "想我點？先對準門把。",
      "你問『應該』——答案就兩個。",
      "教你？推門。定停低。",
      "走廊兩個選項。清楚未？"
    ],
    wary: [
      "你問我想點——想我代你推？",
      "應該點做？門開住。",
      "指引一次：入去，或停。",
      "你要我講句？推。",
      "點算？唔好晃門口。",
      "想清楚。然後手按門。",
      "你問『你想點』——我想你決定。",
      "答案唔喺我嘴。喺門把。"
    ],
    warmer: [
      "……你問我想。我想你入嚟。",
      "推門。或停低望我一眼。",
      "……指引？門把凉。你手熱就推。",
      "你問應該——答案近門口。",
      "……想我點？近啲。入。",
      "點樣先？先唔好走。",
      "……我等你推。或等你停低講。",
      "……我想你入。其餘你講。"
    ],
    sharp: [
      "推。定停。",
      "門。而家。",
      "唔好問。做。",
      "入。",
      "停低都得。快。",
      "少問我想。推門。",
      "夠問。門。",
      "選。"
    ]
  };

  var OFF_TOPIC_REPLIES = {
    cold: [
      "走廊唔傾呢啲。門就喺度。",
      "無關。你企喺門口——推，定停？",
      "今晚唔講天氣同飯。對準門。",
      "我唔做客服。你想入，就推。",
      "題外話留返聽朝。而家——門。"
    ],
    wary: [
      "你岔開——想拖？門仲開住。",
      "講完未？手按門，或企定。",
      "我記下你迴避。門把凉。",
      "離題一次。下次我當你退。",
      "正事係入唔入。其餘收起。"
    ],
    warmer: [
      "……你打岔。難得，但我望住門。",
      "題外？可憐。推門再講。",
      "……哼。你躲。門唔會替你決定。",
      "想傾天？入嚟先。走廊監住。",
      "……一句離題。跟住——推，定停？"
    ],
    sharp: [
      "停。門。",
      "離題。推。",
      "夠。入定企。",
      "唔聽閑話。",
      "而家。門。"
    ]
  };

  var ASK_WANT_THOUGHTS = [
    "……你問我想要乜。門把仲凉。",
    "佢喺問界線。定問許可。",
    "想要？先對準門。",
    "……指引唔喺嘴——喺門把。"
  ];

  function norm(text) {
    return String(text || "")
      .replace(/\s+/g, "")
      .replace(/[？?！!。．\.，,、~～…]/g, "")
      .toLowerCase();
  }

  function toneOf(ctx) {
    var t = (ctx && (ctx.tone || (ctx.state && ctx.state.chatTone))) || "cold";
    if (t === "warm") t = "warmer";
    if (!ASK_WANT_REPLIES[t]) t = "cold";
    return t;
  }

  function isCorridor(node) {
    if (!node) return false;
    if (node.freeChat && (node.id === "n0" || /走廊/.test(String(node.label || "")))) return true;
    if (node.freeChat && Array.isArray(node.choices)) {
      var labs = node.choices.map(function (c) { return String(c.label || ""); }).join(" ");
      if (/推門|停/.test(labs)) return true;
    }
    return !!node.freeChat && node.id === "n0";
  }

  function scorePatterns(text, list) {
    var n = norm(text);
    var raw = String(text || "");
    var score = 0;
    var hits = [];
    for (var i = 0; i < list.length; i++) {
      var re = list[i];
      if (re.test(raw) || re.test(n)) {
        score += 1;
        hits.push(String(re));
      }
    }
    return { score: score, hits: hits };
  }

  /** Ordered-char match: all chars of token appear in order in hay (typo/word-order tolerant). */
  function orderedChars(hay, token) {
    if (!token || !hay) return false;
    var i = 0;
    for (var c = 0; c < hay.length && i < token.length; c++) {
      if (hay.charAt(c) === token.charAt(i)) i++;
    }
    return i === token.length;
  }

  /** Light typo: allow one skip in token or hay for tokens length >= 3. */
  function fuzzyIncludes(hay, token) {
    if (!token || token.length < 1) return false;
    if (hay.indexOf(token) >= 0) return true;
    if (token.length >= 2 && orderedChars(hay, token)) return true;
    if (token.length < 3) return false;
    // skip one char in token
    for (var s = 0; s < token.length; s++) {
      var t2 = token.slice(0, s) + token.slice(s + 1);
      if (t2.length >= 2 && hay.indexOf(t2) >= 0) return true;
    }
    // adjacent transposition
    for (var j = 0; j < token.length - 1; j++) {
      var arr = token.split("");
      var tmp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = tmp;
      if (hay.indexOf(arr.join("")) >= 0) return true;
    }
    return false;
  }

  function scoreSoftLexicon(text, id) {
    var tokens = SOFT_LEXICON[id] || [];
    var n = norm(text);
    var score = 0;
    var hits = [];
    for (var i = 0; i < tokens.length; i++) {
      var tok = norm(tokens[i]);
      if (!tok) continue;
      if (fuzzyIncludes(n, tok)) {
        // longer tokens weigh more; single-char "入" alone is weak
        var w = tok.length >= 2 ? 1 : 0.35;
        if (tok.length >= 3) w = 1.25;
        score += w;
        hits.push(tok);
      }
    }
    return { score: score, hits: hits };
  }

  function classify(text, ctx) {
    ctx = ctx || {};
    var raw = String(text || "").trim();
    var nrm = norm(raw);
    var scores = {};
    var best = "unclear";
    var bestScore = 0;
    var detail = {};

    Object.keys(PATTERNS).forEach(function (id) {
      var r = scorePatterns(raw, PATTERNS[id]);
      var soft = scoreSoftLexicon(raw, id);
      var combined = r.score + soft.score;
      scores[id] = combined;
      detail[id] = (r.hits || []).concat(soft.hits || []);
      if (combined > bestScore) {
        bestScore = combined;
        best = id;
      }
    });

    // Rhetorical 入唔入 / 入唔入得 → enter_door, not refuse
    if (/入唔入|進不進|入唔入得|入唔入得去/.test(raw) || /入唔入|進不進/.test(nrm)) {
      scores.enter_door = (scores.enter_door || 0) + 2;
      scores.refuse = Math.max(0, (scores.refuse || 0) - 1.5);
      if (scores.enter_door > bestScore) {
        best = "enter_door";
        bestScore = scores.enter_door;
      }
    }

    // Corridor bias: door/wait beat soft off_topic; enter beats weak refuse
    if (isCorridor(ctx.node)) {
      if (scores.enter_door > 0 && scores.enter_door >= (scores.off_topic || 0) * 0.5) {
        if (scores.enter_door >= (scores.refuse || 0) || scores.enter_door >= 0.7) {
          best = "enter_door";
          bestScore = scores.enter_door;
        }
      }
      if (best !== "enter_door" && scores.wait > 0 && scores.wait >= (scores.off_topic || 0) * 0.5) {
        best = "wait";
        bestScore = scores.wait;
      }
      if (scores.ask_want > 0 && best === "off_topic" && (scores.off_topic || 0) <= scores.ask_want) {
        best = "ask_want";
        bestScore = scores.ask_want;
      }
    }

    // Node key soft-match boost (synonym / includes / ordered — never sole exact ==)
    if (ctx.node && Array.isArray(ctx.node.intents) && bestScore < 0.7) {
      var t = nrm;
      for (var i = 0; i < ctx.node.intents.length; i++) {
        var keys = ctx.node.intents[i].keys || [];
        for (var k = 0; k < keys.length; k++) {
          var key = norm(keys[k]);
          if (!key) continue;
          var hit = fuzzyIncludes(t, key) || fuzzyIncludes(key, t);
          if (!hit) continue;
          if (/推|開|入|進|行入|門/.test(key) || /推|開|入|進/.test(t)) {
            best = "enter_door";
            bestScore = Math.max(bestScore, 0.6);
          } else if (/停|猶豫|等|企|站|準備/.test(key) || /停|等|準備/.test(t)) {
            best = "wait";
            bestScore = Math.max(bestScore, 0.6);
          } else if (/唔入|走|閃|關|鎖/.test(key)) {
            best = "refuse";
            bestScore = Math.max(bestScore, 0.5);
          }
        }
      }
    }

    // Partial multi-token: enter if text has enter-ish bigrams without full pattern
    if (bestScore < 0.5) {
      if (/(行|走|踏).{0,2}(入|進)/.test(raw) || /(入|進).{0,4}(房|辦公室|屋|去|嚟|來|门|門)/.test(raw)) {
        best = "enter_door";
        bestScore = 0.8;
        scores.enter_door = Math.max(scores.enter_door || 0, 0.8);
      } else if (/未.{0,2}(準備|敢|好|得)/.test(raw) || /(等|停|猶豫)/.test(raw)) {
        if (!/入|推門|開門/.test(nrm)) {
          best = "wait";
          bestScore = 0.75;
          scores.wait = Math.max(scores.wait || 0, 0.75);
        }
      }
    }

    if (bestScore <= 0) best = "unclear";

    // Default residual chatter on corridor → off_topic (in-character block path)
    if (best === "unclear" && isCorridor(ctx.node) && raw.length >= 2) {
      if (!/^[嗯啊呃哦喔]+$/.test(raw)) {
        best = "off_topic";
        bestScore = 0.25;
      }
    }

    return {
      id: best,
      score: bestScore,
      scores: scores,
      hits: detail[best] || [],
      intents: INTENTS.slice(),
      text: raw
    };
  }

  function familyOfNodeIntent(intent) {
    var keys = ((intent && intent.keys) || []).join(" ");
    if (/推門|開門|入去|入嚟|推入|入門|進去|進入|行入/.test(keys)) return "enter_door";
    if (/猶豫|停|等等|企|站住|再推|未準備/.test(keys)) return "wait";
    if (/鎖門|關門|唔入|走先|閃/.test(keys)) return "refuse";
    if (intent && intent.bucket === "heat") return "flirt";
    if (intent && intent.bucket === "leave" && /走|返|夠/.test(keys)) return "refuse";
    if (intent && intent.bucket === "tired") return "wait";
    if (intent && intent.bucket === "leave") return "enter_door";
    return null;
  }

  function forceMapByIntentId(id, node) {
    if (!node || !Array.isArray(node.intents)) return null;
    for (var i = 0; i < node.intents.length; i++) {
      if (familyOfNodeIntent(node.intents[i]) === id) return node.intents[i];
    }
    if (id === "enter_door") return node.intents[0] || null;
    if (id === "wait") {
      for (var w = 0; w < node.intents.length; w++) {
        if (node.intents[w].tension || node.intents[w].bucket === "tired") return node.intents[w];
      }
      return node.intents[1] || node.intents[0] || null;
    }
    if (id === "refuse") {
      for (var r = 0; r < node.intents.length; r++) {
        if (familyOfNodeIntent(node.intents[r]) === "refuse") return node.intents[r];
      }
    }
    return null;
  }

  function mapToNodeIntent(classified, node) {
    if (!classified || !node || !Array.isArray(node.intents)) return null;
    var id = classified.id;
    if (id === "ask_want" || id === "off_topic" || id === "unclear" || id === "ask_memory") {
      return null; // handled by reply / unlock path, not advance
    }
    var syn = KEY_SYNONYMS[id] || [];
    var t = norm(classified.text || "");

    // 1) family match (intent id ↔ node intent family) — primary path, not label ==
    for (var i = 0; i < node.intents.length; i++) {
      var fam = familyOfNodeIntent(node.intents[i]);
      if (fam && fam === id) return node.intents[i];
    }
    // 2) synonym soft includes / fuzzy against keys (boost only)
    for (var j = 0; j < node.intents.length; j++) {
      var keys = node.intents[j].keys || [];
      for (var k = 0; k < keys.length; k++) {
        var key = norm(keys[k]);
        if (!key) continue;
        if (fuzzyIncludes(t, key) || t.indexOf(key) >= 0) return node.intents[j];
        for (var s = 0; s < syn.length; s++) {
          var sn = norm(syn[s]);
          if (sn && fuzzyIncludes(key, sn) && fuzzyIncludes(t, sn)) {
            return node.intents[j];
          }
        }
      }
    }
    // 3) sceneGoal success → force map by intent id (never require exact choice label)
    if (node.sceneGoal && global.GuidePolicy && typeof global.GuidePolicy.isSuccess === "function") {
      if (global.GuidePolicy.isSuccess(id, node.sceneGoal)) {
        var forced = forceMapByIntentId(id, node);
        if (forced) return forced;
      }
    } else {
      var softForce = forceMapByIntentId(id, node);
      if (softForce && (id === "enter_door" || id === "wait" || id === "refuse")) return softForce;
    }
    // 4) agree → first / heat intent (guided yes)
    if (id === "agree") {
      for (var a = 0; a < node.intents.length; a++) {
        if (node.intents[a].bucket === "heat" || node.intents[a].heat) return node.intents[a];
      }
      return node.intents[0] || null;
    }
    return null;
  }

  function pickFrom(pool, recent) {
    var list = (pool || []).filter(Boolean);
    if (!list.length) return "";
    recent = recent || [];
    var fresh = list.filter(function (l) { return recent.indexOf(l) < 0; });
    var use = fresh.length ? fresh : list;
    return use[Math.floor(Math.random() * use.length)];
  }

  function pickReply(classified, ctx) {
    ctx = ctx || {};
    var tone = toneOf(ctx);
    var recent = (ctx.state && ctx.state.recentBotReplies) || [];
    var streak = (ctx.state && ctx.state.offTopicStreak) || 0;
    var id = classified && classified.id;

    if (id === "ask_want") {
      return pickFrom(ASK_WANT_REPLIES[tone] || ASK_WANT_REPLIES.cold, recent);
    }
    if (id === "off_topic") {
      var otTone = tone;
      if (streak >= 4) otTone = "sharp";
      else if (streak >= 2 && tone !== "sharp") otTone = tone === "warmer" ? "cold" : "sharp";
      return pickFrom(OFF_TOPIC_REPLIES[otTone] || OFF_TOPIC_REPLIES.cold, recent);
    }
    if (id === "apologize") {
      return pickFrom([
        "道歉收低。門仲喺度。",
        "……知。跟住你推，定停。",
        "唔使客套。決定。"
      ], recent);
    }
    if (id === "challenge") {
      return pickFrom([
        "頂嘴？門把仲凉。",
        "你挑戰——先入嚟再算。",
        "……有種。推門講。"
      ], recent);
    }
    if (id === "flirt") {
      return pickFrom([
        "……走廊。收斂。想近——入去。",
        "膽大。門後先繼續。",
        "哼。推門。"
      ], recent);
    }
    if (id === "ask_memory") {
      return null; // let app pickReply / memory chips handle
    }
    if (id === "unclear") {
      if (isCorridor(ctx.node)) {
        return pickFrom([
          "講清楚。推門——定停低。",
          "我聽唔到重點。門，定停？",
          "……再講一次。對準門。"
        ], recent);
      }
      return null;
    }
    return null;
  }

  function askWantThought() {
    return ASK_WANT_THOUGHTS[Math.floor(Math.random() * ASK_WANT_THOUGHTS.length)];
  }

  function currentNode() {
    if (typeof state === "undefined" || !state || !state.story || !state.story.nodes) return null;
    return state.story.nodes[state.nodeId] || null;
  }

  function currentTone() {
    try {
      if (typeof syncChatTone === "function") return syncChatTone();
    } catch (e) {}
    return (typeof state !== "undefined" && state && state.chatTone) || "cold";
  }

  function noteReply(line) {
    if (typeof state === "undefined" || !state || !line) return;
    state.recentBotReplies = (state.recentBotReplies || []).concat([line]).slice(-8);
  }

  // --- Wire into chat path ---
  function enhanceMatch(orig) {
    return function matchFreeChatIntent(userText) {
      var node = currentNode();
      var classified = classify(userText, { node: node, state: typeof state !== "undefined" ? state : null, tone: currentTone() });
      // sceneGoal: advance iff intent ∈ successIntents — never exact choice-label match as sole path
      if (node && node.sceneGoal && global.GuidePolicy && typeof global.GuidePolicy.isSuccess === "function") {
        if (!global.GuidePolicy.isSuccess(classified.id, node.sceneGoal)) {
          return null;
        }
        var mappedGoal = mapToNodeIntent(classified, node) || forceMapByIntentId(classified.id, node);
        if (mappedGoal) return mappedGoal;
        return null; // success intent but no node map — do not fall back to literal keys
      }
      var mapped = mapToNodeIntent(classified, node);
      if (mapped) return mapped;
      if (typeof orig === "function") {
        var hit = orig(userText);
        if (hit) return hit;
      }
      return null;
    };
  }

  function enhancePick(orig) {
    return function pickReplyWrapped(userText) {
      var node = currentNode();
      var classified = classify(userText, { node: node, state: typeof state !== "undefined" ? state : null, tone: currentTone() });
      var line = pickReply(classified, { node: node, state: typeof state !== "undefined" ? state : null, tone: currentTone() });
      if (line) return line;
      if (typeof orig === "function") return orig(userText);
      return "……";
    };
  }

  function enhanceSubmit(orig) {
    return async function handleChatSubmit(text) {
      var cleaned = String(text || "").trim();
      if (!cleaned) {
        if (typeof orig === "function") return orig(text);
        return;
      }
      var node = currentNode();
      var st = typeof state !== "undefined" ? state : null;
      var classified = classify(cleaned, { node: node, state: st, tone: currentTone() });

      // GuidePolicy path when node has sceneGoal
      if (node && node.sceneGoal && global.GuidePolicy && typeof global.GuidePolicy.decide === "function") {
        var decision = global.GuidePolicy.decide({
          intent: classified,
          sceneGoal: node.sceneGoal,
          memory: st && (st.chatMemory || st.memoryChips || []),
          missCount: (st && st.guideMissCount) || 0,
          state: st,
          node: node,
          tone: currentTone()
        });
        if (decision && decision.advance) {
          if (st) {
            st.guideMissCount = 0;
            st.offTopicStreak = 0;
          }
          if (typeof orig === "function") return orig(text);
          return;
        }
        if (decision && !decision.advance) {
          if (st && st.chatBusy) return;
          if (st) st.chatBusy = true;
          if (typeof global.GuidePolicy.applyMissToState === "function") {
            global.GuidePolicy.applyMissToState(st, decision);
          } else if (st) {
            st.guideMissCount = decision.missCount || ((st.guideMissCount || 0) + 1);
          }
          if (typeof noteChatActivity === "function") noteChatActivity();
          if (typeof appendChat === "function") appendChat("user", cleaned);
          if (typeof pushChatMemory === "function") pushChatMemory("user", cleaned);
          var inputG = document.getElementById("chat-input");
          if (inputG) inputG.value = "";
          try { if (typeof AudioEngine !== "undefined") AudioEngine.sfxClick(); } catch (eg0) {}
          if (typeof setChatTyping === "function") setChatTyping(true);
          if (typeof setUnread === "function") setUnread(0);
          await new Promise(function (r) { setTimeout(r, 320 + Math.random() * 520); });

          if (decision.thought && typeof setThoughtVoice === "function") {
            setThoughtVoice(decision.thought);
          }
          if (decision.showChoices && typeof unlockFreeChatChoices === "function") {
            unlockFreeChatChoices(classified.id === "ask_want" ? "ask_want" : "off_topic_escalate");
          } else if (decision.showChoices && st) {
            st.freeChatChoicesVisible = true;
            document.body.classList.add("show-choices");
          }

          var replyG = decision.reply || "門就喺度。推定停。";
          if (/(有什麼可以幫|很樂意為你|AI助手|語言模型)/i.test(replyG) || (/客服/.test(replyG) && !/唔做客服/.test(replyG))) {
            replyG = "我唔做客服。門——推定停。";
          }
          if (typeof setChatTyping === "function") setChatTyping(false);
          if (typeof appendChat === "function") appendChat("alex", replyG);
          if (typeof pushChatMemory === "function") pushChatMemory("bot", replyG);
          noteReply(replyG);
          try {
            if (typeof audioPrefs !== "undefined" && !audioPrefs.voiceMute && typeof speakChat === "function") speakChat(replyG);
          } catch (eg1) {}
          try { if (typeof AudioEngine !== "undefined") AudioEngine.sfxTransition(); } catch (eg2) {}
          if (st) st.chatBusy = false;
          if (typeof noteChatActivity === "function") noteChatActivity();
          return;
        }
      }

      // Legacy corridor ask_want (no sceneGoal): thought + unlock
      if (classified.id === "ask_want" && node && node.freeChat) {
        if (typeof state !== "undefined" && state.chatBusy) return;
        if (typeof state !== "undefined") state.chatBusy = true;
        if (typeof noteChatActivity === "function") noteChatActivity();
        if (typeof appendChat === "function") appendChat("user", cleaned);
        if (typeof pushChatMemory === "function") pushChatMemory("user", cleaned);
        var input = document.getElementById("chat-input");
        if (input) input.value = "";
        try { if (typeof AudioEngine !== "undefined") AudioEngine.sfxClick(); } catch (e) {}
        if (typeof setChatTyping === "function") setChatTyping(true);
        if (typeof setUnread === "function") setUnread(0);
        await new Promise(function (r) { setTimeout(r, 350 + Math.random() * 500); });

        if (typeof setThoughtVoice === "function") setThoughtVoice(askWantThought());
        if (typeof unlockFreeChatChoices === "function") {
          unlockFreeChatChoices("ask_want");
        } else if (typeof state !== "undefined") {
          state.freeChatChoicesVisible = true;
          document.body.classList.add("show-choices");
        }
        if (typeof state !== "undefined") state.offTopicStreak = 0;

        var reply = pickReply(classified, { node: node, state: typeof state !== "undefined" ? state : null, tone: currentTone() })
          || "推定停。門把就喺度。";
        if (typeof setChatTyping === "function") setChatTyping(false);
        if (typeof appendChat === "function") appendChat("alex", reply);
        if (typeof pushChatMemory === "function") pushChatMemory("bot", reply);
        noteReply(reply);
        try {
          if (typeof audioPrefs !== "undefined" && !audioPrefs.voiceMute && typeof speakChat === "function") speakChat(reply);
        } catch (e2) {}
        try { if (typeof AudioEngine !== "undefined") AudioEngine.sfxTransition(); } catch (e3) {}
        if (typeof state !== "undefined") state.chatBusy = false;
        if (typeof noteChatActivity === "function") noteChatActivity();
        return;
      }

      // Legacy off_topic (no sceneGoal)
      if (classified.id === "off_topic" && node && node.freeChat) {
        if (typeof state !== "undefined" && state.chatBusy) return;
        if (typeof state !== "undefined") {
          state.chatBusy = true;
          state.offTopicStreak = (state.offTopicStreak || 0) + 1;
        }
        if (typeof noteChatActivity === "function") noteChatActivity();
        if (typeof appendChat === "function") appendChat("user", cleaned);
        if (typeof pushChatMemory === "function") pushChatMemory("user", cleaned);
        var input2 = document.getElementById("chat-input");
        if (input2) input2.value = "";
        try { if (typeof AudioEngine !== "undefined") AudioEngine.sfxClick(); } catch (e4) {}
        if (typeof setChatTyping === "function") setChatTyping(true);
        if (typeof setUnread === "function") setUnread(0);
        await new Promise(function (r) { setTimeout(r, 300 + Math.random() * 600); });

        var streak = (typeof state !== "undefined" && state.offTopicStreak) || 1;
        if (streak >= 2 && typeof setThoughtVoice === "function") {
          setThoughtVoice(streak >= 4 ? "……再離題，當你退。" : "……你打岔。門仲開住。");
        }
        if (streak >= 3 && typeof unlockFreeChatChoices === "function") {
          unlockFreeChatChoices("off_topic_escalate");
        }

        var reply2 = pickReply(classified, { node: node, state: typeof state !== "undefined" ? state : null, tone: currentTone() })
          || "走廊唔傾呢啲。推，定停？";
        if (/(有什麼可以幫|很樂意為你|AI助手|語言模型)/i.test(reply2) || (/客服/.test(reply2) && !/唔做客服/.test(reply2))) {
          reply2 = "我唔做客服。門——推定停。";
        }
        if (typeof setChatTyping === "function") setChatTyping(false);
        if (typeof appendChat === "function") appendChat("alex", reply2);
        if (typeof pushChatMemory === "function") pushChatMemory("bot", reply2);
        noteReply(reply2);
        try {
          if (typeof audioPrefs !== "undefined" && !audioPrefs.voiceMute && typeof speakChat === "function") speakChat(reply2);
        } catch (e5) {}
        try { if (typeof AudioEngine !== "undefined") AudioEngine.sfxTransition(); } catch (e6) {}
        if (typeof state !== "undefined") state.chatBusy = false;
        if (typeof noteChatActivity === "function") noteChatActivity();
        return;
      }

      // enter_door / wait / refuse / agree → fall through to original (uses enhanced match)
      if (typeof orig === "function") return orig(text);
    };
  }

  function install() {
    if (typeof global.matchFreeChatIntent === "function" && !global.matchFreeChatIntent.__intent1) {
      global.matchFreeChatIntent = enhanceMatch(global.matchFreeChatIntent);
      global.matchFreeChatIntent.__intent1 = true;
    } else if (typeof matchFreeChatIntent === "function" && !matchFreeChatIntent.__intent1) {
      var m = enhanceMatch(matchFreeChatIntent);
      m.__intent1 = true;
      global.matchFreeChatIntent = m;
      try { matchFreeChatIntent = m; } catch (e) {}
    }

    if (typeof global.pickReply === "function" && !global.pickReply.__intent1) {
      global.pickReply = enhancePick(global.pickReply);
      global.pickReply.__intent1 = true;
    } else if (typeof pickReply === "function" && !pickReply.__intent1) {
      var p = enhancePick(pickReply);
      p.__intent1 = true;
      global.pickReply = p;
      try { pickReply = p; } catch (e2) {}
    }

    if (typeof global.handleChatSubmit === "function" && !global.handleChatSubmit.__intent1) {
      global.handleChatSubmit = enhanceSubmit(global.handleChatSubmit);
      global.handleChatSubmit.__intent1 = true;
    } else if (typeof handleChatSubmit === "function" && !handleChatSubmit.__intent1) {
      var h = enhanceSubmit(handleChatSubmit);
      h.__intent1 = true;
      global.handleChatSubmit = h;
      try { handleChatSubmit = h; } catch (e3) {}
    }
  }

  function selfCheckSoft(node) {
    node = node || {
      id: "n0",
      label: "走廊",
      freeChat: true,
      choices: [{ label: "推門" }, { label: "停低" }],
      intents: [
        { keys: ["推門", "開門", "入去"], next: "n0b", bucket: "leave" },
        { keys: ["停", "等等", "猶豫"], next: "n0b", tension: 2, bucket: "tired" }
      ],
      sceneGoal: { successIntents: ["enter_door", "wait"], optionalIntents: ["ask_want", "agree"], maxMisses: 3 }
    };
    var rows = [];
    var pass = 0;
    for (var i = 0; i < ACCEPTANCE_SOFT.length; i++) {
      var row = ACCEPTANCE_SOFT[i];
      var c = classify(row.text, { node: node });
      var ok = c.id === row.intent;
      if (ok) pass++;
      rows.push({ text: row.text, want: row.intent, got: c.id, ok: ok });
    }
    return { pass: pass, total: ACCEPTANCE_SOFT.length, rows: rows, version: "split1" };
  }

  var api = {
    INTENTS: INTENTS,
    classify: classify,
    mapToNodeIntent: mapToNodeIntent,
    forceMapByIntentId: forceMapByIntentId,
    pickReply: pickReply,
    isCorridor: isCorridor,
    install: install,
    selfCheckSoft: selfCheckSoft,
    ACCEPTANCE_SOFT: ACCEPTANCE_SOFT,
    version: "split1"
  };

  global.IntentEngine = api;

  // Install now and retry briefly (chat-guide wraps on interval).
  install();
  var ticks = 0;
  var timer = setInterval(function () {
    install();
    if (++ticks > 40) clearInterval(timer);
  }, 250);
})(typeof window !== "undefined" ? window : globalThis);

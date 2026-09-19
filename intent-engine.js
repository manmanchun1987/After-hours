/**
 * IntentEngine (intent1) — Cantonese pattern / synonym / tone / scene classifier.
 * Reply pools are materials only; selection is driven by intent + scene + Vera tone.
 * Loaded after app.js + chat-guide.js + guide-policy.js so it can wrap the chat path.
 */
(function (global) {
  "use strict";

  var INTENTS = [
    "ask_want",
    "agree",
    "refuse",
    "enter_door",
    "wait",
    "apologize",
    "flirt",
    "challenge",
    "ask_memory",
    "off_topic",
    "unclear"
  ];

  // Pattern groups: scored hits (not whole-string equality).
  var PATTERNS = {
    enter_door: [
      /推門/, /推開門/, /開門/, /入去/, /入嚟/, /推入/, /入門/, /入來/, /入来/,
      /推入去/, /打開門/, /打开门/, /我推/, /推啦/, /推啊/, /入啊/, /入啦/,
      /\benter\b/i, /\bgo in\b/i, /\bopen( the)? door\b/i, /push( the)? door/i
    ],
    wait: [
      /猶豫/, /停一秒/, /停一停/, /停低/, /唔敢/, /再推/, /等等/, /企(喇|喺)度/,
      /站住/, /等陣/, /等一下/, /等一等/, /hold on/i, /wait/i, /等等先/, /等我/,
      /未敢/, /再等/, /停一停先/, /^停$/
    ],
    ask_want: [
      /你想(要|點|我)/, /想(要|點)(乜|咩|我|點)/, /我(應該|要)點/, /點樣(先|做)/,
      /我做咩/, /你要我/, /教我/, /指引/, /點算/, /應該點/, /我想知你想/,
      /你想要乜/, /你想要咩/, /想我點做/, /你想我點/, /點先得/, /我點做/,
      /what do you want/i, /what should i/i, /how should i/i, /tell me what/i,
      /你究竟想/, /想點啊/, /想點呀/, /跟你想/, /照你想/
    ],
    agree: [
      /^(好|係|係呀|係喎|得|得啦|嗯|嗯哼|繼續|聽你講|想聽|好呀|得喎|ok|okay|yes|y)$/i,
      /好啊/, /可以/, /同意/, /跟你/, /聽你/, /我跟/, /係咁/, /就咁/
    ],
    refuse: [
      /唔入/, /唔要/, /不要/, /拒絕/, /鎖門/, /關門/, /走先/, /閃/, /唔得/,
      /算吧/, /算了/, /唔敢入/, /我走/, /離開/, /no\b/i, /refuse/i, /唔想/
    ],
    apologize: [
      /對唔住/, /唔好意思/, /抱歉/, /sorry/i, /道歉/, /我錯/, /原諒/
    ],
    flirt: [
      /靚/, /好靚/, /想錫/, /想親/, /心口/, /你香/, /今晚留/, /想要你/,
      /誘惑/, /可愛/, /sexy/i, /kiss/i, /抱你/, /近啲/, /坐近/
    ],
    challenge: [
      /憑咩/, /唔服/, /頂嘴/, /你錯/, /無理/, /專橫/, /挑戰/, /憑什麼/,
      /你以為/, /你睇唔起/, /誰怕誰/, /challenge/i
    ],
    ask_memory: [
      /記得/, /之前/, /頭先/, /今晚.*記/, /你知唔知/, /你記/, /memory/i,
      /記唔記得/, /頭先嗰/
    ],
    off_topic: [
      /天氣/, /食咗/, /食乜/, /午餐/, /晚餐/, /足球/, /遊戲/, /game/i,
      /chatgpt/i, /你係唔係ai/i, /人工智能/, /機械人/, /机器人/, /同ai/i, /係ai/i, /\bai\b/i, /傾偈.*ai|ai.*傾/i,
      /薪水/, /人工幾多/, /加班費/, /家人/, /老婆/, /女朋友/, /男友/,
      /天氣點/, /落雨/, /天氣預報/, /whats the weather/i, /how are you$/i,
      /你好嗎$/, /食飯未/, /中午/, /八卦/, /同事私/
    ]
  };

  // Soft synonyms that boost mapping onto node.intent keys (substring, not ==).
  var KEY_SYNONYMS = {
    enter_door: ["推門", "開門", "入去", "入嚟", "推", "入門", "入"],
    wait: ["停", "猶豫", "等等", "停低", "企", "站住"],
    refuse: ["唔入", "走", "閃", "關門", "鎖門"],
    agree: ["好", "係", "繼續", "得"],
    flirt: ["近", "坐近", "想要"],
    ask_want: ["想", "點", "指引", "教"]
  };

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

  function classify(text, ctx) {
    ctx = ctx || {};
    var raw = String(text || "").trim();
    var scores = {};
    var best = "unclear";
    var bestScore = 0;
    var detail = {};

    Object.keys(PATTERNS).forEach(function (id) {
      var r = scorePatterns(raw, PATTERNS[id]);
      scores[id] = r.score;
      detail[id] = r.hits;
      if (r.score > bestScore) {
        bestScore = r.score;
        best = id;
      }
    });

    // Scene bias: on corridor, door/wait/ask_want beat soft off_topic ties.
    if (isCorridor(ctx.node)) {
      if (scores.enter_door > 0 && scores.enter_door >= scores.off_topic) {
        best = "enter_door";
        bestScore = scores.enter_door;
      } else if (scores.wait > 0 && scores.wait >= scores.off_topic && scores.enter_door === 0) {
        best = "wait";
        bestScore = scores.wait;
      } else if (scores.ask_want > 0 && best === "off_topic" && scores.off_topic <= scores.ask_want) {
        best = "ask_want";
        bestScore = scores.ask_want;
      }
    }

    // Node key soft-match boost (synonym / includes — never sole path).
    if (ctx.node && Array.isArray(ctx.node.intents) && bestScore === 0) {
      var t = norm(raw);
      for (var i = 0; i < ctx.node.intents.length; i++) {
        var keys = ctx.node.intents[i].keys || [];
        for (var k = 0; k < keys.length; k++) {
          var key = norm(keys[k]);
          if (!key) continue;
          if (t.indexOf(key) >= 0 || key.indexOf(t) >= 0 && t.length >= 1) {
            // map via synonym family
            if (/推|開|入/.test(key)) {
              best = "enter_door";
              bestScore = 0.5;
            } else if (/停|猶豫|等|企|站/.test(key)) {
              best = "wait";
              bestScore = 0.5;
            } else if (/唔入|走|閃|關|鎖/.test(key)) {
              best = "refuse";
              bestScore = 0.5;
            }
          }
        }
      }
    }

    if (bestScore <= 0) best = "unclear";

    // Default residual chatter on corridor → off_topic (in-character block path)
    if (best === "unclear" && isCorridor(ctx.node) && raw.length >= 2) {
      // short affirmations already caught; leftover = off_topic-ish
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
    if (/推門|開門|入去|入嚟|推入|入門/.test(keys)) return "enter_door";
    if (/猶豫|停|等等|企|站住|再推/.test(keys)) return "wait";
    if (/鎖門|關門|唔入|走先|閃/.test(keys)) return "refuse";
    if (intent && intent.bucket === "heat") return "flirt";
    if (intent && intent.bucket === "leave" && /走|返|夠/.test(keys)) return "refuse";
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

    // 1) family match
    for (var i = 0; i < node.intents.length; i++) {
      var fam = familyOfNodeIntent(node.intents[i]);
      if (fam && fam === id) return node.intents[i];
    }
    // 2) synonym soft includes against keys
    for (var j = 0; j < node.intents.length; j++) {
      var keys = node.intents[j].keys || [];
      for (var k = 0; k < keys.length; k++) {
        var key = norm(keys[k]);
        if (!key) continue;
        if (t.indexOf(key) >= 0) return node.intents[j];
        for (var s = 0; s < syn.length; s++) {
          if (key.indexOf(norm(syn[s])) >= 0 && t.indexOf(norm(syn[s])) >= 0) {
            return node.intents[j];
          }
        }
      }
    }
    // 3) agree → first / heat intent (guided yes)
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
      // sceneGoal: only success intents may map → advance; optional/miss stay null
      if (node && node.sceneGoal && global.GuidePolicy && typeof global.GuidePolicy.isSuccess === "function") {
        if (!global.GuidePolicy.isSuccess(classified.id, node.sceneGoal)) {
          return null;
        }
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

  var api = {
    INTENTS: INTENTS,
    classify: classify,
    mapToNodeIntent: mapToNodeIntent,
    pickReply: pickReply,
    isCorridor: isCorridor,
    install: install,
    version: "guide1"
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

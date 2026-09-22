(function () {
  var YES = /^(好|好呀|好啊|好喎|係|係呀|係喎|得|得啦|得喎|得嘅|嗯|嗯哼|繼續|聽你講|想聽|ok|okay|yes|y)$/i;
  var OWNER_PROBE = /^(OWNER|CODE|#pt|#playtest|playtest|#code)$/i;
  var misses = 0;
  var lastAck = "";
  var lastNodeId = "";
  if (!document.getElementById("chat-guide-css")) {
    var st = document.createElement("style");
    st.id = "chat-guide-css";
    st.textContent = ".freechat-hidden,.action-zone.is-chat-first #choices{display:none!important}body.show-choices .action-zone.is-chat-first #choices,.show-choices #choices{display:flex!important;flex-direction:column}#want-line{font-size:12px;color:#c9b48a;margin:.25rem 0 .4rem}";
    document.head.appendChild(st);
  }
  function node() {
    return (typeof state !== "undefined" && state.story && state.story.nodes && state.story.nodes[state.nodeId]) || null;
  }
  function stampChat(story) {
    if (!story || !story.nodes) return;
    Object.keys(story.nodes).forEach(function (id) {
      var n = story.nodes[id];
      if (n.ending) return;
      n.freeChat = true;
      if (!n.intents || !n.intents.length) {
        n.intents = (n.choices || []).map(function (c) {
          var lab = String(c.label || "");
          return { keys: [lab, lab.replace(/[「」\s]/g, ""), "好", "繼續"], next: c.next, heat: c.heat, tension: c.tension, bucket: c.heat ? "heat" : "leave", ack: lab };
        });
      }
    });
  }
  function heatIntent(n) {
    if (!n || !n.intents) return null;
    var i, x;
    for (i = 0; i < n.intents.length; i++) {
      x = n.intents[i];
      if (x.bucket === "heat" || x.heat) return x;
    }
    return n.intents[0] || null;
  }
  function poles(n) {
    if (!n || !n.intents) return [];
    var out = [];
    n.intents.forEach(function (it) {
      var k = (it.keys && it.keys[0]) || "";
      if (k && out.indexOf(k) < 0) out.push(k);
    });
    return out.slice(0, 3);
  }
  function clip(s) {
    return String(s || "").replace(/\s+/g, "").slice(0, 12) || "呢句";
  }
  function hideChoices() {
    document.body.classList.remove("show-choices");
    if (typeof state !== "undefined") state.freeChatChoicesVisible = false;
    if (typeof setChoicesDeferred === "function") setChoicesDeferred(true);
    var box = document.getElementById("choices");
    if (box) box.classList.add("freechat-hidden");
  }
  function showChoices() {
    document.body.classList.add("show-choices");
    if (typeof state !== "undefined") state.freeChatChoicesVisible = true;
    if (typeof setChoicesDeferred === "function") setChoicesDeferred(false);
    var box = document.getElementById("choices");
    if (box) box.classList.remove("freechat-hidden");
  }
  window.__ahHideChoices = hideChoices;
  function onNodeAdvance() {
    var id = (typeof state !== "undefined" && state.nodeId) || "";
    if (id === lastNodeId) return;
    lastNodeId = id;
    misses = 0;
    if (typeof state !== "undefined") state.guideMissCount = 0;
    hideChoices();
  }
  function bumpMiss() {
    misses += 1;
    if (typeof state !== "undefined") state.guideMissCount = Math.max(state.guideMissCount || 0, misses);
    if (misses >= 2) showChoices();
  }
  function tryYesHeat(userText) {
    var t = String(userText || "").trim();
    if (!YES.test(t)) return null;
    var n = node();
    var h = heatIntent(n);
    misses = 0;
    if (typeof state !== "undefined") state.guideMissCount = 0;
    hideChoices();
    if (h) {
      h.ack = "好。" + (h.ack || "靠近呢邊。");
      lastAck = h.ack;
    }
    return h || { ack: "好。", bucket: "heat", heat: 1 };
  }
  function glueText() {
    var el = document.getElementById("play-text");
    var n = node();
    if (!el || !n) return;
    var body = String(n.text || "");
    if (lastAck && body.indexOf(lastAck) !== 0) el.textContent = lastAck + "\n\n" + body;
    var want = document.getElementById("want-line");
    if (!want) {
      want = document.createElement("p");
      want.id = "want-line";
      if (el.parentNode) el.parentNode.insertBefore(want, el.nextSibling);
    }
    var p = poles(n);
    want.textContent = n.ending || !p.length ? "" : "佢等你答：「" + p.join("」定「") + "」。";
  }
  function wrap() {
    if (typeof window.matchFreeChatIntent === "function" && !window.matchFreeChatIntent.__guided) {
      var orig = window.matchFreeChatIntent;
      window.matchFreeChatIntent = function (userText) {
        var raw = String(userText || "").trim();
        if (OWNER_PROBE.test(raw)) {
          hideChoices();
          return null;
        }
        var yesHit = tryYesHeat(userText);
        if (yesHit) return yesHit;
        var n0 = node();
        if (window.IntentEngine && typeof window.IntentEngine.classify === "function") {
          var cls = window.IntentEngine.classify(userText, { node: n0, state: typeof state !== "undefined" ? state : null });
          if (n0 && n0.sceneGoal && window.GuidePolicy) {
            if (cls && window.GuidePolicy.isSuccess && window.GuidePolicy.isSuccess(cls.id, n0.sceneGoal)) {
              var mappedOk = null;
              if (typeof window.IntentEngine.mapToNodeIntent === "function") {
                mappedOk = window.IntentEngine.mapToNodeIntent(cls, n0);
              }
              if (!mappedOk && typeof window.IntentEngine.forceMapByIntentId === "function") {
                mappedOk = window.IntentEngine.forceMapByIntentId(cls.id, n0);
              }
              if (mappedOk) {
                misses = 0;
                if (typeof state !== "undefined") state.guideMissCount = 0;
                hideChoices();
                if (!mappedOk._ackClipped) {
                  mappedOk.ack = "你講「" + clip(userText) + "」。" + (mappedOk.ack || "我接。");
                  mappedOk._ackClipped = true;
                }
                lastAck = mappedOk.ack;
                return mappedOk;
              }
              return null;
            }
            bumpMiss();
            return null;
          }
          if (cls && (cls.id === "ask_want" || cls.id === "off_topic" || cls.id === "unclear" || cls.id === "ask_memory")) {
            return null;
          }
          if (cls && typeof window.IntentEngine.mapToNodeIntent === "function") {
            var mapped = window.IntentEngine.mapToNodeIntent(cls, n0);
            if (mapped) {
              misses = 0;
              if (typeof state !== "undefined") state.guideMissCount = 0;
              hideChoices();
              if (!mapped._ackClipped) {
                mapped.ack = "你講「" + clip(userText) + "」。" + (mapped.ack || "我接。");
                mapped._ackClipped = true;
              }
              lastAck = mapped.ack;
              return mapped;
            }
          }
        }
        var n = node();
        if (n && n.sceneGoal && window.GuidePolicy) {
          bumpMiss();
          return null;
        }
        var hit = orig(userText);
        if (hit) {
          misses = 0;
          if (typeof state !== "undefined") state.guideMissCount = 0;
          hideChoices();
          hit.ack = "你講「" + clip(userText) + "」。" + (hit.ack || "我接。");
          lastAck = hit.ack;
          return hit;
        }
        bumpMiss();
        return null;
      };
      window.matchFreeChatIntent.__guided = true;
    }
    if (typeof window.pickReply === "function" && !window.pickReply.__guided) {
      var pr = window.pickReply;
      window.pickReply = function (userText) {
        if (OWNER_PROBE.test(String(userText || "").trim())) {
          return "";
        }
        if (YES.test(String(userText || "").trim())) {
          return "好。靠近呢邊。";
        }
        if (window.IntentEngine && typeof window.IntentEngine.classify === "function") {
          var c = window.IntentEngine.classify(userText, { node: node(), state: typeof state !== "undefined" ? state : null });
          if (c && (c.id === "ask_want" || c.id === "off_topic" || c.id === "enter_door" || c.id === "wait" || c.id === "apologize" || c.id === "flirt" || c.id === "challenge" || c.id === "ask_memory")) {
            var line = window.IntentEngine.pickReply(c, { node: node(), state: typeof state !== "undefined" ? state : null });
            if (line) return line;
            if (typeof pr === "function") return pr(userText);
          }
        }
        var n = node();
        var p = poles(n);
        var ask = p.length ? p.join("定") : "重點";
        return "你講「" + clip(userText) + "」。我要聽嘅係" + ask + "。";
      };
      window.pickReply.__guided = true;
    }
    if (typeof window.renderNode === "function" && !window.renderNode.__guided) {
      var rn = window.renderNode;
      window.renderNode = function () {
        if (typeof state !== "undefined" && state.story) stampChat(state.story);
        rn.apply(this, arguments);
        onNodeAdvance();
        hideChoices();
        glueText();
        hint();
        var n = node();
        if (n && n.text && window.AHAudio && typeof window.AHAudio.speak === "function") {
          window.AHAudio.speak(n.text);
        }
      };
      window.renderNode.__guided = true;
    }
    if (typeof window.unlockFreeChatChoices === "function" && !window.unlockFreeChatChoices.__guided) {
      var un = window.unlockFreeChatChoices;
      window.unlockFreeChatChoices = function (reason) {
        if (reason === "ask_want" || reason === "off_topic_escalate" || reason === "guide_policy" || (reason && String(reason).indexOf("ask") === 0)) {
          misses = Math.max(misses, 2);
          var ok = un.apply(this, arguments);
          showChoices();
          return ok;
        }
        if (misses < 2) return false;
        var ok2 = un.apply(this, arguments);
        if (ok2) showChoices();
        return ok2;
      };
      window.unlockFreeChatChoices.__guided = true;
    }
    if (typeof state !== "undefined" && state.story) stampChat(state.story);
  }
  function hint() {
    var n = node();
    var input = document.getElementById("chat-input");
    if (!input || !n) return;
    var p = poles(n);
    input.placeholder = p.length ? "答佢：「" + p.join("」／「") + "」" : "對佢講…";
  }
  document.addEventListener("submit", function () { setTimeout(hint, 80); }, true);
  if (!window.__ahChoicesWatch) {
    window.__ahChoicesWatch = true;
    var mo = new MutationObserver(function () { if (misses < 2) hideChoices(); });
    function watchBox() {
      var box = document.getElementById("choices");
      if (box) mo.observe(box, { attributes: true, childList: true, subtree: true });
    }
    watchBox();
    setTimeout(watchBox, 800);
  }
  setInterval(function () {
    wrap();
    onNodeAdvance();
    if (misses >= 2) showChoices();
    else hideChoices();
    glueText();
    hint();
  }, 400);
})();

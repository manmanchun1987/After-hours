(function () {
  var YES = /^(好|係|係呀|係喎|得|得啦|嗯|嗯哼|繼續|聽你講|想聽|好呀|得喎|ok|okay|yes|y)$/i;
  var misses = 0;
  if (!document.getElementById("chat-guide-css")) {
    var st = document.createElement("style");
    st.id = "chat-guide-css";
    st.textContent = ".freechat-hidden,.action-zone.is-chat-first #choices{display:none!important} body.show-choices .action-zone.is-chat-first #choices,.show-choices #choices{display:flex!important;flex-direction:column}";
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
          return {
            keys: [lab, lab.replace(/[「」\s]/g, ""), "好", "繼續"],
            next: c.next,
            heat: c.heat,
            tension: c.tension,
            bucket: c.heat ? "heat" : "leave",
            ack: lab
          };
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
  }
  function wrap() {
    var ok = false;
    if (typeof window.matchFreeChatIntent === "function" && !window.matchFreeChatIntent.__guided) {
      var orig = window.matchFreeChatIntent;
      window.matchFreeChatIntent = function (userText) {
        var hit = orig(userText);
        if (hit) { misses = 0; hideChoices(); return hit; }
        var n = node();
        var t = String(userText || "").trim();
        if (YES.test(t)) { misses = 0; hideChoices(); return heatIntent(n); }
        misses += 1;
        if (misses >= 2) showChoices();
        return null;
      };
      window.matchFreeChatIntent.__guided = true;
      ok = true;
    }
    if (typeof window.renderNode === "function" && !window.renderNode.__guided) {
      var rn = window.renderNode;
      window.renderNode = function () {
        if (typeof state !== "undefined" && state.story) stampChat(state.story);
        rn.apply(this, arguments);
        misses = 0;
        hideChoices();
        hint();
      };
      window.renderNode.__guided = true;
      ok = true;
    }
    if (typeof window.unlockFreeChatChoices === "function" && !window.unlockFreeChatChoices.__guided) {
      var un = window.unlockFreeChatChoices;
      window.unlockFreeChatChoices = function () {
        if (misses < 2) return false;
        return un.apply(this, arguments);
      };
      window.unlockFreeChatChoices.__guided = true;
    }
    if (typeof state !== "undefined" && state.story) stampChat(state.story);
    return ok;
  }
  function hint() {
    var n = node();
    var input = document.getElementById("chat-input");
    if (!input || !n) return;
    var p = poles(n);
    input.placeholder = p.length
      ? "用字回佢。例如「" + p.join("」／「") + "」。講「好」=靠近"
      : "對佢講…推劇";
  }
  document.addEventListener("submit", function () { setTimeout(hint, 80); }, true);
  var n = 0;
  var t = setInterval(function () {
    wrap();
    hideChoices();
    hint();
    if (++n > 80) clearInterval(t);
  }, 300);
})();

(function () {
  var YES = /^(好|係|係呀|係喎|得|得啦|嗯|嗯哼|繼續|聽你講|想聽|好呀|得喎|ok|okay|yes|y)$/i;
  var misses = 0;
  var lastAck = "";
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
    s = String(s || "").replace(/\s+/g, "").slice(0, 12);
    return s || "呢句";
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
        var hit = orig(userText);
        if (hit) {
          misses = 0; hideChoices();
          hit.ack = "你講「" + clip(userText) + 
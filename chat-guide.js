(function () {
  var YES = /^(好|係|係呀|係喎|得|得啦|嗯|嗯哼|繼續|聽你講|想聽|好呀|得喎|ok|okay|yes|y)$/i;
  function node() {
    return (typeof state !== "undefined" && state.story && state.story.nodes && state.story.nodes[state.nodeId]) || null;
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
  function wrap() {
    if (typeof window.matchFreeChatIntent !== "function") return false;
    if (window.matchFreeChatIntent.__guided) return true;
    var orig = window.matchFreeChatIntent;
    window.matchFreeChatIntent = function (userText) {
      var hit = orig(userText);
      if (hit) return hit;
      var n = node();
      var t = String(userText || "").trim();
      if (YES.test(t)) return heatIntent(n);
      return null;
    };
    window.matchFreeChatIntent.__guided = true;
    if (typeof window.applyFreeChatAdvance === "function" && !window.applyFreeChatAdvance.__guided) {
      var adv = window.applyFreeChatAdvance;
      window.applyFreeChatAdvance = function (intent) {
        return adv.apply(this, arguments);
      };
      window.applyFreeChatAdvance.__guided = true;
    }
    return true;
  }
  function hint() {
    var n = node();
    var input = document.getElementById("chat-input");
    if (!input || !n) return;
    var p = poles(n);
    if (!p.length) {
      input.placeholder = "對佢講…推劇";
      return;
    }
    input.placeholder = "例如講「" + p.join("」或「") + "」，講「好」算靠近";
  }
  document.addEventListener("submit", function () {
    setTimeout(hint, 80);
  }, true);
  var n = 0;
  var t = setInterval(function () {
    wrap();
    hint();
    if (++n > 80) clearInterval(t);
  }, 300);
})();

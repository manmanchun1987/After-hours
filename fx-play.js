(function () {
  function layer() {
    var el = document.getElementById("fx-layer");
    if (el) return el;
    el = document.createElement("div");
    el.id = "fx-layer";
    el.innerHTML = '<div class="fx-sweep"></div><div class="fx-flash"></div><div class="fx-rim"></div><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i>';
    document.body.appendChild(el);
    return el;
  }
  function play(kind) {
    var el = layer();
    el.classList.remove("is-win", "is-fail");
    void el.offsetWidth;
    el.classList.add(kind === "fail" ? "is-fail" : "is-win");
    var play = document.getElementById("screen-play");
    if (play && kind !== "fail") {
      play.classList.remove("is-advancing");
      void play.offsetWidth;
      play.classList.add("is-advancing");
    }
    setTimeout(function () { el.classList.remove("is-win", "is-fail"); }, 1000);
  }
  function enableChatFirst(story) {
    if (!story || !story.nodes) return;
    Object.keys(story.nodes).forEach(function (id) {
      var n = story.nodes[id];
      if (n.ending) return;
      n.freeChat = true;
      if (!Array.isArray(n.intents) || !n.intents.length) {
        n.intents = (n.choices || []).map(function (c) {
          var lab = String(c.label || "");
          var keys = [lab, lab.replace(/[「」\s]/g, "")];
          lab.replace(/[\u4e00-\u9fff]{1,3}/g, function (w) { keys.push(w); return w; });
          return { keys: keys.filter(Boolean), next: c.next, heat: c.heat, tension: c.tension, bucket: c.heat ? "flirt" : "work", ack: lab };
        });
      }
      if ((n.choices || []).length > 2) n.choices = n.choices.slice(0, 2);
    });
  }
  var _render = window.renderNode;
  if (typeof _render === "function") {
    window.renderNode = function () {
      var prev = typeof state !== "undefined" ? state.nodeId : null;
      _render.apply(this, arguments);
      var zone = document.getElementById("action-zone");
      if (zone) zone.classList.add("is-chat-first");
      var box = document.getElementById("choices");
      if (box) {
        box.querySelectorAll(".is-locked").forEach(function (btn) {
          btn.addEventListener("click", function () { play("fail"); }, { once: true });
        });
        box.querySelectorAll(".btn-choice:not(.is-locked)").forEach(function (btn) {
          btn.addEventListener("click", function () { play("win"); }, { once: true });
        });
      }
    };
  }
  var _adv = window.applyFreeChatAdvance;
  if (typeof _adv === "function") {
    window.applyFreeChatAdvance = function (intent) {
      var ok = _adv.apply(this, arguments);
      if (ok) play("win");
      else play("fail");
      return ok;
    };
  }
  var _boot = window.startAlex;
  function wrapStory() {
    if (typeof state !== "undefined" && state.story) enableChatFirst(state.story);
  }
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "enter-btn") setTimeout(wrapStory, 200);
  });
  var t = setInterval(function () {
    if (typeof state !== "undefined" && state.story) { enableChatFirst(state.story); wrapStory(); clearInterval(t); }
  }, 400);
  layer();
})();

(function () {
  function layer() {
    var el = document.getElementById("fx-layer");
    if (el) return el;
    el = document.createElement("div");
    el.id = "fx-layer";
    el.innerHTML = '<div class="fx-sweep"></div><div class="fx-sweep2"></div><div class="fx-flash"></div><div class="fx-rim"></div>' +
      '<i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i>' +
      '<i class="spark-fail"></i><i class="spark-fail"></i><i class="spark-fail"></i>';
    document.body.appendChild(el);
    return el;
  }
  function scene() {
    var host = document.querySelector("#screen-play .play-bg");
    if (!host) return null;
    var el = document.getElementById("scene-bg");
    if (el) return el;
    el = document.createElement("div");
    el.id = "scene-bg";
    var wins = "";
    for (var i = 0; i < 80; i++) wins += '<i class="' + (Math.random() > 0.62 ? "on" : "") + '"></i>';
    el.innerHTML = '<div class="city"></div><div class="windows">' + wins + '</div><div class="rain"></div><div class="tube"></div><div class="cctv"></div>';
    host.insertBefore(el, host.firstChild);
    return el;
  }
  function hasReview() {
    return true; // review.svg shipped; fallback kept in class resolve
  }
  function setScene() {
    var el = scene();
    if (!el) return;
    var storyId = (typeof state !== "undefined" && state.story && state.story.id) || "alex";
    var nodeId = (typeof state !== "undefined" && state.nodeId) || "";
    var node = (typeof state !== "undefined" && state.story && state.story.nodes && state.story.nodes[nodeId]) || null;
    var sceneKey = (node && node.scene) || "";
    var cls;
    if (sceneKey === "review" || sceneKey === "lounge" || sceneKey === "pantry" || sceneKey === "office") {
      cls = sceneKey;
    } else if (/^n7|^n8|ending_/.test(nodeId) || (node && node.remember && node.remember.indexOf("review_room") >= 0)) {
      cls = hasReview() ? "review" : "office";
    } else if (storyId === "morgan") {
      cls = "lounge";
    } else if (storyId === "sam") {
      cls = "pantry";
    } else {
      cls = "office";
    }
    el.className = cls;
  }
  function play(kind) {
    var el = layer();
    el.classList.remove("is-win", "is-fail");
    void el.offsetWidth;
    el.classList.add(kind === "fail" ? "is-fail" : "is-win");
    var playEl = document.getElementById("screen-play");
    if (playEl && kind !== "fail") {
      playEl.classList.remove("is-advancing");
      void playEl.offsetWidth;
      playEl.classList.add("is-advancing");
    }
    setTimeout(function () { el.classList.remove("is-win", "is-fail"); }, 1100);
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
          lab.replace(/[一-鿿]{1,3}/g, function (w) { keys.push(w); return w; });
          return { keys: keys.filter(Boolean), next: c.next, heat: c.heat, tension: c.tension, bucket: c.heat ? "flirt" : "work", ack: lab };
        });
      }
      if ((n.choices || []).length > 2) n.choices = n.choices.slice(0, 2);
    });
  }
  var _render = window.renderNode;
  if (typeof _render === "function") {
    window.renderNode = function () {
      _render.apply(this, arguments);
      setScene();
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
      play(ok ? "win" : "fail");
      return ok;
    };
  }
  function wrapStory() {
    if (typeof state !== "undefined" && state.story) enableChatFirst(state.story);
    setScene();
  }
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "enter-btn") setTimeout(wrapStory, 200);
  });
  var t = setInterval(function () {
    if (typeof state !== "undefined" && state.story) { enableChatFirst(state.story); wrapStory(); clearInterval(t); }
  }, 400);
  layer();
  scene();
})();

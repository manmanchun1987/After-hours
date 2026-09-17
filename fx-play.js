(function () {
  var wrapped = false;
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
  function setScene() {
    var el = scene();
    if (!el) return;
    var storyId = (typeof state !== "undefined" && state.story && state.story.id) || "alex";
    var nodeId = (typeof state !== "undefined" && state.nodeId) || "";
    var node = (typeof state !== "undefined" && state.story && state.story.nodes && state.story.nodes[nodeId]) || null;
    var sceneKey = (node && node.scene) || "";
    var allowed = { office:1, lounge:1, pantry:1, review:1, roof:1, lift:1 };
    var cls = allowed[sceneKey] ? sceneKey : (storyId === "morgan" ? "lounge" : storyId === "sam" ? "pantry" : "office");
    el.className = cls;
  }
  function play(kind) {
    var el = layer();
    el.classList.remove("is-win", "is-fail");
    void el.offsetWidth;
    el.classList.add(kind === "fail" ? "is-fail" : "is-win");
    if (window.AHAudio && window.AHAudio.cue) window.AHAudio.cue(kind === "fail" ? "fail" : "win");
    var playEl = document.getElementById("screen-play");
    if (playEl && kind !== "fail") {
      playEl.classList.remove("is-advancing");
      void playEl.offsetWidth;
      playEl.classList.add("is-advancing");
    }
    setTimeout(function () { el.classList.remove("is-win", "is-fail"); }, 1100);
  }
  function hookEngine() {
    if (wrapped) return;
    if (typeof window.renderNode !== "function") return;
    wrapped = true;
    var _render = window.renderNode;
    window.renderNode = function () {
      _render.apply(this, arguments);
      setScene();
    };
    if (typeof window.applyFreeChatAdvance === "function") {
      var _adv = window.applyFreeChatAdvance;
      window.applyFreeChatAdvance = function () {
        var ok = _adv.apply(this, arguments);
        play(ok ? "win" : "fail");
        return ok;
      };
    }
  }
  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest && e.target.closest("button, .btn, .btn-choice");
    if (!btn) return;
    if (btn.classList.contains("is-locked")) play("fail");
    else if (btn.classList.contains("btn-choice") || btn.id === "enter-btn" || btn.classList.contains("btn-primary")) play("win");
    hookEngine();
    setScene();
  }, true);
  var n = 0;
  var t = setInterval(function () {
    hookEngine();
    if (wrapped || ++n > 40) clearInterval(t);
  }, 250);
  layer();
})();

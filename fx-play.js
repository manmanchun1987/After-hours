(function () {
  window.__ahFxPlay = "t3-0616";
  var wrapped = false;
  var lastNode = "";
  window.__ahFxPlayChain = "t3-0414>t3-1002>t3-0616";
  var OWNER_PROBE = /^(OWNER|CODE|#pt|#playtest|playtest|#code|#督|#驗|#owner|#追|#測|#qa)$/i;
  function layer() {
    var el = document.getElementById("fx-layer");
    if (el) return el;
    el = document.createElement("div");
    el.id = "fx-layer";
    el.innerHTML = '<div class="fx-sweep"></div><div class="fx-sweep2"></div><div class="fx-flash"></div><div class="fx-rim"></div>' +
      '<div class="fx-shutter"></div><div class="fx-stamp"></div>' +
      '<i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i><i class="spark"></i>' +
      '<i class="spark-fail"></i><i class="spark-fail"></i><i class="spark-fail"></i>';
    document.body.appendChild(el);
    return el;
  }
  function ensureFxCss() {
    if (document.getElementById("fx-code-css")) return;
    var st = document.createElement("style");
    st.id = "fx-code-css";
    st.textContent = ".fx-shutter{position:fixed;inset:0;pointer-events:none;background:#0a0a0c;transform:scaleY(0);transform-origin:50% 0;z-index:40;opacity:0}.fx-layer.is-cut .fx-shutter{animation:ahCut .38s ease}.fx-stamp{position:fixed;right:12%;top:18%;width:72px;height:72px;border:3px solid #c9b48a;border-radius:4px;opacity:0;pointer-events:none;z-index:41}.fx-layer.is-win .fx-stamp{border-color:#e8c98a;animation:ahSlam .42s ease}.fx-layer.is-fail .fx-stamp{border-color:#8a3a3a;animation:ahSlam .42s ease}@keyframes ahCut{0%{opacity:1;transform:scaleY(1)}55%{opacity:1;transform:scaleY(1)}100%{opacity:0;transform:scaleY(0)}}@keyframes ahSlam{0%{opacity:0;transform:scale(1.4) rotate(-8deg)}40%{opacity:1;transform:scale(.96) rotate(2deg)}100%{opacity:0;transform:scale(1) rotate(0)}}#choices.freechat-hidden{display:none!important;visibility:hidden!important}body.show-choices #choices:not(.freechat-hidden) button{animation:ahRim .9s ease 1}@keyframes ahRim{0%{box-shadow:0 0 0 0 rgba(201,180,138,.5)}70%{box-shadow:0 0 0 8px rgba(201,180,138,0)}100%{box-shadow:0 0 0 0 rgba(201,180,138,0)}}";
    document.head.appendChild(st);
  }
  function keepChatFirst(resetMiss) {
    document.body.classList.remove("show-choices");
    var box = document.getElementById("choices");
    if (box) {
      box.classList.add("freechat-hidden");
      box.style.setProperty("display", "none", "important");
    }
    if (resetMiss && window.__ahForceHide) window.__ahForceHide();
    else if (window.__ahHideChoices) window.__ahHideChoices();
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
    var allowed = { office:1, lounge:1, pantry:1, review:1, roof:1, lift:1, close:1, dark:1, hall:1, meet:1 };
    var cls = allowed[sceneKey] ? sceneKey : (storyId === "morgan" ? "lounge" : storyId === "sam" ? "pantry" : "office");
    if (cls === "close" || cls === "meet" || cls === "hall") cls = "office close-mood";
    if (cls === "dark") cls = "office dark-mood";
    el.className = cls;
    if (!document.getElementById("scene-mood-css")) {
      var st = document.createElement("style");
      st.id = "scene-mood-css";
      st.textContent = "#scene-bg.close-mood .city{filter:brightness(.85) saturate(1.1)}#scene-bg.close-mood .windows i.on{opacity:.9}#scene-bg.dark-mood{filter:brightness(.45)}#scene-bg.dark-mood .rain{opacity:.7}#scene-bg.dark-mood .windows i{opacity:.25}";
      document.head.appendChild(st);
    }
  }
  function shutter() {
    if (window.__ahOwnerQuiet || window.__ahPlaytest) return;
    var el = layer();
    ensureFxCss();
    el.classList.remove("is-cut");
    void el.offsetWidth;
    el.classList.add("is-cut");
    setTimeout(function () { el.classList.remove("is-cut"); }, 420);
  }
  function play(kind) {
    if (window.__ahOwnerQuiet || window.__ahPlaytest) return;
    var el = layer();
    ensureFxCss();
    el.classList.remove("is-win", "is-fail", "is-cut");
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
      var before = (typeof state !== "undefined" && state.nodeId) || "";
      _render.apply(this, arguments);
      setScene();
      var after = (typeof state !== "undefined" && state.nodeId) || "";
      if (after && after !== lastNode) {
        if (lastNode && !window.__ahOwnerQuiet && !window.__ahPlaytest) shutter();
        lastNode = after;
        keepChatFirst(true);
      } else {
        keepChatFirst(false);
      }
      document.body.classList.remove("show-choices");
    };
    window.renderNode.__ahNeverReveal = true;
    window.renderNode.__ahFx0616 = true;
    if (typeof window.applyFreeChatAdvance === "function" && !window.applyFreeChatAdvance.__ahFx0616) {
      var _adv = window.applyFreeChatAdvance;
      window.applyFreeChatAdvance = function () {
        var ok = _adv.apply(this, arguments);
        if (!window.__ahOwnerQuiet && !window.__ahPlaytest) play(ok ? "win" : "fail");
        keepChatFirst(!!ok);
        return ok;
      };
      window.applyFreeChatAdvance.__ahFx0616 = true;
    }
    if (typeof window.goToNode === "function" && !window.goToNode.__ahCut0616) {
      var gn = window.goToNode;
      window.goToNode = function () {
        var r = gn.apply(this, arguments);
        if (!window.__ahOwnerQuiet && !window.__ahPlaytest) shutter();
        keepChatFirst(true);
        return r;
      };
      window.goToNode.__ahCut0616 = true;
    }
  }
  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest && e.target.closest("button, .btn, .btn-choice");
    if (!btn) return;
    if (!window.__ahOwnerQuiet && !window.__ahPlaytest) {
      if (btn.classList.contains("is-locked")) play("fail");
      else if (btn.classList.contains("btn-choice") || btn.id === "enter-btn" || btn.classList.contains("btn-primary")) play("win");
    }
    hookEngine();
    setScene();
    if (btn.classList.contains("btn-choice")) keepChatFirst(true);
  }, true);
  document.addEventListener("submit", function (e) {
    var input = document.getElementById("chat-input");
    var raw = input ? String(input.value || "").trim() : "";
    if (!OWNER_PROBE.test(raw)) return;
    window.__ahOwnerQuiet = true;
    window.__ahPlaytest = true;
    keepChatFirst(false);
    e.preventDefault();
    e.stopPropagation();
  }, true);
  var n = 0;
  var t = setInterval(function () {
    hookEngine();
    if (wrapped || ++n > 40) clearInterval(t);
  }, 250);
  layer();
  ensureFxCss();
})();

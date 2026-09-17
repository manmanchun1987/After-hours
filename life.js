/* live62 cache */
(function () {
  var BASE = location.pathname.indexOf("/After-hours") === 0 ? "/After-hours" : ".";
  var FILES = { alex: BASE + "/data/alex.json", morgan: BASE + "/data/morgan.json", sam: BASE + "/data/sam.json" };
  var IDLE = BASE + "/assets/video/vera-loop.mp4";
  var LINE = {
    n1: BASE + "/assets/video/vera-loop.mp4",
    n2c: BASE + "/assets/video/vera-alt.mp4",
    n4x: BASE + "/assets/video/vera-loop.mp4",
    n5: BASE + "/assets/video/vera-alt.mp4"
  };
  var FACE = {
    alex: BASE + "/assets/alex.png",
    morgan: BASE + "/assets/morgan.jpg",
    sam: BASE + "/assets/sam.jpg"
  };
  var story = null, nodeId = null, heat = 20, tension = 15, mem = [], route = "alex";
  var sfxChoice, sfxCall, sfxTrans, bgm, lastScene = "", linePlayed = {};
  function $(id) { return document.getElementById(id); }
  function clamp(n) { return Math.max(0, Math.min(100, n)); }
  function ping(a) {
    if (!a) return;
    try { a.currentTime = 0; a.play(); } catch (e) {}
  }
  function tap() {
    if (!sfxChoice) {
      sfxChoice = new Audio(BASE + "/assets/audio/sfx-click.mp3");
      sfxChoice.volume = 0.4;
    }
    ping(sfxChoice);
  }
  function sceneOf(id) {
    if (id === "n0" || id === "n0b") return "hall";
    if (id === "n4x" || id === "n5" || id === "n6a" || id === "n6b" || id === "n6c") return "dark";
    if (id === "n7" || id === "n8a" || id === "n8b") return "review";
    if (id && id.indexOf("ending") === 0) return "dawn";
    if (id === "n3b" || id === "n4b" || id === "n4c") return "close";
    return "meet";
  }
  function ensureBgm() {
    if (bgm) return;
    bgm = new Audio(BASE + "/assets/audio/bgm-loop.mp3");
    bgm.loop = true;
    bgm.volume = 0.18;
  }
  function playBgm(scene) {
    ensureBgm();
    bgm.volume = scene === "dark" ? 0.1 : 0.18;
    var p = bgm.play();
    if (p && p.catch) p.catch(function () {});
  }
  function sceneEnter(scene) {
    if (scene === lastScene) return;
    lastScene = scene;
    if (scene === "dark" || scene === "close") {
      if (!sfxCall) { sfxCall = new Audio(BASE + "/assets/audio/sfx-call.mp3"); sfxCall.volume = 0.45; }
      ping(sfxCall);
    } else {
      if (!sfxTrans) { sfxTrans = new Audio(BASE + "/assets/audio/sfx-transition.mp3"); sfxTrans.volume = 0.3; }
      ping(sfxTrans);
    }
  }
  function hideVid(v) {
    if (!v) return;
    v.setAttribute("data-fail", "1");
    v.style.display = "none";
    try { v.pause && v.pause(); } catch (e) {}
  }
  function playIdle() {
    var v = $("vera-vid");
    if (!v || route !== "alex" || v.getAttribute("data-fail") === "1") return;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    if (v.getAttribute("data-src") !== "idle") {
      v.src = IDLE;
      v.setAttribute("data-src", "idle");
    }
    var p = v.play();
    if (p && p.catch) p.catch(function () { hideVid(v); });
  }
  function playLine(id) {
    var v = $("vera-vid");
    var src = LINE[id];
    if (!v || !src || linePlayed[id]) { playIdle(); return; }
    linePlayed[id] = true;
    v.loop = false;
    v.muted = true;
    v.playsInline = true;
    v.onended = function () { playIdle(); };
    v.onerror = function () { playIdle(); };
    v.src = src;
    v.setAttribute("data-src", "line");
    var p = v.play();
    if (p && p.catch) p.catch(function () { playIdle(); });
  }
  function setFace() {
    var img = $("alex-portrait");
    var v = $("vera-vid");
    if (img) img.src = FACE[route] || FACE.alex;
    if (!v) return;
    if (route !== "alex") { hideVid(v); return; }
    v.style.display = "";
    v.onerror = function () { hideVid(v); };
    if (LINE[nodeId] && !linePlayed[nodeId]) playLine(nodeId);
    else playIdle();
  }
  function addMem(list) {
    (list || []).forEach(function (id) {
      if (id && mem.indexOf(id) < 0) mem.push(id);
    });
  }
  function isCgChoice(ch) {
    if (!ch) return false;
    if (ch.cg === true || ch.mode === "call") return true;
    if ((ch.heat || 0) >= 8) return true;
    return false;
  }
  function meters() {
    var h = $("meter-heat"), t = $("meter-tension");
    if (h) h.style.width = heat + "%";
    if (t) t.style.width = tension + "%";
  }
  function chips() {
    var box = $("memory-chips");
    var strip = $("memory-strip");
    if (!box || !strip) return;
    box.innerHTML = "";
    var labels = (story && story.memoryLabels) || {};
    mem.forEach(function (id) {
      var s = document.createElement("span");
      s.className = "chip";
      s.textContent = labels[id] || id;
      box.appendChild(s);
    });
    strip.hidden = mem.length === 0;
  }
  function slot(wrapId, textId, val) {
    var w = $(wrapId), p = $(textId);
    if (!w || !p) return;
    if (val) { p.textContent = val; w.hidden = false; }
    else { p.textContent = ""; w.hidden = true; }
  }
  function show(name) {
    ["screen-gate", "screen-cast", "screen-play", "screen-ending"].forEach(function (id) {
      var el = $(id); if (!el) return;
      el.classList.toggle("active", id === "screen-" + name);
    });
    document.body.classList.toggle("mode-play", name === "play");
    if (name === "play") setFace();
  }
  function render() {
    if (!story || !story.nodes) return;
    var node = story.nodes[nodeId]; if (!node) return;
    addMem(node.remember);
    var scene = sceneOf(nodeId);
    document.body.classList.toggle("mode-cg", !!(node && node.mode === "call"));
    document.body.setAttribute("data-scene", scene);
    sceneEnter(scene);
    playBgm(scene);
    if (node.ending) {
      if ($("ending-title")) $("ending-title").textContent = node.endingTitle || node.title || node.label || "結局";
      if ($("ending-text")) $("ending-text").textContent = node.text || "";
      show("ending"); return;
    }
    if ($("play-label")) $("play-label").textContent = node.label || story.name || "";
    if ($("play-text")) $("play-text").textContent = node.text || "";
    slot("thought-slot", "play-thought", node.thought);
    slot("aside-slot", "play-aside", [node.aside, node.mid].filter(Boolean).join(" · "));
    meters(); chips();
    var box = $("choices");
    if (box) {
      box.innerHTML = "";
      (node.choices || []).forEach(function (ch) {
        var need = ch.requireHeat || 0;
        var b = document.createElement("button");
        b.className = "btn btn-choice" + (isCgChoice(ch) ? " btn-cg" : "");
        b.type = "button";
        if (heat < need) {
          b.disabled = true;
          b.textContent = (ch.label || "") + "（熱度不足）";
        } else {
          b.textContent = (isCgChoice(ch) ? "CG · " : "") + (ch.label || "繼續");
          b.onclick = function () {
            tap();
            if (ch.heat) heat = clamp(heat + ch.heat);
            if (ch.tension) tension = clamp(tension + ch.tension);
            addMem(ch.remember);
            nodeId = ch.to || ch.next;
            render();
          };
        }
        box.appendChild(b);
      });
    }
    show("play");
  }
  function start(id) {
    tap();
    lastScene = "";
    linePlayed = {};
    route = id || "alex";
    var v = $("vera-vid");
    if (v) { v.removeAttribute("data-fail"); v.removeAttribute("data-src"); }
    fetch(FILES[id] || FILES.alex).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (s) {
        story = s; nodeId = s.start; heat = 20; tension = 15; mem = []; render();
      })
      .catch(function () { show("cast"); });
  }
  function bind() {
    if ($("enter-btn")) $("enter-btn").onclick = function () { tap(); show("cast"); playBgm("meet"); };
    document.querySelectorAll("[data-start]").forEach(function (btn) {
      btn.onclick = function () { start(btn.getAttribute("data-start")); };
    });
    if ($("back-cast")) $("back-cast").onclick = function () { tap(); show("cast"); };
    if ($("ending-replay")) $("ending-replay").onclick = function () {
      tap();
      lastScene = "";
      linePlayed = {};
      if (story) { nodeId = story.start; heat = 20; tension = 15; mem = []; render(); }
    };
    if ($("ending-cast")) $("ending-cast").onclick = function () { tap(); show("cast"); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

(function () {
  var BASE = location.pathname.indexOf("/After-hours") === 0 ? "/After-hours" : ".";
  var FILES = { alex: BASE + "/data/alex.json", morgan: BASE + "/data/morgan.json", sam: BASE + "/data/sam.json" };
  var CLIP = BASE + "/assets/_users_69f5aaea-27d3-48b5-b7c8-1861432a31ce_generated_b8e9107f-e582-4175-86e7-de5bf918a8da_generated_video.mp4";
  var FACE = {
    alex: BASE + "/assets/IMG_1412.jpeg",
    morgan: BASE + "/assets/IMG_1411.jpeg",
    sam: BASE + "/assets/IMG_1410.jpeg"
  };
  var story = null, nodeId = null, heat = 20, tension = 15, mem = [], route = "alex";
  var sfx, bgm, bgmKey = "";
  function $(id) { return document.getElementById(id); }
  function clamp(n) { return Math.max(0, Math.min(100, n)); }
  function tap() {
    try {
      if (!sfx) { sfx = new Audio(BASE + "/assets/audio/sfx-choice.mp3"); sfx.volume = 0.35; }
      sfx.currentTime = 0;
      sfx.play();
    } catch (e) {}
  }
  function sceneOf(id) {
    if (id === "n0" || id === "n0b") return "hall";
    if (id === "n4x" || id === "n5") return "dark";
    if (id === "n7" || id === "n8a" || id === "n8b") return "review";
    if (id && id.indexOf("ending") === 0) return "dawn";
    if (id === "n3b" || id === "n4b" || id === "n4c") return "close";
    return "meet";
  }
  function cueFor(node) {
    if (node && node.mode === "call") return "call";
    if (route === "morgan") return "lounge";
    if (route === "sam") return "pantry";
    return "office";
  }
  function playBgm(key) {
    if (key === bgmKey && bgm) {
      var p = bgm.play(); if (p && p.catch) p.catch(function () {});
      return;
    }
    bgmKey = key;
    var prefer = BASE + "/assets/audio/bgm-" + key + ".mp3";
    var fallback = BASE + "/assets/audio/bgm-loop.mp3";
    if (bgm) { try { bgm.pause(); } catch (e) {} }
    bgm = new Audio(prefer);
    bgm.loop = true;
    bgm.volume = 0.22;
    bgm.onerror = function () {
      if (bgm.src.indexOf("bgm-loop") >= 0) return;
      bgm.src = fallback;
      bgm.play().catch(function () {});
    };
    bgm.play().catch(function () {});
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
  function hideVid(v) {
    if (!v) return;
    v.setAttribute("data-fail", "1");
    v.style.display = "none";
    try { v.pause && v.pause(); } catch (e) {}
    try { v.removeAttribute("src"); v.load && v.load(); } catch (e2) {}
  }
  function setFace() {
    var img = $("alex-portrait");
    var v = $("vera-vid");
    if (img) img.src = FACE[route] || FACE.alex;
    if (!v) return;
    if (route === "alex") {
      v.style.display = "";
      playClip();
    } else {
      hideVid(v);
    }
  }
  function playClip() {
    var v = $("vera-vid");
    if (!v) return;
    if (route !== "alex") return;
    if (v.getAttribute("data-fail") === "1") return;
    if (v.getAttribute("data-ready") !== "1") {
      v.src = CLIP;
      v.setAttribute("data-ready", "1");
      v.onerror = function () { hideVid(v); };
    }
    v.muted = true;
    v.loop = true;
    v.setAttribute("playsinline", "");
    v.playsInline = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () { hideVid(v); });
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
    document.body.classList.toggle("mode-cg", !!(node && node.mode === "call"));
    document.body.setAttribute("data-scene", sceneOf(nodeId));
    playBgm(cueFor(node));
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
    route = id || "alex";
    var v = $("vera-vid");
    if (v) { v.removeAttribute("data-fail"); v.removeAttribute("data-ready"); }
    fetch(FILES[id] || FILES.alex).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (s) {
        story = s; nodeId = s.start; heat = 20; tension = 15; mem = []; render();
      })
      .catch(function () { show("cast"); });
  }
  function bind() {
    if ($("enter-btn")) $("enter-btn").onclick = function () { tap(); show("cast"); playBgm("office"); };
    document.querySelectorAll("[data-start]").forEach(function (btn) {
      btn.onclick = function () { start(btn.getAttribute("data-start")); };
    });
    if ($("back-cast")) $("back-cast").onclick = function () { tap(); show("cast"); };
    if ($("ending-replay")) $("ending-replay").onclick = function () {
      tap();
      if (story) { nodeId = story.start; heat = 20; tension = 15; mem = []; render(); }
    };
    if ($("ending-cast")) $("ending-cast").onclick = function () { tap(); show("cast"); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

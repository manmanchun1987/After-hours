(function () {
  var BASE = location.pathname.indexOf("/After-hours") === 0 ? "/After-hours" : ".";
  var FILES = { alex: BASE + "/data/alex.json", morgan: BASE + "/data/morgan.json", sam: BASE + "/data/sam.json" };
  var story = null, nodeId = null, heat = 20, tension = 15, mem = [];
  function $(id) { return document.getElementById(id); }
  function clamp(n) { return Math.max(0, Math.min(100, n)); }
  function addMem(list) {
    (list || []).forEach(function (id) {
      if (id && mem.indexOf(id) < 0) mem.push(id);
    });
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
  }
  function render() {
    if (!story || !story.nodes) return;
    var node = story.nodes[nodeId]; if (!node) return;
    addMem(node.remember);
    if (node.ending) {
      if ($("ending-title")) $("ending-title").textContent = node.endingTitle || node.title || node.label || "結局";
      if ($("ending-text")) $("ending-text").textContent = node.text || "";
      show("ending"); return;
    }
    if ($("play-label")) $("play-label").textContent = node.label || story.name || "";
    if ($("play-text")) $("play-text").textContent = node.text || "";
    slot("thought-slot", "play-thought", node.thought);
    slot("aside-slot", "play-aside", node.aside);
    meters(); chips();
    var box = $("choices");
    if (box) {
      box.innerHTML = "";
      (node.choices || []).forEach(function (ch) {
        var need = ch.requireHeat || 0;
        var b = document.createElement("button");
        b.className = "btn btn-choice"; b.type = "button";
        if (heat < need) {
          b.disabled = true;
          b.textContent = (ch.label || "") + "（熱度不足）";
        } else {
          b.textContent = ch.label || "繼續";
          b.onclick = function () {
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
    fetch(FILES[id] || FILES.alex).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (s) {
        story = s; nodeId = s.start; heat = 20; tension = 15; mem = []; render();
      })
      .catch(function () { show("cast"); });
  }
  function bind() {
    if ($("enter-btn")) $("enter-btn").onclick = function () { show("cast"); };
    document.querySelectorAll("[data-start]").forEach(function (btn) {
      btn.onclick = function () { start(btn.getAttribute("data-start")); };
    });
    if ($("back-cast")) $("back-cast").onclick = function () { show("cast"); };
    if ($("ending-replay")) $("ending-replay").onclick = function () {
      if (story) { nodeId = story.start; heat = 20; tension = 15; mem = []; render(); }
    };
    if ($("ending-cast")) $("ending-cast").onclick = function () { show("cast"); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

(function () {
  var BASE = ".";
  if (location.pathname.indexOf("/After-hours") === 0) BASE = "/After-hours";
  var FILES = {
    alex: BASE + "/data/alex.json",
    morgan: BASE + "/data/morgan.json",
    sam: BASE + "/data/sam.json"
  };
  var story = null;
  var nodeId = null;
  function $(id) { return document.getElementById(id); }
  function show(name) {
    ["screen-gate", "screen-cast", "screen-play", "screen-ending"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      if (id === "screen-" + name) el.classList.add("active");
      else el.classList.remove("active");
    });
    document.body.classList.toggle("mode-play", name === "play");
  }
  function render() {
    if (!story || !story.nodes) return;
    var node = story.nodes[nodeId];
    if (!node) return;
    if (node.ending) {
      var et = $("ending-title"); if (et) et.textContent = node.title || "結局";
      var ex = $("ending-text"); if (ex) ex.textContent = node.text || "";
      show("ending");
      return;
    }
    var label = $("play-label"); if (label) label.textContent = story.name || "";
    var text = $("play-text"); if (text) text.textContent = node.text || "";
    var box = $("choices");
    if (box) {
      box.innerHTML = "";
      (node.choices || []).forEach(function (ch) {
        var b = document.createElement("button");
        b.className = "btn btn-choice";
        b.type = "button";
        b.textContent = ch.label || "繼續";
        b.onclick = function () {
          nodeId = ch.to || ch.next || ch.id;
          render();
        };
        box.appendChild(b);
      });
    }
    show("play");
  }
  function start(id) {
    fetch(FILES[id] || FILES.alex)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (s) {
        story = s;
        nodeId = s.start;
        render();
      })
      .catch(function (err) {
        var t = $("play-text") || $("chars");
        if (t) t.textContent = "載不到劇本：" + (FILES[id] || "") + " " + err;
        show("cast");
      });
  }
  function bind() {
    var enter = $("enter-btn");
    if (enter) enter.onclick = function () { show("cast"); };
    document.querySelectorAll("[data-start]").forEach(function (btn) {
      btn.onclick = function () { start(btn.getAttribute("data-start")); };
    });
    var back = $("back-cast");
    if (back) back.onclick = function () { show("cast"); };
    var er = $("ending-replay");
    if (er) er.onclick = function () { if (story) { nodeId = story.start; render(); } };
    var ec = $("ending-cast");
    if (ec) ec.onclick = function () { show("cast"); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

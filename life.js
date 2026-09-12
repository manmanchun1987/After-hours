(function () {
  var BASE = location.pathname.indexOf("/After-hours") === 0 ? "/After-hours" : ".";
  var FILES = { alex: BASE + "/data/alex.json", morgan: BASE + "/data/morgan.json", sam: BASE + "/data/sam.json" };
  var VIDEO = "https://files2.heygen.ai/aries/output/45fc2818-8f28-46a1-9c67-789dc8de82f5/video.mp4?Expires=1789835706&Signature=PqU7cybe8KsiQeF9Xfw2JJnlTJYtI9-8yl8rANo5IIJrFfZiHdobcMc~LNhR0uAq35OzwQQKJePdQ~P2nd7awQ71eC-VkB56oTUgFJHXkn-lFSvhOeGHaVqbp4r-t9JNOXLHBljDJav--Xc2MphSQLF2NN7fXmM13irTU5ylGdvtNuDnJN~72RME8H1SmsxBRqtCAKLX27Fomxx2piZ4ZYYRLEOZJvI9o5aNhq1FG46OeIxLjjn1pEWKh03mjDuSfV65wJwOulywvttWf2HE9QbdRQmCfsG5M6TeBiQCvVRIc9kHq3prqjZ-E1d3Q7cYzzB3APYBJZDPGXLj0n217w__&Key-Pair-Id=K38HBHX5LX3X2H";
  var story = null, nodeId = null;
  function $(id) { return document.getElementById(id); }
  function playVid() {
    var v = $("vera-vid");
    if (!v) return;
    if (!v.getAttribute("src")) v.src = VIDEO;
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function show(name) {
    ["screen-gate", "screen-cast", "screen-play", "screen-ending"].forEach(function (id) {
      var el = $(id); if (!el) return;
      el.classList.toggle("active", id === "screen-" + name);
    });
    document.body.classList.toggle("mode-play", name === "play");
    if (name === "play") playVid();
  }
  function render() {
    if (!story || !story.nodes) return;
    var node = story.nodes[nodeId]; if (!node) return;
    if (node.ending) {
      if ($("ending-title")) $("ending-title").textContent = node.title || "結局";
      if ($("ending-text")) $("ending-text").textContent = node.text || "";
      show("ending"); return;
    }
    if ($("play-label")) $("play-label").textContent = story.name || "";
    if ($("play-text")) $("play-text").textContent = node.text || "";
    var box = $("choices");
    if (box) {
      box.innerHTML = "";
      (node.choices || []).forEach(function (ch) {
        var b = document.createElement("button");
        b.className = "btn btn-choice"; b.type = "button";
        b.textContent = ch.label || "繼續";
        b.onclick = function () { nodeId = ch.to || ch.next; render(); };
        box.appendChild(b);
      });
    }
    show("play");
  }
  function start(id) {
    fetch(FILES[id] || FILES.alex).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (s) { story = s; nodeId = s.start; render(); })
      .catch(function () { show("cast"); });
  }
  function bind() {
    if ($("enter-btn")) $("enter-btn").onclick = function () { show("cast"); };
    document.querySelectorAll("[data-start]").forEach(function (btn) {
      btn.onclick = function () { start(btn.getAttribute("data-start")); };
    });
    if ($("back-cast")) $("back-cast").onclick = function () { show("cast"); };
    if ($("ending-replay")) $("ending-replay").onclick = function () { if (story) { nodeId = story.start; render(); } };
    if ($("ending-cast")) $("ending-cast").onclick = function () { show("cast"); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

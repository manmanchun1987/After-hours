(function () {
  var BASE = location.pathname.indexOf("/After-hours") === 0 ? "/After-hours" : ".";
  var FILES = { alex: BASE + "/data/alex.json", morgan: BASE + "/data/morgan.json", sam: BASE + "/data/sam.json" };
  var story = null, nodeId = null;
  function $(id) { return document.getElementById(id); }
  function show(name) {
    ["screen-gate", "screen-cast", "screen-play", "screen-ending"].forEach(function (id) {
      var el = $(id); if (!el) return;
      el.classList.toggle("active", id === "screen-" + name);
    });
    document.body.classList.toggle("mode-play", name === "play");
    if (name === "play") startLife();
  }
  function startLife() {
    var img = $("alex-portrait"), stack = $("alex-portrait-stack");
    if (!img || !stack || stack.dataset.life === "1") return;
    var c = document.createElement("canvas");
    c.id = "life-canvas";
    c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1";
    stack.appendChild(c);
    var ctx = c.getContext("2d"), t = 0, started = false;
    function fit() {
      var w = stack.clientWidth || innerWidth, h = stack.clientHeight || innerHeight;
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
    }
    function frame() {
      t += 0.016; fit();
      var w = c.width, h = c.height;
      if (!w || !img.naturalWidth) { requestAnimationFrame(frame); return; }
      var ir = img.naturalWidth / img.naturalHeight, cr = w / h, dw, dh;
      if (ir > cr) { dh = h * 1.04; dw = dh * ir; } else { dw = w * 1.04; dh = dw / ir; }
      var dx = (w - dw) / 2 + Math.sin(t * 0.55) * 18;
      var dy = (h - dh) * 0.02 + Math.sin(t * 0.9) * 12;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, dx, dy, dw, dh);
      if ((t % 3.6) > 3.38) {
        ctx.fillStyle = "#2a1c18";
        var ey = dy + dh * 0.215, ex = dx + dw * 0.492;
        ctx.beginPath();
        ctx.ellipse(ex - dw * 0.017, ey, dw * 0.015, dh * 0.007, 0, 0, Math.PI * 2);
        ctx.ellipse(ex + dw * 0.019, ey, dw * 0.015, dh * 0.007, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!started) { started = true; stack.dataset.life = "1"; img.style.opacity = "0"; }
      requestAnimationFrame(frame);
    }
    if (img.complete && img.naturalWidth) requestAnimationFrame(frame);
    else img.addEventListener("load", function () { requestAnimationFrame(frame); }, { once: true });
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
        b.className = "btn btn-choice"; b.type = "button"; b.textContent = ch.label || "繼續";
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

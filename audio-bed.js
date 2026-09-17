(function () {
  var ctx, master, bedGain, sfxGain, started = false, muted = false;
  function AC() { return window.AudioContext || window.webkitAudioContext; }
  function ensure() {
    if (ctx) return ctx;
    var C = AC();
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    bedGain = ctx.createGain();
    sfxGain = ctx.createGain();
    master.gain.value = 0.7;
    bedGain.gain.value = 0.18;
    sfxGain.gain.value = 0.45;
    bedGain.connect(master);
    sfxGain.connect(master);
    master.connect(ctx.destination);
    return ctx;
  }
  function beep(freq, dur, type, vol, slide) {
    if (!ensure() || muted) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(sfxGain);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  }
  function noiseBurst(dur, vol) {
    if (!ensure() || muted) return;
    var n = ctx.sampleRate * dur;
    var buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    var f = ctx.createBiquadFilter();
    var g = ctx.createGain();
    src.buffer = buf;
    f.type = "lowpass"; f.frequency.value = 900;
    g.gain.setValueAtTime(vol || 0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start();
  }
  function startBed() {
    if (!ensure()) return;
    try { if (ctx.state === "suspended") ctx.resume(); } catch (e) {}
    if (!started) {
      started = true;
      var o = ctx.createOscillator();
      var o2 = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 92;
      o2.type = "triangle"; o2.frequency.value = 138;
      g.gain.value = 1;
      o.connect(g); o2.connect(g); g.connect(bedGain);
      o.start(); o2.start();
    }
    if (!window.__ahBgmEl) {
      var a = new Audio("./assets/audio/bgm-loop.mp3");
      a.loop = true;
      a.volume = 0.28;
      a.preload = "auto";
      window.__ahBgmEl = a;
    }
    var a = window.__ahBgmEl;
    a.muted = muted;
    var p = a.play();
    if (p && p.catch) p.catch(function () {
      /* retry once after short delay on autoplay block */
      setTimeout(function () {
        try { a.play().catch(function () {}); } catch (e) {}
      }, 120);
    });
  }
  function playCue(kind) {
    if (kind === "fail") { beep(180, 0.28, "sawtooth", 0.1, 70); noiseBurst(0.2, 0.06); }
    else if (kind === "win") { beep(523, 0.12, "triangle", 0.1); setTimeout(function () { beep(784, 0.18, "sine", 0.09); }, 90); }
    else if (kind === "send") { beep(640, 0.06, "square", 0.05); }
    else { beep(420, 0.05, "sine", 0.04); }
  }
  function setMuted(v) {
    muted = !!v;
    if (window.__ahBgmEl) window.__ahBgmEl.muted = muted;
    if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.7, ctx.currentTime, 0.05);
  }
  window.AHAudio = { start: startBed, cue: playCue, unlock: function () { ensure(); startBed(); }, setMuted: setMuted };
  document.addEventListener("click", function (e) {
    var id = e.target && e.target.id;
    if (id === "enter-btn" || id === "btn-mute-bgm" || id === "btn-mute-master") {
      ensure(); startBed();
    }
    if (id === "btn-mute-master" || id === "btn-mute-bgm") {
      setMuted(!muted);
    }
    if (id === "enter-btn") playCue("win");
  }, true);
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "chat-form") playCue("send");
  }, true);
  /* unlock on any first gesture; keep resume listener so post-enter never silent */
  function gestureUnlock() {
    ensure(); startBed();
  }
  document.addEventListener("pointerdown", gestureUnlock, true);
  document.addEventListener("touchstart", gestureUnlock, { capture: true, passive: true });
})();

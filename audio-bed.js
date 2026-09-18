(function () {
  var ctx, master, bedGain, sfxGain, started = false, muted = false;
  var clickEl, choiceEl;
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
    sfxGain.gain.value = 0.55;
    bedGain.connect(master);
    sfxGain.connect(master);
    master.connect(ctx.destination);
    return ctx;
  }
  function fileCue(which) {
    try {
      if (!clickEl) {
        clickEl = new Audio("./assets/audio/sfx-click.mp3");
        clickEl.preload = "auto";
      }
      if (!choiceEl) {
        choiceEl = new Audio("./assets/audio/sfx-choice.mp3");
        choiceEl.preload = "auto";
      }
      var a = which === "choice" ? choiceEl : clickEl;
      a.currentTime = 0;
      a.volume = muted ? 0 : 0.7;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      return true;
    } catch (e) {
      return false;
    }
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
    if (p && p.catch) p.catch(function () {});
  }
  function playCue(kind) {
    if (muted) return;
    if (kind === "fail") {
      beep(165, 0.32, "sawtooth", 0.14, 55);
      noiseBurst(0.24, 0.09);
    } else if (kind === "win") {
      fileCue("choice");
      beep(523, 0.14, "triangle", 0.13);
      setTimeout(function () { beep(784, 0.2, "sine", 0.11); }, 80);
    } else if (kind === "send") {
      fileCue("click");
      beep(640, 0.06, "square", 0.05);
    } else if (kind === "choice") {
      fileCue("choice");
      beep(380, 0.07, "sine", 0.1, 40);
      setTimeout(function () { beep(520, 0.05, "triangle", 0.07); }, 35);
    } else if (kind === "tick" || kind === "click") {
      fileCue("click");
      beep(420, 0.04, "sine", 0.05);
    } else {
      fileCue("click");
      beep(420, 0.05, "sine", 0.04);
    }
  }
  function setMuted(v) {
    muted = !!v;
    if (window.__ahBgmEl) window.__ahBgmEl.muted = muted;
    if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.7, ctx.currentTime, 0.05);
    if (muted && window.speechSynthesis) window.speechSynthesis.cancel();
  }
  function speak(text) {
    if (muted || !window.speechSynthesis) return;
    var t = String(text || "").replace(/\s+/g, " ").trim().slice(0, 140);
    if (!t) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t);
      u.lang = "zh-HK";
      u.rate = 0.92;
      u.pitch = 1.02;
      u.volume = 0.9;
      var voices = window.speechSynthesis.getVoices() || [];
      var pick = null;
      for (var i = 0; i < voices.length; i++) {
        var lg = (voices[i].lang || "").toLowerCase();
        if (lg.indexOf("zh-hk") === 0 || lg.indexOf("zh-tw") === 0 || lg === "zh" || lg.indexOf("yue") === 0) {
          pick = voices[i]; break;
        }
      }
      if (pick) u.voice = pick;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  window.AHAudio = {
    start: startBed,
    cue: playCue,
    speak: speak,
    unlock: function () { ensure(); startBed(); },
    setMuted: setMuted,
    get muted() { return muted; }
  };
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t) return;
    var id = t.id || (t.closest && t.closest("[id]") && t.closest("[id]").id);
    var btn = t.closest ? t.closest("button, .btn, .btn-choice") : t;
    if (id === "btn-mute-master" || id === "btn-mute-bgm" || id === "btn-mute-voice") {
      ensure();
      startBed();
      return;
    }
    if (id === "enter-btn") {
      ensure(); startBed(); playCue("win");
      return;
    }
    if (btn && (btn.classList && (btn.classList.contains("btn") || btn.classList.contains("btn-choice") || btn.tagName === "BUTTON"))) {
      ensure(); startBed();
      playCue(btn.classList.contains("btn-primary") || btn.classList.contains("btn-choice") ? "choice" : "click");
    }
  }, true);
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "chat-form") playCue("send");
  }, true);
  document.addEventListener("pointerdown", function () { ensure(); startBed(); }, true);
})();

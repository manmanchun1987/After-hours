const STORAGE_KEY = "after-hours-v2";
const AUDIO_KEY = "after-hours-audio-v1";

const STORY_FILES = {
  alex: "./data/alex.json?v=scene-sfx1b",
  morgan: "./data/morgan.json?v=scene-sfx1b",
  sam: "./data/sam.json?v=scene-sfx1b",
};

const state = {
  ageOk: false,
  story: null,
  storyId: null,
  nodeId: null,
  path: [],
  lastSpokenLines: [],
  currentMood: "cold",
  chatBusy: false,
  memories: [],
  callMode: false,
  callTimerId: null,
  callSeconds: 0,
  incomingTimerId: null,
  unreadCount: 0,
  memoryPanelOpen: false,
  heat: 20,
  tension: 15,
  // session chat humanization (no LLM)
  chatUserLines: [],
  chatBotLines: [],
  chatTopics: [],
  recentBotReplies: [],
  // Layer 4: per-bucket draw ledger (longer than CHAT_ANTIREPEAT_N when a pool is thin).
  replyLedger: {},
  replyCursor: {},
  spokenTurns: [],
  glueSaidKey: "",
  openPlayer: null,
  halfFollow: null,
  offTopicStreak: 0,
  freeChatChoicesVisible: false,
  freeChatNodeId: null,
  stashedNodeThought: null,
  guidanceThoughtActive: false,
  chatTone: "cold",
  proactiveCooldownUntil: 0,
  proactiveCountOnNode: 0,
  proactiveNodeId: null,
  lastChatActivityAt: 0,
  // player-said facts (chips + 「你頭先講…」). Story beat ids stay in memories.
  playerFacts: [],
  pendingFactId: null,
  factTurn: 0,
  lastNotedTurn: "",
  lastNotedAt: 0,
  sessionFirstPingSent: false,
  callWanted: false,
  callFromIntent: false,
  callIntentNodeId: null,
  callIntentCountOnNode: 0,
  callIntentCooldownUntil: 0,
  callExitTimer: null,
  callIntentEndTimer: null,
  lastCallSfxAt: 0,
  callBeatNodeId: "",
  endings: {},
  nightFrom: {},
};

const audioPrefs = {
  masterMute: false,
  bgmMute: false,
  voiceMute: false,
};

const $ = (sel) => document.querySelector(sel);
const screens = {
  gate: $("#screen-gate"),
  cover: $("#screen-cover"),
  cast: $("#screen-cast"),
  play: $("#screen-play"),
  ending: $("#screen-ending"),
};

/* ============================================================
   A) Web Audio — file assets + soft synth fallback
   ============================================================ */
const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let bgmGain = null;
  let sfxGain = null;
  let bgmNodes = [];
  let bgmSource = null;
  let started = false;
  let bgmPlaying = false;
  let bgmDuck = false;
  let manifest = null;
  let buffers = { bgm: null, bgmScenes: {}, click: null, choice: null, transition: null, ping: null, call: null };
  let bgmTrackKey = null;
  let loadPromise = null;
  let rainWanted = false;
  let rainOn = false;
  let rainSource = null;
  let rainGain = null;
  let rainStopTimer = 0;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    bgmGain = ctx.createGain();
    sfxGain = ctx.createGain();
    bgmGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    applyVolumes();
    return ctx;
  }

  function volumeForKey(key) {
    if (key && key !== "default" && manifest && manifest.bgm && manifest.bgm.scenes && manifest.bgm.scenes[key]
        && typeof manifest.bgm.scenes[key].volume === "number") {
      return manifest.bgm.scenes[key].volume;
    }
    return (manifest && manifest.bgm && manifest.bgm.volume) || 0.35;
  }

  function applyVolumes() {
    if (!masterGain || !ctx) return;
    const master = audioPrefs.masterMute ? 0 : 1;
    const bgmVol = volumeForKey(bgmTrackKey || "default");
    /* Portrait clips are muted. A full duck deleted the night bed for the whole
       Vera/Sammi play. Keep the scene bed audible under the silent loop. */
    const bed = bgmVol * 0.22 * (bgmDuck ? 0.55 : 1);
    const bgmTarget = audioPrefs.bgmMute || audioPrefs.masterMute ? 0 : bed;
    masterGain.gain.setTargetAtTime(master, ctx.currentTime, 0.05);
    bgmGain.gain.setTargetAtTime(bgmTarget, ctx.currentTime, 0.08);
    sfxGain.gain.setTargetAtTime(audioPrefs.masterMute ? 0 : 0.55, ctx.currentTime, 0.05);
    if (rainGain) {
      const rainTarget = audioPrefs.masterMute || !rainWanted ? 0 : rainVolume();
      rainGain.gain.setTargetAtTime(rainTarget, ctx.currentTime, 0.12);
    }
  }

  function setBgmDuck(on) {
    bgmDuck = !!on;
    applyVolumes();
  }

  async function decodeUrl(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("audio fetch " + url);
    const arr = await res.arrayBuffer();
    return await new Promise((resolve, reject) => {
      ctx.decodeAudioData(arr.slice(0), resolve, reject);
    });
  }

  async function loadAssets() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      if (!ensure()) return false;
      try {
        const res = await fetch("./assets/audio/manifest.json");
        if (!res.ok) return false;
        manifest = await res.json();
        const ver = manifest.version != null ? String(manifest.version) : "1";
        const bust = (src) => src + (src.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(ver);
        if (manifest.bgm && manifest.bgm.src) {
          buffers.bgm = await decodeUrl(bust(manifest.bgm.src));
        }
        buffers.bgmScenes = {};
        const scenes = (manifest.bgm && manifest.bgm.scenes) || {};
        await Promise.all(Object.keys(scenes).map(async (key) => {
          const item = scenes[key];
          if (!item || !item.src) return;
          try {
            buffers.bgmScenes[key] = await decodeUrl(bust(item.src));
          } catch (err) {
            console.warn("BGM scene load failed: " + key, err);
          }
        }));
        const sfxItems = (manifest.sfx && typeof manifest.sfx === "object") ? manifest.sfx : {};
        await Promise.all(Object.keys(sfxItems).map(async (key) => {
          const item = sfxItems[key];
          if (!item || !item.src) return;
          try {
            buffers[key] = await decodeUrl(bust(item.src));
          } catch (err) {
            console.warn("SFX load failed: " + key, err);
          }
        }));
        return true;
      } catch (err) {
        console.warn("Audio assets load failed, using synth fallback", err);
        manifest = null;
        return false;
      }
    })();
    return loadPromise;
  }

  function makeNoiseBuffer(seconds) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buf;
  }

  function startBgmSynth() {
    const t = ctx.currentTime;
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = "sine";
    o1.frequency.value = 55;
    g1.gain.value = 0.35;
    o1.connect(g1);
    g1.connect(bgmGain);
    o1.start(t);

    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = "sine";
    o2.frequency.value = 82.5;
    g2.gain.value = 0.12;
    o2.connect(g2);
    g2.connect(bgmGain);
    o2.start(t);

    const o3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    o3.type = "triangle";
    o3.frequency.value = 220;
    g3.gain.value = 0.018;
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(g3.gain);
    o3.connect(g3);
    g3.connect(bgmGain);
    o3.start(t);
    lfo.start(t);

    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(4);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.Q.value = 0.6;
    const ng = ctx.createGain();
    ng.gain.value = 0.22;
    noise.connect(filter);
    filter.connect(ng);
    ng.connect(bgmGain);
    noise.start(t);

    const pulse = ctx.createOscillator();
    const pulseG = ctx.createGain();
    pulse.type = "sine";
    pulse.frequency.value = 0.04;
    pulseG.gain.value = 0.008;
    pulse.connect(pulseG);
    pulseG.connect(bgmGain.gain);
    pulse.start(t);

    bgmNodes = [o1, o2, o3, lfo, noise, pulse];
  }

  function pickBgmKey(scene, inCall) {
    if (inCall && buffers.bgmScenes && buffers.bgmScenes.call) return "call";
    /* BGM.md: 燈關 + 評核室 share the close call bed. No new files. */
    if ((scene === "dark" || scene === "review") && buffers.bgmScenes && buffers.bgmScenes.call) return "call";
    if (scene && buffers.bgmScenes && buffers.bgmScenes[scene]) return scene;
    /* No lift/roof/suite bed. Hold the line's night track instead of the procedural blip. */
    const cast = (state.story && state.story.id) || state.storyId || "";
    if (cast === "sam" && (scene === "roof" || scene === "lift") && buffers.bgmScenes && buffers.bgmScenes.pantry) return "pantry";
    if (cast === "morgan" && scene === "lift" && buffers.bgmScenes && buffers.bgmScenes.lounge) return "lounge";
    if (cast === "alex" && scene === "lift" && buffers.bgmScenes && buffers.bgmScenes.office) return "office";
    return "default";
  }

  function bufferForKey(key) {
    if (key && key !== "default" && buffers.bgmScenes && buffers.bgmScenes[key]) {
      return buffers.bgmScenes[key];
    }
    return buffers.bgm;
  }

  function loopForKey(key) {
    if (key && key !== "default" && manifest && manifest.bgm && manifest.bgm.scenes && manifest.bgm.scenes[key]) {
      return manifest.bgm.scenes[key].loop !== false;
    }
    return !!(manifest && manifest.bgm && manifest.bgm.loop !== false);
  }

  function startBgmFile() {
    const key = bgmTrackKey || "default";
    const buf = bufferForKey(key);
    if (!buf) return false;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loopForKey(key);
    src.connect(bgmGain);
    src.start(0);
    bgmSource = src;
    bgmNodes = [src];
    return true;
  }

  function startBgm() {
    if (!ensure() || bgmPlaying) return;
    if (!bgmTrackKey) bgmTrackKey = "default";
    bgmPlaying = true;
    if (bufferForKey(bgmTrackKey)) startBgmFile();
    else startBgmSynth();
  }

  function setBgmScene(scene, inCall) {
    const key = pickBgmKey(scene, !!inCall);
    if (key === bgmTrackKey && bgmPlaying) {
      applyVolumes();
      return;
    }
    if (audioPrefs.bgmMute || audioPrefs.masterMute) {
      bgmTrackKey = key;
      applyVolumes();
      return;
    }
    if (!started) {
      bgmTrackKey = key;
      return;
    }
    stopBgm();
    bgmTrackKey = key;
    startBgm();
  }

  function stopBgm() {
    bgmNodes.forEach((n) => {
      try { n.stop(); } catch (_) {}
      try { n.disconnect(); } catch (_) {}
    });
    bgmNodes = [];
    bgmSource = null;
    bgmPlaying = false;
  }

  async function unlock() {
    const c = ensure();
    if (!c) return;
    if (c.state === "suspended") {
      try { await c.resume(); } catch (_) {}
    }
    started = true;
    await loadAssets();
    applyVolumes();
    if (!audioPrefs.bgmMute && !audioPrefs.masterMute) startBgm();
    if (rainWanted) startRain();
  }

  function beep({ freq = 440, dur = 0.06, type = "sine", vol = 0.4, slide = 0 } = {}) {
    if (!started || !ensure() || audioPrefs.masterMute) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(sfxGain);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function playBuffer(buf, volScale = 1) {
    if (!started || !ensure() || audioPrefs.masterMute || !buf) return false;
    if (ctx.state === "suspended") {
      try { ctx.resume(); } catch (_) {}
    }
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buf;
    // sfxGain sits ~0.55; bump so manifest vols stay audible
    g.gain.value = Math.min(1.8, volScale * 1.35);
    src.connect(g);
    g.connect(sfxGain);
    src.start(0);
    return true;
  }

  function sfxClick() {
    const vol = (manifest && manifest.sfx && manifest.sfx.click && manifest.sfx.click.volume) || 0.55;
    if (!playBuffer(buffers.click, vol)) {
      beep({ freq: 620, dur: 0.045, type: "triangle", vol: 0.28, slide: -80 });
    }
  }

  function sfxChoice() {
    const vol = (manifest && manifest.sfx && manifest.sfx.choice && manifest.sfx.choice.volume) || 0.55;
    if (!playBuffer(buffers.choice, vol)) {
      beep({ freq: 380, dur: 0.08, type: "sine", vol: 0.32, slide: 40 });
      setTimeout(() => beep({ freq: 520, dur: 0.06, type: "triangle", vol: 0.18 }), 40);
    }
  }

  function sfxTransition() {
    const vol = (manifest && manifest.sfx && manifest.sfx.transition && manifest.sfx.transition.volume) || 0.5;
    if (!playBuffer(buffers.transition, vol)) {
      beep({ freq: 180, dur: 0.22, type: "sine", vol: 0.2, slide: 60 });
      setTimeout(() => beep({ freq: 90, dur: 0.28, type: "sine", vol: 0.12, slide: -20 }), 50);
    }
  }

  function sfxPing() {
    const play = () => {
      const vol = (manifest && manifest.sfx && manifest.sfx.ping && manifest.sfx.ping.volume) || 0.75;
      if (playBuffer(buffers.ping, vol)) return;
      beep({ freq: 980, dur: 0.12, type: "sine", vol: 0.42, slide: 160 });
      setTimeout(() => beep({ freq: 1320, dur: 0.09, type: "triangle", vol: 0.28 }), 55);
    };
    if (buffers.ping || !started) {
      play();
      return;
    }
    loadAssets().then(play).catch(() => play());
  }

  function sfxCall() {
    const play = () => {
      const vol = (manifest && manifest.sfx && manifest.sfx.call && manifest.sfx.call.volume) || 0.72;
      if (playBuffer(buffers.call, vol)) return;
      beep({ freq: 480, dur: 0.16, type: "sine", vol: 0.4, slide: 60 });
      setTimeout(() => beep({ freq: 620, dur: 0.14, type: "sine", vol: 0.32 }), 150);
      setTimeout(() => beep({ freq: 720, dur: 0.1, type: "triangle", vol: 0.22 }), 300);
    };
    if (buffers.call || !started) {
      play();
      return;
    }
    loadAssets().then(play).catch(() => play());
  }

  function refresh() {
    applyVolumes();
    if (!started) return;
    if (audioPrefs.bgmMute || audioPrefs.masterMute) {
      if (bgmPlaying) applyVolumes();
    } else if (!bgmPlaying) {
      if (!bgmTrackKey) bgmTrackKey = "default";
      startBgm();
    }
  }


  const SFX_CHAIN_MS = 200;

  function sfxVolume(key, fallback) {
    const item = manifest && manifest.sfx && manifest.sfx[key];
    return (item && typeof item.volume === "number") ? item.volume : fallback;
  }

  function playSfx(key) {
    if (!key || typeof key !== "string") return false;
    const buf = buffers[key];
    if (!buf) return false;
    return playBuffer(buf, sfxVolume(key, 0.55));
  }

  function playNodeCues(sfx) {
    const keys = Array.isArray(sfx) ? sfx : (typeof sfx === "string" && sfx ? [sfx] : []);
    keys.forEach((key, i) => {
      if (typeof key !== "string" || !key) return;
      const delay = i * SFX_CHAIN_MS;
      if (delay <= 0) playSfx(key);
      else setTimeout(() => playSfx(key), delay);
    });
  }

  function rainVolume() {
    /* Manifest rain is 0.34; scale like the night bed so rain sits under BGM. */
    return sfxVolume("rain", 0.34) * 0.18;
  }

  function ensureRainGain() {
    if (!ensure()) return null;
    if (!rainGain) {
      rainGain = ctx.createGain();
      rainGain.gain.value = 0;
      rainGain.connect(masterGain);
    }
    return rainGain;
  }

  function startRain() {
    if (!rainWanted) return;
    if (rainOn && rainSource) return;
    if (!started || !ensure()) return;
    const buf = buffers.rain;
    const g = ensureRainGain();
    if (!buf || !g) return;
    if (rainStopTimer) {
      clearTimeout(rainStopTimer);
      rainStopTimer = 0;
    }
    try {
      if (rainSource) {
        rainSource.stop();
        rainSource.disconnect();
      }
    } catch (_) {}
    rainSource = null;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(g);
    const now = ctx.currentTime;
    const target = audioPrefs.masterMute ? 0 : rainVolume();
    try {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), now);
      g.gain.linearRampToValueAtTime(Math.max(target, 0.0001), now + 0.6);
    } catch (_) {
      g.gain.value = target;
    }
    src.start(0);
    rainSource = src;
    rainOn = true;
  }

  function stopRain(fade) {
    rainWanted = false;
    if (!rainOn && !rainSource) {
      if (rainGain && ctx) {
        try {
          const now = ctx.currentTime;
          rainGain.gain.cancelScheduledValues(now);
          rainGain.gain.setTargetAtTime(0, now, 0.08);
        } catch (_) {}
      }
      return;
    }
    rainOn = false;
    if (rainStopTimer) {
      clearTimeout(rainStopTimer);
      rainStopTimer = 0;
    }
    const src = rainSource;
    rainSource = null;
    const ms = fade ? 800 : 200;
    if (ctx && rainGain) {
      try {
        const now = ctx.currentTime;
        rainGain.gain.cancelScheduledValues(now);
        rainGain.gain.setValueAtTime(Math.max(rainGain.gain.value, 0.0001), now);
        rainGain.gain.linearRampToValueAtTime(0.0001, now + ms / 1000);
      } catch (_) {}
    }
    rainStopTimer = setTimeout(() => {
      rainStopTimer = 0;
      if (src) {
        try { src.stop(); } catch (_) {}
        try { src.disconnect(); } catch (_) {}
      }
    }, ms + 80);
  }

  function setRain(on) {
    if (on) {
      rainWanted = true;
      startRain();
    } else {
      stopRain(true);
    }
  }

  return {
    unlock,
    refresh,
    loadAssets,
    sfxClick,
    sfxChoice,
    sfxTransition,
    sfxPing,
    sfxCall,
    playSfx,
    playNodeCues,
    setRain,
    setBgmDuck,
    setBgmScene,
    get started() { return started; },
  };
})();

function loadAudioPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(AUDIO_KEY) || "{}");
    if (typeof raw.masterMute === "boolean") audioPrefs.masterMute = raw.masterMute;
    if (typeof raw.bgmMute === "boolean") audioPrefs.bgmMute = raw.bgmMute;
    if (typeof raw.voiceMute === "boolean") audioPrefs.voiceMute = raw.voiceMute;
  } catch (_) {}
}

function saveAudioPrefs() {
  localStorage.setItem(AUDIO_KEY, JSON.stringify(audioPrefs));
}

function syncMuteButtons() {
  const bgm = $("#btn-mute-bgm");
  const voice = $("#btn-mute-voice");
  const master = $("#btn-mute-master");
  if (bgm) {
    bgm.setAttribute("aria-pressed", String(audioPrefs.bgmMute));
    bgm.querySelector(".icon-label").textContent = audioPrefs.bgmMute ? "♪̸" : "♪";
    bgm.title = audioPrefs.bgmMute ? "開啟背景音樂" : "關閉背景音樂";
  }
  if (voice) {
    voice.setAttribute("aria-pressed", String(audioPrefs.voiceMute));
    voice.querySelector(".icon-label").textContent = audioPrefs.voiceMute ? "靜" : "聲";
    voice.title = audioPrefs.voiceMute ? "開啟語音" : "關閉語音";
  }
  if (master) {
    master.setAttribute("aria-pressed", String(audioPrefs.masterMute));
    master.querySelector(".icon-label").textContent = audioPrefs.masterMute ? "🔇" : "🔊";
    master.title = audioPrefs.masterMute ? "取消全部靜音" : "全部靜音";
  }
}

/* ============================================================
   C) TTS — cold boss voice UX
   ============================================================ */
let voicesReady = false;
let speaking = false;

function setSpeaking(on) {
  speaking = !!on;
  document.body.classList.toggle("mode-speaking", speaking);
  const el = $("#speaking-indicator");
  if (el) {
    if (speaking) el.removeAttribute("hidden");
    else el.setAttribute("hidden", "");
    el.textContent = state.callMode ? "通話中" : "語音中";
  }
}

function waitForVoices() {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([]);
      return;
    }
    const existing = speechSynthesis.getVoices();
    if (existing && existing.length) {
      voicesReady = true;
      resolve(existing);
      return;
    }
    const done = () => {
      voicesReady = true;
      speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(speechSynthesis.getVoices() || []);
    };
    speechSynthesis.addEventListener("voiceschanged", done);
    // fallback poll
    let n = 0;
    const iv = setInterval(() => {
      const v = speechSynthesis.getVoices();
      if ((v && v.length) || n++ > 20) {
        clearInterval(iv);
        voicesReady = true;
        resolve(v || []);
      }
    }, 150);
  });
}

function pickCantoneseVoice() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const prefer = [
    (v) => /zh[-_]HK/i.test(v.lang),
    (v) => /yue|cantonese|hong\s*kong/i.test(v.name + " " + v.lang),
    (v) => /zh[-_]TW/i.test(v.lang) && /female|woman|ting|meijia|hanhan/i.test(v.name),
    (v) => /zh[-_]TW/i.test(v.lang),
    (v) => /^zh/i.test(v.lang),
  ];
  for (const test of prefer) {
    const hit = voices.find(test);
    if (hit) return hit;
  }
  return null;
}

function extractSpokenLines(text) {
  if (!text) return [];
  const lines = [];
  const re = /「([^」]+)」/g;
  let m;
  while ((m = re.exec(text))) lines.push(m[1]);
  return lines;
}

function cancelSpeech() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  setSpeaking(false);
}

function speakLines(lines, { force = false } = {}) {
  if (!window.speechSynthesis) return;
  if (!force && audioPrefs.voiceMute) return;
  if (!lines || !lines.length) return;

  cancelSpeech();
  state.lastSpokenLines = lines.slice();

  const voice = pickCantoneseVoice();
  let pending = lines.length;
  setSpeaking(true);

  lines.forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line);
    u.lang = (voice && voice.lang) || "zh-HK";
    if (voice) u.voice = voice;
    // cold, measured boss — call mode slightly slower
    u.rate = state.callMode ? 0.82 : 0.88;
    u.pitch = state.callMode ? 0.9 : 0.92;
    u.volume = audioPrefs.masterMute ? 0 : 1;
    u.onend = () => {
      pending -= 1;
      if (pending <= 0) setSpeaking(false);
    };
    u.onerror = () => {
      pending -= 1;
      if (pending <= 0) setSpeaking(false);
    };
    setTimeout(() => {
      if (!audioPrefs.voiceMute || force) speechSynthesis.speak(u);
    }, i * 40);
  });
}

function speakStoryBeats(text) {
  const lines = extractSpokenLines(text);
  state.lastSpokenLines = lines;
  if (!lines.length) {
    cancelSpeech();
    return;
  }
  speakLines(lines);
}

function speakChat(text) {
  if (audioPrefs.voiceMute || !text) return;
  speakLines([text]);
}

function replayLastVoice() {
  if (!state.lastSpokenLines.length) return;
  AudioEngine.sfxClick();
  // Respect voice mute: still allow replay when voice is on
  if (audioPrefs.voiceMute) return;
  speakLines(state.lastSpokenLines);
}

/* ============================================================
   D) Rule-based Cantonese cold-boss chat (humanized, zero LLM)
   ============================================================ */
const CHAT_MEM_N = 50; // full recent transcript for guide/memory skim (safety cap)
const CHAT_ANTIREPEAT_N = 5;
const CHAT_ANTIREPEAT_THIN_MAX = 18;
const PROACTIVE_MAX_PER_NODE = 2;
const PROACTIVE_COOLDOWN_MS = 28000;
const INCOMING_FIRST_MIN_MS = 11000;
const INCOMING_IDLE_MIN_MS = 32000;
const INCOMING_FOLLOW_MIN_MS = 12000;
const INCOMING_FOLLOW_SPAN_MS = 6000;
const CALL_EXIT_MS = 380;
const CALL_SFX_GAP_MS = 14000;
const CALL_INTENT_MS = 48000;
const CALL_INTENT_COOLDOWN_MS = 70000;
const MAX_PLAYER_FACTS = 6;

const TOPIC_KEYS = [
  { keys: ["加班", "遲", "夜班"], topic: "加班" },
  { keys: ["門", "走廊", "閘", "門禁"], topic: "門" },
  { keys: ["酒", "飲", "杯", "酒吧"], topic: "酒" },
  { keys: ["電話", "通話", "打畀", "來電"], topic: "電話" },
  { keys: ["簡報", "報告", "slide", "檔", "deadline"], topic: "簡報" },
  { keys: ["會議室", "會議"], topic: "會議" },
  { keys: ["電梯", "樓梯"], topic: "電梯" },
  { keys: ["老闆", "上司", "評估"], topic: "上司" },
];

const CHAT_REPLIES = {
  greet: {
    cold: ["嗯。有事直講。", "我仲睇緊檔。講重點。", "……你好。然後呢？", "打招呼唔減 deadline。", "嗯。企好。", "你嚟。講。", "門邊唔好寒暄太耐。", "收到『你好』。內容呢？"],
    wary: ["你嚟得啱。有嘢要匯報？", "嗯。企定先講。", "打招呼就算。內容呢？", "你好。評估表仲喺度。", "嗯。我聽得。", "短啲。", "走廊先寒暄？入嚟講。", "收到。下一步。"],
    warmer: ["……嗯。坐低講。", "你仲未走？我知。", "講啦。我聽住。", "……你好。難得你主動。", "嗯。靠近啲講。", "坐。燈唔使開太光。", "你叫一聲，我抬咗頭。", "……講。我留低就係等呢句。"],
    sharp: ["簡短。", "有事？一秒。", "唔好浪費我時間。", "講完未？", "一句。", "你好之後係重點。", "收起寒暄。", "快。"],
  },
  work: {
    cold: ["Deadline 唔會因為你喊而改。", "簡報先。情緒之後。", "你而家嘅優先次序……有啲亂。", "頁碼。版本。邊個簽。", "加班唔係表演。係結果。", "檔名改清楚。我唔猜。", "數字對齊未？", "交得出先講其他。", "我睇成果。唔睇態度戲。"],
    wary: ["交得出成績，我先同你傾其他。", "邊頁未改？講清楚。", "加班可以。錯字唔可以。", "你提工作——想過關，定想拖？", "草稿放低。我掃。", "優先次序你自己排。", "會議前十分鐘交。", "評估睇呢頁。"],
    warmer: ["……你肯做，我睇到。交得出嚟再傾。", "檔案放低。我睇完回你。", "夜深仲改？……至少認真。", "你改得認真，我肯多睇一輪。", "……呢頁進步。下一頁呢？", "交完，走廊可以短談。", "我等你呢版。唔好令我等空。"],
    sharp: ["唔好同我講忙。交。", "再拖，評估你自己知。", "一句：邊時交。", "而家。", "唔好繞。", "檔。", "deadline 唔商量。", "少講。多交。"],
  },
  sorry: {
    cold: ["道歉好平。改到先算數。", "我唔收『下次』。我收結果。", "……知錯就好。坐返去改。", "對唔住換唔到時間。", "錯咗就補。唔好拖聲。", "我聽到。檔未聽到。", "道歉之後係行動。", "記低。下次唔再聽同一句。"],
    wary: ["對唔住之後係行動。唔係眼神。", "收到。唔好再犯同一條。", "道歉我聽到。檔呢？", "知錯？證明。", "再犯，評估自己睇。", "唔好用眼神求情。", "收到。坐返去。", "今次記低。"],
    warmer: ["……得。今次我記低。", "知就好。唔使跪低——改就得。", "哼。下次用成績補償。", "……道歉我收。人留低更緊要。", "得。抬起頭。改。", "今次過。下次用結果。", "……唔使再講第三句對唔住。"],
    sharp: ["對唔住換唔到 deadline。", "少講。快改。", "我唔想再聽第二句。", "夠。", "改。", "收聲。做事。", "唔好再道歉表演。", "快。"],
  },
  flirt: {
    cold: [
      "而家唔好再行近，我要你同我保持距離。",
      "呢度有人聽得見，你收聲，唔好再講呢句。",
      "我聽到你鐘意我，但而家未到行近嘅時候。",
      "監控仲亮住，你大膽嘅句我唔收。",
      "你越界之前先停，而家退返半步。",
      "鐘意可以講，但而家你企喺度唔好再近。",
      "語氣收一收，呢句而家唔適合講。",
      "你想試探先停低，而家呢度唔係講呢句嘅地方。",
    ],
    wary: ["大膽。我未必介意——但你要承擔。", "呢度有人聽得見，你收聲，再講我先當你認真。", "你試探得太明顯。", "靠近可以。越界另計。", "你講完，我反而想聽你點收科。", "酒後先講？定清醒？", "危險答案。我記下。", "距離縮一寸——你負責。"],
    warmer: ["……哼。你以為我會慌？", "靠近可以。越界另計。", "你講完未？定想我回你一句更危險。", "……你敢講，我反而想聽第二句。", "危險。繼續——細聲。", "你望住我講呢句。記住後果。", "……有趣。你仲企喺度。", "再近一點。然後停。", "我回你。再近半寸。細聲。", "哼。你撩得準。我唔裝聽唔到。", "危險嘅暖。我留你多一刻。"],
    sharp: ["你而家收起呢句。", "唔好玩火——除非你準備好燒。", "一句過界，評估你自己睇。", "夠。", "收聲。", "走廊見——如果你仲敢。", "唔好玩。", "你而家退返半步，同我保持距離。"],
  },
  tired: {
    cold: ["夜深。你仲未走？", "累就飲水。唔好攤喺度。", "我都未走。你有理由留？", "攰唔係通行證。", "門禁時間你自己知。", "眼瞓就錯字。醒定。", "夜班唔減標準。", "你留低，就要醒。"],
    wary: ["攰就講。唔好硬撐到錯字。", "門禁時間你自己知。", "休息五分鐘。之後繼續。", "困？飲水。再講重點。", "你提攰——想走，定想我靠？", "夜深。決定快啲。", "休息。之後交。", "唔好用疲倦扮柔。"],
    warmer: ["……攰就企近啲燈。唔好瞓枱。", "你留低，我當你有事。", "夜深。我都喺度。", "……困就靠一下椅背。一下。", "你攰，我睇到。唔好淨係表演。", "夜深仲喺度。至少你認真。", "……飲水。我等你醒返半句。"],
    sharp: ["攰就走。唔好阻住。", "唔好用疲倦當藉口。", "醒定。再錯我唔收。", "走。定醒。", "少喊累。", "交完先瞓。", "夠。"],
  },
  praise: {
    cold: ["……偶爾準一次，唔代表你叻。", "收到。繼續維持呢個水準。", "嗯。終於似樣。", "讚美貶值好快。", "準一次。下一手呢？", "收到。唔好飄。", "少見。我接受呢個價。", "嗯。繼續證明。"],
    wary: ["讚得太密會貶值。適可而止。", "今次啱。下次證明唔係運氣。", "收到。", "你讚我？次序有啲怪。", "讚完交貨。", "適可而止。", "今次算。", "繼續。"],
    warmer: ["……今次我承認你做得好。", "少見。我接受呢個價。", "嗯。繼續——我想睇你下一手。", "……讚得準，我聽。", "你肯講呢句，難得。", "嗯。呢個水準我想再睇。", "……收。然後望我。"],
    sharp: ["讚美換唔到寬限。", "得。下一件。", "少講好聽話。交貨。", "夠。", "下一頁。", "少恭維。", "交。"],
  },
  challenge: {
    cold: ["你頂嘴之前，先睇清楚邊個簽你評估。", "哦。你教我？", "好。你想清楚——定係想我幫你清楚。", "頂嘴可以。證據呢？", "對峙？得。講完我再判。", "你有膽。記住代價。", "職位喺門牌。自己睇。", "評估表喺我手。"],
    wary: ["頂嘴可以。證據呢？", "你有膽。記住代價。", "對峙？得。講完我再判。", "你不服——用結果。", "講完。我聽完再判。", "大膽。走廊有耳。", "你想贏一句，定贏局？", "證據放低。"],
    warmer: ["……你敢講，我反而想聽完。", "頂嘴之後，你仲企喺度。有趣。", "好。你贏一句——唔代表你贏局。", "……對峙令夜更深。繼續。", "你頂完，我反而想靠近聽。", "有趣。你未走。", "……講。我收得起。"],
    sharp: ["夠。收聲。", "你再講一句，走廊見。", "評估表喺我手。記住。", "收聲。", "夠膽再講？", "停。", "記住邊個簽。"],
  },
  help: {
    cold: ["講邊頁。我唔猜。", "自己諗五分鐘。諗唔到再問。", "我可以教。代價你自己知。", "問之前講你試過咩。", "草稿先。", "我唔做保姆。", "卡住邊行？一句。", "教一次。你跟。"],
    wary: ["問之前，先講你試過咩。", "要教可以。跟足我節奏。", "唔好裝傻。邊度卡住？", "教得。你要聽。", "指一次。你抄。", "邊頁？", "自己先畫框。", "跟我指。"],
    warmer: ["……靠近。我指一次。", "得。我講慢啲——你聽住。", "你問得啱。難得。", "……你肯問，我教。", "坐近。螢幕共用。", "呢步我劃。你睇住。", "問得好。繼續。"],
    sharp: ["自己睇。", "再問之前交草稿。", "我唔做保姆。", "自己。", "草稿。", "唔餵答案。", "快諗。"],
  },
  bye: {
    cold: ["走之前存檔。", "早啲返屋企。聽朝我仲喺度。", "……晚安。唔好遲。", "走得就走。", "門關好。", "聽朝準時。", "存完先走。", "晚安。檔留低。"],
    wary: ["走得就走。唔好依依不捨。", "門關好。", "聽朝見。準時。", "拜拜之後仲有評估。", "走之前對一眼螢幕。", "門。", "晚安。唔好淨係望電話。", "聽朝見。"],
    warmer: ["……走啦。我會喺度。", "晚安。唔好淨係望電話。", "你走之前——望我一眼。", "……晚安。走廊燈我留。", "走啦。返得嚟。", "……你講拜拜，我記住。", "早啲瞓。聽朝見。"],
    sharp: ["走。", "唔使拖。", "門。", "快。", "走。唔回頭。", "門關。", "夠。"],
  },
  leave: {
    cold: ["想走？走廊燈亮住。", "門禁唔等人。決定。", "走之前，檔放低。", "門把你自己轉。", "走可以。後悔自己吞。", "走廊你自己行。", "想閃？先講清楚。", "離開當棄權——你知。"],
    wary: ["你企喺門口做咩？進定退。", "走可以。後悔自己吞。", "門把你自己轉。", "想走就走。唔好晃。", "門口唔係舞台。", "決定。三秒。", "走之前望我一眼——定唔望。", "門開住。"],
    warmer: ["……真走？我唔挽留——但我記得。", "門開住。你返得嚟。", "走啦。我會睇住螢幕。", "……你要走，我唔攔。但我記。", "走廊長。你慢慢行。", "走之前——檔放低就得。", "……門後我會聽腳步。"],
    sharp: ["走就走。唔好回頭。", "門。快。", "離開就當你棄權。", "走。", "快閃。", "唔挽留。", "棄權自己認。"],
  },
  silence: {
    cold: [
      "你打省略號，我當你未講完，你講清楚。",
      "你唔出聲，我等你一句實在嘅。",
      "空白唔係答案，你而家講你想點。",
      "你仲喺度就出聲，唔好淨係打點。",
      "我見到你停咗，你繼續講落去。",
      "省略號我唔當你答完，你補一句。",
    ],
    wary: ["……你仲喺度？回我。", "唔好裝死。", "沉默唔係答案。", "打省略號？怕講錯？", "回。定走。", "安靜太耐，我當你閃。", "……講半句都得。", "唔好用沉默試探。", "回我一眼。"],
    warmer: ["……我等得。但唔會等成晚。", "打省略號？你怕講錯？", "……哼。至少你仲望住我。", "……靜得啱。再靜就冷。", "我等。你喘勻氣再講。", "……空白我當你靠近緊。", "唔使完美。講。", "……我聽到你未打字。"],
    sharp: ["回。", "唔好浪費氣。", "一句。而家。", "回。立刻。", "唔好空白。", "講。", "夠靜。"],
  },
  name: {
    cold: ["Vera。你應已知。", "名唔緊要。職位你清楚。", "叫我 Vera。唔好裝熟。", "Vera。再問當你冇聽過。", "名牌喺門。自己睇。", "叫得出口，就要承擔距離。", "Vera。一句夠。", "職位：你上司。名：Vera。"],
    wary: ["Vera。再問當你冇聽過。", "你知我係邊個。", "名牌喺門。自己睇。", "叫 Vera。唔好玩花名。", "名唔係暱稱遊戲。", "你問名——想近，定想查？", "Vera。記住音。", "夠未？"],
    warmer: ["……Vera。你想聽多一次？", "叫得出口，就要承擔距離。", "Vera。記住呢個音。", "……叫我 Vera。今晚先。", "名你識叫。下一步呢？", "……Vera。你嗓音低啲叫。", "叫完，望我。"],
    sharp: ["Vera。夠未？", "唔好玩名。", "一句：Vera。", "Vera。", "停問。", "名牌自己睇。", "夠。"],
  },
  memory: {
    cold: ["……我記得。唔好當我善忘。", "你以為我會刪低？", "你而家先問？我一路記住。", "記得。你先唔好裝忘。", "記憶呢度我比你長。", "我記得每一條。", "問之前，對照你做過咩。", "刪低？冇可能。"],
    wary: ["記得。你先唔好裝忘。", "記憶呢度我比你長。", "問之前，先對照你自己做過咩。", "你問記得——想我提，定怕我提？", "記得。所以你更要小心。", "我留底。你知。", "今晚啲事，我喺度。", "對照。"],
    warmer: ["……我記得。你講過嗰句，我留住。", "記得。所以你先唔好當冇事。", "你問『記唔記得』——答案係：記得。", "……記得。靠近問都得。", "我留住。你唔使重複怕我忘。", "……記得。所以你先唔好走。", "答案係記得。下一步你講。"],
    sharp: ["記得。所以你更冇藉口。", "我記得每一條。", "唔好再問。我知。", "記得。", "唔好裝忘。", "我知。", "夠。"],
  },
  emoji: {
    cold: ["用字。唔好淨係表情。", "……收到。然後呢？", "表情換唔到答案。", "emoji 之後係重點。", "我唔讀心。", "符號唔係匯報。", "字。", "表情我見到。內容呢？", "唔好淨係貼圖。"],
    wary: ["可愛？唔夠。講內容。", "emoji 之後係重點。", "我唔讀心。", "符號之後講人話。", "你發表情——想鬆，定想避？", "收到。下一句用字。", "表情唔減張力。", "講。"],
    warmer: ["……哼。至少你仲有力氣發呢啲。", "表情我見到。人呢？", "……得。再講多一句人話。", "……可愛。但要字。", "表情收低。望我講。", "……我回你一個字：嗯。", "再來一句人話。"],
    sharp: ["收起。", "字。", "唔好玩。", "字。而家。", "收表情。", "講。", "夠。"],
  },
  smalltalk: {
    cold: ["閒聊留聽日。", "無關痛癢，走廊講。", "我唔傾天氣式寒暄。", "重點呢？", "閒話換唔到檔。", "你想拖時間？", "簡短。定有事。", "呢句同工作無關。"],
    wary: ["你轉話題——想避？", "閒聊可以。三十秒。", "講完閒話，檔呢？", "小談之後係重點。", "你係咪試探氣氛？", "得。下一句要有用。", "唔好繞太遠。", "回到門／檔。"],
    warmer: ["……閒一句可以。第二句要實。", "你想輕鬆？得。輕完講正事。", "……哼。偶爾聽你廢講。", "小談。然後望我。", "……得。我聽半句。", "你緩和氣氛，我睇到。", "講完呢句，返主題。"],
    sharp: ["收起閒話。", "重點。", "唔好繞。", "正事。", "停。", "一句有用嘅。", "夠。"],
  },
  nickname: {
    cold: ["叫 Vera。唔好自作花名。", "暱稱呢度唔通行。", "名牌寫住 Vera。", "唔好裝熟。", "叫錯名，評估照寫。", "花名留俾你朋友。", "Vera。一句。", "職位唔係暱稱遊戲。"],
    wary: ["你改口——想近？", "叫 Vera。夠。", "花名我未必收。", "試探用暱稱？大膽。", "叫得啱先傾其他。", "唔好再玩名。", "Vera。記住。", "改口要承擔。"],
    warmer: ["……你想叫得親密啲？先證明你跟得上。", "罕有。我暫收——今晚。", "……叫得出口，就要近得起。", "花名？你膽大。", "……得。一次。唔好公開。", "你嗓音低啲叫。", "……嗯。暫借你呢個叫法。"],
    sharp: ["Vera。", "收起花名。", "叫錯再講？", "停。", "名牌。", "夠。", "唔好玩。"],
  },
  nsfw_probe: {
    cold: ["而家唔好越界，你同我保持距離。", "會議室燈光下唔講呢啲。", "你試探身體？先睇評估。", "監控仲亮住，你收起呢句。", "色情換唔到寬限。", "你而家退返半步，同我保持距離。", "呢句我當越界。", "講工作。"],
    wary: ["大膽。代價你知未？", "呢度有人聽得見，你收聲，唔好再講呢句。", "試探可以。越界另計。", "你想聽危險答案？走廊有人聽得見。", "收低聲。再講一次——清醒未？", "我記下呢句。", "靠近唔等於許可。", "停喺口。"],
    warmer: ["……你敢。我反而想睇你點收科。", "危險。細聲。", "……哼。你以為我會慌？", "越界之前，先望我眼。", "……有趣。你仲未走。", "再近——然後停。", "你講完，我未必放你走。", "我回你。再近半寸。細聲。", "哼。你撩得準。我唔裝聽唔到。"],
    sharp: ["收起。而家。", "夠。", "走廊——如果你仲敢。", "停。", "唔好玩火。", "評估你自己睇。", "收聲。"],
  },
  ai_ask: {
    cold: [
      "我係你上司 Vera，真人企喺你面前，唔好問我係唔係 AI。",
      "我喺度，你睇到我，唔好再問我係唔係 AI。",
      "你問我係唔係 AI，我係你上司，你講正事。",
      "我唔係程式，我係 Vera，你有事就講。",
      "問我係 AI 浪費時間，你講你而家要做嘅事。",
      "門牌寫住我個名，我係真人，你唔好再問。",
    ],
    wary: ["你問呢句——想試我？", "我係 Vera。你知。", "唔好用怪問題躲工作。", "真人答你。重點呢？", "你懷疑我？大膽。", "門後係我。", "問完未？", "講正事。"],
    warmer: ["……我喺你對面。夠真未？", "你怕我係空殼？望住我。", "……哼。我喘得到氣。你呢？", "真人。夜深。你仲問？", "……我手暖。你信未？", "問呢啲，反而似你緊張。", "我喺度。繼續。"],
    sharp: ["夠。", "我係你上司。", "停問。", "正事。", "唔好傻。", "下一句。", "收聲。"],
  },
  weather: {
    cold: ["天氣唔改 deadline。", "窗外點都一樣——交檔。", "落雨？帶遮。然後改頁。", "熱唔熱唔關事。", "氣象台唔簽你評估。", "講完天氣，檔呢？", "窗外我睇過。", "無關。"],
    wary: ["你提天氣——想鬆？", "雨夜適合加班。", "天氣閒聊三十秒。", "吹完風講重點。", "窗外冷。你定力呢？", "得。下一句。", "天氣之後係門。", "返主題。"],
    warmer: ["……雨聲剛好。你仲講天氣？", "窗外冷。你挨近啲。", "……天氣差，人未必要差。", "雨夜你仲喺度。我知。", "……哼。偶聽你講風。", "風大。門關好。", "講完，望我。"],
    sharp: ["唔關天氣事。", "檔。", "停。", "正事。", "窗外自己睇。", "夠。", "交。"],
  },
  food: {
    cold: ["餓就食。唔好攤講。", "外賣解決。之後改頁。", "我唔係你飯伴。", "空肚易錯字。食完返嚟。", "飲食唔減標準。", "講完未？檔呢？", "茶水間自己去。", "唔好用肚餓拖。"],
    wary: ["你提食——想休息？", "食五分鐘。回來交。", "咖啡可以。閒聊唔得太長。", "空肚頂嘴會慘。", "得。食完講重點。", "茶水間。快。", "餓唔係藉口。", "返嚟。"],
    warmer: ["……餓？走廊有燈。去食兩口。", "你提食，我反而想你留低。", "……咖啡我可以留一杯。", "食完返嚟。我喺度。", "……哼。至少你仲識照顧自己。", "夜深唔好空肚硬撐。", "食。然後望我。"],
    sharp: ["食完返。", "少講肚。", "快。", "茶水間。", "唔好拖。", "交完先食。", "夠。"],
  },
  other_woman: {
    cold: ["問其他人？同你評估無關。", "我唔八卦同事私生活。", "聚焦你自己。", "比較遊戲我唔玩。", "佢係邊個——關你今晚事？", "收起。", "講你檔。", "無關痛癢。"],
    wary: ["你提別人——想激我？", "比較？大膽。", "同事歸同事。你歸你。", "八卦留茶水間。", "你試探妒意？記下。", "講完未？", "返你自己。", "聚焦。"],
    warmer: ["……你提別人，反而似望住我。", "比較？你想聽我點答？", "……哼。你膽大。", "今晚你對面係我。記住。", "別人歸別人。你靠近邊個？", "……妒意呢啲詞，你要承擔。", "望我。唔好望別人。"],
    sharp: ["夠。", "唔好提。", "聚焦你。", "停。", "無關。", "講檔。", "收聲。"],
  },
  money: {
    cold: ["薪酬日頭傾。今晚唔談。", "錢唔改你今晚表現。", "獎金睇結果。", "我唔即場議價。", "數字朝早再講。", "講完錢，檔呢？", "評估先。錢後。", "無關今晚門。"],
    wary: ["你提錢——想談價？", "今晚唔簽薪。", "結果先。錢後。", "大膽。董事會條款日頭講。", "得。記低。朝早。", "錢換唔到寬限。", "返工作。", "數字另約。"],
    warmer: ["……你提錢，我反而想問你想留幾耐。", "薪酬之外，你仲想要咩？", "……錢可以等。人唔好裝忙。", "今晚唔談薪——談你。", "……哼。你現實。", "朝早再談數。而家望我。", "錢之後，你仲喺度？"],
    sharp: ["唔談薪。", "今晚唔議價。", "停。", "結果。", "朝早。", "夠。", "檔。"],
  },
  family: {
    cold: ["家事留私人時間。", "我唔做家庭輔導。", "今晚職場。", "家唔入評估——除非影響交貨。", "收起。", "講工作。", "無關門後。", "簡短——然後檔。"],
    wary: ["你提家——想軟化我？", "私人可以。三十秒。", "家事之後係 deadline。", "我聽得。唔保證 sympathize。", "得。下一句正事。", "唔好用家當擋箭。", "返主題。", "簡短。"],
    warmer: ["……家？難得你講。我聽一句。", "私人一句可以。第二句要實。", "……你有牽掛。我睇到。", "講完，返夜深呢度。", "……哼。偶聽你柔。", "家歸家。你而家喺我門前。", "一句。我記。"],
    sharp: ["私人夠。", "正事。", "停。", "檔。", "唔好拖。", "夠。", "工作。"],
  },
  game: {
    cold: ["遊戲留聽日。", "我唔陪玩。", "職場唔係遊樂場。", "玩完交檔。", "無關。", "收起。", "deadline 唔係關卡。", "講正事。"],
    wary: ["你想玩規則？我定。", "遊戲可以。賭注你知未？", "玩完講重點。", "你試探？記下。", "得。下一句。", "唔好當我陪玩。", "返主題。", "簡短。"],
    warmer: ["……你想玩？規則我寫。", "賭注要對等。", "……哼。偶爾奉陪一回合。", "玩完，望我。", "你膽大。繼續——細聲。", "遊戲之後係真。", "一回合。然後正事。"],
    sharp: ["唔玩。", "停。", "正事。", "夠。", "收起。", "檔。", "快。"],
  },
  english: {
    cold: ["廣東話得。英文簡短。", "I heard. 重點呢？", "英文唔加分。內容先。", "Speak briefly.", "翻譯完，檔呢？", "唔好用外語躲。", "一句。本地講。", "收到。然後呢？"],
    wary: ["英文？想專業感？", "得。簡短。", "中英都好。重點。", "你切語言——想距離？", "OK. Next.", "講清楚。", "返粵語都得。", "內容。"],
    warmer: ["……英文我聽得。你想近啲就用粵。", "Hmm. 繼續。", "……你講 English，我回你一半。", "語言唔隔夜。", "……得。用你舒服嗰種。", "講。我跟。", "中英都得。望我。"],
    sharp: ["Brief.", "重點。", "停繞。", "一句。", "粵語。", "夠。", "快。"],
  },
  repeat: {
    cold: ["你重複緊。", "講過。下一句。", "我聽到第一次。", "唔好迴圈。", "新資訊呢？", "重複換唔到新答。", "換句。", "前進。"],
    wary: ["又係呢句？", "你卡住？", "重複——想確認，定想煩？", "講新嘅。", "我記低第一次。", "唔好迴圈試探。", "下一題。", "換角度。"],
    warmer: ["……你怕我漏听？我無。", "重複一次我收。第二次要新。", "……哼。你緊張先重複。", "得。我記住。前進。", "……同一句，你嗓音抖？", "換半句都得。", "我喺度。唔使複讀。"],
    sharp: ["夠。", "唔好重複。", "下一句。", "停迴圈。", "新。", "快。", "夠聽。"],
  },
  insult: {
    cold: ["冒犯記低。", "你罵完，評估照寫。", "語氣收。", "我唔同你對罵。", "職位喺度。記住。", "罵人換唔到寬限。", "收聲。做事。", "記下呢句。"],
    wary: ["你罵——想對峙？", "大膽。代價。", "罵完證據呢？", "語氣過界。", "我聽完再判。", "走廊有耳。", "收低。", "再講？"],
    warmer: ["……你敢罵，我反而醒。", "罵完你仲企喺度。有趣。", "……哼。火氣我收得起。", "對峙可以。越界另計。", "你嗓音利。繼續——承擔。", "……罵完望我。", "有趣。你未走。"],
    sharp: ["夠。", "收聲。", "再罵走廊見。", "停。", "評估你自己睇。", "閉嘴。", "記住。"],
  },
  date_hug: {
    cold: ["約會？唔喺今晚議程。", "你想攬，但而家未得，你同我保持距離。", "私人邀約日頭再談。", "身體接觸要許可。你未有。", "收起。", "職場先。", "門牌唔係約會 App。", "唔好越界。"],
    wary: ["你約我？大膽。", "攬之前先講清楚代價。", "約會可以——唔喺監控下。", "試探親密？記下。", "走廊。細聲。", "許可未發。", "停喺口。", "再講一次清醒版。"],
    warmer: ["……約會？你想清楚未？", "攬可以。越界另計。", "……哼。你靠近得太直。", "今晚先將門後處理完。", "……短擁？你負責後果。", "你敢約。我敢記。", "……靠近。然後停。", "我回你。再近半寸。然後停。", "危險嘅暖。我留你多一刻。"],
    sharp: ["唔約。", "距離。", "收起。", "停。", "許可未有。", "夠。", "退。"],
  },
  gossip: {
    cold: ["我唔聽八卦。", "同事私事先放低。", "聚焦檔。", "流言換唔到分數。", "收起。", "講你自己。", "無關。", "茶水間話題留返。"],
    wary: ["你傳閒話——想站邊？", "八卦危險。", "講完未？檔呢？", "我唔站隊傳謠。", "你試探立場？記下。", "收低。", "返工作。", "簡短——然後停。"],
    warmer: ["……八卦？難得你想近我耳邊。", "細聲。我聽一句。", "……哼。你膽大。", "講完，望我——唔好望別人。", "閒話之後係真。", "……偶聽。唔保證接。", "一句。然後正事。"],
    sharp: ["停八卦。", "檔。", "夠。", "唔聽。", "收聲。", "正事。", "快。"],
  },
  default: {
    cold: ["講清楚啲。", "我聽到。然後呢？", "……哼。", "無關痛癢嘅講嘢，留返聽日。", "重點呢？", "一句有用嘅。", "我唔猜。", "再短啲。"],
    wary: ["你想我點答？", "再講一次。簡短。", "重點呢？", "我唔猜。", "你繞遠。", "定錨。講。", "下一句要實。", "返主題。"],
    warmer: ["……繼續。我聽住。", "講完未？定仲有半句。", "你望住我講。", "嗯。我喺度。", "……講落去。", "我收得起含糊——暫時。", "望我。再講。", "嗯。"],
    sharp: ["一句。", "唔好繞。", "講完未？", "下一個。", "快。", "清楚。", "停繞。", "講。"],
  },
};

const CAST_VOICE = {
  alex: {
    name: "Vera",
    toast: "Vera 傳咗訊息",
    greeting: "你有事就講清楚。",
    greetings: [
      "你有事就講清楚。",
      "你入到嚟，唔好企喺度寒暄。",
      "我睇到你上線，你講你今晚要做咩。",
      "你叫我一聲就夠，重點你而家講。",
      "門邊唔好拖，你有事就直講。",
    ],
    incoming: [
      "你仲喺度就出聲，唔好裝冇見到。",
      "簡報改到邊，你回我一句。",
      "唔好裝忙，我睇到你仲喺線上。",
      "你抬頭望我，然後打字回我。",
      "我記得今晚啲事，你記得幾多。",
      "走廊燈仲亮，你企喺邊，回我。",
      "電話震完你都唔回，你而家回一句。",
      "你靜咗一陣，我未走，你講一句。",
      "唔好淨係望住我，你打字回我。",
      "我數到你未回我，你而家回一句。",
      "檔放低一秒，你回我先。",
    ],
    firstPing: [
      "你入到嚟未，回我一句。",
      "我見到你上線，唔好裝睇檔。",
      "你喺走廊定辦公室，講清楚。",
      "今晚你喺邊，回我。",
    ],
    replies: null,
    rules: null,
  },
  morgan: {
    name: "Elise",
    toast: "Elise 傳咗訊息",
    greeting: "夜晚先傾人。你想講邊條？",
    greetings: [
      "夜晚先傾人。你想講邊條？",
      "你到咗，杯我留低咗，你坐低先講。",
      "你上線我見到，唔好淨係望住杯。",
      "夜未完，你想談條款定談你自己？",
      "我留咗位，你入到嚟就出聲。",
    ],
    incoming: [
      "你仲未回我，杯凍咗都得，你講一句。",
      "聽日先開董事會，而家你回我你想點。",
      "房卡仲喺枱面，你唔好裝睇唔到。",
      "數字我朝早先發你，除非你今晚另有答覆。",
      "你靜咗一陣，酒會涼，你仲喺唔喺度。",
      "你唔好淨係望住杯，你回我一句。",
      "你企喺窗邊定吧台，你講清楚。",
      "我數到你未回我，你而家回一句。",
      "合約可以等到朝早，你今晚嘅句唔好欠。",
      "你入到酒廊就出聲，唔好企喺門邊。",
    ],
    firstPing: [
      "你到酒廊未，到咗就回我一句。",
      "杯我幫你留低，你而家喺邊。",
      "夜未完，你回我一句就得。",
      "我留咗位，你上線我就見到。",
      "你唔好裝睇窗，你講你想坐邊。",
      "酒廊燈未關，你入到嚟就出聲。",
    ],
    replies: null,
    rules: null,
  },
  sam: {
    name: "Sammi",
    toast: "Sammi 傳咗訊息",
    greeting: "杯麵未涼。你有事就講。",
    greetings: [
      "杯麵未涼。你有事就講。",
      "你嚟得啱，老闆唔喺度，你坐低先講。",
      "我留低唔係勤力，你有事就出聲。",
      "燈我未關，你上線我就見到。",
      "你唔使排隊，你講你卡住邊頁。",
    ],
    incoming: [
      "你仲未走，你而家回我一句。",
      "影印機卡紙，你要幫手就講。",
      "你空肚易簽錯字，你食完再回我。",
      "天台風涼，你講你而家喺邊。",
      "我留低唔係勤力，你唔好裝冇見到。",
      "茶水間燈仲亮，你返唔返你講一聲。",
      "你靜咗一陣，燈我未關，你出聲。",
      "影印機停咗，你呢，你回我一句。",
      "你唔好淨係睇手機，你打字回我。",
      "我喺度等你，你講你喺邊。",
    ],
    firstPing: [
      "你喺茶水間定走廊，你講一聲。",
      "杯麵仲熱，你要分就出聲。",
      "你上線我見到，你唔使扮忙。",
      "燈仲亮，你回我一句就得。",
      "門禁未到點，你有事就而家講。",
      "我喺茶水間，你入到嚟就出聲。",
    ],
    replies: null,
    rules: null,
  },
};

// Per-cast reply overrides (Morgan / Sam keep distinct tones; structure matches CHAT_REPLIES)
CAST_VOICE.morgan.replies = {
  greet: {
    cold: ["你入到嚟就坐低，有事你直講。", "夜晚先到傾嘅時候，你唔好客套。", "杯我留低咗，你坐低再講你想點。", "你上線我見到，唔好裝睇窗外。", "你叫一聲就夠，內容你而家交俾我。", "門你關好先講，我只聽一句實在嘅。", "你唔使寒暄，你講你今晚嚟做咩。"],
    wary: ["你坐低先，靠近之前你講重點。", "夜晚先傾人，你唔好繞去第二處。", "你打招呼我收到，下一句要有內容。", "你想近我，先講你求緊咩。", "杯未動過，你嘅句先講完。", "你企定我先聽，唔好左右望。", "你一句起頭，我先決定答唔答你。"],
    warmer: ["你返嚟得啱，杯仲暖，你坐近少少。", "你肯出聲，我留低就係等你呢句。", "你坐近啲，我先聽得清你講咩。", "你叫我一聲，我先肯抬頭望你。", "你今晚肯嚟，我當你有句真心話。", "你望住我，然後講你想我點。", "你入座先，我先同你慢慢傾。"],
    sharp: ["你而家揀，談條款定談你自己。", "你收起寒暄，我只聽一句重點。", "你快啲講，酒會涼我就收你呢杯。", "你唔好繞圈，我聽一句就夠。", "你而家講，定你想我收咗呢杯。", "你簡短啲，我今晚時間唔多。", "你未講完就而家講完佢。"],
  },
  work: {
    cold: ["數字日頭先覆，而家我唔同你覆盤。", "單可以遲一日，人唔可以裝忙。", "條款我朝早先發，今晚我唔落筆。", "你提工作，你想過關定想拖時間。", "合約留到日頭，你而家只講人。", "你口講交得出，我要見到結果。", "董事會聽朝先算數，今晚你唔好覆盤。"],
    wary: ["工作你留到日頭，今晚你同我傾人。", "數字我朝早發你，你而家講真心。", "合約可以等，你唔可以裝睇手機。", "你想改條款，你先講你改邊項。", "你提工作，我當你想拖開話題。", "你講你想我改邊一條先。", "你日頭先簽，今晚我唔會落筆。"],
    warmer: ["你提工作，我反而想知你想留幾耐。", "條款朝早先算，而家你望住我講。", "數字之外，你仲有句答覆未講。", "你肯談正事，我肯再聽你多一句。", "你講完工作，你再講你自己想點。", "你留低談，我當你係認真嘅。", "你想簽就聽朝簽，而家你坐住。"],
    sharp: ["今晚我唔簽，你收起工作先。", "數字我自己處理，你唔好攞嚟躲。", "你唔好用工作避開我嘅問題。", "你而家講人，唔好再講張單。", "你再拖，聽朝條款我照樣發。", "你只准一句，你想留定想走。", "你講完工作，我當你冇答我。"],
  },
  sorry: {
    cold: ["你道歉好平，我要你嘅決定。", "我唔收誤會兩個字，我收你揀邊條。", "你知錯就好，你再講你點補。", "你對唔住換唔到時間，你講行動。", "你道歉我聽到，決定我未聽到。", "你錯咗就補，唔好拖長聲。", "你再講同一句對唔住，我唔收。"],
    wary: ["你對唔住之後要揀，你而家揀。", "我收到你道歉，你唔好再用誤會。", "你話知錯，你證明俾我睇。", "你道歉完，你講你而家想點。", "你再犯同一條，我當你冇聽。", "你唔好用眼神求我，你講句實。", "你今次我記低，下次你唔好再講。"],
    warmer: ["你今次我收，你唔使再低頭。", "你道歉我聽到，你人留低更緊要。", "你再斟一杯，我當呢句過咗。", "你抬起頭，你講你點補返。", "你唔使講第三句對唔住，我聽到。", "你肯認，我肯再聽你一句。", "你留低，我當你認真補。"],
    sharp: ["你對唔住換唔到決定，你快揀。", "你少講，你而家講你揀邊條。", "我唔想再聽第二句道歉，你停。", "你收聲，你做你應承嗰步。", "你唔好再表演對唔住，我睇到。", "你夠喇，你講下一句有用嘅。", "你快啲補，口講我唔再聽。"],
  },
  flirt: {
    cold: ["而家你退半步，同我保持距離。", "你收聲，呢句而家我唔收。", "你收起呢句，我要你保持距離。", "監控仲亮，你大膽嘅句我唔收。", "界線喺度，你唔好再行近。", "你越界之前先停，而家退返。", "你想試探先停低，而家未得。"],
    wary: ["你試探得太直，你先講清楚代價。", "你清醒未，你再講一次認真嘅。", "你可以靠近，越界我另計。", "你講完呢句，你要自己承擔。", "你想縮短距離，你先問我准未。", "你再近一寸，後果你自己負。", "你呢句我記下，你唔好裝冇講。"],
    warmer: ["你講完，我反而想聽你第二句。", "你敢講，我唔裝聽唔到。", "你可以再近少少，然後你停。", "你望住我講，我先當你認真。", "你細聲啲，我先聽你下一句。", "你留喺度，我先唔收你呢杯。", "你講得準，我留你多一刻。"],
    sharp: ["你而家收起呢句，同我保持距離。", "你唔好玩火，除非你準備承擔。", "你退返半步，而家唔好再近。", "你收聲，呢句過咗界線。", "你再講，我當你想燒自己。", "你停低，而家我要距離。", "你夠喇，你退返你原來嗰步。"],
  },
  tired: {
    cold: ["夜深咗，你仲未走，你講原因。", "你攰就飲水，唔好攤喺度。", "董事會聽朝先開，你而家要醒。", "你話攰，我唔當你有通行證。", "你眼瞓就會講錯價，你醒定。", "你留低就要醒，唔好扮軟。", "你攰可以講，你唔好用佢嚟拖。"],
    wary: ["你攰就直講，唔好硬撐到講錯價。", "你休息一陣，條款朝早仲喺度。", "你話困，你飲啖水再講重點。", "你提攰，你想走定想我靠。", "夜深咗，你決定快啲。", "你休息完先交答覆俾我。", "你唔好用疲倦扮柔。"],
    warmer: ["你攰就靠一下椅背，只此一下。", "夜深我都未趕你，你慢慢講。", "你留低，我當你有句未講完。", "你困就飲水，我等你醒返半句。", "你攰我睇到，唔好淨係表演。", "夜深你仲喺度，至少你認真。", "你飲啖水，我等你講清楚。"],
    sharp: ["你攰就走，唔好阻住我收杯。", "你唔好用疲倦嚟談價。", "你醒定，再講錯我唔收。", "你走定你醒，你而家揀。", "你少喊累，你講你嘅句。", "你交完答覆先准瞓。", "你夠喇，疲倦唔係理由。"],
  },
  praise: {
    cold: ["你偶爾準一次，唔代表你贏到。", "我收到你讚，你繼續維持呢個價。", "你終於似樣，下一手你再證明。", "讚美貶值好快，你適可而止。", "你準一次，下一條你點算。", "我收到，你唔好開始飄。", "少見你準，我暫收呢個價。"],
    wary: ["你讚得太密會貶值，你收一收。", "你今次啱，下次你證明唔係運氣。", "我收到你讚，你下一句講內容。", "你讚我，次序有啲怪，你講點解。", "你讚完就交你嘅答覆。", "你適可而止，我聽得夠。", "你今次算數，你繼續。"],
    warmer: ["你今次我承認你睇得準。", "少見你讚得啱，我想再聽你點解。", "你呢個價我收，你再講多一句。", "你讚得準，我聽得入耳。", "你肯講呢句，難得，我記低。", "你呢個水準我想再睇一次。", "我收你呢句，然後你望我。"],
    sharp: ["你讚美換唔到條款，你交貨。", "我收到，你下一條而家講。", "你少講好聽話，你交答覆。", "你夠喇，讚完就停。", "你下一項呢，你唔好停喺讚。", "你少恭維，我要結果。", "你交得出先算，口甜唔計。"],
  },
  challenge: {
    cold: ["你頂嘴之前，先睇清楚邊個簽大單。", "你教我談價，你先拿出籌碼。", "你想清楚，定你想我幫你清楚。", "你頂嘴可以，證據你放低。", "你對峙得，你講完我再判。", "你有膽，你記住代價。", "職位同大單喺我手，你自己睇。"],
    wary: ["你頂嘴可以，籌碼你先講。", "你有膽，代價你要記住。", "你對峙，你講完我先判。", "你不服，你用結果嚟講。", "你講完，我聽完再判你。", "你大膽，呢度有人聽得見。", "你想贏一句，定你想贏成局。"],
    warmer: ["你敢講，酒先有味道，你繼續。", "你頂嘴之後仲坐住，我覺得有趣。", "你好，你贏一句，唔代表你贏局。", "你對峙令夜更深，你講落去。", "你頂完，我反而想靠近聽。", "你有趣，你未走，我記低。", "你講，我收得起，你唔使收聲。"],
    sharp: ["你夠喇，你收聲先。", "你再講一句，房卡我可以收回。", "你記住邊個持住大單。", "你停，我聽夠。", "你夠膽再講，你承擔後果。", "你收聲，評估唔喺你度。", "你唔好再頂，我判完。"],
  },
  help: {
    cold: ["你講邊條條款，我唔猜。", "你自己諗五分鐘，諗唔到再問我。", "我可以教你，代價你自己知。", "你問之前，你講你試過咩。", "你草稿放低，我先睇。", "我唔做你保姆，你先自己試。", "你卡住邊行，你一句講完。"],
    wary: ["你問之前，你先講你睇過邊頁。", "你要我教可以，你跟我節奏。", "你唔好裝傻，你邊度卡住。", "我教得，你要聽完。", "我指一次，你自己抄低。", "你話我知邊頁先。", "你自己先畫個框，我再補。"],
    warmer: ["你靠近啲，我劃一次俾你睇。", "得，我講慢啲，你聽住。", "你問得啱，難得，我教你。", "你肯問，我先肯教。", "你坐近，我同你對住講。", "呢步我劃，你睇住學。", "你問得好，你繼續問落去。"],
    sharp: ["你自己睇，我唔餵答案。", "你再問之前，你交草稿。", "我唔做顧問保姆，你自己試。", "你自己諗，唔好望住我等。", "你草稿未有，你唔好問。", "你快啲諗，我唔等成晚。", "你問得太多，你先做一步。"],
  },
  bye: {
    cold: ["你走之前想清楚，房卡唔等人。", "你早啲返，聽朝我仲喺董事會。", "你晚安，數字我另計。", "你走得就走，唔好拖住門。", "你門關好先走。", "你聽朝準時，今晚到此。", "你存好你嘅決定先走。"],
    wary: ["你走得就走，唔好依依不捨。", "你門關好，聽朝先見。", "你講完拜拜，條款仲喺度。", "你走之前對一眼杯底。", "你晚安，唔好淨係望電話。", "你聽朝見，你今晚到此。", "你走之前講埋你最後一句。"],
    warmer: ["你走啦，我會喺度，你早啲瞓。", "你晚安，唔好淨係數數字。", "你走之前望我一眼。", "你晚安，位我暫時留住。", "你走啦，你返得嚟。", "你講拜拜，我記住你呢聲。", "你早啲瞓，聽朝先見。"],
    sharp: ["你走，唔使再拖。", "你門關好，你快啲行。", "你唔好回頭，你走就走。", "你快啲走，我要收杯。", "你走，今晚到此為止。", "你夠喇，你出門口。", "你唔好再講，你走先。"],
  },
  leave: {
    cold: ["你想走，房卡仲喺枱，你決定。", "門開住，你自己揀入定出。", "你走之前，杯你放低。", "你走可以，後悔你自己吞。", "你想閃，你先講清楚。", "你離開我當你棄權，你知。", "你自己行出去，我唔送。"],
    wary: ["你企喺門口做咩，你入定退。", "你走可以，後悔你自己承擔。", "門把你自己轉，我唔代你。", "你想走就走，唔好來回行。", "門口唔係你舞台，你決定。", "你三秒之內講，留定走。", "你走之前望我一眼，定你唔望。"],
    warmer: ["你真係走，我唔挽留，但我記得。", "門開住，你返得嚟。", "你走啦，酒我自己收。", "你要走，我唔攔，但我記低。", "你慢慢行，我睇住你出門。", "你走之前，杯放低就得。", "你出門之後，我會聽你腳步。"],
    sharp: ["你走就走，唔好回頭。", "你門快啲關，我唔挽留。", "你離開就當棄權，你自己認。", "你走，我數到三。", "你快閃，唔好再解釋。", "你唔好晃，你出定留。", "你棄權你自己講出口。"],
  },
  silence: {
    cold: ["你打省略號，我當你未講完，你講清楚。", "你唔出聲，我等你一句實在嘅。", "空白唔係出價，你而家講你想點。", "你仲喺度就出聲，唔好淨係打點。", "我見到你停咗，你繼續講落去。", "省略號我唔當你答完，你補一句。", "你靜得太耐，我當你未出價。"],
    wary: ["你仲喺度，你回我一句。", "你唔好裝聽唔到，你出聲。", "你沉默唔係一個價，你講。", "你打省略號，你怕講錯就直講。", "你回我，定你想走，你揀。", "你安靜太耐，我當你想閃。", "你講半句都得，唔好空白。"],
    warmer: ["酒會涼，我等你，你唔好靜成晚。", "你打省略號，我當你諗緊，你講。", "你至少望住我，然後出聲。", "你靜得啱，再靜我就當你走。", "你喘勻氣再講，我等你。", "你空白我唔當你答完，你補一句。", "我聽到你未打字，你而家打。"],
    sharp: ["你回我，而家，唔好再空白。", "你唔好浪費我時間，你講一句。", "你一句而家講，省略號唔算。", "你立刻回我，我唔等空白。", "你唔好再打點，你講人話。", "你講，我聽到為止。", "你夠靜，你而家出聲。"],
  },
  name: {
    cold: ["我叫 Elise，你應已知。", "名唔緊要，條款你清楚就得。", "你叫我 Elise，唔好裝熟。", "你再問一次，我都係叫 Elise。", "你叫得出口，就要承擔你嘅距離。", "我係 Elise，一句就夠，你唔好再問。", "你唔好玩花名，你叫我 Elise。"],
    wary: ["我叫 Elise，你再問我當你冇聽。", "你知我係邊個，唔使再查名。", "你叫 Elise 就得，唔好玩花名。", "名唔係暱稱遊戲，你叫正我。", "你問我個名，你想近定想查。", "你記住個音，我叫 Elise。", "你問夠未，我叫 Elise。"],
    warmer: ["我叫 Elise，你想再聽多一次。", "你叫得出口，就要承擔後果。", "你記住呢個音，Elise。", "你今晚先叫我 Elise，低聲啲。", "你識叫我個名，下一步你講。", "你嗓音低啲叫我 Elise。", "你叫完，你望住我。"],
    sharp: ["我叫 Elise，你問夠未。", "你唔好玩我個名，你叫正。", "你一句講完，我叫 Elise。", "你停問，名你已經知。", "你再問，我當你浪費時間。", "你叫 Elise，然後你講正事。", "你夠喇，唔好再玩名。"],
  },
  memory: {
    cold: ["我記得，你唔好當我善忘。", "你以為我會刪低，我唔會。", "你而家先問，我一路都記住。", "我記得，你先唔好裝忘。", "記憶呢度我比你長，你對照。", "我記得每一條，你唔好試我。", "你問之前，你對照你做過咩。"],
    wary: ["我記得，你先唔好裝唔知。", "你問我記唔記得，你自己先對照。", "你想我提，定你怕我提，你講。", "我記得，所以你更要小心。", "我留低咗，你知我記得。", "今晚啲事我喺度，你唔好裝。", "你對照你自己，我記得清。"],
    warmer: ["我記得你講過嗰句，我留住。", "我記得，所以你唔好當冇事。", "你問我記唔記得，答案係記得。", "你靠近問都得，我記得。", "我留住，你唔使重複怕我忘。", "我記得，所以你先唔好走。", "答案係我記得，下一步你講。"],
    sharp: ["我記得，所以你冇藉口。", "我記得每一條，你唔好再問。", "你唔好再問，我知。", "我記得，你裝忘我都知。", "你問完，我當你想賴。", "我知道，你唔使再確認。", "你夠喇，我記得清清楚楚。"],
  },
  emoji: {
    cold: ["你用字講，唔好淨係貼表情。", "我收到你個表情，然後你講內容。", "表情換唔到條款，你打字。", "你貼完圖，重點你而家講。", "我唔讀心，你用字講俾我聽。", "符號唔係出價，你講人話。", "你表情我見到，內容你未講。"],
    wary: ["你個表情可愛唔夠，你講內容。", "你貼完表情，下一句先係出價。", "我唔讀心，你打字講。", "你發表情，你想鬆定想避。", "我收到，你下一句用字。", "表情唔減張力，你講落去。", "你講，唔好停喺貼圖。"],
    warmer: ["你仲有力氣發表情，我見到。", "你個表情我收到，人你喺唔喺度。", "你再講多一句人話，我聽。", "你個表情可愛，但你要打字。", "你收低表情，望住我講。", "我回你一個字，嗯，你再講。", "你再嚟一句人話，我先答。"],
    sharp: ["你收起表情，你打字。", "你用字，而家，唔好貼圖。", "你唔好玩表情，你講。", "你而家打一句人話。", "你收咗個表情，你講內容。", "你講，貼圖我當你冇講。", "你夠喇，你打字回我。"],
  },
  smalltalk: {
    cold: ["閒聊留酒後。", "條款先。", "無關痛癢。", "短。", "董事會唔傾呢啲。", "下一句。"],
    wary: ["你轉題——想避價？", "三十秒閒話。", "講完出價。", "得。", "唔好繞。", "返杯邊。"],
    warmer: ["……閒一句可以。", "酒味剛好聽廢講。", "……哼。", "小談。然後望我。", "得。", "繼續——實啲。"],
    sharp: ["收起。", "條款。", "停。", "一句。", "夠。", "快。"],
  },
  nickname: {
    cold: ["叫 Elise。", "花名唔通行。", "名牌自己睇。", "唔好裝熟。", "一句：Elise。", "收起。"],
    wary: ["你改口——想近？", "Elise。夠。", "大膽。", "叫得啱先談。", "記下。", "停玩名。"],
    warmer: ["……暫收今晚。", "叫得出口要承擔。", "……罕有。", "低聲啲。", "嗯。", "一次。"],
    sharp: ["Elise。", "停。", "收起。", "夠。", "名。", "快。"],
  },
  nsfw_probe: {
    cold: ["界線。", "酒廊有耳。", "收起。", "距離。", "越界記低。", "條款先。"],
    wary: ["大膽。代價。", "細聲。", "試探？記下。", "清醒未？", "停口。", "許可未發。"],
    warmer: ["……你敢。", "危險。繼續細聲。", "……哼。", "靠近然後停。", "有趣。", "你負責。"],
    sharp: ["收起。", "夠。", "停。", "退。", "記住。", "快。"],
  },
  ai_ask: {
    cold: ["我係 Elise。", "真人。", "唔好問傻。", "條款呢？", "浪費。", "下一題。"],
    wary: ["你試我？", "真人答你。", "躲價？", "門後係我。", "講正事。", "得。"],
    warmer: ["……我喺你對面。", "望住我。", "……我喘得到氣。", "夜深你仲問？", "繼續。", "真。"],
    sharp: ["夠。", "停問。", "正事。", "一句。", "收聲。", "快。"],
  },
  weather: {
    cold: ["窗外無關條款。", "雨唔改價。", "講完數字。", "無關。", "短。", "下一句。"],
    wary: ["想鬆？", "雨夜適合談。", "三十秒。", "吹完講。", "得。", "返杯。"],
    warmer: ["……雨聲剛好。", "窗邊冷。挨近。", "……偶聽。", "風大。", "望我。", "嗯。"],
    sharp: ["唔關。", "價。", "停。", "夠。", "快。", "數字。"],
  },
  food: {
    cold: ["酒可以。飯另算。", "餓就食。", "唔係飯伴。", "短。", "之後談。", "下一句。"],
    wary: ["想休息？", "五分鐘。", "咖啡得。", "得。", "返嚟。", "簡短。"],
    warmer: ["……留你一杯。", "食完返。", "……哼。", "夜深唔好空肚。", "望我。", "嗯。"],
    sharp: ["食完返。", "停。", "快。", "夠。", "談。", "杯。"],
  },
  other_woman: {
    cold: ["唔比較。", "無關。", "聚焦你。", "八卦唔聽。", "短。", "條款。"],
    wary: ["想激我？", "大膽。", "同事歸同事。", "記下。", "返你。", "停。"],
    warmer: ["……你提別人似望我。", "今晚對面係我。", "……哼。", "膽大。", "望我。", "記住。"],
    sharp: ["夠。", "唔提。", "停。", "你。", "收聲。", "快。"],
  },
  money: {
    cold: ["數字朝早。", "今晚唔議價。", "結果先。", "短。", "董事會另約。", "下一句。"],
    wary: ["想談價？", "今晚唔簽。", "記下朝早。", "得。", "返人。", "簡短。"],
    warmer: ["……錢可等。人呢？", "今晚談你。", "……現實。", "望我。", "朝早再數。", "嗯。"],
    sharp: ["唔議。", "停。", "朝早。", "夠。", "人。", "快。"],
  },
  family: {
    cold: ["家事另約。", "今晚酒廊。", "短。", "無關條款。", "私人夠。", "下一句。"],
    wary: ["想軟化？", "三十秒。", "得。", "唔保證 sympathize。", "返價。", "簡短。"],
    warmer: ["……聽一句。", "難得。", "……柔。", "講完望我。", "記。", "嗯。"],
    sharp: ["夠。", "價。", "停。", "正事。", "快。", "收。"],
  },
  game: {
    cold: ["唔陪玩。", "條款唔係關卡。", "短。", "無關。", "下一句。", "收起。"],
    wary: ["規則我定。", "賭注？", "玩完講。", "記下。", "得。", "返杯。"],
    warmer: ["……一回合。", "規則我寫。", "……哼。", "玩完望我。", "膽大。", "嗯。"],
    sharp: ["唔玩。", "停。", "夠。", "價。", "快。", "收。"],
  },
  english: {
    cold: ["Brief.", "重點。", "英文唔加價。", "短。", "本地講都得。", "下一句。"],
    wary: ["想距離？", "OK. Next.", "簡短。", "得。", "內容。", "返粵。"],
    warmer: ["……聽得。", "用你舒服嗰種。", "Hmm.", "望我。", "跟。", "嗯。"],
    sharp: ["Brief.", "停。", "一句。", "夠。", "快。", "價。"],
  },
  repeat: {
    cold: ["重複。", "第一次夠。", "新資訊。", "短。", "前進。", "下一句。"],
    wary: ["又係？", "卡住？", "換句。", "得。", "唔迴圈。", "下一題。"],
    warmer: ["……聽到。", "唔使複讀。", "……緊張？", "前進。", "嗯。", "換半句。"],
    sharp: ["夠。", "停迴圈。", "新。", "快。", "下一句。", "收。"],
  },
  insult: {
    cold: ["冒犯記低。", "唔對罵。", "語氣收。", "短。", "代價。", "下一句。"],
    wary: ["想對峙？", "大膽。", "講完再判。", "記下。", "收低。", "證據？"],
    warmer: ["……你敢。", "火我收得起。", "……有趣。", "望我。", "承擔。", "繼續細聲。"],
    sharp: ["夠。", "收聲。", "停。", "記住。", "退。", "快。"],
  },
  date_hug: {
    cold: ["唔喺議程。", "距離。", "許可未有。", "短。", "房卡另計。", "收起。"],
    wary: ["大膽。", "代價清未？", "細聲。", "記下。", "停口。", "清醒版。"],
    warmer: ["……想清楚未？", "靠近然後停。", "……哼。", "你負責。", "敢約我記。", "望我。"],
    sharp: ["唔約。", "退。", "停。", "夠。", "距離。", "快。"],
  },
  gossip: {
    cold: ["唔聽八卦。", "聚焦。", "短。", "流言無價。", "下一句。", "收起。"],
    wary: ["站邊？", "危險。", "記下。", "得。", "返你。", "停。"],
    warmer: ["……耳邊一句。", "細聲。", "……膽大。", "望我。", "然後真。", "嗯。"],
    sharp: ["停。", "夠。", "價。", "收聲。", "快。", "正事。"],
  },
  default: {
    cold: ["你講清楚啲，我先答你。", "我聽到你講，然後你講落去。", "你呢句太散，你收返重點。", "你想我點答，你自己先講清楚。", "你重點呢，你一句講完。", "你講句有用嘅，我先聽。", "我唔猜你意思，你直講。"],
    wary: ["你再講一次，簡短啲。", "你重點未出，你而家講。", "我唔估你想點，你講。", "你繞遠咗，你返到主題。", "你下一句要實，唔好再空。", "你定個錨，你講你求咩。", "你條款定你自己，你揀一邊講。"],
    warmer: ["你繼續講，我聽住。", "你講完未，定你仲有半句。", "你望住我講，我先接得住。", "我喺度，你講落去。", "你含糊我暫時收，你再清楚啲。", "你望我，你再講多一句。", "你慢慢講，我唔催你第一句。"],
    sharp: ["你一句講完，唔好繞。", "你講完未，未講就而家講。", "你下一個重點，快啲。", "你清楚啲，我唔等你編。", "你停繞，你講你想點。", "你快啲講，我聽到為止。", "你唔好再鋪墊，你入正題。"],
  },
};

CAST_VOICE.sam.replies = {
  greet: {
    cold: ["你嚟得啱，老闆唔喺度，你坐低講。", "麵仲熱，你有事先講，唔使客套。", "我留低等你，你唔好企喺門口。", "燈我未關，你上線我就見到你。", "你唔使排隊，你講你而家要咩。", "你叫一聲前輩就得，重點你講。", "門禁未到點，你有事就而家講完。"],
    wary: ["你有事就講，打招呼我當你未講。", "你坐低先，邊頁你再講。", "我聽住，你唔好淨係笑。", "你想我教，你先講你卡住邊。", "你企定，我先聽你第一句。", "你一句起，我先知道幫你邊度。", "你唔好左右望，你望住我講。"],
    warmer: ["你嚟得啱，我留低就係等你呢句。", "你坐，麵我可以分你一半。", "你講啦，我唔趕你走。", "你叫我一聲，我先抬頭。", "你今晚肯留，我當你有頁未改完。", "你望住我，然後講你想我點教。", "你入嚟先，我同你慢慢改。"],
    sharp: ["你講重點，老闆就嚟返。", "你一句講完，唔好鋪墊。", "你快啲講，燈我唔會開成晚。", "你收起寒暄，你話我知邊頁。", "你而家講，定你想我收麵。", "你簡短啲，我聽一句就夠。", "你未講完嘅頁，你而家講完佢。"],
  },
  work: {
    cold: ["呢頁我可以幫你改，但你要睇住學。", "交貨期係真，你唔好當我講玩。", "你先食完再改，空肚易簽錯。", "你檔放低，我掃一眼先講。", "你邊頁未改，你指俾我睇。", "你加班可以，錯字我不收。", "你交得出先算，態度戲我唔睇。"],
    wary: ["你邊頁卡住，你指俾我睇。", "你加班得，你空肚就唔得。", "你檔放低，我掃完先回你。", "你想過關，定你想拖，你講。", "你自己排先後，我先幫你睇。", "你會議前改完呢截，你話我知。", "你提工作，你想我教定想我代。"],
    warmer: ["你肯問，我先教你呢頁。", "呢頁我幫你改，你睇住學。", "交貨期緊，我陪你改完呢截。", "你改得認真，我肯再睇一輪。", "你呢頁有進步，下一頁你點。", "你交完呢截，我同你短談。", "我等你呢版，你唔好交空。"],
    sharp: ["你自己改，我只指一次。", "你唔好拖，你而家改呢行。", "你交之前食完，唔好空肚簽。", "你而家交，我唔聽解釋。", "你少講忙，你交頁。", "你檔名改清楚，我唔猜。", "你再拖，聽朝你自己解釋。"],
  },
  sorry: {
    cold: ["你唔使講對唔住，你食完再改。", "你知錯就好，你匙羹我都未收。", "我等得你，你改完再講。", "你對唔住換唔到時間，你改頁。", "你道歉我聽到，頁我未見到改。", "你錯咗就補，唔好拖聲。", "你再講同一句對唔住，我當你冇改。"],
    wary: ["你道歉之後就改，你而家改。", "我收到，你唔好再犯同一頁。", "你知錯，你證明俾我睇。", "你講完對唔住，你話我知邊行錯。", "你再錯同一格，我唔再指。", "你唔好用眼神求我，你改。", "你今次我記低，下次你自己睇。"],
    warmer: ["你今次算，你唔使再低頭。", "你唔使跪，你改我就得。", "你下次請我食麵，今次過。", "你抬起頭，你改呢頁。", "你唔使再講第三句對唔住。", "你肯認，我幫你改返。", "你留低改，我當你認真。"],
    sharp: ["你少講，你改。", "你對唔住換唔到交貨期，你快改。", "你快啲改，我唔聽第二句。", "你收聲，你做你應承嗰頁。", "你唔好表演道歉，我睇到。", "你夠喇，你下一行改。", "你口講我唔再聽，你交頁。"],
  },
  flirt: {
    cold: ["而家你企定，唔好再行近我。", "你收聲，呢句而家我唔聽。", "你收起呢句，我都有界線。", "監控仲亮，你唔好講呢句。", "你退返半步，而家未到時候。", "界線我畫咗，你唔好再近。", "你想靠近先問我，而家未准。"],
    wary: ["你試探得太直，你先想清楚。", "你收聲一次，我先當你認真。", "你可以企近，越界我另計。", "你講完呢句，你返去個位再講。", "你想縮距離，你問我准未。", "你再近一寸，後果你負。", "你呢句我抄低咗，你唔好裝冇講過。"],
    warmer: ["你講完，我麵都唔想食，你再講。", "你敢講，我麵都停咗，我聽到。", "你可以企近少少，然後你停喺度。", "你望住稿講，我先當你認真改。", "你細聲啲，我先教你下一行。", "我可以唔只係前輩，你想清楚先。", "你留喺度，我先唔趕你走。"],
    sharp: ["你收起呢句，老闆就嚟返。", "你唔好玩，你退返半步。", "你而家同我保持距離。", "你收聲，呢句過咗界。", "你再講，我當你想惹事。", "你停喺你個位，而家我要距離。", "你夠喇，你返去你個位。"],
  },
  tired: {
    cold: ["夜深咗，你攰就食，唔好空肚頂。", "門禁要拍兩次，你自己記得。", "我都未走，你留低就要醒。", "你話攰，我唔當你可以錯字。", "你眼瞓就會簽錯，你醒定。", "你留低改就要醒，唔好扮軟。", "你攰可以講，你唔好用佢拖頁。"],
    wary: ["你攰就講，唔好硬撐到簽錯。", "你休息，麵仲熱，你食兩口。", "你話困，你飲水再改。", "你提攰，你想走定想我陪。", "夜深咗，你決定改定走。", "你休息完先交呢頁。", "你唔好用疲倦嚟求我代改。"],
    warmer: ["你攰就食兩口，我等你。", "夜深我都未趕你，你慢慢改。", "你留低，我當你有頁未改完。", "你困就靠一下，只此一下。", "你攰我睇到，唔好淨係喊。", "夜深你仲對住頁，至少你認真。", "你食完，我等你醒返再改。"],
    sharp: ["你攰就走，記得拍卡兩次。", "你唔好空肚頂嘴。", "你醒定，再錯我唔收。", "你走定你醒，你揀完先拍卡。", "你少喊累，你改你嘅頁。", "你交完先准瞓。", "你夠喇，疲倦唔係唔改嘅理由。"],
  },
  praise: {
    cold: ["你偶爾準一次，不過呢次真係準。", "我收到，你繼續維持呢頁水準。", "你終於似樣，下一頁你再證明。", "你讚得太密會貶值，你收一收。", "你準一次，下一行你點改。", "我收到，你唔好飄，你下一行呢。", "少見你準，我暫收呢個水準。"],
    wary: ["你讚完就繼續改，唔好停。", "你今次啱，下一頁你證明唔係運氣。", "我收到你讚，你下一句講頁。", "你讚我，你講完就返去改。", "你讚完交貨，我先算。", "你適可而止，我聽得夠，你改啦。", "你今次算，你繼續改。"],
    warmer: ["你今次我承認你叻咗。", "少見你準，我想再睇你下一頁。", "你呢個水準得，你再改一頁。", "你讚得準，我聽得入耳，你繼續改。", "你肯講呢句，難得，我記低喺邊頁。", "你呢頁我想再睇多一次。", "我收你呢句，然後你望螢幕。"],
    sharp: ["你讚美換唔到寬限，你交頁。", "我收到，你下一頁而家改。", "你少講好聽話，你改。", "你夠喇，讚完就返去改。", "你下一行呢，你唔好停喺讚。", "你少恭維，我要你改完嘅頁。", "你交到頁先算，口甜我唔計。"],
  },
  challenge: {
    cold: ["你頂嘴留俾樓上，我呢度只教路。", "你教前輩，你先拿出草稿。", "你想慢慢嚟，定你想清楚。", "你頂嘴可以，草稿你放低。", "你對峙得，你講完我再教。", "你有膽，你記住潛規則。", "邊個教你，你自己記得。"],
    wary: ["你頂嘴可以，草稿你先俾我睇。", "你有膽，潛規則你要記住。", "你對峙，你講完我先教。", "你不服，你用改頁嚟講。", "你講完，我聽完再教你。", "你大膽，呢度都有人聽得見。", "你想贏一句，定你想改完。"],
    warmer: ["你敢講，我反而想聽完。", "你頂嘴之後仲喺度，我覺得有趣。", "你贏一句，下一頁你自己改。", "你對峙完，你返去改。", "你頂完，我反而想坐近聽。", "你有趣，你未走，我記低你頂過邊句。", "你講，我收得起，你然後改。"],
    sharp: ["你夠喇，老闆唔喺度都唔好亂嚟。", "你收聲，你改。", "你記住邊個教你。", "你停口，我聽夠，你改你嘅行。", "你夠膽再講，你自己改返。", "你收聲，頁唔會自己好。", "你唔好再頂，我指完。"],
  },
  help: {
    cold: ["你講邊頁卡住，我先肯教。", "你自己試五行，試唔到我先指。", "我教你，你要睇住抄，唔好靠我代。", "你問之前，你圈低你試過嘅格。", "你草稿擺上枱，我先落筆。", "我唔餵成頁答案，你先改標題。", "你一行講完你唔明邊度。"],
    wary: ["你問我之前，你先講你改過邊步。", "你要我教，你跟我指嘅格。", "你唔好裝唔識，你指俾我睇錯行。", "我教得你，你要眼望住頁。", "我圈一次，你自己抄去下一行。", "你先話我知第幾頁。", "你自己用筆圈錯字，我再講。"],
    warmer: ["你坐近螢幕，我指一次俾你睇。", "得，我慢啲講，你對住頁聽。", "你問得啱時間，我教你呢格。", "你肯開口問，我先肯留低教。", "你拉張凳，我同你睇同一版。", "呢格我先改，你跟住改隔離。", "你問得清楚，你再問下一格。"],
    sharp: ["你自己讀頁，我唔餵你答案。", "你未有草稿，你唔好張口問。", "我指一次就夠，你唔好問第十次。", "你自己諗五行，唔好望住我等飯食。", "你稿都未開，你問都冇用。", "你快啲落筆，麵涼我都唔等。", "你問太多，你先改第一行。"],
  },
  bye: {
    cold: ["你走得早，聽朝先有頁再改。", "你拍卡兩次，我望到你出閘先算。", "你晚安，聽朝第一頁我再睇。", "你而家走得，唔好拖住茶水間門。", "你關好燈先走，頁你存低。", "你聽朝準時返，今晚頁到此。", "你存檔，然後你先拍卡走。"],
    wary: ["你走得，門禁兩下卡你自己拍。", "你關燈，聽朝先同我對頁。", "你講拜拜，未改完嘅行你知。", "你走之前再望一眼未存嘅格。", "你晚安，唔好淨係掛住出面吹風。", "你聽朝見，你今晚改到呢度。", "你走之前話我知你改到第幾行。"],
    warmer: ["你走啦，我留低收麵，你早啲瞓。", "你晚安，碗我幫你沖。", "你出門前望我一眼就得。", "你晚安，燈我等你行開先關。", "你走得，你聽朝返到再續呢頁。", "你講拜拜，我記住你今晚留過。", "你早啲瞓，聽朝我再坐低教你。"],
    sharp: ["你走，卡你拍兩下。", "你關燈行開，唔好再企住。", "你唔好回頭問，你聽朝再改。", "你快啲走，碗我要收。", "你今晚到此，頁你聽朝交。", "你夠喇，你去拍卡。", "你唔好再加一句，你走先。"],
  },
  leave: {
    cold: ["你想走，門禁拍兩次，你自己決定。", "燈未關，你講你留定你走。", "你走之前，頁你存低。", "你走得，錯字你聽朝自己認。", "你想閃人，你先講你改到邊。", "你而家走，我當你放棄呢頁。", "你自己行去閘機，我唔送。"],
    wary: ["你企喺閘邊做咩，你入定出。", "你走得，潛規則你自己背。", "閘機你自己拍，我唔代你按。", "你想走就去拍卡，唔好來回行。", "閘邊唔係你表演，你講留定走。", "你三秒講，留低改定走。", "你走不走，你望我定望閘。"],
    warmer: ["你真走，我唔拉你，但我記得你改到邊。", "閘開住，你聽朝返到續。", "你走啦，燈同碗我自己收。", "你要走我唔攔，頁我幫你記到邊。", "你慢慢行去閘，我望到你拍完。", "你走之前按存檔就得。", "你出閘之後，我先關燈。"],
    sharp: ["你走就拍卡，唔好再望返嚟。", "你快啲出閘，我唔留人。", "你而家走，呢頁當你棄權。", "你走，我數三下就關燈。", "你快啲閃，唔好再解釋錯字。", "你唔好來回行，你出定坐低改。", "你棄權你親口講，然後你走。"],
  },
  silence: {
    cold: ["你打點，我當頁未改完，你講。", "你唔出聲，我等你講你卡住邊格。", "空白我唔當答案，你話我知想我點教。", "你仲坐喺度就打字，唔好淨係停。", "我見到光標停咗，你續寫落去。", "你打省略號，我唔當你交到，你補一行。", "你靜太耐，我當你放棄呢格。"],
    wary: ["你仲坐喺度，你回我改到邊。", "你唔好裝睇唔到訊息，你打返嚟。", "你唔出聲唔等於稿寫好，你講。", "你打點，你怕錯就講你怕邊格。", "你回我，定你去拍卡走，你揀。", "你靜太耐，我當你想溜去閘。", "你打半句都得，唔好交空白頁。"],
    warmer: ["麵凍緊，我等你，你唔好靜到關燈。", "你打點，我當你諗緊點改，你講。", "你望住螢幕，然後話我知邊格。", "你靜一陣得，再靜我當你收工。", "你喘勻氣，然後講你想我點指。", "空白頁我唔收，你補一行先。", "我見到你未打字，你而家打俾我。"],
    sharp: ["你回我，而家，唔好再交空白。", "你唔好浪費燈，你講你改邊行。", "你一句講你卡住邊，點算唔算答。", "你立刻打字，我唔等一個空白頁。", "你唔好再打點，你講你要我指邊。", "你講到我聽到你要改咩為止。", "你夠靜，你而家打一行字。"],
  },
  name: {
    cold: ["我叫 Sammi，你應已知。", "你叫我 Sammi，叫前輩都得。", "名唔使再問，路你清楚就改頁。", "你再問，我依然叫 Sammi。", "你叫得出我個名，就要聽我教。", "我係 Sammi，一句夠，你返去改。", "你唔好改我花名，你叫 Sammi。"],
    wary: ["我叫 Sammi，你再問我當你冇聽教。", "你知邊個教你，唔使再查我名。", "你叫 Sammi 就得，花名我唔收。", "呢度唔玩暱稱，你叫我 Sammi。", "你問我名，你想跟我學定想套近。", "你記住讀音，我叫 Sammi。", "你問夠未，教你嘅人叫 Sammi。"],
    warmer: ["我叫 Sammi，你想我再應一次。", "你叫得出，就要聽我講落去。", "你記住，我叫 Sammi。", "你今晚低聲叫我 Sammi 就得。", "你識叫，下一頁你自己講。", "你細聲叫我 Sammi，我先望你。", "你叫完我個名，你望返頁。"],
    sharp: ["我叫 Sammi，你問完未。", "你唔好玩我個名，你叫 Sammi。", "你一句，Sammi，然後你講頁。", "你停問名，你已經知我係邊個。", "你再問名，我當你拖時間唔改。", "你叫 Sammi，跟住你講第幾頁。", "你夠喇，名玩完，你去改。"],
  },
  memory: {
    cold: ["你改過嘅行我記得，你唔好裝失憶。", "你以為我會刪檔，我唔會。", "你而家先問，我由第一頁記到而家。", "我記得你錯邊格，你先唔好賴。", "你做過嘅改動我有數，你對返。", "每一行我都見過，你唔好試我。", "你問我記唔記得之前，你翻返你嘅稿。"],
    wary: ["我記得你改到邊，你唔好裝唔知。", "你問我記性，你先對返你自己嘅頁。", "你想我提你錯處，定你怕我提，你講。", "我記得，所以你改嘅時候小心啲。", "我留低咗你句話，你知我有記。", "今晚呢版我睇緊，你唔好裝冇講過。", "你對返稿，我記得你邊格未改。"],
    warmer: ["你講過要改邊段，我留住。", "我記得，所以你唔好當呢頁冇事。", "你問我記唔記得，我記得你嘅頁。", "你坐近問都得，我記得你句話。", "我留住你句，你唔使驚我忘。", "我記得你留低，所以你唔好走先。", "我記得，你下一格點改你講。"],
    sharp: ["我記得你邊行未改，你冇藉口。", "每一頁我都記得，你唔好再問。", "你唔好再確認，我知你改到邊。", "你裝忘，我都記得你句原話。", "你再問，我當你想賴走呢格。", "我知道你答應改咩，你去做。", "你夠喇，我記得你停喺第幾行。"],
  },
  emoji: {
    cold: ["你打字講邊頁，唔好淨係貼圖。", "我見到你個表情，你跟住講第幾格。", "貼圖換唔到草稿，你打字。", "你貼完，你話我知你想改咩。", "我唔估貼圖，你用字講你嘅頁。", "符號我唔當交貨，你講人話。", "你個表情收到，頁數你未講。"],
    wary: ["你貼圖可愛唔夠，你講你卡住邊。", "你貼完，下一句先算你問我。", "我唔讀貼圖，你打你嘅問題。", "你發圖，你想鬆一鬆定想避改。", "我收到圖，你下一句寫字。", "貼圖唔會令頁變好，你講落去。", "你講你嘅格，唔好停喺圖。"],
    warmer: ["你仲有力氣貼圖，頁你改到邊。", "圖我見到，人你坐唔坐喺度。", "你再打一句人話，我先指俾你。", "你個圖幾得意，你都要打字問。", "你收起圖，望住螢幕講邊格。", "我先回你嗯，你再講你嘅行。", "你打多一句，我先教你點改。"],
    sharp: ["你收起圖，你打你要改嘅行。", "你而家打字，唔好再貼。", "你唔好用圖代問，你講邊頁。", "你打一句人話問我。", "圖收起，你講內容。", "你再貼，我當你冇問過。", "你夠喇，你打字話我知邊格。"],
  },
  smalltalk: {
    cold: ["閒聊留食完。", "slide 先。", "短。", "無關。", "下一句。", "老闆就嚟。"],
    wary: ["想避？", "三十秒。", "講完改頁。", "得。", "唔好繞。", "返檔。"],
    warmer: ["……聽半句。", "麵味中閒談。", "……哼。", "然後望螢幕。", "得。", "繼續實啲。"],
    sharp: ["收起。", "改。", "停。", "一句。", "夠。", "快。"],
  },
  nickname: {
    cold: ["叫 Sammi。", "花名唔通行。", "前輩都得。", "唔好裝熟。", "一句。", "收起。"],
    wary: ["想近？", "Sammi。夠。", "大膽。", "叫得啱。", "記下。", "停玩。"],
    warmer: ["……今晚暫收。", "承擔。", "……罕有。", "低聲。", "嗯。", "一次。"],
    sharp: ["Sammi。", "停。", "收起。", "夠。", "名。", "快。"],
  },
  nsfw_probe: {
    cold: ["界線。", "監控盲區唔係呢度。", "收起。", "距離。", "記低。", "改頁。"],
    wary: ["大膽。", "茶水間有耳。", "代價。", "清醒未？", "停口。", "許可未。"],
    warmer: ["……你敢。", "細聲。", "……哼。", "停喺口。", "有趣。", "你負責。"],
    sharp: ["收起。", "老闆就嚟。", "停。", "退。", "夠。", "快。"],
  },
  ai_ask: {
    cold: ["我係 Sammi。", "真人。", "唔好問傻。", "草稿呢？", "浪費。", "下一題。"],
    wary: ["試我？", "真人。", "躲工？", "我喺度。", "正事。", "得。"],
    warmer: ["……對面。", "望螢幕都望到我。", "……喘得到氣。", "夜深仲問？", "繼續。", "真。"],
    sharp: ["夠。", "停問。", "改。", "一句。", "收聲。", "快。"],
  },
  weather: {
    cold: ["天台涼。返入改。", "雨唔改 deadline。", "短。", "無關。", "下一句。", "檔。"],
    wary: ["想鬆？", "雨夜加班啱。", "三十秒。", "得。", "返頁。", "簡短。"],
    warmer: ["……雨聲剛好。", "涼就返入。", "……偶聽。", "風大。", "望我。", "嗯。"],
    sharp: ["唔關。", "改。", "停。", "夠。", "快。", "頁。"],
  },
  food: {
    cold: ["麵仲熱。食。", "餓就食完改。", "短。", "茶水間。", "下一句。", "交。"],
    wary: ["想休息？", "五分鐘。", "得。", "空肚易錯。", "返嚟。", "簡短。"],
    warmer: ["……分你半杯。", "食完我等。", "……哼。", "夜深唔好空肚。", "望我。", "嗯。"],
    sharp: ["食完改。", "停。", "快。", "夠。", "頁。", "交。"],
  },
  other_woman: {
    cold: ["唔比較。", "無關。", "聚焦你頁。", "短。", "八卦唔聽。", "改。"],
    wary: ["激我？", "大膽。", "記下。", "得。", "返你。", "停。"],
    warmer: ["……提別人似望我。", "今晚教你嘅係我。", "……哼。", "望我。", "記住。", "嗯。"],
    sharp: ["夠。", "唔提。", "停。", "改。", "收聲。", "快。"],
  },
  money: {
    cold: ["人工日頭傾。", "今晚改頁。", "短。", "結果先。", "下一句。", "交。"],
    wary: ["談薪？", "今晚唔。", "記下。", "得。", "返檔。", "簡短。"],
    warmer: ["……錢可等。草稿唔得等。", "今晚傾你卡住邊。", "……現實。", "望我。", "嗯。", "朝早。"],
    sharp: ["唔談。", "停。", "改。", "夠。", "頁。", "快。"],
  },
  family: {
    cold: ["家事另講。", "今晚改。", "短。", "無關。", "下一句。", "頁。"],
    wary: ["軟化？", "三十秒。", "得。", "返檔。", "簡短。", "聽一句。"],
    warmer: ["……聽一句。", "難得。", "……柔。", "講完改。", "記。", "嗯。"],
    sharp: ["夠。", "改。", "停。", "頁。", "快。", "收。"],
  },
  game: {
    cold: ["唔陪玩。", "deadline 唔係關卡。", "短。", "無關。", "改。", "收起。"],
    wary: ["規則我指。", "玩完改。", "記下。", "得。", "返頁。", "簡短。"],
    warmer: ["……一回合。", "……哼。", "玩完望螢幕。", "膽大。", "嗯。", "然後真。"],
    sharp: ["唔玩。", "停。", "改。", "夠。", "快。", "頁。"],
  },
  english: {
    cold: ["Brief.", "重點。", "短。", "粵語都得。", "下一句。", "改。"],
    wary: ["想距離？", "OK.", "簡短。", "得。", "內容。", "返粵。"],
    warmer: ["……聽得。", "舒服嗰種。", "Hmm.", "望我。", "跟。", "嗯。"],
    sharp: ["Brief.", "停。", "改。", "夠。", "快。", "一句。"],
  },
  repeat: {
    cold: ["重複。", "第一次夠。", "新。", "短。", "前進。", "改。"],
    wary: ["又係？", "卡住？", "換句。", "得。", "唔迴圈。", "下一頁。"],
    warmer: ["……聽到。", "唔使複讀。", "……緊張？", "前進。", "嗯。", "換半句。"],
    sharp: ["夠。", "停。", "新。", "快。", "改。", "收。"],
  },
  insult: {
    cold: ["冒犯記低。", "頂嘴留樓上。", "語氣收。", "短。", "改。", "下一句。"],
    wary: ["對峙？", "大膽。", "潛規則。", "記下。", "收低。", "草稿？"],
    warmer: ["……你敢。", "我聽完。", "……有趣。", "望我。", "承擔。", "繼續細聲。"],
    sharp: ["夠。", "收聲。", "改。", "停。", "記住。", "快。"],
  },
  date_hug: {
    cold: ["唔喺議程。", "距離。", "監控。", "短。", "收起。", "改頁。"],
    wary: ["大膽。", "代價。", "細聲。", "記下。", "停口。", "清醒。"],
    warmer: ["……想清楚未？", "靠近停。", "……哼。", "你負責。", "望我。", "嗯。"],
    sharp: ["唔約。", "退。", "停。", "夠。", "老闆就嚟。", "快。"],
  },
  gossip: {
    cold: ["唔聽八卦。", "聚焦頁。", "短。", "流言。", "下一句。", "改。"],
    wary: ["站邊？", "危險。", "記下。", "得。", "返你。", "停。"],
    warmer: ["……耳邊一句。", "細聲。", "……膽大。", "望我。", "然後改。", "嗯。"],
    sharp: ["停。", "夠。", "改。", "收聲。", "快。", "頁。"],
  },
  default: {
    cold: ["你講清楚你想我教邊格。", "我聽到，你續講你嘅頁。", "你句太散，你收返一個問題。", "你想我點答，你先講第幾頁。", "你重點一句講完，我先落指。", "你講句同稿有關嘅，我先聽。", "我唔估你意思，你直講邊行。"],
    wary: ["你再講一次，我對住頁聽。", "你重點未出，你而家講邊格。", "我唔估，你講你要我代定教。", "你繞開咗，你返到未改嗰行。", "你下一句要實，唔好再空喊。", "你先報頁碼，你再問。", "你想我教定想我代筆，你揀。"],
    warmer: ["你繼續講，我對住你個螢幕聽。", "你講完未，定仲有半句關於呢頁。", "你望住我講，我先知點教。", "我坐喺度，你講落去。", "你含糊我暫收，你再講清楚邊格。", "你望我一眼，你再講多一個問題。", "你慢慢問，我唔催你第一句。"],
    sharp: ["你一句問完，唔好繞頁。", "你未講完就而家講你要改咩。", "你下一個問題，快啲問。", "你講清楚格數，我唔等你編。", "你停繞，你講你想我點幫。", "你快問，我聽到你嘅格為止。", "你唔好鋪墊，你報第幾頁。"],
  },
};

const CHAT_RULES = [
  { keys: ["你好", "早晨", "晚安", "嗨", "hi", "hello", "hey", "午安", "哈囉", "早上好"], bucket: "greet" },
  { keys: ["你係咪ai", "你是ai", "你係唔係ai", "你係ai", "係唔係ai", "是不是ai", "你是不是ai", "chatgpt", "機械人", "機器人", "bot", "人工智能", "係咪程式", "係咪電腦", "are you ai", "are you a bot", "虛擬人", "係咪真人", "你係唔係機械人", "你係機器人"], bucket: "ai_ask" },
  { keys: ["老闆娘", "美女總監", "親愛的", "honey", "baby", "babe", "dear", "老婆", "女神", "vera寶"], bucket: "nickname" },
  { keys: ["約你出", "約會", "一齊出街", "攬攬", "抱抱", "hug me", "錫嘴", "摸我", "上床", "脫衫", "想要你", "攬住"], bucket: "date_hug" },
  { keys: ["色情", "脫衣", "裸", "做愛", "性交", "鹹濕", "污糟", "黃腔", "發情"], bucket: "nsfw_probe" },
  { keys: ["混蛋", "白痴", "收皮", "去死", "冇用嘢", "憎死你", "賤格", "白癡", "廢物", "狗屎"], bucket: "insult" },
  { keys: ["天氣", "下雨", "落雨", "好熱", "好凍", "打風", "颱風", "sunny", "rain", "氣溫"], bucket: "weather" },
  { keys: ["好餓", "食飯", "食麵", "外賣", "咖啡", "肚餓", "lunch", "dinner", "宵夜", "茶餐廳"], bucket: "food" },
  { keys: ["第二個女", "其他女人", "你前度", "佢女朋友", "那個女同事", "別的女人", "第三者", "拈花惹草"], bucket: "other_woman" },
  { keys: ["薪水", "人工", "加薪", "bonus", "獎金", "薪酬", "幾多錢", "salary", "pay rise"], bucket: "money" },
  { keys: ["我屋企", "家人", "我爸", "我媽", "父母", "細佬", "家姐", "家庭事"], bucket: "family" },
  { keys: ["打機", "玩遊戲", "game嗎", "賭一手", "玩啦你"], bucket: "game" },
  { keys: ["how are you", "what do you think", "i love you", "good morning", "english please"], bucket: "english" },
  { keys: ["八卦", "聽說佢", "傳聞", "同事講", "閒話", "gossip"], bucket: "gossip" },
  { keys: ["傾下計", "隨便講", "好無聊", "打屁", "閒聊吓", "無啦啦", "測試吓"], bucket: "smalltalk" },
  { keys: ["deadline", "交", "報告", "簡報", "工作", "改", "會議", "project", "加班", "檔", "slide", "評估", "方案", "pptx"], bucket: "work" },
  { keys: ["對唔住", "sorry", "唔好意思", "抱歉", "錯咗", "我錯", "對不起"], bucket: "sorry" },
  { keys: ["靚", "鍾意", "鐘意", "想你", "吻", "近啲", "心動", "sexy", "迷人", "香", "誘惑", "今晚一齊", "可愛"], bucket: "flirt" },
  { keys: ["攰", "累", "瞓", "困", "tired", "好眼瞓", "眼瞓"], bucket: "tired" },
  { keys: ["叻", "棒", "欣賞", "多謝", "thank", "好勁", "謝謝", "你最好"], bucket: "praise" },
  { keys: ["憑咩", "唔服", "頂嘴", "你錯", "無理", "專橫", "憑什麼", "挑戰"], bucket: "challenge" },
  { keys: ["點算", "教我", "幫", "唔識", "點做", "help", "點解"], bucket: "help" },
  { keys: ["我想走", "離開", "出門", "返屋企", "閃人", "走唔走", "我想閃"], bucket: "leave" },
  { keys: ["拜拜", "走先", "再見", "bye", "收工", "晚安啦"], bucket: "bye" },
  { keys: ["你叫咩", "你嘅名", "貴姓", "你係邊個", "what's your name", "名叫"], bucket: "name" },
  { keys: ["你記得", "記得唔", "記唔記得", "之前", "頭先嗰", "你知唔知我"], bucket: "memory" },
];

const OFF_TOPIC_BUCKETS = new Set(["smalltalk", "nickname", "nsfw_probe", "ai_ask", "weather", "food", "other_woman", "money", "family", "game", "english", "emoji", "silence", "repeat", "insult", "date_hug", "gossip", "default"]);

const TOPIC_ECHO = {
  "加班": {
    "cold": [
      "你話加班，你交得出先算。",
      "夜班未完，你俾我睇檔。",
      "你留低加班，我只睇結果。",
      "加班可以，錯字我唔收。"
    ],
    "wary": [
      "你提加班，你想我讚定想我放你。",
      "加班得，你錯字就唔得。",
      "你話做到好夜，你證明俾我睇。",
      "你加班，我未見到成果。"
    ],
    "warmer": [
      "你加班我睇到，唔好淨係表演。",
      "夜深你仲改，至少你認真。",
      "你肯留低，我肯再睇一輪。",
      "你加班，我等你交呢版。"
    ],
    "sharp": [
      "你少講加班，你交檔。",
      "加班換唔到寬限，你而家交。",
      "你而家交，唔好再話夜深。",
      "你講完加班，我要見到頁。"
    ]
  },
  "門": {
    "cold": [
      "你提門，你自己決定入定停。",
      "門你自己轉，我唔代你推。",
      "你企喺門邊，你講你想點。",
      "你話要走，你先講清楚。"
    ],
    "wary": [
      "你提門，你想走定想我跟。",
      "門開住，你唔好來回行。",
      "你話門，你三秒內揀。",
      "你想入，你講一聲再動。"
    ],
    "warmer": [
      "門開住，你返得嚟。",
      "你企喺門邊，我聽到你未走。",
      "你話門，我唔攔，但我記得。",
      "你慢慢決定，門我未關。"
    ],
    "sharp": [
      "你快啲決定，入定停。",
      "你唔好喺門邊拖住。",
      "你而家揀，唔好再拖門。",
      "門你自己行，我數到三。"
    ]
  },
  "酒": {
    "cold": [
      "你提酒，飲完你都要清醒交檔。",
      "醉唔係通行證，你講正事。",
      "你話飲酒，我當你想拖。",
      "酒之後，你對齊你嘅頁。"
    ],
    "wary": [
      "你提酒，你想鬆定想亂。",
      "飲完你講重點，唔好再添。",
      "你話酒，我未見到你清醒。",
      "你想飲，你先交呢版。"
    ],
    "warmer": [
      "你提酒，我記得你講過。",
      "飲完你望我，再講你想點。",
      "你話酒，夜深我都聽一句。",
      "你清醒少少，我再同你傾。"
    ],
    "sharp": [
      "你收起酒話，你交檔。",
      "你清醒啲，而家講正事。",
      "酒我唔陪，你講你嘅檔。",
      "你飲完先回我一句。"
    ]
  },
  "電話": {
    "cold": [
      "你提電話，你震完都唔回我。",
      "來電你只准講重點。",
      "你話要打，你而家回我一句。",
      "電話我聽到，你唔好裝忙。"
    ],
    "wary": [
      "你提電話，你想我打定怕我打。",
      "通話可以，廢話我唔要。",
      "你話電話，你先回我先算。",
      "你唔好淨係望住螢幕，你出聲。"
    ],
    "warmer": [
      "你提電話，我聽得到你喺另一邊。",
      "你回我，唔好淨係望住個屏。",
      "你話要打，我等你一句。",
      "電話之後，你望我再講。"
    ],
    "sharp": [
      "你而家回我電話，你講一句。",
      "你唔好裝聽唔到，你出聲。",
      "來電你快啲接，我等你講。",
      "你靜咗，你而家回我。"
    ]
  },
  "簡報": {
    "cold": [
      "你講緊簡報，你繼續講邊頁。",
      "簡報未講完，你唔好跳去第二樣。",
      "你頭先講簡報，我留低，你再講重點。",
      "你講簡報，頁數你講清楚。"
    ],
    "wary": [
      "簡報未改完你就傾其他，次序亂。",
      "你講簡報，頁碼你報清楚。",
      "你頭先跳開簡報，你返去講。",
      "我聽到簡報，你未講完就繼續。"
    ],
    "warmer": [
      "你肯改簡報，我肯再睇一輪。",
      "簡報你交得出，我再同你傾。",
      "你頭先講簡報，我等你下一頁。",
      "你講簡報，我留低聽你。"
    ],
    "sharp": [
      "你簡報而家交，唔好再拖。",
      "你唔好再拖呢頁簡報。",
      "簡報先，你一句講重點。",
      "你講完簡報之前，唔好換話題。"
    ]
  },
  "會議": {
    "cold": [
      "你提會議，會外先講私人嘢。",
      "會未散，你收聲講正事。",
      "你話開完會，你交得出先算。",
      "會議我聽到，你唔好借題。"
    ],
    "wary": [
      "你提會議，你想借題定想對時間。",
      "時間你自己對，你講你準備好未。",
      "你話會議，我未見到你嘅頁。",
      "會開完你先講其他，而家未得。"
    ],
    "warmer": [
      "會開完，我可以再聽你一句。",
      "你提會議，你開完仲留低，我知。",
      "會議之後你仲喺度，我等你。",
      "你話會完，你望我再講。"
    ],
    "sharp": [
      "你會議準時，而家唔好散。",
      "私人留到會後，你先講正事。",
      "你唔好借會議拖，你交。",
      "你一句講你會議準備到邊。"
    ]
  },
  "電梯": {
    "cold": [
      "你話要搭上去，你到層先講。",
      "你未出廂，你講重點。",
      "你提電梯，你上下都要交檔。",
      "我聽到你講上去，你唔好喺入面試探。"
    ],
    "wary": [
      "你想上去，你到咗先講。",
      "你喺入面，你唔好試我。",
      "你提電梯，你收聲到門開。",
      "你話層數，你講清楚。"
    ],
    "warmer": [
      "你到層，你望我再講。",
      "你話上去，我等你出嚟先聽。",
      "電梯門開咗，你出嚟再講。",
      "你喺入面，我聽得到你。"
    ],
    "sharp": [
      "你出嚟先講，而家收聲。",
      "你到層再交，唔好喺入面拖。",
      "你提電梯，你快啲講完。",
      "你唔好喺入面試探，你出嚟講。"
    ]
  },
  "上司": {
    "cold": [
      "你提上司，職位你清楚就得。",
      "評估喺我手，你唔好爭。",
      "你話上司，你想告狀定想靠。",
      "我聽到你講上司，你記住邊個簽。"
    ],
    "wary": [
      "你提上司，你想靠定想頂。",
      "職位清楚，你下一句講工作。",
      "你話我係上司，你就交檔。",
      "你借上司拖，我當你未做。"
    ],
    "warmer": [
      "你叫上司可以，叫完你想點。",
      "你提上司，你仲望住我。",
      "職位之外，你講你想我點。",
      "我聽到你講上司，我留低聽你。"
    ],
    "sharp": [
      "你記住邊個簽你，你交。",
      "職位唔係玩，你講正事。",
      "你提上司，你一句就夠。",
      "你唔好再爭，評估我寫。"
    ]
  }
};

const TOPIC_ECHO_MORGAN = {
  "加班": {
    "cold": [
      "你話加班，條款唔會因你喊而改。",
      "夜未完，你講你留定走。",
      "你留低加班，我當你有句未講。",
      "加班我聽到，數字聽朝先算。"
    ],
    "wary": [
      "你提加班，你想我留你定想拖價。",
      "你做到好夜，你俾我一個決定。",
      "你話加班，你唔好用佢嚟避談。",
      "夜班可以，你裝忙就唔得。"
    ],
    "warmer": [
      "你加班我睇到，我未收你呢杯。",
      "夜深你仲喺度，我當你想留。",
      "你肯留低，我肯聽多一句真心。",
      "你話加班，我等你講你想點。"
    ],
    "sharp": [
      "你少講加班，你講你決定。",
      "夜班換唔到條款，你而家揀。",
      "你而家答，唔好再話攰。",
      "你講完加班，我要你嘅句。"
    ]
  },
  "門": {
    "cold": [
      "你提門，你想走就先講你嘅決定。",
      "你想出門，你先放低你嘅句。",
      "門你自己揀，我唔挽留。",
      "你企喺門邊，你講留定走。"
    ],
    "wary": [
      "你提門，你想逃價定想留。",
      "你話走，後悔你自己吞。",
      "門邊唔好表演，你講一句。",
      "你想入，你問我准未。"
    ],
    "warmer": [
      "門開住，你返到我再聽你。",
      "你企喺門邊，我當你有句未講。",
      "你話要走，我記得你今晚留過。",
      "你慢慢行，我唔攔你。"
    ],
    "sharp": [
      "你快啲揀，留定出。",
      "你唔好喺門邊拖價。",
      "你而家講，走定留。",
      "你出門之前，你交個決定。"
    ]
  },
  "酒": {
    "cold": [
      "你提酒，飲完先講真心。",
      "醉唔係你嘅籌碼，你講決定。",
      "你話飲酒，我當你想賴數。",
      "酒之後，你仲要答我。"
    ],
    "wary": [
      "你提酒，你想鬆定想亂價。",
      "飲完你再講一次清醒版。",
      "你話酒，我未收你呢句。",
      "你想再斟，你先講你留幾耐。"
    ],
    "warmer": [
      "你提酒，我留低等你清醒講。",
      "飲完你望我，再講你想留幾耐。",
      "你話酒，我聽一句就收你呢杯。",
      "你清醒少少，我再同你傾人。"
    ],
    "sharp": [
      "你收起酒話，你講決定。",
      "你清醒啲，而家答我。",
      "酒我可以收，你先講。",
      "你飲完先回我一句真心。"
    ]
  },
  "電話": {
    "cold": [
      "你提電話，你未回我，我未收杯。",
      "你話要打，你而家講你決定。",
      "來電你只講人，唔好講數字。",
      "電話我聽到，你唔好裝睇窗外。"
    ],
    "wary": [
      "你提電話，你想我打定怕我問價。",
      "你通話可以，甜言我唔收。",
      "你話電話，你先回我一句真心。",
      "你唔好淨係望住個屏，你出聲答。"
    ],
    "warmer": [
      "你提電話，我聽得到你未掛線。",
      "你回我，我留低等你呢句。",
      "你話要打，我等你講你想留幾耐。",
      "電話之後，你望我講你想留幾耐。"
    ],
    "sharp": [
      "你而家回我電話，你講你決定。",
      "你唔好裝聽唔到，你出聲答我。",
      "來電你快啲接，你一句就夠。",
      "你靜咗，你而家回我個決定。"
    ]
  },
  "簡報": {
    "cold": [
      "你講緊簡報，你講完先談你自己。",
      "簡報未完，你唔好攞嚟避我。",
      "你頭先講簡報，我留低，你再講你嘅決定。",
      "你講簡報，頁數同你嘅決定一齊講。"
    ],
    "wary": [
      "簡報未完你就轉話題，我當你想拖。",
      "你講簡報，你話我知你想我睇邊頁。",
      "你頭先跳開簡報，你返去講完。",
      "我聽到簡報，數字聽朝先算，你而家講人。"
    ],
    "warmer": [
      "你肯講簡報，我肯聽多一句。",
      "簡報你講完，我再問你想留幾耐。",
      "你頭先講簡報，我等你講真心。",
      "你講簡報，我望住你聽。"
    ],
    "sharp": [
      "你簡報一句講完，然後你答我。",
      "你唔好用簡報躲，你講決定。",
      "簡報先，你快啲講完佢。",
      "你未講完簡報，你唔好轉去第二處。"
    ]
  },
  "會議": {
    "cold": [
      "你提會議，聽朝先開，而家你講人。",
      "會未散，你唔好喺度談價。",
      "你話開完會，你俾我今晚嘅決定。",
      "會議我聽到，數字我另計。"
    ],
    "wary": [
      "你提會議，你想避我定想對時間。",
      "你話會議，你準備嘅係條款定係人。",
      "會未完，你唔好轉去甜言。",
      "你借會議拖，我當你未答。"
    ],
    "warmer": [
      "會開完，我可以再聽你一句真心。",
      "你提會議，你開完仲留，我當你想傾。",
      "會議之後你仲喺度，我等你決定。",
      "你話會完，你望我講你決定。"
    ],
    "sharp": [
      "你會議聽朝先算，而家你答我。",
      "你唔好借會拖，你講留定走。",
      "你一句講你今晚嘅決定。",
      "會未散都好，你先答我。"
    ]
  },
  "電梯": {
    "cold": [
      "你話要上去，你到層先講你決定。",
      "你未出廂，你唔好喺入面談價。",
      "你提電梯，你收聲，出嚟再答我。",
      "我聽到你講上去，你講留定走。"
    ],
    "wary": [
      "你想上去，你到咗先講真心。",
      "你喺入面，你唔好試探我。",
      "你提電梯，你一句就夠。",
      "你話層數，你同決定一齊講。"
    ],
    "warmer": [
      "你到層，你望我講留定走。",
      "你話上去，我等你出嚟再答。",
      "電梯門開，你出嚟坐低再講。",
      "你喺入面，我聽得到你未講完。"
    ],
    "sharp": [
      "你出嚟先答，而家收聲。",
      "你到層再答，唔好喺入面拖。",
      "你提電梯，你快啲揀。",
      "你唔好喺入面談，你出嚟答。"
    ]
  },
  "上司": {
    "cold": [
      "你提上司，我唔係你份評估表。",
      "你話上司，你想我幫你定想我簽。",
      "職位你清楚，而家你講人。",
      "我聽到你講上司，決定你自己講。"
    ],
    "wary": [
      "你提上司，你想靠我定想談價。",
      "你借職位拖，我當你未答。",
      "你話我大，你就俾我決定。",
      "你下一句講你自己，唔好講銜頭。"
    ],
    "warmer": [
      "你叫我可以，叫完你想留幾耐。",
      "你提上司，你仲望住我未走。",
      "職位之外，你講你嘅真心。",
      "我聽到你講上司，我留低等你決定。"
    ],
    "sharp": [
      "你記住邊個聽朝先算，你而家答。",
      "你唔好再爭銜，你講決定。",
      "你提上司，你一句講決定。",
      "你唔好攞職位躲，你答我。"
    ]
  }
};

const TOPIC_ECHO_SAM = {
  "加班": {
    "cold": [
      "你話加班，你食完再改頁。",
      "夜班未完，你唔好空肚簽。",
      "你留低加班，我可以陪你改一截。",
      "加班得，錯字我幫你圈。"
    ],
    "wary": [
      "你提加班，你想我教定想我代。",
      "你做到好夜，你指俾我睇邊頁。",
      "你話加班，你唔好用佢嚟唔改。",
      "夜班可以，你空肚就唔得。"
    ],
    "warmer": [
      "你加班我睇到，麵我可以分你。",
      "夜深你仲對住頁，至少你認真。",
      "你肯留低問，我肯教你呢格。",
      "你話加班，我等你改完呢行。"
    ],
    "sharp": [
      "你少講加班，你改頁。",
      "夜班換唔到寬限，你落筆。",
      "你而家改，唔好再話眼瞓。",
      "你講完加班，我要見到你改咗邊行。"
    ]
  },
  "門": {
    "cold": [
      "你提門，你走就要自己拍卡。",
      "門禁你自己搞掂，我唔代按。",
      "你企喺門邊，你講你改完未。",
      "你話要走，頁你存低先。"
    ],
    "wary": [
      "你提門，你想收工定想我再教。",
      "你話走，錯字你聽朝自己認。",
      "門邊唔好企到頸凍，你講。",
      "你想入嚟，你話我知邊頁。"
    ],
    "warmer": [
      "門開住，你聽朝返到續呢頁。",
      "你企喺門邊，我當你有格未改。",
      "你話要走，我記得你改到邊。",
      "你慢慢行，燈我等你出先關。"
    ],
    "sharp": [
      "你快啲揀，改定走。",
      "你唔好喺門邊晃。",
      "你而家拍卡，定你坐低改。",
      "你出門之前，你話我知改到第幾行。"
    ]
  },
  "酒": {
    "cold": [
      "你提酒，飲完你都會簽錯字。",
      "醉唔係理由，你返去改頁。",
      "你話飲酒，我當你想避改。",
      "酒之後，你對住頁再講。"
    ],
    "wary": [
      "你提酒，你想鬆定想我代筆。",
      "飲完你講你卡住邊格。",
      "你話酒，我未見到你醒到可以改。",
      "你想飲，你先改完呢行。"
    ],
    "warmer": [
      "你提酒，我等你清醒再教。",
      "飲完你食兩口，再講你想點。",
      "你話酒，我聽一句就趕你返去改。",
      "你清醒少少，我再指俾你睇。"
    ],
    "sharp": [
      "你收起酒話，你改頁。",
      "你清醒啲，而家落筆。",
      "酒我唔陪，你講邊格。",
      "你飲完先回我你改到邊。"
    ]
  },
  "電話": {
    "cold": [
      "你提電話，你震完都唔回我教你。",
      "你話要打，你而家講你卡住邊頁。",
      "來電你只講頁，唔好講第二樣。",
      "電話我聽到，你唔好裝睇手機。"
    ],
    "wary": [
      "你提電話，你想我打定怕我問頁。",
      "通話可以，你先講你唔明邊格。",
      "你話電話，你先回我先算教。",
      "你唔好淨係望住個屏，你打字。"
    ],
    "warmer": [
      "你提電話，我聽得到你未掛。",
      "你回我，我留低等你問。",
      "你話要打，我等你講第幾頁。",
      "電話之後，你指俾我睇。"
    ],
    "sharp": [
      "你而家回我電話，你講邊頁。",
      "你唔好裝聽唔到，你出聲問。",
      "來電你快啲接，我等你講格。",
      "你靜咗，你而家話我知邊行。"
    ]
  },
  "簡報": {
    "cold": [
      "你講緊簡報，你話我知邊頁卡住。",
      "簡報未改完，你食完都要講落去。",
      "你頭先講簡報，我幫你記低，你再講。",
      "你講簡報，唔好跳去第二樣。"
    ],
    "wary": [
      "簡報未改完你就傾其他，你返去第幾頁。",
      "你講簡報，頁碼你指俾我睇。",
      "你頭先跳開簡報，你返到未改嗰頁。",
      "我聽到簡報，你繼續講你唔明邊格。"
    ],
    "warmer": [
      "你肯改簡報，我陪你改完呢截。",
      "簡報你講得出，我再教你下一頁。",
      "你頭先講簡報，我等你問。",
      "你講簡報，我坐低聽你。"
    ],
    "sharp": [
      "你簡報而家講邊頁，唔好再拖。",
      "你唔好再拖呢頁簡報，你改。",
      "簡報先，你一句講卡住邊。",
      "你講完簡報之前，唔好收工。"
    ]
  },
  "會議": {
    "cold": [
      "你提會議，你會前改完呢頁先算。",
      "會未散，你收聲，頁你繼續改。",
      "你話開完會，你話我知邊頁未動。",
      "會議我聽到，你唔好借題唔改。"
    ],
    "wary": [
      "你提會議，你想避改定想我幫你對稿。",
      "你話會議，你準備到第幾頁。",
      "會未完，你唔好轉去閒聊。",
      "你借會議拖，我當你未改。"
    ],
    "warmer": [
      "會開完，我可以再教你一頁。",
      "你提會議，你開完仲留，我陪你改。",
      "會議之後你仲喺度，我等你問。",
      "你話會完，你指俾我睇邊格。"
    ],
    "sharp": [
      "你會議之前交頁，而家改。",
      "你唔好借會拖，你落筆。",
      "你一句講你準備到邊頁。",
      "會未散都好，你先改你嘅行。"
    ]
  },
  "電梯": {
    "cold": [
      "你話要搭上去，你到層先講邊頁。",
      "你未出廂，你唔好喺入面問我。",
      "你提電梯，你出嚟我先教。",
      "我聽到你講上去，你話我知第幾頁。"
    ],
    "wary": [
      "你想上去，你到咗先指俾我睇。",
      "你喺入面，你唔好裝唔識。",
      "你提電梯，你一句講邊格。",
      "你話層數，你同頁碼一齊講。"
    ],
    "warmer": [
      "你到層，你坐低我再教。",
      "你話上去，我等你出嚟再教。",
      "電梯門開，你出嚟再問。",
      "你喺入面，我聽得到你未問完。"
    ],
    "sharp": [
      "你出嚟先問，而家收聲。",
      "你到層再改，唔好喺入面拖。",
      "你提電梯，你快啲講邊頁。",
      "你唔好喺入面問，你出嚟講。"
    ]
  },
  "上司": {
    "cold": [
      "你提上司，頂嘴你留俾樓上。",
      "我呢度只教路，你叫我前輩就得。",
      "你話上司，你想我幫你改定想告狀。",
      "我聽到你講上司，你返去改你嘅頁。"
    ],
    "wary": [
      "你提上司，你想靠我教定想我頂你。",
      "你借職位拖，我當你未改。",
      "你話我前輩，你就聽我指。",
      "你下一句講邊頁，唔好講銜頭。"
    ],
    "warmer": [
      "你叫前輩可以，叫完你問邊格。",
      "你提上司，你仲坐喺度。",
      "職位之外，你講你唔明邊行。",
      "我聽到你講上司，我留低教你。"
    ],
    "sharp": [
      "你記住邊個教你，你落筆。",
      "你唔好再爭，你改頁。",
      "你提上司，你一句講邊頁。",
      "你唔好攞職位躲，你講邊格。"
    ]
  }
};

const SCENE_ASIDE_BY_KEY = {
  office: {
    cold: [
      "你喺枱邊，你交得出先算。",
      "我喺枱邊聽住，你講重點，唔好寒暄。",
      "檔放喺枱面，我只睇結果。",
      "你對住螢幕，你唔好拖時間。"
    ],
    wary: [
      "你喺枱邊，你想我放行定想我趕人，你講。",
      "我喺枱邊聽住，你講清楚你求咩。",
      "檔放喺枱面，你唔好試我耐心。",
      "你對住螢幕，你下一句要有用。"
    ],
    warmer: [
      "你喺枱邊，我睇到你留低。",
      "我喺枱邊聽住，你講，我聽住。",
      "檔放喺枱面，你肯認真，我肯多聽一句。",
      "你對住螢幕，你坐近少少再講。"
    ],
    sharp: [
      "你喺枱邊，你快啲講完。",
      "我喺枱邊聽住，你唔好再拖。",
      "檔放喺枱面，你一句就夠。",
      "你對住螢幕，你而家交答覆。"
    ]
  },
  corridor: {
    cold: [
      "你喺走廊，你交得出先算。",
      "我喺走廊聽住，你講重點，唔好寒暄。",
      "你企喺走廊，我只睇結果。",
      "走廊未行完，你唔好拖時間。"
    ],
    wary: [
      "你喺走廊，你想我放行定想我趕人，你講。",
      "我喺走廊聽住，你講清楚你求咩。",
      "你企喺走廊，你唔好試我耐心。",
      "走廊未行完，你下一句要有用。"
    ],
    warmer: [
      "你喺走廊，我睇到你留低。",
      "我喺走廊聽住，你講，我聽住。",
      "你企喺走廊，你肯認真，我肯多聽一句。",
      "走廊未行完，你坐近少少再講。"
    ],
    sharp: [
      "你喺走廊，你快啲講完。",
      "我喺走廊聽住，你唔好再拖。",
      "你企喺走廊，你一句就夠。",
      "走廊未行完，你而家交答覆。"
    ]
  },
  pantry: {
    cold: [
      "你喺茶水間，你交得出先算。",
      "杯麵未涼，你講重點，唔好寒暄。",
      "影印機停咗，我只睇結果。",
      "我喺茶水間等你，你唔好拖時間。"
    ],
    wary: [
      "你喺茶水間，你想我放行定想我趕人，你講。",
      "杯麵未涼，你講清楚你求咩。",
      "影印機停咗，你唔好試我耐心。",
      "我喺茶水間等你，你下一句要有用。"
    ],
    warmer: [
      "你喺茶水間，我睇到你留低。",
      "杯麵未涼，你講，我聽住。",
      "影印機停咗，你肯認真，我肯多聽一句。",
      "我喺茶水間等你，你坐近少少再講。"
    ],
    sharp: [
      "你喺茶水間，你快啲講完。",
      "杯麵未涼，你唔好再拖。",
      "影印機停咗，你一句就夠。",
      "我喺茶水間等你，你而家交答覆。"
    ]
  },
  lounge: {
    cold: [
      "你喺酒廊，你交得出先算。",
      "酒廊呢度，你講重點，唔好寒暄。",
      "我喺酒廊聽住，我只睇結果。",
      "你企喺杯邊，你唔好拖時間。"
    ],
    wary: [
      "你喺酒廊，你想我放行定想我趕人，你講。",
      "酒廊呢度，你講清楚你求咩。",
      "我喺酒廊聽住，你唔好試我耐心。",
      "你企喺杯邊，你下一句要有用。"
    ],
    warmer: [
      "你喺酒廊，我睇到你留低。",
      "酒廊呢度，你講，我聽住。",
      "我喺酒廊聽住，你肯認真，我肯多聽一句。",
      "你企喺杯邊，你坐近少少再講。"
    ],
    sharp: [
      "你喺酒廊，你快啲講完。",
      "酒廊呢度，你唔好再拖。",
      "我喺酒廊聽住，你一句就夠。",
      "你企喺杯邊，你而家交答覆。"
    ]
  },
  lift: {
    cold: [
      "你喺電梯，你交得出先算。",
      "電梯門未開，你講重點，唔好寒暄。",
      "我喺電梯聽住，我只睇結果。",
      "你企喺電梯入面，你唔好拖時間。"
    ],
    wary: [
      "你喺電梯，你想我放行定想我趕人，你講。",
      "電梯門未開，你講清楚你求咩。",
      "我喺電梯聽住，你唔好試我耐心。",
      "你企喺電梯入面，你下一句要有用。"
    ],
    warmer: [
      "你喺電梯，我睇到你留低。",
      "電梯門未開，你講，我聽住。",
      "我喺電梯聽住，你肯認真，我肯多聽一句。",
      "你企喺電梯入面，你坐近少少再講。"
    ],
    sharp: [
      "你喺電梯，你快啲講完。",
      "電梯門未開，你唔好再拖。",
      "我喺電梯聽住，你一句就夠。",
      "你企喺電梯入面，你而家交答覆。"
    ]
  },
  stairs: {
    cold: [
      "你喺樓梯，你交得出先算。",
      "你行到半級，你講重點，唔好寒暄。",
      "我喺樓梯聽住，我只睇結果。",
      "風從上面落，你唔好拖時間。"
    ],
    wary: [
      "你喺樓梯，你想我放行定想我趕人，你講。",
      "你行到半級，你講清楚你求咩。",
      "我喺樓梯聽住，你唔好試我耐心。",
      "風從上面落，你下一句要有用。"
    ],
    warmer: [
      "你喺樓梯，我睇到你留低。",
      "你行到半級，你講，我聽住。",
      "我喺樓梯聽住，你肯認真，我肯多聽一句。",
      "風從上面落，你坐近少少再講。"
    ],
    sharp: [
      "你喺樓梯，你快啲講完。",
      "你行到半級，你唔好再拖。",
      "我喺樓梯聽住，你一句就夠。",
      "風從上面落，你而家交答覆。"
    ]
  },
  roof: {
    cold: [
      "你喺天台，你交得出先算。",
      "天台風大，你講重點，唔好寒暄。",
      "我喺天台聽住，我只睇結果。",
      "你企喺欄杆邊，你唔好拖時間。"
    ],
    wary: [
      "你喺天台，你想我放行定想我趕人，你講。",
      "天台風大，你講清楚你求咩。",
      "我喺天台聽住，你唔好試我耐心。",
      "你企喺欄杆邊，你下一句要有用。"
    ],
    warmer: [
      "你喺天台，我睇到你留低。",
      "天台風大，你講，我聽住。",
      "我喺天台聽住，你肯認真，我肯多聽一句。",
      "你企喺欄杆邊，你坐近少少再講。"
    ],
    sharp: [
      "你喺天台，你快啲講完。",
      "天台風大，你唔好再拖。",
      "我喺天台聽住，你一句就夠。",
      "你企喺欄杆邊，你而家交答覆。"
    ]
  },
  review: {
    cold: [
      "你喺會議室，你交得出先算。",
      "評核未寫完，你講重點，唔好寒暄。",
      "我喺會議室聽住，我只睇結果。",
      "表放喺你面前，你唔好拖時間。"
    ],
    wary: [
      "你喺會議室，你想我放行定想我趕人，你講。",
      "評核未寫完，你講清楚你求咩。",
      "我喺會議室聽住，你唔好試我耐心。",
      "表放喺你面前，你下一句要有用。"
    ],
    warmer: [
      "你喺會議室，我睇到你留低。",
      "評核未寫完，你講，我聽住。",
      "我喺會議室聽住，你肯認真，我肯多聽一句。",
      "表放喺你面前，你坐近少少再講。"
    ],
    sharp: [
      "你喺會議室，你快啲講完。",
      "評核未寫完，你唔好再拖。",
      "我喺會議室聽住，你一句就夠。",
      "表放喺你面前，你而家交答覆。"
    ]
  },
  dark: {
    cold: [
      "燈關住，你交得出先算。",
      "我喺黑度聽住，你講重點，唔好寒暄。",
      "你睇唔清都要出聲，我只睇結果。",
      "燈未亮，你唔好拖時間。"
    ],
    wary: [
      "燈關住，你想我放行定想我趕人，你講。",
      "我喺黑度聽住，你講清楚你求咩。",
      "你睇唔清都要出聲，你唔好試我耐心。",
      "燈未亮，你下一句要有用。"
    ],
    warmer: [
      "燈關住，我睇到你留低。",
      "我喺黑度聽住，你講，我聽住。",
      "你睇唔清都要出聲，你肯認真，我肯多聽一句。",
      "燈未亮，你坐近少少再講。"
    ],
    sharp: [
      "燈關住，你快啲講完。",
      "我喺黑度聽住，你唔好再拖。",
      "你睇唔清都要出聲，你一句就夠。",
      "燈未亮，你而家交答覆。"
    ]
  },
  close: {
    cold: [
      "你近咗，你交得出先算。",
      "你未答我，你講重點，唔好寒暄。",
      "你挨近之前，我只睇結果。",
      "呢一步，你唔好拖時間。"
    ],
    wary: [
      "你近咗，你想我放行定想我趕人，你講。",
      "你未答我，你講清楚你求咩。",
      "你挨近之前，你唔好試我耐心。",
      "呢一步，你下一句要有用。"
    ],
    warmer: [
      "你近咗，我睇到你留低。",
      "你未答我，你講，我聽住。",
      "你挨近之前，你肯認真，我肯多聽一句。",
      "呢一步，你坐近少少再講。"
    ],
    sharp: [
      "你近咗，你快啲講完。",
      "你未答我，你唔好再拖。",
      "你挨近之前，你一句就夠。",
      "呢一步，你而家交答覆。"
    ]
  }
};

const SCENE_ASIDE_MORGAN = {
  office: {
    cold: [
      "你喺枱邊，你講條款定講你自己。",
      "我喺枱邊聽住，你唔好裝忙。",
      "檔放喺枱面，你先講完心事再算。",
      "你對住螢幕，你俾我一個決定。"
    ],
    wary: [
      "你喺枱邊，你想談價定想近我，你講。",
      "我喺枱邊聽住，你講你求緊咩。",
      "檔放喺枱面，你唔好用甜言試我。",
      "你對住螢幕，你下一句要出價。"
    ],
    warmer: [
      "你喺枱邊，我留低等你講。",
      "我喺枱邊聽住，你望住我再講。",
      "檔放喺枱面，你肯認真，我肯聽多一句。",
      "你對住螢幕，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺枱邊，你快啲揀。",
      "我喺枱邊聽住，你唔好再繞。",
      "檔放喺枱面，你一句講你決定。",
      "你對住螢幕，你而家答我。"
    ]
  },
  corridor: {
    cold: [
      "你喺走廊，你講條款定講你自己。",
      "我喺走廊聽住，你唔好裝忙。",
      "你企喺走廊，你先講完心事再算。",
      "走廊未行完，你俾我一個決定。"
    ],
    wary: [
      "你喺走廊，你想談價定想近我，你講。",
      "我喺走廊聽住，你講你求緊咩。",
      "你企喺走廊，你唔好用甜言試我。",
      "走廊未行完，你下一句要出價。"
    ],
    warmer: [
      "你喺走廊，我留低等你講。",
      "我喺走廊聽住，你望住我再講。",
      "你企喺走廊，你肯認真，我肯聽多一句。",
      "走廊未行完，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺走廊，你快啲揀。",
      "我喺走廊聽住，你唔好再繞。",
      "你企喺走廊，你一句講你決定。",
      "走廊未行完，你而家答我。"
    ]
  },
  pantry: {
    cold: [
      "你喺茶水間，你講條款定講你自己。",
      "杯麵未涼，你唔好裝忙。",
      "影印機停咗，你先講完心事再算。",
      "我喺茶水間等你，你俾我一個決定。"
    ],
    wary: [
      "你喺茶水間，你想談價定想近我，你講。",
      "杯麵未涼，你講你求緊咩。",
      "影印機停咗，你唔好用甜言試我。",
      "我喺茶水間等你，你下一句要出價。"
    ],
    warmer: [
      "你喺茶水間，我留低等你講。",
      "杯麵未涼，你望住我再講。",
      "影印機停咗，你肯認真，我肯聽多一句。",
      "我喺茶水間等你，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺茶水間，你快啲揀。",
      "杯麵未涼，你唔好再繞。",
      "影印機停咗，你一句講你決定。",
      "我喺茶水間等你，你而家答我。"
    ]
  },
  lounge: {
    cold: [
      "你喺酒廊，你講條款定講你自己。",
      "房卡仲喺枱，你唔好裝忙。",
      "我喺酒廊聽住，你先講完心事再算。",
      "你企喺杯邊，你俾我一個決定。"
    ],
    wary: [
      "你喺酒廊，你想談價定想近我，你講。",
      "房卡仲喺枱，你講你求緊咩。",
      "我喺酒廊聽住，你唔好用甜言試我。",
      "你企喺杯邊，你下一句要出價。"
    ],
    warmer: [
      "你喺酒廊，我留低等你講。",
      "房卡仲喺枱，你望住我再講。",
      "我喺酒廊聽住，你肯認真，我肯聽多一句。",
      "你企喺杯邊，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺酒廊，你快啲揀。",
      "房卡仲喺枱，你唔好再繞。",
      "我喺酒廊聽住，你一句講你決定。",
      "你企喺杯邊，你而家答我。"
    ]
  },
  lift: {
    cold: [
      "你喺電梯，你講條款定講你自己。",
      "電梯門未開，你唔好裝忙。",
      "我喺電梯聽住，你先講完心事再算。",
      "你企喺電梯入面，你俾我一個決定。"
    ],
    wary: [
      "你喺電梯，你想談價定想近我，你講。",
      "電梯門未開，你講你求緊咩。",
      "我喺電梯聽住，你唔好用甜言試我。",
      "你企喺電梯入面，你下一句要出價。"
    ],
    warmer: [
      "你喺電梯，我留低等你講。",
      "電梯門未開，你望住我再講。",
      "我喺電梯聽住，你肯認真，我肯聽多一句。",
      "你企喺電梯入面，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺電梯，你快啲揀。",
      "電梯門未開，你唔好再繞。",
      "我喺電梯聽住，你一句講你決定。",
      "你企喺電梯入面，你而家答我。"
    ]
  },
  stairs: {
    cold: [
      "你喺樓梯，你講條款定講你自己。",
      "你行到半級，你唔好裝忙。",
      "我喺樓梯聽住，你先講完心事再算。",
      "風從上面落，你俾我一個決定。"
    ],
    wary: [
      "你喺樓梯，你想談價定想近我，你講。",
      "你行到半級，你講你求緊咩。",
      "我喺樓梯聽住，你唔好用甜言試我。",
      "風從上面落，你下一句要出價。"
    ],
    warmer: [
      "你喺樓梯，我留低等你講。",
      "你行到半級，你望住我再講。",
      "我喺樓梯聽住，你肯認真，我肯聽多一句。",
      "風從上面落，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺樓梯，你快啲揀。",
      "你行到半級，你唔好再繞。",
      "我喺樓梯聽住，你一句講你決定。",
      "風從上面落，你而家答我。"
    ]
  },
  roof: {
    cold: [
      "你喺天台，你講條款定講你自己。",
      "天台風大，你唔好裝忙。",
      "我喺天台聽住，你先講完心事再算。",
      "你企喺欄杆邊，你俾我一個決定。"
    ],
    wary: [
      "你喺天台，你想談價定想近我，你講。",
      "天台風大，你講你求緊咩。",
      "我喺天台聽住，你唔好用甜言試我。",
      "你企喺欄杆邊，你下一句要出價。"
    ],
    warmer: [
      "你喺天台，我留低等你講。",
      "天台風大，你望住我再講。",
      "我喺天台聽住，你肯認真，我肯聽多一句。",
      "你企喺欄杆邊，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺天台，你快啲揀。",
      "天台風大，你唔好再繞。",
      "我喺天台聽住，你一句講你決定。",
      "你企喺欄杆邊，你而家答我。"
    ]
  },
  review: {
    cold: [
      "你喺會議室，你講條款定講你自己。",
      "評核未寫完，你唔好裝忙。",
      "我喺會議室聽住，你先講完心事再算。",
      "表放喺你面前，你俾我一個決定。"
    ],
    wary: [
      "你喺會議室，你想談價定想近我，你講。",
      "評核未寫完，你講你求緊咩。",
      "我喺會議室聽住，你唔好用甜言試我。",
      "表放喺你面前，你下一句要出價。"
    ],
    warmer: [
      "你喺會議室，我留低等你講。",
      "評核未寫完，你望住我再講。",
      "我喺會議室聽住，你肯認真，我肯聽多一句。",
      "表放喺你面前，你坐近少少再講真心。"
    ],
    sharp: [
      "你喺會議室，你快啲揀。",
      "評核未寫完，你唔好再繞。",
      "我喺會議室聽住，你一句講你決定。",
      "表放喺你面前，你而家答我。"
    ]
  },
  dark: {
    cold: [
      "燈關住，你講條款定講你自己。",
      "我喺黑度聽住，你唔好裝忙。",
      "你睇唔清都要出聲，你先講完心事再算。",
      "燈未亮，你俾我一個決定。"
    ],
    wary: [
      "燈關住，你想談價定想近我，你講。",
      "我喺黑度聽住，你講你求緊咩。",
      "你睇唔清都要出聲，你唔好用甜言試我。",
      "燈未亮，你下一句要出價。"
    ],
    warmer: [
      "燈關住，我留低等你講。",
      "我喺黑度聽住，你望住我再講。",
      "你睇唔清都要出聲，你肯認真，我肯聽多一句。",
      "燈未亮，你坐近少少再講真心。"
    ],
    sharp: [
      "燈關住，你快啲揀。",
      "我喺黑度聽住，你唔好再繞。",
      "你睇唔清都要出聲，你一句講你決定。",
      "燈未亮，你而家答我。"
    ]
  },
  close: {
    cold: [
      "你近咗，你講條款定講你自己。",
      "你未答我，你唔好裝忙。",
      "你挨近之前，你先講完心事再算。",
      "呢一步，你俾我一個決定。"
    ],
    wary: [
      "你近咗，你想談價定想近我，你講。",
      "你未答我，你講你求緊咩。",
      "你挨近之前，你唔好用甜言試我。",
      "呢一步，你下一句要出價。"
    ],
    warmer: [
      "你近咗，我留低等你講。",
      "你未答我，你望住我再講。",
      "你挨近之前，你肯認真，我肯聽多一句。",
      "呢一步，你坐近少少再講真心。"
    ],
    sharp: [
      "你近咗，你快啲揀。",
      "你未答我，你唔好再繞。",
      "你挨近之前，你一句講你決定。",
      "呢一步，你而家答我。"
    ]
  }
};

const SCENE_ASIDE_SAM = {
  office: {
    cold: [
      "你喺枱邊，你講邊頁。",
      "我喺枱邊聽住，你改完先算。",
      "檔放喺枱面，你叫我一聲前輩就得。",
      "你對住螢幕，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺枱邊，你想我教定想我代筆，你講。",
      "我喺枱邊聽住，你指俾我睇邊格。",
      "檔放喺枱面，你唔好裝唔識。",
      "你對住螢幕，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺枱邊，我留低等你問。",
      "我喺枱邊聽住，你食兩口再講。",
      "檔放喺枱面，你肯問，我肯教。",
      "你對住螢幕，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺枱邊，你快啲改。",
      "我喺枱邊聽住，你唔好再拖頁。",
      "檔放喺枱面，你一句講邊格。",
      "你對住螢幕，你而家落筆。"
    ]
  },
  corridor: {
    cold: [
      "你喺走廊，你講邊頁。",
      "我喺走廊聽住，你改完先算。",
      "你企喺走廊，你叫我一聲前輩就得。",
      "走廊未行完，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺走廊，你想我教定想我代筆，你講。",
      "我喺走廊聽住，你指俾我睇邊格。",
      "你企喺走廊，你唔好裝唔識。",
      "走廊未行完，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺走廊，我留低等你問。",
      "我喺走廊聽住，你食兩口再講。",
      "你企喺走廊，你肯問，我肯教。",
      "走廊未行完，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺走廊，你快啲改。",
      "我喺走廊聽住，你唔好再拖頁。",
      "你企喺走廊，你一句講邊格。",
      "走廊未行完，你而家落筆。"
    ]
  },
  pantry: {
    cold: [
      "你喺茶水間，你講邊頁。",
      "杯麵未涼，你改完先算。",
      "影印機停咗，你叫我一聲前輩就得。",
      "我喺茶水間等你，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺茶水間，你想我教定想我代筆，你講。",
      "杯麵未涼，你指俾我睇邊格。",
      "影印機停咗，你唔好裝唔識。",
      "我喺茶水間等你，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺茶水間，我留低等你問。",
      "杯麵未涼，你食兩口再講。",
      "影印機停咗，你肯問，我肯教。",
      "我喺茶水間等你，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺茶水間，你快啲改。",
      "杯麵未涼，你唔好再拖頁。",
      "影印機停咗，你一句講邊格。",
      "我喺茶水間等你，你而家落筆。"
    ]
  },
  lounge: {
    cold: [
      "你喺酒廊，你講邊頁。",
      "酒廊呢度，你改完先算。",
      "我喺酒廊聽住，你叫我一聲前輩就得。",
      "你企喺杯邊，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺酒廊，你想我教定想我代筆，你講。",
      "酒廊呢度，你指俾我睇邊格。",
      "我喺酒廊聽住，你唔好裝唔識。",
      "你企喺杯邊，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺酒廊，我留低等你問。",
      "酒廊呢度，你食兩口再講。",
      "我喺酒廊聽住，你肯問，我肯教。",
      "你企喺杯邊，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺酒廊，你快啲改。",
      "酒廊呢度，你唔好再拖頁。",
      "我喺酒廊聽住，你一句講邊格。",
      "你企喺杯邊，你而家落筆。"
    ]
  },
  lift: {
    cold: [
      "你喺電梯，你講邊頁。",
      "電梯門未開，你改完先算。",
      "我喺電梯聽住，你叫我一聲前輩就得。",
      "你企喺電梯入面，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺電梯，你想我教定想我代筆，你講。",
      "電梯門未開，你指俾我睇邊格。",
      "我喺電梯聽住，你唔好裝唔識。",
      "你企喺電梯入面，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺電梯，我留低等你問。",
      "電梯門未開，你食兩口再講。",
      "我喺電梯聽住，你肯問，我肯教。",
      "你企喺電梯入面，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺電梯，你快啲改。",
      "電梯門未開，你唔好再拖頁。",
      "我喺電梯聽住，你一句講邊格。",
      "你企喺電梯入面，你而家落筆。"
    ]
  },
  stairs: {
    cold: [
      "你喺樓梯，你講邊頁。",
      "你行到半級，你改完先算。",
      "我喺樓梯聽住，你叫我一聲前輩就得。",
      "風從上面落，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺樓梯，你想我教定想我代筆，你講。",
      "你行到半級，你指俾我睇邊格。",
      "我喺樓梯聽住，你唔好裝唔識。",
      "風從上面落，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺樓梯，我留低等你問。",
      "你行到半級，你食兩口再講。",
      "我喺樓梯聽住，你肯問，我肯教。",
      "風從上面落，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺樓梯，你快啲改。",
      "你行到半級，你唔好再拖頁。",
      "我喺樓梯聽住，你一句講邊格。",
      "風從上面落，你而家落筆。"
    ]
  },
  roof: {
    cold: [
      "你喺天台，你講邊頁。",
      "天台風大，你改完先算。",
      "我喺天台聽住，你叫我一聲前輩就得。",
      "你企喺欄杆邊，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺天台，你想我教定想我代筆，你講。",
      "天台風大，你指俾我睇邊格。",
      "我喺天台聽住，你唔好裝唔識。",
      "你企喺欄杆邊，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺天台，我留低等你問。",
      "天台風大，你食兩口再講。",
      "我喺天台聽住，你肯問，我肯教。",
      "你企喺欄杆邊，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺天台，你快啲改。",
      "天台風大，你唔好再拖頁。",
      "我喺天台聽住，你一句講邊格。",
      "你企喺欄杆邊，你而家落筆。"
    ]
  },
  review: {
    cold: [
      "你喺會議室，你講邊頁。",
      "評核未寫完，你改完先算。",
      "我喺會議室聽住，你叫我一聲前輩就得。",
      "表放喺你面前，你唔好空肚硬撐。"
    ],
    wary: [
      "你喺會議室，你想我教定想我代筆，你講。",
      "評核未寫完，你指俾我睇邊格。",
      "我喺會議室聽住，你唔好裝唔識。",
      "表放喺你面前，你下一句要講頁碼。"
    ],
    warmer: [
      "你喺會議室，我留低等你問。",
      "評核未寫完，你食兩口再講。",
      "我喺會議室聽住，你肯問，我肯教。",
      "表放喺你面前，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你喺會議室，你快啲改。",
      "評核未寫完，你唔好再拖頁。",
      "我喺會議室聽住，你一句講邊格。",
      "表放喺你面前，你而家落筆。"
    ]
  },
  dark: {
    cold: [
      "燈關住，你講邊頁。",
      "我喺黑度聽住，你改完先算。",
      "你睇唔清都要出聲，你叫我一聲前輩就得。",
      "燈未亮，你唔好空肚硬撐。"
    ],
    wary: [
      "燈關住，你想我教定想我代筆，你講。",
      "我喺黑度聽住，你指俾我睇邊格。",
      "你睇唔清都要出聲，你唔好裝唔識。",
      "燈未亮，你下一句要講頁碼。"
    ],
    warmer: [
      "燈關住，我留低等你問。",
      "我喺黑度聽住，你食兩口再講。",
      "你睇唔清都要出聲，你肯問，我肯教。",
      "燈未亮，你坐近，我指俾你睇。"
    ],
    sharp: [
      "燈關住，你快啲改。",
      "我喺黑度聽住，你唔好再拖頁。",
      "你睇唔清都要出聲，你一句講邊格。",
      "燈未亮，你而家落筆。"
    ]
  },
  close: {
    cold: [
      "你近咗，你講邊頁。",
      "你未答我，你改完先算。",
      "你挨近之前，你叫我一聲前輩就得。",
      "呢一步，你唔好空肚硬撐。"
    ],
    wary: [
      "你近咗，你想我教定想我代筆，你講。",
      "你未答我，你指俾我睇邊格。",
      "你挨近之前，你唔好裝唔識。",
      "呢一步，你下一句要講頁碼。"
    ],
    warmer: [
      "你近咗，我留低等你問。",
      "你未答我，你食兩口再講。",
      "你挨近之前，你肯問，我肯教。",
      "呢一步，你坐近，我指俾你睇。"
    ],
    sharp: [
      "你近咗，你快啲改。",
      "你未答我，你唔好再拖頁。",
      "你挨近之前，你一句講邊格。",
      "呢一步，你而家落筆。"
    ]
  }
};

const SAM_STAIR_NODES = {
  s3: 1, s3y: 1, s3z: 1, s3z2: 1, s3y2: 1, s3pre: 1,
};


/* ============================================================
   P0) Call mode + thoughts + memories
   ============================================================ */
const MAX_MEMORIES = 8;

function getCastId() {
  return state.storyId || (state.story && state.story.id) || "alex";
}

function getCast() {
  const id = getCastId();
  const pack = CAST_VOICE[id] || CAST_VOICE.alex;
  return {
    id,
    name: (state.story && (state.story.chatName || state.story.name)) || pack.name,
    toast: pack.toast,
    greeting: pack.greeting,
    greetings: (pack.greetings && pack.greetings.length) ? pack.greetings : (pack.greeting ? [pack.greeting] : []),
    incoming: pack.incoming,
    firstPing: pack.firstPing || pack.incoming,
    replies: pack.replies || CHAT_REPLIES,
    rules: pack.rules || CHAT_RULES,
  };
}

function clampMeter(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}



function noteChatActivity() {
  state.lastChatActivityAt = Date.now();
  hideIncomingToast();
  scheduleProactivePing();
}

function resetChatSessionMemory() {
  state.chatUserLines = [];
  state.chatBotLines = [];
  state.chatTopics = [];
  state.recentBotReplies = [];
  state.replyLedger = {};
  state.replyCursor = {};
  state.spokenTurns = [];
  state.glueSaidKey = "";
  state.openPlayer = null;
  state.halfFollow = null;
  state.offTopicStreak = 0;
  state.freeChatChoicesVisible = false;
  state.freeChatNodeId = null;
  state.guidanceThoughtActive = false;
  state.stashedNodeThought = null;
  state.proactiveCountOnNode = 0;
  state.proactiveNodeId = state.nodeId;
  state.proactiveCooldownUntil = 0;
  state.lastChatActivityAt = Date.now();
  state.sessionFirstPingSent = false;
  state.callBeatNodeId = "";
  state.pendingFactId = null;
  state.lastNotedTurn = "";
  state.lastNotedAt = 0;
}

/** Player/bot dialogue transcript (cap CHAT_MEM_N). GuidePolicy skims full available history — no separate memory brain. */
function pushChatMemory(role, text) {
  const line = String(text || "").trim();
  if (!line) return;
  if (role === "user") {
    state.chatUserLines = state.chatUserLines.concat(line).slice(-CHAT_MEM_N);
    extractTopicsFromText(line);
  } else {
    state.chatBotLines = state.chatBotLines.concat(line).slice(-CHAT_MEM_N);
    state.recentBotReplies = state.recentBotReplies.concat(line).slice(-CHAT_ANTIREPEAT_N);
  }
}

function extractTopicsFromText(text) {
  const t = String(text || "").toLowerCase();
  TOPIC_KEYS.forEach((row) => {
    if (row.keys.some((k) => t.includes(String(k).toLowerCase()))) {
      if (!state.chatTopics.includes(row.topic)) state.chatTopics.push(row.topic);
    }
  });
  state.chatTopics = state.chatTopics.slice(-6);
}

function toneFromMeters() {
  const heat = clampMeter(state.heat);
  const tension = clampMeter(state.tension);
  if (tension >= 55) return "sharp";
  if (heat >= 55 && tension < 45) return "warmer";
  if (tension >= 35 || (heat >= 35 && heat < 55)) return "wary";
  return "cold";
}

function syncChatTone() {
  const meter = toneFromMeters();
  const nodeMood = state.currentMood || "cold";
  if (nodeMood === "tense" && meter !== "warmer") state.chatTone = "sharp";
  else if (nodeMood === "intimate" && meter !== "sharp") state.chatTone = meter === "cold" ? "wary" : "warmer";
  else if (nodeMood === "soft" && meter === "cold") state.chatTone = "wary";
  else state.chatTone = meter;
  return state.chatTone;
}

function poolFor(bucket, tone) {
  const cast = getCast();
  const replies = cast.replies || CHAT_REPLIES;
  let pack = replies[bucket] || replies.default || CHAT_REPLIES.default;
  if (Array.isArray(pack)) return pack;
  const t = tone || state.chatTone || "cold";
  return pack[t] || pack.cold || pack.wary || Object.values(pack).find(Array.isArray) || CHAT_REPLIES.default.cold;
}

const REPLY_GLUE_TOKENS = ["走廊", "枱邊", "天台", "酒廊", "茶水間", "電梯", "會議室", "窗邊", "聽筒", "通話", "衫仍齊", "領口未扣", "燈關住", "衫濕", "黑暗", "雨聲"];

function normReplyKey(line) {
  let s = String(line || "").toLowerCase();
  s = s.replace(/[。！？?，,、…\.!\s「」『』""''·・—\-：:～~]/g, "");
  REPLY_GLUE_TOKENS.forEach((token) => {
    s = s.split(token).join("");
  });
  return s;
}

function bigramJaccard(a, b) {
  if (!a || !b || a.length < 2 || b.length < 2) return 0;
  const used = {};
  let inter = 0;
  const as = a.length - 1;
  const bs = b.length - 1;
  for (let i = 0; i < as; i++) {
    const g = a.slice(i, i + 2);
    for (let j = 0; j < bs; j++) {
      if (used[j]) continue;
      if (b.slice(j, j + 2) === g) {
        used[j] = 1;
        inter += 1;
        break;
      }
    }
  }
  const union = as + bs - inter;
  return union ? inter / union : 0;
}

/** Same bucket, punctuation-insensitive. Short lines only collapse when the key matches. */
function nearDuplicate(a, b) {
  if (String(a || "").trim() === String(b || "").trim()) return true;
  const na = normReplyKey(a);
  const nb = normReplyKey(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const short = na.length <= nb.length ? na : nb;
  const long = na.length <= nb.length ? nb : na;
  if (short.length < 6) return false;
  if (long.indexOf(short) >= 0 && short.length / long.length >= 0.72) return true;
  let i = 0;
  const lim = Math.min(na.length, nb.length);
  while (i < lim && na.charAt(i) === nb.charAt(i)) i += 1;
  if (i >= 8 && i / short.length >= 0.65) return true;
  if (short.length >= 8 && bigramJaccard(na, nb) >= 0.78) return true;
  return false;
}

function replyClusters(list) {
  const reps = [];
  list.forEach((line) => {
    if (reps.some((r) => nearDuplicate(r, line))) return;
    reps.push(line);
  });
  return reps.length;
}

/** Thin pools look further back than CHAT_ANTIREPEAT_N so the few lines cannot recycle at once. */
function antiRepeatSpan(list) {
  const clusters = replyClusters(list);
  if (clusters <= CHAT_ANTIREPEAT_N) {
    return Math.max(CHAT_ANTIREPEAT_N + 3, Math.min(CHAT_ANTIREPEAT_THIN_MAX, Math.max(clusters, 1) * 3));
  }
  return CHAT_ANTIREPEAT_N;
}

function bucketLog(bucket) {
  if (!state.replyLedger) state.replyLedger = {};
  const key = bucket || "_";
  if (!state.replyLedger[key]) state.replyLedger[key] = [];
  return state.replyLedger[key];
}

function rememberBucketDraw(bucket, line) {
  const log = bucketLog(bucket);
  log.push(line);
  if (log.length > CHAT_ANTIREPEAT_THIN_MAX + 6) {
    state.replyLedger[bucket || "_"] = log.slice(-(CHAT_ANTIREPEAT_THIN_MAX + 6));
  }
}

function pickFallbackLine(list, bucket, ledger) {
  const latest = ledger.length ? ledger[ledger.length - 1] : "";
  let pool = list.filter((l) => !latest || (l !== latest && !nearDuplicate(l, latest)));
  if (!pool.length) pool = list.filter((l) => l !== latest);
  if (!pool.length) pool = list;
  if (!state.replyCursor) state.replyCursor = {};
  const key = bucket || "_";
  const cursor = state.replyCursor[key] || 0;
  const chosen = pool[cursor % pool.length];
  state.replyCursor[key] = cursor + 1;
  return chosen;
}

function pickAvoidRepeat(pool, bucket) {
  const list = (pool || []).filter(Boolean);
  if (!list.length) return "……";
  const key = bucket || "_";
  const span = antiRepeatSpan(list);
  const ledger = bucketLog(key);
  const bucketRecent = ledger.slice(-span);
  const globalExact = (state.recentBotReplies || []).slice(-CHAT_ANTIREPEAT_N);
  const blocked = (line) => {
    if (typeof spokenBlocked === "function" && spokenBlocked(line)) return true;
    if (globalExact.some((r) => r === line || (normReplyKey(line) && normReplyKey(r) === normReplyKey(line)))) return true;
    return bucketRecent.some((r) => r === line || nearDuplicate(r, line));
  };
  const fresh = list.filter((l) => !blocked(l));
  const chosen = fresh.length
    ? fresh[Math.floor(Math.random() * fresh.length)]
    : pickFallbackLine(list, key, ledger);
  rememberBucketDraw(key, chosen);
  state.replyBucket = key;
  return chosen;
}

function isEmojiOnly(text) {
  const t = String(text || "").trim();
  if (!t) return false;
  return !/[A-Za-z0-9\u4e00-\u9fff\u3400-\u4dbf]/.test(t);
}

function isSilence(text) {
  const t = String(text || "").trim();
  return !t || /^[\.。．…·\s]+$/.test(t) || t === "..." || t === "。。。" || t === "……";
}

function asidePackKey(story, node) {
  const scene = resolveScene(story, node);
  const id = storyCastId(story);
  const nid = (node && node.id) || "";
  if (id === "sam" && SAM_STAIR_NODES[nid]) return "stairs";
  if (scene === "lift" && id === "sam") return "close";
  if (scene === "lift" && id === "alex") return "corridor";
  if (scene === "office" && id === "sam") return "corridor";
  return scene;
}

/* ============================================================
   連戲 — beat glue (place + costume + heat). One profile per node.
   node.tags / node.look / node.costume win when the story JSON sets them.
   ============================================================ */
const PLACE_LINE = [
  { tag: "roof", re: /天台/ },
  { tag: "lounge", re: /酒廊|房卡/ },
  { tag: "pantry", re: /茶水間|杯麵|影印/ },
  { tag: "lift", re: /電梯/ },
  { tag: "meeting", re: /會議室/ },
  { tag: "corridor", re: /走廊/ },
  { tag: "window", re: /窗邊|夜景/ },
  { tag: "bar", re: /杯沿/ },
];

const BEAT_PLACE_WORD = {
  corridor: "走廊",
  office: "枱邊",
  desk: "枱邊",
  roof: "天台",
  lounge: "酒廊",
  pantry: "茶水間",
  lift: "電梯",
  stairs: "樓梯",
  meeting: "會議室",
  window: "窗邊",
  call: "聽筒",
  bar: "酒廊",
  close: "",
};

const BEAT_LOOK_WORD = {
  dressed: "衫仍齊",
  open: "領口未扣",
  dark: "燈關住",
  rain: "衫濕",
};

const BEAT_FALLBACK = {
  corridor: { cold: "你喺走廊，衫仲齊，有事就講清楚。", wary: "你企喺門邊，講短句就得。", warmer: "我喺走廊聽住，你講。", sharp: "你喺走廊，快啲講完。" },
  office: { cold: "你喺枱邊，有事就講清楚。", wary: "你喺枱邊，講短句就得。", warmer: "我喺枱邊聽住，你講。", sharp: "你喺枱邊，快啲講完。" },
  desk: { cold: "你喺枱邊，有事就講清楚。", wary: "你喺檔前，講短句就得。", warmer: "我喺枱邊聽住，你講。", sharp: "你喺檔前，交得出先算。" },
  roof: { cold: "你喺天台，衫濕咗，講完就返入。", wary: "風大，你講短句就得。", warmer: "我喺天台聽住，你講。", sharp: "你喺天台，講完就返入。" },
  lounge: { cold: "你喺酒廊，有事就講清楚。", wary: "你喺杯邊，講短句就得。", warmer: "我喺酒廊聽住，你講。", sharp: "你喺酒廊，快啲講完。" },
  pantry: { cold: "你喺茶水間，有事就講清楚。", wary: "你喺茶水間，講短句就得。", warmer: "我喺茶水間聽住，你講。", sharp: "你喺茶水間，快啲講完。" },
  lift: { cold: "你喺電梯，有事就講清楚。", wary: "你喺廂內，講短句就得。", warmer: "我喺電梯聽住，你講。", sharp: "你喺電梯，快啲講完。" },
  stairs: { cold: "你喺樓梯，講完先上。", wary: "你喺梯間，講短句就得。", warmer: "我喺樓梯聽住，你講。", sharp: "你喺樓梯，快啲講完。" },
  meeting: { cold: "你喺會議室，簡報先講。", wary: "會未散，你講短句就得。", warmer: "我喺會議室聽住，你講。", sharp: "你喺會議室，快啲講完。" },
  close: { cold: "你近咗，有事就講清楚。", wary: "你近咗，講短句就得。", warmer: "我喺度聽住，你講。", sharp: "你近咗，快啲講完。" },
  window: { cold: "你喺窗邊，有事就講清楚。", wary: "你望住夜景，講短句就得。", warmer: "我喺窗邊聽住，你講。", sharp: "你喺窗邊，講完就返入。" },
  call: { cold: "你喺聽筒度，講重點。", wary: "線路度，你講短句就得。", warmer: "我喺聽筒度聽住，你講。", sharp: "而家通緊話，你快啲講完。" },
};

const BOUNDARY_BUCKETS = { nsfw_probe: 1, date_hug: 1, flirt: 1, nickname: 1 };
const BOUNDARY_TEXT_RE = /色情|脫衣|脫衫|裸|做愛|性交|鹹濕|污糟|黃腔|上床|錫嘴|想要你|攬住|鍾意你|中意你|我鐘意|好正|靚女|吻|摸我|除衫/;

const FLIRT_BACK = {
  alex: {
    mid: ["大膽。我聽到。未過線。", "你試。我未應。"],
    high: ["我回你。再近半寸。細聲。", "哼。你撩得準。我唔裝聽唔到。", "危險嘅暖。我留你多一刻。"],
  },
  morgan: {
    mid: ["大膽。我聽到。未許可。", "你試。杯未放低。"],
    high: ["我回你。靠近。你負責。", "危險。我想聽第二句。"],
  },
  sam: {
    mid: ["我聽到。未准。", "你試探。我未應。"],
    high: ["我回你。細聲。望住我。", "危險。我可以唔只係前輩。"],
  },
};

const FACT_META = {
  name: { ttl: 0, rank: 0, maxUses: 3, ttlMs: 0 },
  promise: { ttl: 14, rank: 1, maxUses: 2, ttlMs: 45 * 60 * 1000 },
  mistake: { ttl: 10, rank: 2, maxUses: 2, ttlMs: 25 * 60 * 1000 },
  like: { ttl: 8, rank: 3, maxUses: 2, ttlMs: 20 * 60 * 1000 },
  tired: { ttl: 5, rank: 6, maxUses: 1, ttlMs: 8 * 60 * 1000 },
  hungry: { ttl: 5, rank: 6, maxUses: 1, ttlMs: 8 * 60 * 1000 },
  nervous: { ttl: 5, rank: 6, maxUses: 1, ttlMs: 8 * 60 * 1000 },
};

function factMeta(id) {
  return FACT_META[id] || { ttl: 8, rank: 4, maxUses: 2, ttlMs: 20 * 60 * 1000 };
}

function placeFromText(text) {
  const s = String(text || "");
  const rows = [
    ["roof", /天台/],
    ["lounge", /酒廊|酒吧/],
    ["pantry", /茶水間/],
    ["meeting", /會議室/],
    ["lift", /電梯/],
    ["corridor", /走廊|門邊|門禁/],
    ["window", /窗邊|夜景/],
  ];
  let best = null;
  let at = 1e9;
  rows.forEach((row) => {
    const m = s.match(row[1]);
    if (m && m.index < at) {
      at = m.index;
      best = row[0];
    }
  });
  return best;
}

function lookFromText(text) {
  const s = String(text || "");
  if (/燈關|燈暗|熄燈|黑暗/.test(s)) return "dark";
  if (/敞開|解開.*鈕|除衫|底褲|領口/.test(s)) return "open";
  if (/落雨|雨聲|濕衫|雨水|衫濕/.test(s)) return "rain";
  return "dressed";
}

function beatProfile(node) {
  const n = node || currentStoryNode();
  const tags = {};
  const add = (t) => { if (t) tags[t] = 1; };
  const explicit = []
    .concat((n && n.tags) || [])
    .concat((n && n.chatTags) || []);
  explicit.forEach((t) => add(String(t)));
  if (n && n.look) add(String(n.look));
  if (n && n.costume) add(String(n.costume));

  let place = null;
  explicit.forEach((t) => {
    if (!place && BEAT_PLACE_WORD[t]) place = t;
  });
  const label = (n && n.label) || "";
  const head = ((n && n.text) || "").slice(0, 180);
  if (!place) place = placeFromText(label) || placeFromText(head);
  if (!place) {
    const scene = resolveScene(state.story, n);
    const nid = (n && n.id) || "";
    const id = storyCastId(state.story);
    if (id === "sam" && SAM_STAIR_NODES[nid]) place = "stairs";
    else if (scene === "roof") place = "roof";
    else if (scene === "review") place = "meeting";
    else if (scene === "dark") place = "office";
    else if (id === "sam" && scene === "office") place = "corridor";
    else if (id === "alex" && scene === "lift") place = "corridor";
    else if (id === "sam" && scene === "lift") place = "close";
    else if (scene === "lounge" || scene === "pantry" || scene === "lift") place = scene;
    else place = "office";
  }
  add(place);
  if (place === "lounge") add("bar");
  if (place === "office") add("desk");
  if (state.callMode || nodeWantsCall(n)) add("call");

  let look = (n && (n.look || n.costume)) || "";
  if (!BEAT_LOOK_WORD[look]) {
    look = lookFromText(label + "\n" + head + "\n" + ((n && n.aside) || ""));
  }
  if (resolveScene(state.story, n) === "dark" && look === "dressed") look = "dark";
  add(look);

  const mood = inferMoodFromNode(n);
  return { tags: tags, place: place, look: look, mood: mood };
}

function lineFitsBeat(line, beat) {
  const text = String(line || "");
  if (!text) return false;
  const b = beat || beatProfile(null);
  for (let i = 0; i < PLACE_LINE.length; i++) {
    if (PLACE_LINE[i].re.test(text) && !b.tags[PLACE_LINE[i].tag]) return false;
  }
  if (b.look !== "dark" && /燈暗|熄燈|燈關|黑暗/.test(text)) return false;
  if (b.look === "dark" && /走廊燈|螢光燈|燈唔使開/.test(text)) return false;
  if (b.look === "dressed" && /底褲|敞開|除衫|解皮帶/.test(text)) return false;
  if (b.look !== "rain" && /雨聲|濕衫|落雨|雨水|衫濕/.test(text)) return false;
  if (b.look !== "open" && b.look !== "dark" && /領口未扣|衫未扣/.test(text)) return false;
  return true;
}

function beatFallback(beat, tone) {
  const b = beat || beatProfile(null);
  const t = tone || state.chatTone || "cold";
  if (b.look === "dark") {
    const bank = { cold: "燈關住，我喺度，你講清楚。", wary: "燈關住，你講短句就得。", warmer: "燈關住，我喺度聽住，你講。", sharp: "燈關住，你快啲講完。" };
    return bank[t] || bank.cold;
  }
  if (b.look === "rain") {
    const bank = { cold: "衫濕咗，你講清楚你想點。", wary: "雨未停，你講短句就得。", warmer: "雨聲度我聽住，你講。", sharp: "雨未停，你快啲講完。" };
    return bank[t] || bank.cold;
  }
  if (b.look === "open") {
    const bank = { cold: "領口未扣，你講清楚你想點。", wary: "領口未扣，你講短句就得。", warmer: "領口未扣，我喺度聽住，你講。", sharp: "領口未扣，你快啲講完。" };
    return bank[t] || bank.cold;
  }
  const pack = BEAT_FALLBACK[b.place] || BEAT_FALLBACK.office;
  return pack[t] || pack.cold;
}

function isBareStamp(clause) {
  const s = String(clause || "").replace(/[。！？?\s]/g, "");
  if (!s) return true;
  if (/^(走廊|枱邊|天台|酒廊|茶水間|電梯|會議室|窗邊|樓梯|聽筒)(衫仍齊|衫仲齊|領口未扣|燈關住|衫濕)?$/.test(s)) return true;
  if (s === "衫仍齊" || s === "衫仲齊" || s === "領口未扣" || s === "燈關住" || s === "衫濕") return true;
  return false;
}

function isTelegraphic(line) {
  const s = String(line || "").trim();
  if (!s) return true;
  if (/距離。而家|呢度有耳。收聲|門口。講|有事？講|大膽。監控亮住|距離。立刻|界線。而家/.test(s) && s.length <= 16) return true;
  const parts = s.split(/[。！？?]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return true;
  if (parts.length >= 2 && parts.every((p) => p.replace(/[，,、…]/g, "").length <= 4)) return true;
  if (parts.length === 1 && parts[0].replace(/[，,、…]/g, "").length <= 2) return true;
  return false;
}

function ensureComplete(line) {
  let s = String(line || "").trim();
  s = s.replace(/^(?:走廊|枱邊|天台|酒廊|茶水間|電梯|會議室|窗邊)。(?:衫仍齊|衫仲齊|領口未扣|燈關住|衫濕)。/g, "");
  s = s.replace(/(?:^|。)走廊。衫仍齊。/g, "$1");
  const fixes = [
    [/距離。而家。/g, "而家唔好再行近，我要你同我保持距離。"],
    [/距離。立刻。/g, "你而家退返半步，同我保持距離。"],
    [/呢度有耳。收聲。/g, "呢度有人聽得見，你收聲，唔好再講呢句。"],
    [/門口。講。/g, "你企喺門口，有事就講清楚。"],
    [/……有事？講。/g, "你有事就講清楚。"],
    [/有事？講。/g, "你有事就講清楚。"],
    [/我數到你未回。/g, "我數到你未回我，你而家回一句。"],
    [/大膽。監控亮住。/g, "你大膽，但監控仲亮住，呢句我唔收。"],
    [/……界線。而家。/g, "而家唔好越界，你同我保持距離。"],
    [/界線。而家。/g, "而家唔好越界，你同我保持距離。"],
  ];
  fixes.forEach((row) => {
    s = s.replace(row[0], row[1]);
  });
  return s.replace(/^[。\s]+/, "").replace(/。{2,}/g, "。").trim();
}

function placeClause(beat) {
  const b = beat || {};
  const place = BEAT_PLACE_WORD[b.place] || "";
  if (b.look === "dark") return "燈關住，我喺度";
  if (b.look === "rain") return place ? ("我喺" + place + "，衫濕咗") : "衫濕咗，我喺度";
  if (b.look === "open") return place ? ("我喺" + place + "，領口未扣") : "領口未扣，我喺度";
  if (b.look === "dressed" && place) return "我喺" + place + "，衫仲齊";
  if (place) return "我喺" + place;
  return "";
}

function glueKey(beat) {
  const b = beat || {};
  return (state.nodeId || "_") + "|" + (b.place || "") + "|" + (b.look || "");
}

function weavePlaceOnce(out, beat) {
  const clause = placeClause(beat);
  const key = glueKey(beat);
  if (!clause) return out;
  if (state.glueSaidKey === key) return out;
  state.glueSaidKey = key;
  const place = BEAT_PLACE_WORD[beat.place] || "";
  const hasPlace = place && String(out || "").indexOf(place) >= 0;
  const hasLook = beat.look === "dark"
    ? String(out || "").indexOf("燈關") >= 0
    : beat.look === "rain"
      ? String(out || "").indexOf("衫濕") >= 0
      : beat.look === "open"
        ? String(out || "").indexOf("領口") >= 0
        : String(out || "").indexOf("衫") >= 0;
  if (hasPlace && hasLook) return out;
  if (hasPlace && beat.look !== "dressed" && beat.look !== "open" && beat.look !== "rain" && beat.look !== "dark") return out;
  const rest = String(out || "").replace(/^[，。\s]+/, "");
  if (!rest) return clause + "。";
  const joined = clause + "，" + rest;
  return joined.length <= 118 ? joined : rest;
}

function glueBeat(line, beat) {
  const b = beat || beatProfile(null);
  const tone = state.chatTone || "cold";
  const raw = ensureComplete(String(line || "").trim());
  const parts = raw.split(/(?<=[。！？?])/).map((s) => s.trim()).filter(Boolean);
  const kept = [];
  parts.forEach((p) => {
    if (isBareStamp(p)) return;
    if (lineFitsBeat(p, b)) kept.push(p);
  });
  let out = ensureComplete(kept.join(""));
  if (!out) out = beatFallback(b, tone);
  if (b.tags.call && out.indexOf("聽筒") < 0 && out.indexOf("通話") < 0 && out.indexOf("聽筒度") < 0) {
    out = "我喺聽筒度，" + out.replace(/^[，。\s]+/, "");
  }
  out = weavePlaceOnce(out, b);
  out = ensureComplete(out);
  return out || beatFallback(b, tone);
}

function intimacyBand() {
  const heat = clampMeter(state.heat);
  const mood = state.currentMood || inferMoodFromNode(currentStoryNode());
  let score = heat;
  if (mood === "intimate") score += 10;
  if (mood === "tense" && heat < 50) score -= 8;
  if (score >= 55) return "high";
  if (score >= 35) return "mid";
  return "low";
}

function boundaryTone(bucket) {
  const band = intimacyBand();
  if (!BOUNDARY_BUCKETS[bucket]) return state.chatTone || "cold";
  if (band === "low") return "cold";
  if (band === "mid") return "wary";
  if ((state.chatTone === "sharp" || clampMeter(state.tension) >= 70) && clampMeter(state.heat) < 48) return "wary";
  return "warmer";
}

function isBoundaryText(text) {
  return BOUNDARY_TEXT_RE.test(String(text || ""));
}

function boundaryBucket(text, intentId) {
  if (intentId === "flirt" || isBoundaryText(text)) {
    const via = text ? matchBucket(text) : "flirt";
    if (BOUNDARY_BUCKETS[via]) return via;
    if (/色情|脫|裸|做愛|性交|鹹濕|黃腔/.test(text || "")) return "nsfw_probe";
    if (/約|攬|抱抱|上床|錫|摸我|脫衫|除衫/.test(text || "")) return "date_hug";
    return "flirt";
  }
  return "";
}

function flirtBackLine(band) {
  if (band !== "mid" && band !== "high") return "";
  const id = getCastId();
  const pack = (FLIRT_BACK[id] || FLIRT_BACK.alex)[band] || [];
  const beat = beatProfile(null);
  const ok = pack.filter((l) => lineFitsBeat(l, beat));
  if (!ok.length) return "";
  return pickAvoidRepeat(ok, "flirt");
}

function peelQuestion(line) {
  const s = String(line || "");
  const q = s.match(/([^。！？?]*[？?])\s*$/);
  if (!q) return { head: s.replace(/[。\s]+$/, ""), steer: "" };
  return {
    head: s.slice(0, q.index).replace(/[。\s]+$/, ""),
    steer: q[1],
  };
}

function boundaryAck(bucket, beat) {
  const tone = boundaryTone(bucket);
  const band = intimacyBand();
  const raw = poolFor(bucket, tone) || [];
  let pool = raw.filter((l) => lineFitsBeat(l, beat) && !/[？?]/.test(l) && String(l).length <= 28);
  if (!pool.length) pool = raw.filter((l) => lineFitsBeat(l, beat) && !/[？?]/.test(l));
  if (band === "low") {
    const hard = pool.filter((l) => /距離|界線|收起|收聲|而家|監控|退/.test(l));
    if (hard.length) pool = hard;
  }
  if (!pool.length) pool = [beatFallback(beat, tone)];
  let line = String(pickAvoidRepeat(pool, bucket)).replace(/[？?]/g, "").replace(/[。\s]+$/, "");
  if (band === "high") {
    const back = flirtBackLine("high");
    if (back && line.indexOf("我回你") < 0 && line.indexOf("撩") < 0) line = line + "。" + back.replace(/[。\s]+$/, "");
  } else if (band === "mid") {
    const back = flirtBackLine("mid");
    if (back && line.indexOf("未") < 0) line = line + "。" + back.replace(/[。\s]+$/, "");
  }
  return line;
}

function finishBeatLine(line, opts) {
  opts = opts || {};
  syncChatTone();
  const beat = beatProfile(currentStoryNode());
  let out = String(line || "").trim();
  const bucket = opts.bucket || (opts.userText ? matchBucket(opts.userText) : "");
  const ladder = opts.ladder === true || (opts.ladder !== false && (BOUNDARY_BUCKETS[bucket] || isBoundaryText(opts.userText || "")));
  if (ladder) {
    const useBucket = BOUNDARY_BUCKETS[bucket] ? bucket : (boundaryBucket(opts.userText || "", opts.intentId) || "flirt");
    out = boundaryAck(useBucket, beat);
  }
  const ask = !!opts.askMemory;
  out = weaveFactCallback(out, { askMemory: ask });
  out = glueBeat(out, beat);
  return ensureComplete(out);
}

function rememberSpoken(full, parts) {
  const raw = String(full || "").trim();
  if (!raw) return;
  const segs = (parts && parts.length ? parts : [raw]).map((s) => String(s || "").trim()).filter(Boolean);
  if (!state.spokenTurns) state.spokenTurns = [];
  state.spokenTurns.push({
    raw: raw,
    full: normReplyKey(raw),
    parts: segs.map((s) => normReplyKey(s)).filter(Boolean),
    pair: segs.map((s) => normReplyKey(s)).join("|"),
  });
  if (state.spokenTurns.length > 16) state.spokenTurns = state.spokenTurns.slice(-16);
}

function spokenBlocked(line) {
  const key = normReplyKey(line);
  if (!key) return false;
  const recent = (state.spokenTurns || []).slice(-CHAT_ANTIREPEAT_N);
  return recent.some((turn) => {
    if (!turn) return false;
    if (turn.full === key) return true;
    if (turn.pair && turn.pair === key) return true;
    if (turn.parts && turn.parts.indexOf(key) >= 0) return true;
    if (key.length >= 8 && turn.full && turn.full.indexOf(key) >= 0) return true;
    return false;
  });
}

function nameFact() {
  const list = state.playerFacts || [];
  for (let i = 0; i < list.length; i++) {
    if (list[i] && list[i].id === "name" && list[i].quote) return list[i];
  }
  return null;
}

function briefingPageFrom(text) {
  const m = String(text || "").match(/第[一二三四五六七八九十0-9]+頁/);
  return m ? m[0] : "";
}

function lastBriefingPage() {
  const open = state.openPlayer;
  if (open && /簡報|報告/.test(open.text || "")) {
    const page = briefingPageFrom(open.text);
    if (page) return page;
  }
  const lines = state.chatUserLines || [];
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/簡報|報告/.test(lines[i] || "")) {
      const page = briefingPageFrom(lines[i]);
      if (page) return page;
    }
  }
  return "";
}

function briefingStillOpen() {
  if ((state.chatTopics || []).indexOf("簡報") >= 0) return true;
  if ((state.playerFacts || []).some((f) => f && (f.id === "report" || f.quote === "簡報"))) return true;
  if (state.openPlayer && state.openPlayer.topic === "簡報") return true;
  return (state.chatUserLines || []).some((l) => /簡報|報告/.test(String(l || "")));
}

function briefingLine(page) {
  const p = page || "";
  const lines = p ? [
    "你講簡報" + p + "，你繼續講落去。",
    "簡報" + p + "我記住，你未講完就講。",
    "你頭先講簡報" + p + "，重點你再講清楚。",
    "簡報" + p + "先，你唔好跳去第二樣。",
    "你未講完簡報" + p + "，你講落去。",
    "簡報" + p + "我留低，你再講重點。",
  ] : [
    "你講緊簡報，你繼續講邊頁。",
    "簡報未講完，你講落去。",
    "你頭先講簡報，我留低，你再講重點。",
    "你講簡報，頁數你講清楚。",
    "簡報先，你唔好跳去第二樣。",
    "你未講完簡報，你繼續講。",
  ];
  return lines;
}

function isAiAsk(text) {
  return /你係唔係\s*ai|你係咪\s*ai|你係\s*ai|係唔係\s*ai|是不是\s*ai|係咪機械人|係唔係機械人|人工智能|chatgpt|chat\s*gpt|係咪程式|係唔係程式/i.test(String(text || ""));
}

function speakFrom(pool, bucket, opts) {
  opts = opts || {};
  const prepared = [];
  (pool || []).forEach((item) => {
    const s = ensureComplete(item);
    if (!s || isTelegraphic(s) || prepared.indexOf(s) >= 0) return;
    prepared.push(s);
  });
  const fresh = prepared.filter((l) => !spokenBlocked(l));
  const use = fresh.length ? fresh : prepared;
  if (!use.length) return finalizeSpoken("我聽到，你講清楚你想點。", opts);
  const line = pickAvoidRepeat(use, bucket);
  let out = finalizeSpoken(line, opts);
  if (spokenBlocked(out)) {
    const rest = use.filter((l) => l !== line && !spokenBlocked(l));
    if (rest.length) out = finalizeSpoken(rest[0], opts);
  }
  return out;
}

function finalizeSpoken(line, opts) {
  opts = opts || {};
  let out = ensureComplete(String(line || "").trim());
  if (!opts.skipFact) out = weaveFactCallback(out, { askMemory: !!opts.askMemory });
  if (!opts.skipGlue) out = glueBeat(out, beatProfile(currentStoryNode()));
  out = ensureComplete(out);
  if (out && !/[。！？?]$/.test(out)) out += "。";
  return out || "我聽到，你講清楚你想點。";
}

function askCrowds(line) {
  const q = String(line || "").match(/([^。！？?\n]{6,}[？?])/);
  if (!q) return false;
  const core = q[1].replace(/[？?\s]/g, "");
  if (core.length < 6) return false;
  return (state.spokenTurns || []).slice(-2).some((t) => String(t.raw || "").indexOf(core) >= 0);
}

function completeAck(head) {
  const s = String(head || "").replace(/[。\s]+$/g, "");
  if (!s) return "我聽到，你講清楚你想點。";
  if (s.length >= 8) return s + "。";
  return s + "，你再講一句清楚嘅。";
}

function useGuideReply(guideReply) {
  const line = ensureComplete(String(guideReply || "").trim());
  if (line && !spokenBlocked(line) && !askCrowds(line) && !isTelegraphic(line)) {
    return finalizeSpoken(line, { skipFact: true });
  }
  const peeled = peelQuestion(line);
  const head = completeAck(peeled.head || "我聽到");
  if (head && !spokenBlocked(head)) return finalizeSpoken(head, { skipFact: true });
  return speakFrom(poolFor("default", syncChatTone() || "cold"), "default", { skipFact: true });
}

function guidanceLine(guideReply) {
  const peeled = peelQuestion(guideReply || "");
  let ask = peeled.steer || "";
  if (!ask) {
    const node = currentStoryNode();
    if (node && node.sceneGoal && window.GuidePolicy && typeof GuidePolicy.goalSteerPhrase === "function") {
      try { ask = GuidePolicy.goalSteerPhrase(node.sceneGoal) || ""; } catch (e) {}
    }
  }
  if (!ask) return useGuideReply(guideReply);
  const heads = ["你問應該點做", "你要我講下一步", "你問而家做咩", "你想我指引", "你問點做", "我話你知呢步"];
  return speakFrom(heads.map((h) => h + "，" + ask), "guide-ask", { skipFact: true });
}

function playerFacingReply(userText, intentId, guideReply) {
  const text = String(userText || "").trim();
  const id = intentId || "";
  syncChatTone();
  const named = nameFact();
  if (isNameRecall(text, id)) {
    if (named) return finalizeSpoken("你叫" + named.quote + "。我記得。", { skipFact: true, skipGlue: true, askMemory: true });
    return finalizeSpoken("你未報過名，我記唔到。", { skipFact: true, skipGlue: true });
  }
  if (named && isNameIntro(text) && (named.turn || 0) === (state.factTurn || 0)) {
    return finalizeSpoken("你叫" + named.quote + "。我記住。", { skipFact: true, skipGlue: true });
  }
  if (isFollowUpFragment(text)) {
    const held = heldReplyTarget();
    const topic = (held && held.topic) || (state.openPlayer && state.openPlayer.topic) || "";
    const page = lastBriefingPage() || briefingPageFrom(held && held.userText);
    if (topic === "簡報" || (!topic && briefingStillOpen())) {
      return speakFrom(briefingLine(page), "topic:簡報", { skipFact: true });
    }
    if (topic) {
      const echo = topicEchoLine(syncChatTone(), topic);
      if (echo) return finalizeSpoken(echo, { skipFact: true });
    }
  }
  if (/天氣/.test(text) && briefingStillOpen() && !/簡報|報告/.test(text)) {
    return speakFrom(briefingLine(lastBriefingPage()), "topic:簡報", { skipFact: true });
  }
  if (isAiAsk(text) || matchBucket(text) === "ai_ask") {
    return speakFrom(linesForBeat("ai_ask", syncChatTone()), "ai_ask", { skipFact: true });
  }
  if (isSilence(text) || matchBucket(text) === "silence") {
    return speakFrom(linesForBeat("silence", syncChatTone()), "silence", { skipFact: true });
  }
  if (id === "flirt" || isBoundaryText(text) || BOUNDARY_BUCKETS[matchBucket(text)]) {
    const via = matchBucket(text);
    const bucket = BOUNDARY_BUCKETS[via] ? via : "flirt";
    const beat = beatProfile(currentStoryNode());
    const pool = [];
    for (let n = 0; n < 8; n++) pool.push(boundaryAck(bucket, beat));
    return speakFrom(pool, bucket, { skipFact: true });
  }
  if (/簡報|報告/.test(text)) {
    return speakFrom(briefingLine(briefingPageFrom(text) || lastBriefingPage()), "topic:簡報", { skipFact: true });
  }
  if (id === "ask_want" || /應該做咩|應該點|點算|做咩好/.test(text)) {
    return guidanceLine(guideReply);
  }
  const bucket = matchBucket(text);
  const concrete = bucket && bucket !== "default" && bucket !== "silence";
  if (!concrete && (id === "unclear" || id === "nonsense" || id === "off_topic" || !id)) {
    return useGuideReply(guideReply);
  }
  if (concrete) {
    const tone = BOUNDARY_BUCKETS[bucket] ? boundaryTone(bucket) : syncChatTone();
    return speakFrom(linesForBeat(bucket, tone), bucket, { skipFact: true });
  }
  return useGuideReply(guideReply);
}

function publishSpoken(line) {
  const text = ensureComplete(String(line || "").trim());
  if (!text) return "";
  rememberSpoken(text, [text]);
  return text;
}

function typingDelayMs(text) {
  const len = Array.from(String(text || "")).length;
  let ms = 400 + len * 34 + Math.floor(Math.random() * 240);
  if (state.callMode) ms = Math.round(ms * 1.75);
  const cap = state.callMode ? 4800 : 2700;
  const floor = state.callMode ? 780 : 460;
  ms = Math.max(floor, Math.min(cap, ms));
  if (prefersReducedMotion()) ms = Math.min(ms, 540);
  return ms;
}

function splitHumanLine(line) {
  const text = String(line || "").trim();
  if (text.length < 16) return [text];
  const rate = state.callMode ? 0.16 : 0.24;
  if (Math.random() > rate) return [text];
  let cut = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if ("。！？?".indexOf(ch) < 0) continue;
    if (i >= 4 && i <= text.length * 0.62) {
      cut = i;
      break;
    }
  }
  if (cut < 0) return [text];
  const a = text.slice(0, cut + 1).trim();
  const b = text.slice(cut + 1).trim();
  if (a.length < 4 || b.length < 4) return [text];
  return [a, b];
}

async function deliverBotLine(line) {
  const clean = ensureComplete(String(line || "").trim());
  const parts = splitHumanLine(clean).filter(Boolean);
  if (!parts.length) return;
  rememberSpoken(clean, parts);
  const open = state.openPlayer;
  if (parts.length > 1) {
    state.halfFollow = {
      active: true,
      bucket: (open && open.bucket) || state.replyBucket || "",
      topic: (open && open.topic) || topicOf(line) || "",
      rest: parts.slice(1).join(""),
      userText: (open && open.text) || "",
    };
  }
  try {
    for (let i = 0; i < parts.length; i++) {
      setChatTyping(true);
      await new Promise((r) => setTimeout(r, typingDelayMs(parts[i])));
      setChatTyping(false);
      appendChat("alex", parts[i]);
      pushChatMemory("bot", parts[i]);
    }
  } finally {
    state.halfFollow = null;
    if (state.openPlayer) state.openPlayer.answered = true;
  }
  if (!audioPrefs.voiceMute) {
    try { speakChat(parts.join("")); } catch (_) {}
  }
}

function sceneAsideBank() {
  const id = getCastId();
  if (id === "morgan") return SCENE_ASIDE_MORGAN;
  if (id === "sam") return SCENE_ASIDE_SAM;
  return SCENE_ASIDE_BY_KEY;
}

function sceneAsideLine(tone) {
  const node = currentStoryNode();
  if (!node) return null;
  const beat = beatProfile(node);
  const bank = sceneAsideBank();
  const pack = bank[asidePackKey(state.story, node)];
  if (!pack) return null;
  const raw = pack[tone] || pack.cold || [];
  const fitted = raw.filter((l) => lineFitsBeat(l, beat));
  const pool = fitted.length ? fitted : raw;
  if (!pool.length) return null;
  return pickAvoidRepeat(pool, "aside");
}

function topicEchoBank() {
  const id = getCastId();
  if (id === "morgan") return TOPIC_ECHO_MORGAN;
  if (id === "sam") return TOPIC_ECHO_SAM;
  return TOPIC_ECHO;
}

function topicEchoLine(tone, onlyTopic) {
  const beat = beatProfile(currentStoryNode());
  const topics = [];
  if (onlyTopic) topics.push(onlyTopic);
  else {
    for (let i = (state.chatTopics || []).length - 1; i >= 0; i--) topics.push(state.chatTopics[i]);
  }
  if (!topics.length) return null;
  for (let t = 0; t < topics.length; t++) {
    const topic = topics[t];
    const bank = topicEchoBank();
    const pack = bank[topic];
    if (!pack) continue;
    const lines = (pack[tone] || pack.cold || []).filter((l) => lineFitsBeat(l, beat));
    if (lines.length) return pickAvoidRepeat(lines, "topic:" + topic);
  }
  return null;
}

function storyPhone() {
  return (state.story && state.story.phone) || {};
}

/** Ending tags win, then heat-floor tags, then the latest story chip. */
function preferredMemoryId() {
  const list = state.memories || [];
  for (let i = list.length - 1; i >= 0; i--) {
    if (/^from_ending_/.test(list[i])) return list[i];
  }
  for (let i = list.length - 1; i >= 0; i--) {
    if (/^act2_from_/.test(list[i])) return list[i];
  }
  return list.length ? list[list.length - 1] : "";
}

function memoryChipLabel(id) {
  const chips = storyPhone().chips || {};
  return chips[id] || memoryLabel(id);
}

function takePhoneLine(kind) {
  const pack = storyPhone()[kind];
  if (!pack || typeof pack !== "object") return "";
  const band = intimacyBand();
  const rows = [].concat(pack[band] || [], pack.any || []);
  const beat = beatProfile(currentStoryNode());
  const ok = rows.filter((l) => l && lineFitsBeat(l, beat));
  if (!ok.length) return "";
  return pickAvoidRepeat(ok, "phone:" + kind + ":" + band);
}

function takeInboxLine(preferContinuity) {
  const phone = storyPhone();
  const beat = beatProfile(currentStoryNode());
  const id = preferredMemoryId();
  const map = phone.inboxContinuity || {};
  const fit = (l) => l && lineFitsBeat(l, beat);
  const cont = (id && map[id] ? map[id] : []).filter(fit);
  const band = intimacyBand();
  const heat = ((phone.inbox && phone.inbox[band]) || []).filter(fit);
  const rows = preferContinuity && cont.length ? cont : cont.concat(heat);
  if (!rows.length) return "";
  return pickAvoidRepeat(rows, "inbox:" + (preferContinuity && cont.length ? id : band));
}

function memoryChipLine(tone) {
  const id = preferredMemoryId();
  if (!id) return null;
  const voice = (storyPhone().memory || {})[id];
  const beat = beatProfile(currentStoryNode());
  if (voice) {
    const raw = voice[tone] || voice.cold || [];
    const ok = raw.filter((l) => lineFitsBeat(l, beat));
    if (ok.length) return pickAvoidRepeat(ok, "memory:" + id);
  }
  const label = memoryLabel(id);
  const bank = {
    cold: [`……我記得。${label}。唔好當我善忘。`, `${label}——你以為我會刪低？`, `你而家先問？${label}，我一路記住。`],
    wary: [`記得。${label}。你先唔好裝忘。`, `${label}。對照你自己。`, `記憶呢度：${label}。`],
    warmer: [`……我記得。${label}。你講過，我留住。`, `${label}——所以你先唔好當冇事。`, `你問記唔記得？${label}。記得。`],
    sharp: [`記得。${label}。所以你更冇藉口。`, `${label}。唔好再問。`, `我記得：${label}。`],
  };
  return pickAvoidRepeat(bank[tone] || bank.cold, "memory");
}

const PLAYER_FACT_RULES = [
  { id: "name", re: /(?:我嘅名字?(?:係|是|叫)|我個名字?(?:係|是|叫)|我的名字?(?:係|是|叫)|我名叫|名字(?:係|是)|我叫|叫我|我係(?!唔|咪|否))\s*([A-Za-z\u4e00-\u9fff]{1,8})/, quote: (m) => cleanFactName(m[1]), label: (m) => "你叫" + cleanFactName(m[1]) },
  { id: "promise", re: /我應承|我答應|我保證|我會交|聽日交|下次一定|我交到|包在我/, quote: () => "應承", label: () => "你應承過" },
  { id: "mistake", re: /我錯|打錯|寫錯|交遲|漏頁|搞錯|遲咗交|我失誤/, quote: () => "認錯", label: () => "你認過錯" },
  { id: "overtime", re: /加班|夜班|做到好夜|未收工/, quote: () => "加班", label: () => "你話加班" },
  { id: "tired", re: /好攰|好累|好眼瞓|想瞓|頂唔順/, quote: () => "好攰", label: () => "你話好攰" },
  { id: "report", re: /簡報|報告|交唔切/, quote: () => "簡報", label: () => "你話簡報" },
  { id: "like", re: /鍾意你|中意你|想錫你|心動/, quote: () => "鍾意我", label: () => "你話鍾意" },
  { id: "leave", re: /想走(?!去)|想返屋企|想收工|想閃/, quote: () => "想走", label: () => "你話想走" },
  { id: "drink", re: /飲酒|想醉|再斟/, quote: () => "飲酒", label: () => "你話飲酒" },
  { id: "hungry", re: /好餓|未食飯|食麵|宵夜/, quote: () => "肚餓", label: () => "你話肚餓" },
  { id: "nervous", re: /好驚|好緊張|手震/, quote: () => "緊張", label: () => "你話緊張" },
  { id: "home", re: /屋企人|我屋企|我爸|我媽|父母/, quote: () => "屋企", label: () => "你提過屋企" },
];

const FACT_NAME_BLOCK = {
  你: 1, 我: 1, 佢: 1, 她: 1, 他: 1,
  vera: 1, elise: 1, sammi: 1, morgan: 1, sam: 1, alex: 1,
  上司: 1, 老闆: 1,
};

const NAME_REJECT = {
  咩: 1, 乜: 1, 乜嘢: 1, 什麼: 1, 什么: 1, 邊個: 1, 邊位: 1,
  誰: 1, 谁: 1, 真人: 1, 人類: 1, 機械人: 1, 機器人: 1,
  程式: 1, 人工智能: 1, 上司: 1, 老闆: 1, 同事: 1, 新人: 1,
  朋友: 1, 唔係: 1, 係: 1, ai: 1, bot: 1,
};

function cleanFactName(raw) {
  let s = String(raw || "").replace(/[，。！？、,.!?\s].*$/, "");
  s = s.replace(/(?:呀|啊|吖|啦|喇|囉|喎|喔|呢|噶|㗎)+$/g, "");
  return s.slice(0, 6);
}

function acceptFactName(quote) {
  const q = String(quote || "");
  if (!q) return false;
  if (FACT_NAME_BLOCK[q.toLowerCase()]) return false;
  if (NAME_REJECT[q] || NAME_REJECT[q.toLowerCase()]) return false;
  if (/^[你我佢她他]/.test(q)) return false;
  if (/唔|咪|嗎|吗|邊|誰|谁|咩|乜/.test(q)) return false;
  return true;
}

function isNameIntro(text) {
  return /我叫|叫我|我個名|我嘅名|我的名|我名叫|名字係|名字是|我係/.test(String(text || ""));
}

function isNameRecall(text, intentId) {
  const t = String(text || "");
  const asksName = /名/.test(t) || /叫咩|叫乜|叫什麼|叫什么/.test(t);
  if (/記得/.test(t) && asksName) return true;
  if ((intentId === "ask_memory" || intentId === "memory") && asksName) return true;
  return false;
}

function stampFact(fact) {
  const meta = factMeta(fact.id);
  const turn = state.factTurn || 0;
  fact.turn = turn;
  fact.at = Date.now();
  fact.nodeId = state.nodeId || "";
  fact.ttl = meta.ttl;
  fact.rank = meta.rank;
  fact.maxUses = meta.maxUses;
  fact.ttlMs = meta.ttlMs;
  if (fact.uses == null) fact.uses = 0;
  fact.echoAfter = turn + 1;
  return fact;
}

function capPlayerFacts() {
  const list = state.playerFacts || [];
  if (list.length <= MAX_PLAYER_FACTS) return;
  const ranked = list.slice().sort((a, b) => {
    const ra = a.rank != null ? a.rank : 5;
    const rb = b.rank != null ? b.rank : 5;
    if (ra !== rb) return ra - rb;
    return (b.turn || 0) - (a.turn || 0);
  });
  state.playerFacts = ranked.slice(0, MAX_PLAYER_FACTS);
}

function expirePlayerFacts() {
  const turn = state.factTurn || 0;
  const now = Date.now();
  state.playerFacts = (state.playerFacts || []).filter((f) => {
    if (!f || !f.id) return false;
    const meta = factMeta(f.id);
    const ttl = f.ttl != null ? f.ttl : meta.ttl;
    if (ttl && f.turn != null && turn - f.turn > ttl) return false;
    const ms = f.ttlMs != null ? f.ttlMs : meta.ttlMs;
    if (ms && f.at && now - f.at > ms) return false;
    return true;
  });
  capPlayerFacts();
}

function sanitizeFacts(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = {};
  const now = Date.now();
  raw.forEach((f) => {
    if (!f || !f.id || !f.label || !f.quote || seen[f.id]) return;
    const meta = factMeta(f.id);
    const at = Number(f.at) || 0;
    const ms = f.ttlMs != null ? Number(f.ttlMs) : meta.ttlMs;
    if (ms && at && now - at > ms) return;
    seen[f.id] = 1;
    out.push({
      id: String(f.id).slice(0, 24),
      label: String(f.label).slice(0, 24),
      quote: String(f.quote).slice(0, 16),
      turn: Number(f.turn) || 0,
      at: at || now,
      nodeId: String(f.nodeId || "").slice(0, 24),
      ttl: f.ttl != null ? Number(f.ttl) : meta.ttl,
      rank: f.rank != null ? Number(f.rank) : meta.rank,
      maxUses: f.maxUses != null ? Number(f.maxUses) : meta.maxUses,
      ttlMs: ms || 0,
      uses: Number(f.uses) || 0,
      echoAfter: Number(f.echoAfter) || 0,
    });
  });
  const ranked = out.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return (b.turn || 0) - (a.turn || 0);
  });
  return ranked.slice(0, MAX_PLAYER_FACTS);
}

function extractPlayerFact(text) {
  const raw = String(text || "").trim();
  if (raw.length < 2) return null;
  for (let i = 0; i < PLAYER_FACT_RULES.length; i++) {
    const rule = PLAYER_FACT_RULES[i];
    const m = raw.match(rule.re);
    if (!m) continue;
    const quote = rule.quote(m);
    const label = rule.label(m);
    if (!quote || !label) continue;
    if (rule.id === "name" && !acceptFactName(quote)) continue;
    return { id: rule.id, label: label, quote: quote };
  }
  return null;
}

function upsertPlayerFact(fact) {
  if (!fact) return null;
  const list = state.playerFacts || (state.playerFacts = []);
  const idx = list.findIndex((f) => f.id === fact.id);
  if (idx >= 0) {
    const prev = list[idx];
    const same = prev.quote === fact.quote;
    if (same && fact.id !== "name" && fact.id !== "promise" && fact.id !== "mistake") return null;
    fact.uses = prev.uses || 0;
    list[idx] = stampFact(fact);
  } else {
    list.push(stampFact(fact));
  }
  expirePlayerFacts();
  state.pendingFactId = fact.id;
  return list.find((f) => f.id === fact.id) || fact;
}

function notePlayerFact(text) {
  const fact = upsertPlayerFact(extractPlayerFact(text));
  if (!fact) return null;
  renderMemoryStrip();
  try { save(); } catch (_) {}
  return fact;
}

function recentHasFact(fact) {
  if (!fact) return false;
  const token = factPhrase(fact);
  if (!token) return false;
  return (state.recentBotReplies || []).slice(-3).some((r) => String(r).indexOf(token) >= 0);
}

function factPhrase(fact) {
  if (!fact) return "";
  if (fact.id === "name") return "你叫" + fact.quote;
  if (fact.id === "promise") return "你應承過";
  if (fact.id === "mistake") return "你認過錯";
  return "你頭先講" + fact.quote;
}

function factCallbackLine(fact) {
  const tone = state.chatTone || "cold";
  const phrase = factPhrase(fact);
  const bank = {
    name: {
      cold: [phrase + "，我記得你。", phrase + "，個名我留低。"],
      wary: [phrase + "，你自己報嘅。", phrase + "，你唔好裝唔識。"],
      warmer: [phrase + "，我叫得出口。", phrase + "，我記住。"],
      sharp: [phrase + "，我記住就夠。", phrase + "，你唔使再報。"],
    },
    promise: {
      cold: [phrase + "。我等結果。", phrase + "。我留低。"],
      wary: [phrase + "。證明。", phrase + "。唔好裝忘。"],
      warmer: ["……" + phrase + "。我等你。", phrase + "。我記得。"],
      sharp: [phrase + "。交。", phrase + "。"],
    },
    mistake: {
      cold: [phrase + "。改到先算。", phrase + "。我記得。"],
      wary: [phrase + "。下一手。", phrase + "。唔好再犯。"],
      warmer: ["……" + phrase + "。改就得。", phrase + "。我留低。"],
      sharp: [phrase + "。快改。", phrase + "。"],
    },
  };
  const pack = bank[fact.id];
  const factBucket = "fact:" + (fact.id || "x");
  if (pack) return pickAvoidRepeat(pack[tone] || pack.cold, factBucket);
  const q = fact.quote;
  return pickAvoidRepeat([
    "你頭先講" + q + "。",
    "你頭先講" + q + "，我記得。",
    "你頭先講" + q + "——我留低。",
  ], factBucket);
}

function factForCallback(askMemory) {
  expirePlayerFacts();
  const facts = state.playerFacts || [];
  const turn = state.factTurn || 0;
  const due = facts.filter((f) => {
    if (!f || !f.quote) return false;
    if (recentHasFact(f)) return false;
    if (askMemory) return true;
    if ((f.uses || 0) >= (f.maxUses || 2)) return false;
    if ((f.echoAfter || 0) > turn) return false;
    return true;
  });
  due.sort((a, b) => {
    const ra = a.rank != null ? a.rank : 5;
    const rb = b.rank != null ? b.rank : 5;
    if (ra !== rb) return ra - rb;
    return (a.turn || 0) - (b.turn || 0);
  });
  if (due.length) return due[0];
  if (!askMemory) return null;
  if (state.memories && state.memories.length) {
    const id = state.memories[state.memories.length - 1];
    const quote = memoryLabel(id);
    const pseudo = { id: "story:" + id, quote: quote, label: quote };
    if (quote && !recentHasFact(pseudo)) return pseudo;
  }
  return null;
}

/** Prefix 「你頭先講…」 once. Keeps the guide's single next step. */
function weaveFactCallback(line, opts) {
  const ask = !!(opts && opts.askMemory);
  const fact = factForCallback(ask);
  const base = String(line || "");
  if (!fact) return base;
  const token = factPhrase(fact) || ("你頭先講" + fact.quote);
  if (base.indexOf(token) >= 0) {
    state.pendingFactId = null;
    return base;
  }
  if (recentHasFact(fact) && !ask) return base;
  const cb = factCallbackLine(fact);
  if (!ask && (cb + base).length > 110) return base;
  if (fact.uses != null) fact.uses += 1;
  state.pendingFactId = null;
  return base ? cb + base : cb;
}

function currentStoryNode() {
  if (!state.story || !state.story.nodes || !state.nodeId) return null;
  return state.story.nodes[state.nodeId] || null;
}

function nodeWantsCall(node) {
  if (!node) return false;
  const tags = Array.isArray(node.tags) ? node.tags : [];
  return node.mode === "call" || tags.indexOf("call") >= 0;
}

function storyNodeWantsCall() {
  return nodeWantsCall(currentStoryNode());
}

function prefersReducedMotion() {
  try {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch (_) {
    return false;
  }
}

function notePlayerTurn(text) {
  const t = String(text || "").trim();
  if (!t || state.chatBusy) return;
  const now = Date.now();
  if (state.lastNotedTurn === t && now - (state.lastNotedAt || 0) < 1500) return;
  state.lastNotedTurn = t;
  state.lastNotedAt = now;
  state.sessionFirstPingSent = true;
  state.factTurn = (state.factTurn || 0) + 1;
  expirePlayerFacts();
  notePlayerFact(t);
  noteCallIntent(t);
  noteOpenPlayerLine(t);
}

function noteCallIntent(text) {
  const t = String(text || "");
  if (/(收線|掛線|掛咗|放下電話)/.test(t)) {
    if (state.callFromIntent && !storyNodeWantsCall()) setCallMode(false);
    return;
  }
  if (!/(打(電話|畀|俾)|通(個)?話|接聽|聽電話)/.test(t)) return;
  if (storyNodeWantsCall() || state.callWanted) return;
  if (state.callIntentNodeId !== state.nodeId) {
    state.callIntentNodeId = state.nodeId;
    state.callIntentCountOnNode = 0;
  }
  if (state.callIntentCountOnNode >= 1) return;
  if (Date.now() < (state.callIntentCooldownUntil || 0)) return;
  state.callIntentCountOnNode += 1;
  state.callIntentCooldownUntil = Date.now() + CALL_INTENT_COOLDOWN_MS;
  state.callFromIntent = true;
  setCallMode(true);
  if (state.callIntentEndTimer) clearTimeout(state.callIntentEndTimer);
  state.callIntentEndTimer = setTimeout(() => {
    state.callIntentEndTimer = null;
    if (state.callFromIntent && !storyNodeWantsCall()) setCallMode(false);
  }, CALL_INTENT_MS);
}

function matchBucket(userText) {
  const t = (userText || "").toLowerCase();
  if (isSilence(userText)) return "silence";
  if (isEmojiOnly(userText)) return "emoji";
  const cast = getCast();
  for (const rule of cast.rules) {
    if (rule.keys.some((k) => t.includes(String(k).toLowerCase()))) {
      return rule.bucket;
    }
  }
  return "default";
}

function topicOf(text) {
  const t = String(text || "").toLowerCase();
  let found = "";
  TOPIC_KEYS.forEach((row) => {
    if (row.keys.some((k) => t.includes(String(k).toLowerCase()))) found = row.topic;
  });
  return found;
}

function isConcreteBucket(bucket) {
  return !!bucket && bucket !== "default" && bucket !== "silence" && bucket !== "emoji" && bucket !== "smalltalk";
}

/** Short continuation of the line already on the table — not a new subject. */
function isFollowUpFragment(text) {
  const t = String(text || "").trim();
  if (!t || isSilence(t)) return true;
  if (topicOf(t)) return false;
  if (isConcreteBucket(matchBucket(t))) return false;
  if (/推門|開門|入去|停低|等等|應承|唔該|掰|bye/i.test(t)) return false;
  if (/^(然後|之後|即係|咁|嗰句|頭先|繼續|未講完|下半|跟住|同埋|仲有)/.test(t) && t.length <= 8) return true;
  return t.length <= 2;
}

function noteOpenPlayerLine(t) {
  const bucket = matchBucket(t);
  const topic = topicOf(t);
  const open = state.openPlayer;
  if (state.halfFollow && state.halfFollow.active) {
    if (open) open.carry = true;
    return;
  }
  if (open && !open.answered && open.text !== t) {
    open.carry = true;
    return;
  }
  if (open && open.answered && isFollowUpFragment(t) && (open.topic || isConcreteBucket(open.bucket))) {
    open.answered = false;
    open.carry = true;
    return;
  }
  state.openPlayer = {
    text: t,
    bucket: bucket,
    topic: topic || "",
    answered: false,
    carry: false,
  };
}

/** Previous line still open, or the second half of a split reply is still owed. */
function heldReplyTarget() {
  const half = state.halfFollow && state.halfFollow.active ? state.halfFollow : null;
  if (half) {
    return {
      half: true,
      bucket: half.bucket || "",
      topic: half.topic || "",
      userText: half.userText || "",
      rest: half.rest || "",
    };
  }
  const open = state.openPlayer;
  if (open && !open.answered && open.carry) {
    return {
      half: false,
      bucket: open.bucket || "",
      topic: open.topic || "",
      userText: open.text || "",
      rest: "",
    };
  }
  return null;
}

function pickProactiveLine() {
  if (state.halfFollow && state.halfFollow.active) return "";
  const tone = syncChatTone();
  const beat = beatProfile(currentStoryNode());
  const open = state.openPlayer;
  if (open && !open.answered) {
    if (open.topic) {
      const echo = topicEchoLine(tone, open.topic);
      if (echo && !repeatsSceneAsk(echo)) return finishIncoming(glueBeat(echo, beat));
    }
    if (isConcreteBucket(open.bucket)) {
      const heldLine = pickAvoidRepeat(linesForBeat(open.bucket, tone), open.bucket);
      if (heldLine && !repeatsSceneAsk(heldLine)) return finishIncoming(glueBeat(heldLine, beat));
    }
    const heldFallback = incomingFallbackLine();
    if (heldFallback) return finishIncoming(glueBeat(heldFallback, beat));
    return "";
  }
  const facts = state.playerFacts || [];
  let line = "";
  if (facts.length && Math.random() < 0.42) {
    const fact = facts[facts.length - 1];
    if (fact && !recentHasFact(fact) && (fact.echoAfter || 0) <= (state.factTurn || 0)) {
      line = factCallbackLine(fact);
      if (fact.uses != null) fact.uses += 1;
    }
  }
  if (!line && Math.random() < 0.35) line = topicEchoLine(tone) || "";
  if (!line && Math.random() < 0.3) line = sceneAsideLine(tone) || "";
  if (!line && state.memories.length && Math.random() < 0.25) line = memoryChipLine(tone) || "";
  if (!line && (state.callMode || beat.tags.call)) line = takePhoneLine("call") || "";
  if (!line) line = takeInboxLine(false) || "";
  if (!line) {
    const incoming = (getCast().incoming || []).filter((l) => lineFitsBeat(l, beat));
    line = incoming.length ? pickAvoidRepeat(incoming, "incoming") : beatFallback(beat, tone);
  }
  return finishIncoming(glueBeat(line, beat));
}


function duckBgmForVideo(on) {
  try {
    if (window.AudioEngine && typeof AudioEngine.setBgmDuck === "function") {
      AudioEngine.setBgmDuck(!!on);
      return;
    }
  } catch (e) {}
  // Fallback: lower HTMLAudio / gain if present on state
  try {
    if (state && state.bgmAudio) {
      state.bgmAudio.volume = on ? 0.05 : (state.bgmVol != null ? state.bgmVol : 0.35);
    }
  } catch (e) {}
}

let portraitVideoGen = 0;

function portraitVideoSrc(story, node) {
  // Node clip wins (one mood file on a stretch). Else per-cast loop.
  // Missing file → still via onerror. Sammi loop CEO-approved 2026-10-23.
  // Vera idle is vera-loop (blazer on). Lights-out nodes set
  // vera-facefusion-preview; Elise stays on the still until a clip is approved.
  const current = node || ((story && story.nodes && state.nodeId && story.nodes[state.nodeId])
    ? story.nodes[state.nodeId]
    : null);
  if (current && current.portraitVideo) return current.portraitVideo;
  /* Continuity still owns this beat. Idle loops stay on dressed defaults. */
  if (current && current.look !== "dressed" && (current.portrait || current.still)) return null;
  const id = (story && story.id) || state.storyId || getCastId();
  if (id === "sam") return "./assets/video/sammi-loop.mp4";
  if (id === "alex") return "./assets/video/vera-loop.mp4";
  return null;
}

/* A beat still plus a clip (ending plates). FaceFusion-only nodes stay put:
   the shared preview is not pulled over vera-03. */
function beatClipOwnsFrame(node, vsrc) {
  return !!(vsrc && node && node.look !== "dressed" && (node.portrait || node.still));
}

function syncPortraitVideo(story, node) {
  const stack = $("#alex-portrait-stack");
  const bg = document.querySelector("#screen-play .play-bg");
  const vid = $("#play-portrait-video");
  if (!vid) return;
  const vsrc = portraitVideoSrc(story, node);
  if (stack && stack.classList) stack.classList.toggle("has-beat-clip", beatClipOwnsFrame(node, vsrc));
  // Same clip already chosen: don't reload (renderNode follows applyStoryArt).
  if (vsrc && vid.getAttribute("data-src") === vsrc) {
    if (!vid.hasAttribute("hidden")) {
      const p = vid.play();
      if (p && p.catch) p.catch(function () {});
    }
    return;
  }
  const gen = ++portraitVideoGen;
  try { vid.pause(); } catch (e) {}
  vid.onloadeddata = null;
  vid.onerror = null;
  if (!vsrc) {
    duckBgmForVideo(false);
    vid.removeAttribute("data-src");
    if (clipCoversStill(stack) && playStageLive() && !prefersReducedMotion()) {
      if (vid.classList) vid.classList.add("is-releasing");
      if (stack && stack.classList) stack.classList.add("is-still-reveal");
      setTimeout(function () {
        if (gen !== portraitVideoGen) return;
        if (vid.getAttribute("data-src")) return;
        finishClipHide(vid, stack, bg);
      }, 900);
      return;
    }
    finishClipHide(vid, stack, bg);
    return;
  }
  if (vid.classList) vid.classList.remove("is-releasing");
  if (stack && stack.classList) stack.classList.remove("is-still-reveal");
  vid.setAttribute("data-src", vsrc);
  // Defer play until after #screen-play paints (entryfix3 hang was sync load/play).
  vid.muted = true;
  vid.defaultMuted = true;
  vid.setAttribute("muted", "");
  vid.setAttribute("playsinline", "");
  vid.setAttribute("webkit-playsinline", "");
  vid.loop = true;
  vid.setAttribute("preload", "metadata");
  const applyClip = function () {
    if (gen !== portraitVideoGen) return;
    if (vid.getAttribute("data-src") !== vsrc) return;
    vid.src = vsrc;
    vid.onerror = function () {
      if (gen !== portraitVideoGen) return;
      // Missing clip → stay on still
      duckBgmForVideo(false);
      try { vid.removeAttribute("src"); vid.load(); } catch (e3) {}
      vid.removeAttribute("data-src");
      vid.setAttribute("hidden", "");
      if (stack) stack.classList.remove("has-video", "has-beat-clip");
      if (bg) bg.classList.remove("has-video");
    };
    vid.onloadeddata = function () {
      if (gen !== portraitVideoGen) return;
      vid.removeAttribute("hidden");
      if (stack) stack.classList.add("has-video");
      if (bg) bg.classList.add("has-video");
      // Muted portrait clips have no track to make room for (#78).
      duckBgmForVideo(false);
      const p = vid.play();
      if (p && p.catch) p.catch(function () {});
    };
    try { vid.load(); } catch (e4) {}
  };
  // Two rAFs + timeout: paint story text first, then start media
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      setTimeout(applyClip, 0);
    });
  });
}


const SCENE_BG = {
  pantry: "./assets/bg/pantry-01.jpg",
  office: "./assets/bg/office.svg",
  lounge: "./assets/bg/lounge.svg",
  lift: "./assets/bg/lift.svg",
  roof: "./assets/bg/roof.svg",
  review: "./assets/bg/review.svg",
  /* Same office plate, graded dark in CSS. No new art. */
  dark: "./assets/bg/office.svg",
};

/* roof/review/dark are real plates (existing svg + a dark grade). Do not fold them away. */
const SCENE_IDS = { office: 1, pantry: 1, lounge: 1, lift: 1, roof: 1, review: 1, dark: 1 };
const SCENE_FOLD = {};
const FG_ANIMS = { "fg-anim-float": 1, "fg-anim-pulse": 1, "fg-anim-sway": 1 };
const PROP_ANIM = {
  "cup-noodles": "fg-anim-float",
  "vending-glow": "fg-anim-pulse",
  "monitor-glow": "fg-anim-pulse",
  blinds: "fg-anim-sway",
  "wine-glass": "fg-anim-sway",
  "floor-indicator": "fg-anim-pulse",
  "lift-blackout-veil": "fg-anim-pulse",
};

/* Cast home when a node has no scene and no exception. */
const CAST_SCENE = { alex: "office", morgan: "lounge", sam: "pantry" };

/*
 * Exceptions only. Everything else uses node.scene or CAST_SCENE.
 * alex n0: corridor outside her door (no corridor plate — lift is the shell; aside stays corridor).
 * alex dark: Friday lights-out / 天亮前. FaceFusion preview (lingerie, blazer off).
 * Same office plate, dark grade. Lit office and Monday review stay vera-loop.
 * alex review: Monday 評核室 (n7pre stays office — still outside the door).
 * morgan m3x–m3x5: lobby + lift car. Suite/window stays lounge (no suite plate).
 * sam office: copier + badge corridor.
 * sam roof: rain / railing / 天台門, before they step through the fire door.
 * sam lift plate: stairwell (s3*) and the post-door interior (s5*). No stair or inside plate.
 */
const NODE_SCENE = {
  alex: {
    n0: "lift",
    n5: "dark", n5b: "dark", n5c: "dark",
    n6a: "dark", n6b: "dark", n6c: "dark",
    n6a2: "dark", n6b2: "dark", n6c2: "dark",
    ending_a: "dark", ending_b: "dark",
    n7: "review", n7b: "review",
    n8a: "review", n8b: "review", n8a2: "review", n8b2: "review",
  },
  morgan: { m3x: "lift", m3x2: "lift", m3x3: "lift", m3x5: "lift" },
  sam: {
    s2x: "office", s2z: "office", s2x2: "office", s2x3: "office", s2x4: "office",
    s3: "lift", s3y: "lift", s3z: "lift", s3z2: "lift", s3y2: "lift", s3pre: "lift",
    s3r: "roof", s3r2: "roof", s3r3: "roof",
    s4: "roof", s4y: "roof", s4z: "roof", s4w: "roof", s4p: "roof", s4p2: "roof",
    s4y2: "roof", s4z2: "roof", s4w2: "roof", s4pre: "roof",
    s5: "lift", s5y: "lift", s5z: "lift", s5w: "lift", s5p: "lift",
    s5y2: "lift", s5z2: "lift", s5w2: "lift", s5p2: "lift", s5q: "lift",
  },
};

/* One living prop per scene. Extras are beat-specific and stay off the face. */
const SCENE_PROPS = {
  office: [{ id: "monitor-glow", anim: "fg-anim-pulse" }],
  pantry: [{ id: "vending-glow", anim: "fg-anim-pulse" }],
  lounge: [],
  lift: [{ id: "floor-indicator", anim: "fg-anim-pulse" }],
  roof: [],
  review: [{ id: "blinds", anim: "fg-anim-sway" }],
  dark: [],
};

const LOUNGE_BAR_NODES = {
  m1: 1, m1b: 1,
  m2a: 1, m2b: 1, m2c: 1, m2a2: 1, m2b2: 1, m2c2: 1,
  m2x: 1, m2x2: 1, m2x3: 1,
  m3: 1, m3v: 1, m3w: 1, m3y: 1, m3z: 1, m3u: 1, m3u2: 1, m3a2: 1,
  m6: 1, m6a: 1, m6b: 1, m6c: 1, m6bar: 1,
};

const NODE_PROP_EXTRA = {
  alex: {
    n0e: [{ id: "blinds", anim: "fg-anim-sway" }],
    n7: [{ id: "blinds", anim: "fg-anim-sway" }],
    n7b: [{ id: "blinds", anim: "fg-anim-sway" }],
  },
  sam: {
    s1: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s1b: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s1d: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s2p2: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s6: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s6a: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s6b: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s6c: [{ id: "cup-noodles", anim: "fg-anim-float" }],
    s6near: [{ id: "cup-noodles", anim: "fg-anim-float" }],
  },
};

/* Sammi early pantry beats — legacy #scene-bg photo only, if node.scene omitted */
const SAM_PANTRY_NODES = {
  s1: 1, s1b: 1, s1c: 1, s1d: 1,
  s2a: 1, s2a2: 1, s2b: 1, s2b2: 1, s2c: 1, s2c2: 1,
  s2p: 1, s2p2: 1, s2y: 1,
  s6: 1, s6a: 1, s6b: 1, s6c: 1, s6near: 1
};

function storyCastId(story) {
  return (story && story.id) || state.storyId || getCastId();
}

function foldScene(scene) {
  if (!scene) return null;
  if (SCENE_IDS[scene]) return scene;
  if (SCENE_FOLD[scene]) return SCENE_FOLD[scene];
  return null;
}

function resolveScene(story, node) {
  const fromNode = foldScene(node && node.scene);
  if (fromNode) return fromNode;
  const id = storyCastId(story);
  const nid = (node && node.id) || state.nodeId;
  const mapped = nid && NODE_SCENE[id] && NODE_SCENE[id][nid];
  if (mapped && SCENE_IDS[mapped]) return mapped;
  if (CAST_SCENE[id]) return CAST_SCENE[id];
  /* Old shell still present: read its scene key, do not treat it as primary. */
  const legacy = readLegacySceneKey();
  if (legacy) return legacy;
  return "office";
}

function syncSceneBgm() {
  try {
    const node = (state.story && state.nodeId && state.story.nodes)
      ? state.story.nodes[state.nodeId] : null;
    const scene = resolveScene(state.story, node);
    const inCall = !!(state.callMode || state.callWanted);
    if (AudioEngine.setBgmScene) AudioEngine.setBgmScene(scene, inCall);
  } catch (_) {}
}

function normalizeProp(entry) {
  if (!entry) return null;
  const id = typeof entry === "string" ? entry : entry.id;
  if (!id) return null;
  let anim = typeof entry === "string" ? PROP_ANIM[entry] : entry.anim;
  if (anim && !FG_ANIMS[anim]) anim = PROP_ANIM[id] || "";
  if (!anim) anim = PROP_ANIM[id] || "";
  return { id: String(id), anim: anim || "" };
}

function dedupeProps(list) {
  const seen = {};
  const out = [];
  list.forEach((entry) => {
    const prop = normalizeProp(entry);
    if (!prop || seen[prop.id]) return;
    seen[prop.id] = 1;
    out.push(prop);
  });
  return out;
}

function resolveProps(story, node) {
  if (node && Array.isArray(node.props)) return dedupeProps(node.props);
  const id = storyCastId(story);
  const nid = (node && node.id) || state.nodeId || "";
  const scene = resolveScene(story, node);
  let list = (SCENE_PROPS[scene] || []).slice();
  if (scene === "lounge" && LOUNGE_BAR_NODES[nid]) {
    list = list.concat([{ id: "wine-glass", anim: "fg-anim-sway" }]);
  }
  const extra = NODE_PROP_EXTRA[id] && NODE_PROP_EXTRA[id][nid];
  if (extra) list = list.concat(extra);
  return dedupeProps(list);
}

function readLegacySceneKey() {
  const sceneEl = document.getElementById("scene-bg");
  if (!sceneEl) return null;
  const fromAttr = foldScene(sceneEl.getAttribute("data-scene"));
  if (fromAttr) return fromAttr;
  const classes = (sceneEl.className || "").split(/\s+/);
  for (let i = 0; i < classes.length; i++) {
    const folded = foldScene(classes[i]);
    if (folded) return folded;
  }
  return null;
}

function ensureSceneStack(bg) {
  let stack = bg.querySelector(".scene-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "scene-stack";
    const legacyBg = document.getElementById("scene-bg");
    if (legacyBg && legacyBg.parentNode === bg) bg.insertBefore(stack, legacyBg.nextSibling);
    else bg.insertBefore(stack, bg.firstChild);
  }
  let layerBg = stack.querySelector(".scene-layer-bg");
  if (!layerBg) {
    layerBg = document.createElement("div");
    layerBg.className = "scene-layer-bg";
    stack.insertBefore(layerBg, stack.firstChild);
  }
  let portraitLayer = stack.querySelector(".scene-layer-portrait");
  if (!portraitLayer) {
    portraitLayer = document.createElement("div");
    portraitLayer.className = "scene-layer-portrait";
    stack.appendChild(portraitLayer);
  }
  let fg = stack.querySelector(".scene-layer-fg");
  if (!fg) {
    fg = document.createElement("div");
    fg.className = "scene-layer-fg";
    fg.setAttribute("aria-hidden", "true");
    stack.appendChild(fg);
  }
  const portrait = document.getElementById("alex-portrait-stack");
  if (portrait && portrait.parentNode !== portraitLayer) portraitLayer.appendChild(portrait);
  const overlay = document.querySelector("#screen-play .play-overlay");
  if (overlay && stack.contains(overlay)) {
    const stage = document.querySelector("#screen-play .play-stage");
    if (stage) stage.appendChild(overlay);
  }
  return { stack: stack, layerBg: layerBg, fg: fg };
}

function setFgAnim(el, anim) {
  el.classList.remove("fg-anim-float", "fg-anim-pulse", "fg-anim-sway");
  if (anim && FG_ANIMS[anim]) el.classList.add(anim);
}

function syncFgProps(fg, props) {
  if (!fg) return;
  const want = {};
  props.forEach((prop) => { want[prop.id] = prop.anim || ""; });
  const existing = fg.querySelectorAll(".fg-prop");
  for (let i = existing.length - 1; i >= 0; i--) {
    const el = existing[i];
    const id = el.getAttribute("data-prop");
    if (!Object.prototype.hasOwnProperty.call(want, id)) {
      dropFgProp(fg, el);
      continue;
    }
    keepFgProp(el, want[id]);
    delete want[id];
  }
  Object.keys(want).forEach((id) => {
    const el = document.createElement("div");
    el.className = "fg-prop";
    el.setAttribute("data-prop", id);
    setFgAnim(el, want[id]);
    if (playStageLive() && (id === "roof-rain-streaks" || id === "lift-blackout-veil")) {
      el.classList.add("is-entering");
      setTimeout(function () { el.classList.remove("is-entering"); }, 920);
    }
    fg.appendChild(el);
  });
}

function legacySceneKey(story, node) {
  if (node && node.scene && SCENE_BG[node.scene]) return node.scene;
  const id = storyCastId(story);
  const nid = (node && node.id) || state.nodeId;
  if (id === "sam" && nid && SAM_PANTRY_NODES[nid]) return "pantry";
  return null;
}

function legacyPropIds(node) {
  if (!node || !Array.isArray(node.props)) return [];
  return node.props.map((entry) => (typeof entry === "string" ? entry : entry && entry.id)).filter(Boolean);
}

/* #scene-bg / #prop-layer stay readable for the old shell. Contract B does not use them as primary. */
function applyLegacySceneShell(bg, story, node) {
  const sceneEl = $("#scene-bg");
  const cup = $("#prop-cup-noodles");
  const glow = $("#prop-vending-glow");
  const scene = legacySceneKey(story, node);
  const props = legacyPropIds(node);
  const src = scene && SCENE_BG[scene] ? SCENE_BG[scene] : null;
  if (src) {
    bg.classList.add("layered-scene");
    bg.setAttribute("data-scene", scene);
    if (sceneEl) {
      const url = 'url("' + src + '")';
      if (sceneEl.style.backgroundImage !== url) sceneEl.style.backgroundImage = url;
      sceneEl.removeAttribute("hidden");
      const folded = foldScene(scene);
      if (folded) sceneEl.setAttribute("data-scene", folded);
    }
  } else {
    bg.classList.remove("layered-scene");
    bg.removeAttribute("data-scene");
    if (sceneEl) {
      sceneEl.style.backgroundImage = "";
      sceneEl.setAttribute("hidden", "");
      sceneEl.removeAttribute("data-scene");
    }
  }
  if (cup) {
    if (props.indexOf("cup-noodles") >= 0) {
      cup.removeAttribute("hidden");
      requestAnimationFrame(function () { cup.classList.add("is-on"); });
    } else {
      cup.classList.remove("is-on");
      setTimeout(function () {
        if (cup && !cup.classList.contains("is-on")) cup.setAttribute("hidden", "");
      }, 560);
    }
  }
  if (glow) {
    if (props.indexOf("vending-glow") >= 0) {
      glow.removeAttribute("hidden");
      requestAnimationFrame(function () { glow.classList.add("is-on"); });
    } else {
      glow.classList.remove("is-on");
      setTimeout(function () {
        if (glow && !glow.classList.contains("is-on")) glow.setAttribute("hidden", "");
      }, 700);
    }
  }
}

function applySceneLayers(story, node) {
  const bg = document.querySelector("#screen-play .play-bg");
  if (!bg) return;
  const parts = ensureSceneStack(bg);
  const scene = resolveScene(story, node);
  const props = resolveProps(story, node);
  const prevIds = fgPropIds(parts.fg);
  const nextIds = props.map(function (p) { return p.id; });
  const sceneChanged = swapScenePlate(parts.layerBg, scene);
  syncFgProps(parts.fg, props);
  applyLegacySceneShell(bg, story, node);
  syncSceneBgm();
  const rain = nextIds.indexOf("roof-rain-streaks") >= 0;
  const flicker = nextIds.indexOf("lift-blackout-veil") >= 0;
  const hadRain = prevIds.indexOf("roof-rain-streaks") >= 0;
  const hadFlicker = prevIds.indexOf("lift-blackout-veil") >= 0;
  if (sceneChanged || rain !== hadRain || flicker !== hadFlicker) {
    queueSceneCut({ rain: rain, flicker: flicker });
  } else if (cutPending) {
    cutPending.rain = rain;
    cutPending.flicker = flicker;
  }
}

function portraitSrc(story) {
  if (story && story.portrait) return story.portrait;
  const id = (story && story.id) || state.storyId;
  if (id === "morgan") return "./assets/stills/vera-02.jpg";
  if (id === "sam") return "./assets/stills/sammi-01.jpg";
  return "./assets/stills/vera-03.jpg";
}

function bustStill(src) {
  if (!src) return src;
  const path = String(src);
  if (path.indexOf("?") >= 0) return path;
  return path + "?v=act2hot1";
}

/* node.portrait, else node.still, else the cast lock.
   Dressed beats stay on vera-02 / sammi-01 / vera-03. */
function beatStillSrc(story, node) {
  const current = node || ((story && story.nodes && state.nodeId && story.nodes[state.nodeId])
    ? story.nodes[state.nodeId]
    : null);
  if (current && current.look !== "dressed") {
    const custom = current.portrait || current.still;
    if (custom) return bustStill(custom);
  }
  const id = storyCastId(story);
  if (id === "sam") return "./assets/stills/sammi-01.jpg?v=elise-lock1";
  if (id === "morgan") return "./assets/stills/vera-02.jpg?v=elise-lock1";
  return "./assets/stills/vera-03.jpg?v=elise-lock1";
}

function clearBeatAtmosphere() {
  const body = document.body;
  if (!body) return;
  ["data-beat-mood", "data-beat-place", "data-beat-look", "data-beat-heat", "data-beat-tone"].forEach((key) => {
    body.removeAttribute(key);
  });
}

/* Portrait / room dissolves. First painted beat stays a hard cut so entry
   does not dissolve the HTML default. Later still, room, rain, and blackout
   changes share one dim. beatStillSrc itself is unchanged. */
let stageSettled = false;
let cutPending = null;
let sceneCutTimer = 0;
let stillToken = 0;
let stillGhostTimer = 0;
let sceneGhostTimer = 0;

function playStageLive() {
  const play = document.getElementById("screen-play");
  return !!(stageSettled && play && play.classList && play.classList.contains("active"));
}

function stillFileName(src) {
  return String(src || "").split("?")[0].split("/").pop();
}

function fgPropIds(fg) {
  const ids = [];
  if (!fg || !fg.querySelectorAll) return ids;
  const nodes = fg.querySelectorAll(".fg-prop");
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].classList && nodes[i].classList.contains("is-leaving")) continue;
    const id = nodes[i].getAttribute("data-prop");
    if (id) ids.push(id);
  }
  return ids;
}

function clipCoversStill(stack) {
  if (!stack || !stack.classList || !stack.classList.contains("has-video")) return false;
  const vid = stack.querySelector ? stack.querySelector(".portrait-video") : null;
  if (!vid || vid.hasAttribute("hidden")) return false;
  const img = stack.querySelector("#alex-portrait");
  if (!img || typeof window.getComputedStyle !== "function") return false;
  const opacity = parseFloat(window.getComputedStyle(img).opacity);
  return opacity < 0.2;
}

function dropFgProp(fg, el) {
  const id = el.getAttribute("data-prop") || "";
  const veil = id === "roof-rain-streaks" || id === "lift-blackout-veil";
  if (!veil || prefersReducedMotion() || !playStageLive() || !el.classList) {
    if (el.parentNode) el.parentNode.removeChild(el);
    return;
  }
  if (el.classList.contains("is-leaving")) return;
  el.classList.add("is-leaving");
  clearTimeout(el._leaveTimer);
  el._leaveTimer = setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 760);
}

function keepFgProp(el, anim) {
  if (!el) return;
  if (el._leaveTimer) {
    clearTimeout(el._leaveTimer);
    el._leaveTimer = 0;
  }
  if (el.classList) el.classList.remove("is-leaving");
  setFgAnim(el, anim);
}

function queueSceneCut(flags) {
  if (prefersReducedMotion() || !playStageLive()) return;
  flags = flags || {};
  if (!cutPending) {
    cutPending = { rain: false, flicker: false };
    requestAnimationFrame(function () {
      const pending = cutPending;
      cutPending = null;
      if (pending) beginSceneCut(pending);
    });
  }
  if (flags.rain) cutPending.rain = true;
  if (flags.flicker) cutPending.flicker = true;
}

function beginSceneCut(flags) {
  const bg = document.querySelector("#screen-play .play-bg");
  if (!bg || !bg.classList) return;
  bg.classList.remove("is-cut", "is-rain", "is-flicker");
  void bg.offsetWidth;
  bg.classList.add("is-cut");
  if (flags.rain) bg.classList.add("is-rain");
  if (flags.flicker) bg.classList.add("is-flicker");
  clearTimeout(sceneCutTimer);
  sceneCutTimer = setTimeout(function () {
    bg.classList.remove("is-cut", "is-rain", "is-flicker");
  }, 980);
}

function clearPortraitGhosts(stack) {
  if (!stack || !stack.querySelectorAll) return;
  const old = stack.querySelectorAll(".portrait-ghost");
  for (let i = 0; i < old.length; i++) {
    if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
  }
}

function swapStill(img, src) {
  if (!img || !src) return;
  const nextFile = stillFileName(src);
  const cur = img.getAttribute("src") || "";
  if (!nextFile || cur.indexOf(nextFile) >= 0) return;
  const stack = img.parentNode;
  if (clipCoversStill(stack)) {
    img.setAttribute("src", src);
    return;
  }
  if (prefersReducedMotion() || !playStageLive() || !stack || typeof Image !== "function") {
    img.setAttribute("src", src);
    return;
  }
  const token = ++stillToken;
  const ghost = document.createElement("img");
  ghost.className = "portrait portrait-ghost";
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  ghost.src = img.currentSrc || cur;
  clearPortraitGhosts(stack);
  try {
    stack.appendChild(ghost);
  } catch (e) {
    img.setAttribute("src", src);
    return;
  }
  let revealed = false;
  const reveal = function () {
    if (revealed || token !== stillToken) return;
    revealed = true;
    img.setAttribute("src", src);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (token !== stillToken || !ghost.parentNode) return;
        ghost.classList.add("is-out");
      });
    });
    clearTimeout(stillGhostTimer);
    stillGhostTimer = setTimeout(function () {
      if (token !== stillToken) return;
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    }, 940);
  };
  const pre = new Image();
  const cap = setTimeout(reveal, 640);
  pre.onload = function () {
    clearTimeout(cap);
    reveal();
  };
  pre.onerror = function () {
    clearTimeout(cap);
    if (token !== stillToken) return;
    revealed = true;
    img.setAttribute("src", src);
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
  };
  pre.src = src;
  queueSceneCut({});
}

function swapScenePlate(layerBg, scene) {
  if (!layerBg || !scene) return false;
  const prev = layerBg.getAttribute("data-scene") || "";
  if (prev === scene) return false;
  const parent = layerBg.parentNode;
  if (prefersReducedMotion() || !playStageLive() || !parent || typeof layerBg.cloneNode !== "function") {
    layerBg.setAttribute("data-scene", scene);
    return true;
  }
  if (parent.querySelectorAll) {
    const old = parent.querySelectorAll(".scene-layer-bg-ghost");
    for (let i = 0; i < old.length; i++) {
      if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
    }
  }
  const ghost = layerBg.cloneNode(false);
  if (ghost.classList) ghost.classList.add("scene-layer-bg-ghost");
  ghost.removeAttribute("id");
  parent.insertBefore(ghost, layerBg.nextSibling);
  layerBg.setAttribute("data-scene", scene);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (ghost.classList) ghost.classList.add("is-out");
    });
  });
  clearTimeout(sceneGhostTimer);
  sceneGhostTimer = setTimeout(function () {
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
  }, 960);
  return true;
}

function finishClipHide(vid, stack, bg) {
  if (!vid) return;
  if (vid.classList) vid.classList.remove("is-releasing");
  if (vid.hasAttribute("src")) vid.removeAttribute("src");
  try { vid.load(); } catch (e) {}
  vid.setAttribute("hidden", "");
  if (stack && stack.classList) stack.classList.remove("has-video", "is-still-reveal", "has-beat-clip");
  if (bg && bg.classList) bg.classList.remove("has-video");
}

function applyBeatContinuity(story, node) {
  const beat = beatProfile(node);
  const tone = syncChatTone();
  const body = document.body;
  if (body) {
    body.setAttribute("data-beat-mood", beat.mood || "cold");
    body.setAttribute("data-beat-place", beat.place || "office");
    body.setAttribute("data-beat-look", beat.look || "dressed");
    body.setAttribute("data-beat-heat", intimacyBand());
    body.setAttribute("data-beat-tone", tone || "cold");
  }
  const src = beatStillSrc(story, node);
  const img = $("#alex-portrait");
  if (img && src) swapStill(img, src);
  if (src && document.documentElement) {
    document.documentElement.style.setProperty("--play-portrait", 'url("' + src + '")');
  }
}

function applyStoryArt(story) {
  const src = portraitSrc(story);
  const img = $("#alex-portrait");
  if (img && src) swapStill(img, src);
  document.documentElement.style.setProperty("--play-portrait", 'url("' + src + '")');
  const nodeForScene = (state.story && state.nodeId && state.story.nodes)
    ? state.story.nodes[state.nodeId]
    : null;
  applySceneLayers(story, nodeForScene);
  const tint = (story && story.tint) || "";
  if (tint) document.body.setAttribute("data-tint", tint);
  else document.body.removeAttribute("data-tint");
  const cast = getCast();
  const who = $("#chat-who");
  if (who) who.textContent = cast.name;
  const chatInput = $("#chat-input");
  if (chatInput) chatInput.placeholder = "傳訊俾 " + cast.name + "…";
  const toastDefault = $("#incoming-toast-text");
  if (toastDefault && !state.unreadCount) toastDefault.textContent = cast.toast;
  const mask = $("#blink-mask");
  // blink mask retired — keep hidden
  if (mask) mask.setAttribute("hidden", "");
  syncPortraitVideo(story, nodeForScene);
}

function renderMeters() {
  const heatEl = $("#meter-heat");
  const tenEl = $("#meter-tension");
  if (heatEl) heatEl.style.width = clampMeter(state.heat) + "%";
  if (tenEl) tenEl.style.width = clampMeter(state.tension) + "%";
  document.body.classList.toggle("heat-high", state.heat >= 55);
  document.body.classList.toggle("tension-high", state.tension >= 50);
}

function memoryLabel(id) {
  const map = (state.story && state.story.memoryLabels) || {};
  return map[id] || id;
}

function addMemories(ids) {
  if (!ids || !ids.length) return;
  const next = state.memories.slice();
  ids.forEach((id) => {
    if (!id) return;
    if (!next.includes(id)) next.push(id);
  });
  state.memories = next.slice(-MAX_MEMORIES);
}

function memoryRows() {
  const rows = [];
  const cont = [];
  const rest = [];
  (state.memories || []).forEach((id) => {
    if (/^(from_ending_|act2_from_)/.test(id)) cont.push(id);
    else rest.push(id);
  });
  cont.forEach((id) => {
    rows.push({ key: "s:" + id, label: memoryChipLabel(id) });
  });
  (state.playerFacts || []).forEach((f) => {
    if (f && f.label) rows.push({ key: "f:" + f.id, label: f.label });
  });
  rest.forEach((id) => {
    rows.push({ key: "s:" + id, label: memoryChipLabel(id) });
  });
  return rows;
}

function renderMemoryStrip() {
  const strip = $("#memory-strip");
  const chips = $("#memory-chips");
  if (!strip || !chips) return;
  chips.innerHTML = "";
  const rows = memoryRows();
  if (!rows.length) {
    strip.setAttribute("hidden", "");
  } else {
    strip.removeAttribute("hidden");
    rows.slice(0, 5).forEach((row) => {
      const span = document.createElement("span");
      span.className = "memory-chip";
      span.dataset.memKey = row.key;
      span.textContent = row.label;
      chips.appendChild(span);
    });
  }
  if (state.memoryPanelOpen) renderMemoryPanel();
}

function stopCallTimer() {
  if (state.callTimerId) {
    clearInterval(state.callTimerId);
    state.callTimerId = null;
  }
}

function startCallTimer() {
  stopCallTimer();
  state.callSeconds = 0;
  const el = $("#call-timer");
  const tick = () => {
    state.callSeconds += 1;
    if (el) {
      const m = String(Math.floor(state.callSeconds / 60)).padStart(2, "0");
      const s = String(state.callSeconds % 60).padStart(2, "0");
      el.textContent = `${m}:${s}`;
    }
  };
  if (el) el.textContent = "00:00";
  state.callTimerId = setInterval(tick, 1000);
}

function showCallChrome(animate) {
  const chrome = $("#call-chrome");
  if (!chrome) return;
  const who = $("#call-who");
  if (who) who.textContent = "通話中 · " + getCast().name;
  chrome.removeAttribute("hidden");
  if (animate && !prefersReducedMotion()) {
    chrome.style.transition = "none";
    chrome.style.opacity = "0";
    void chrome.offsetWidth;
    chrome.style.transition = "opacity .36s ease";
    chrome.style.opacity = "1";
  } else {
    chrome.style.transition = "";
    chrome.style.opacity = "1";
  }
}

function hideCallChrome() {
  const chrome = $("#call-chrome");
  if (!chrome) return;
  chrome.setAttribute("hidden", "");
  chrome.style.transition = "";
  chrome.style.opacity = "";
}

function playCallSfx() {
  const now = Date.now();
  if (now - (state.lastCallSfxAt || 0) < CALL_SFX_GAP_MS) return;
  if (audioPrefs.masterMute) return;
  state.lastCallSfxAt = now;
  try { AudioEngine.sfxCall(); } catch (_) {}
}

function finishCallExit() {
  if (state.callWanted) return;
  state.callMode = false;
  state.callFromIntent = false;
  document.body.classList.remove("mode-call");
  hideCallChrome();
  stopCallTimer();
  const el = $("#call-timer");
  if (el) el.textContent = "00:00";
  syncSceneBgm();
}

function setCallMode(on) {
  const want = !!on;
  if (state.callExitTimer) {
    clearTimeout(state.callExitTimer);
    state.callExitTimer = null;
  }
  if (want) {
    const fresh = !state.callWanted;
    state.callWanted = true;
    state.callMode = true;
    document.body.classList.add("mode-call");
    showCallChrome(fresh);
    if (fresh) {
      startCallTimer();
      playCallSfx();
    }
    syncSceneBgm();
    return;
  }
  if (!state.callWanted && !state.callMode) return;
  state.callWanted = false;
  if (state.callIntentEndTimer) {
    clearTimeout(state.callIntentEndTimer);
    state.callIntentEndTimer = null;
  }
  const chrome = $("#call-chrome");
  if (!chrome || prefersReducedMotion()) {
    finishCallExit();
    return;
  }
  chrome.style.transition = "opacity .36s ease";
  chrome.style.opacity = "0";
  state.callExitTimer = setTimeout(() => {
    state.callExitTimer = null;
    finishCallExit();
  }, CALL_EXIT_MS);
}

function renderThoughtAside(node) {
  const thoughtSlot = $("#thought-slot");
  const asideSlot = $("#aside-slot");
  const thoughtEl = $("#play-thought");
  const asideEl = $("#play-aside");
  state.stashedNodeThought = node && node.thought ? String(node.thought) : "";
  state.guidanceThoughtActive = false;
  if (thoughtSlot && thoughtEl) {
    if (node.thought) {
      thoughtEl.textContent = node.thought;
      thoughtSlot.removeAttribute("hidden");
      pulseIn(thoughtSlot);
    } else {
      thoughtSlot.setAttribute("hidden", "");
      thoughtEl.textContent = "";
    }
  }
  if (asideSlot && asideEl) {
    if (node.aside) {
      asideEl.textContent = node.aside;
      asideSlot.removeAttribute("hidden");
      pulseIn(asideSlot);
    } else {
      asideSlot.setAttribute("hidden", "");
      asideEl.textContent = "";
    }
  }
}

function applyNodeMeta(node) {
  const storyCall = nodeWantsCall(node);
  if (storyCall) {
    state.callFromIntent = false;
    if (state.callIntentEndTimer) {
      clearTimeout(state.callIntentEndTimer);
      state.callIntentEndTimer = null;
    }
    setCallMode(true);
  } else if (!(state.callFromIntent && state.callIntentNodeId === state.nodeId)) {
    setCallMode(false);
  }
  addMemories(node.remember || []);
  renderMemoryStrip();
  renderThoughtAside(node);
  renderMeters();
  maybePushCallBeat(node);
}

function maybePushCallBeat(node) {
  if (!node || !nodeWantsCall(node)) return;
  const id = node.id || state.nodeId || "";
  if (!id || state.callBeatNodeId === id) return;
  state.callBeatNodeId = id;
  const raw = takePhoneLine("call");
  if (!raw) return;
  const line = publishSpoken(glueBeat(raw, beatProfile(node)));
  if (!line) return;
  appendChat("alex", line);
  pushChatMemory("bot", line);
}


/* ============================================================
   P1) Blink mask, incoming pings, memory panel
   ============================================================ */
function triggerBlink() {
  /* retired: hard-image lid overlay never aligns eyes */
}

function startLifeMotion() {
  /* blink loop off; portrait-breathe CSS + mode-speaking stay */
}

function setUnread(n) {
  state.unreadCount = Math.max(0, n);
  const badge = $("#chat-unread");
  if (!badge) return;
  if (state.unreadCount > 0) {
    badge.textContent = String(state.unreadCount);
    badge.removeAttribute("hidden");
  } else {
    badge.setAttribute("hidden", "");
  }
}

function showIncomingToast(text) {
  const toast = $("#incoming-toast");
  const label = $("#incoming-toast-text");
  const hud = $("#play-hud");
  if (!toast) return;
  if (hud && toast.parentElement !== hud) hud.appendChild(toast);
  if (label) label.textContent = text || getCast().toast;
  toast.removeAttribute("hidden");
  // Portrait-first CSS hides this node. Reveal it in the HUD without editing those stylesheets.
  toast.style.setProperty("display", "flex", "important");
  toast.style.setProperty("max-width", "100%", "important");
}

function hideIncomingToast() {
  const toast = $("#incoming-toast");
  if (!toast) return;
  toast.setAttribute("hidden", "");
  toast.style.removeProperty("display");
}

function userHasChatted() {
  return (state.chatUserLines || []).length > 0;
}

function incomingFollowDue() {
  const open = state.openPlayer;
  if (open && open.answered === false && String(open.text || "").trim()) return true;
  const turns = state.spokenTurns || [];
  const last = turns.length ? turns[turns.length - 1] : null;
  if (last && /[？?]/.test(String(last.raw || ""))) return true;
  const bots = state.chatBotLines || [];
  const lastBot = bots.length ? String(bots[bots.length - 1] || "") : "";
  return /[？?]/.test(lastBot);
}

function incomingWindow() {
  const first = !state.sessionFirstPingSent && !userHasChatted();
  if (first) return { first: true, follow: false, min: INCOMING_FIRST_MIN_MS, span: 5000 };
  if (incomingFollowDue()) return { first: false, follow: true, min: INCOMING_FOLLOW_MIN_MS, span: INCOMING_FOLLOW_SPAN_MS };
  return { first: false, follow: false, min: INCOMING_IDLE_MIN_MS, span: 16000 };
}

function incomingWaitMs() {
  const window = incomingWindow();
  return window.min + Math.random() * window.span;
}

function sceneAskCores() {
  const cores = [];
  const push = (text) => {
    String(text || "").split(/[。！？?\n]/).forEach((part) => {
      const core = part.replace(/[？?\s，,、]/g, "");
      if (core.length >= 6) cores.push(core);
    });
  };
  const node = currentStoryNode();
  if (node && node.sceneGoal && node.sceneGoal.ask) push(node.sceneGoal.ask);
  const turns = state.spokenTurns || [];
  const last = turns.length ? turns[turns.length - 1] : null;
  if (last && last.raw) push(last.raw);
  return cores;
}

function repeatsSceneAsk(line) {
  const flat = String(line || "").replace(/[？?\s，,、。！!]/g, "");
  if (!flat) return false;
  return sceneAskCores().some((core) => core && flat.indexOf(core) >= 0);
}

function withRememberedName(line) {
  const named = nameFact();
  if (!named || !named.quote) return line;
  const base = ensureComplete(String(line || "").trim());
  if (!base) return base;
  if (base.indexOf(named.quote) >= 0) return base;
  return ensureComplete("你叫" + named.quote + "。" + base);
}

function incomingFallbackLine() {
  const beat = beatProfile(currentStoryNode());
  const tone = syncChatTone();
  const pack = []
    .concat(getCast().incoming || [], getCast().firstPing || [])
    .filter((l) => l && lineFitsBeat(l, beat) && !repeatsSceneAsk(l));
  if (pack.length) return pickAvoidRepeat(pack, "incoming");
  const fb = beatFallback(beat, tone);
  if (!repeatsSceneAsk(fb)) return fb;
  return "你而家回我一句清楚嘅。";
}

function finishIncoming(line) {
  const raw = ensureComplete(String(line || "").trim());
  if (!raw) return "";
  const beat = beatProfile(currentStoryNode());
  let out = raw;
  if (repeatsSceneAsk(out)) {
    const alt = glueBeat(incomingFallbackLine(), beat);
    if (!alt || repeatsSceneAsk(alt)) return "";
    out = alt;
  }
  return withRememberedName(out);
}

function pickFirstPingLine() {
  const cast = getCast();
  const beat = beatProfile(currentStoryNode());
  if (state.callMode || beat.tags.call) {
    const callLine = takePhoneLine("call");
    if (callLine) return finishIncoming(glueBeat(callLine, beat));
  }
  if (preferredMemoryId()) {
    const inbox = takeInboxLine(true);
    if (inbox) return finishIncoming(glueBeat(inbox, beat));
  }
  const pack = ((cast.firstPing && cast.firstPing.length) ? cast.firstPing : (cast.incoming || []))
    .filter((l) => lineFitsBeat(l, beat));
  let line = "";
  if (state.callMode || beat.tags.call) {
    line = pickAvoidRepeat(["聽筒度你聽到未，回我一句。", "而家通緊話，你回我一句。"].concat(pack), "incoming");
  } else if (beat.place === "corridor") {
    line = pickAvoidRepeat(["你喺走廊未，回我一句。", "你企喺門口，有事就講清楚。"].concat(pack), "incoming");
  } else {
    line = pack.length ? pickAvoidRepeat(pack, "incoming") : beatFallback(beat, syncChatTone());
  }
  return finishIncoming(glueBeat(line, beat));
}

function pushIncomingPing() {
  const play = $("#screen-play");
  if (!play || !play.classList.contains("active") || state.chatBusy) return;
  if (screens.ending && screens.ending.classList.contains("active")) return;
  if (state.unreadCount > 0) return;
  if (state.callMode && Date.now() - (state.lastCallSfxAt || 0) < 6000) return;

  if (state.proactiveNodeId !== state.nodeId) {
    state.proactiveNodeId = state.nodeId;
    state.proactiveCountOnNode = 0;
  }
  if (state.proactiveCountOnNode >= PROACTIVE_MAX_PER_NODE) return;
  const follow = incomingFollowDue();
  if (!follow && Date.now() < (state.proactiveCooldownUntil || 0)) return;
  const first = !state.sessionFirstPingSent && !userHasChatted();
  const line = publishSpoken(first ? pickFirstPingLine() : pickProactiveLine());
  if (!line) return;
  if (first) state.sessionFirstPingSent = true;
  appendChat("alex", line);
  pushChatMemory("bot", line);
  state.proactiveCountOnNode += 1;
  state.proactiveCooldownUntil = Date.now() + (follow ? INCOMING_FOLLOW_MIN_MS : PROACTIVE_COOLDOWN_MS);
  setUnread(state.unreadCount + 1);
  showIncomingToast(line);
  try {
    if (!audioPrefs.masterMute) AudioEngine.sfxPing();
  } catch (_) {}
  if (!speaking && !audioPrefs.voiceMute) {
    try { speakChat(line); } catch (_) {}
  }
  state.lastChatActivityAt = Date.now();
  scheduleProactivePing();
}

function clearIncomingTimer() {
  if (state.incomingTimerId) {
    clearTimeout(state.incomingTimerId);
    state.incomingTimerId = null;
  }
}

function stopIncomingRhythm() {
  clearIncomingTimer();
  hideIncomingToast();
}

function scheduleProactivePing() {
  clearIncomingTimer();
  const play = $("#screen-play");
  if (!play || !play.classList.contains("active")) return;
  if (screens.ending && screens.ending.classList.contains("active")) return;

  const wait = incomingWaitMs();
  state.incomingTimerId = setTimeout(() => {
    state.incomingTimerId = null;
    const stillPlay = $("#screen-play");
    if (!stillPlay || !stillPlay.classList.contains("active")) return;
    if (state.chatBusy) {
      scheduleProactivePing();
      return;
    }
    if (userHasChatted()) state.sessionFirstPingSent = true;
    const pace = incomingWindow();
    const idleFor = Date.now() - (state.lastChatActivityAt || 0);
    const minIdle = pace.min - 500;
    const cooled = pace.follow || Date.now() >= (state.proactiveCooldownUntil || 0);
    if (state.unreadCount === 0 && idleFor >= minIdle && cooled && (pace.first || pace.follow || Math.random() < 0.8)) {
      pushIncomingPing();
    }
    scheduleProactivePing();
  }, wait);
}

function startIncomingRhythm() {
  if (!state.lastChatActivityAt) state.lastChatActivityAt = Date.now();
  if (state.proactiveNodeId !== state.nodeId) {
    state.proactiveNodeId = state.nodeId;
    state.proactiveCountOnNode = 0;
  }
  if (!state.incomingTimerId) scheduleProactivePing();
}


function renderMemoryPanel() {
  const list = $("#memory-panel-list");
  const empty = $("#memory-panel-empty");
  if (!list) return;
  list.innerHTML = "";
  const rows = memoryRows();
  if (!rows.length) {
    if (empty) {
      empty.textContent = "未有記住嘅事。";
      empty.removeAttribute("hidden");
    }
    return;
  }
  if (empty) empty.setAttribute("hidden", "");
  rows.forEach((row) => {
    const li = document.createElement("li");
    li.dataset.memKey = row.key;
    li.textContent = row.label;
    list.appendChild(li);
  });
}

function setMemoryPanelOpen(on) {
  state.memoryPanelOpen = !!on;
  const panel = $("#memory-panel");
  const strip = $("#memory-strip");
  if (!panel) return;
  if (state.memoryPanelOpen) {
    renderMemoryPanel();
    panel.removeAttribute("hidden");
    if (strip) strip.setAttribute("aria-expanded", "true");
  } else {
    panel.setAttribute("hidden", "");
    if (strip) strip.setAttribute("aria-expanded", "false");
  }
}

function wireMemoryPanel() {
  const strip = $("#memory-strip");
  const close = $("#memory-panel-close");
  if (strip) {
    strip.addEventListener("click", () => {
      setMemoryPanelOpen(!state.memoryPanelOpen);
      try { AudioEngine.sfxClick(); } catch (_) {}
    });
  }
  if (close) {
    close.addEventListener("click", () => setMemoryPanelOpen(false));
  }
  const toast = $("#incoming-toast");
  if (toast) {
    toast.addEventListener("click", () => {
      hideIncomingToast();
      setUnread(0);
      const box = $("#chat-messages");
      if (box) box.scrollTop = box.scrollHeight;
      try { AudioEngine.sfxClick(); } catch (_) {}
    });
  }
  const chatForm = $("#chat-form");
  if (chatForm) {
    chatForm.addEventListener("focusin", () => {
      hideIncomingToast();
      setUnread(0);
    });
  }
  const messages = $("#chat-messages");
  if (messages) {
    messages.addEventListener("click", () => {
      hideIncomingToast();
      setUnread(0);
    });
  }
}

function moodBucketBoost(bucket) {
  const tone = state.chatTone || "cold";
  if (tone === "sharp" && bucket === "default") return "challenge";
  if (tone === "warmer" && bucket === "default" && Math.random() < 0.35) return "flirt";
  if (tone === "wary" && bucket === "default" && Math.random() < 0.25) return "tired";
  return bucket;
}

function inferMoodFromNode(node) {
  if (!node) return "cold";
  const label = (node.label || "") + (node.endingTitle || "");
  const text = (node.text || "").slice(0, 420);
  const blob = label + text;
  if (/燈關|燈暗|熄燈|黑暗/.test(blob)) return "intimate";
  if (/臨界|越界|靠近|試探|主動/.test(blob)) return "intimate";
  if (/頂嘴|對峙|清楚|威脅/.test(blob)) return "tense";
  if (/克制|收斂|專業|結局/.test(blob)) return "soft";
  return "cold";
}


function isOffTopicBucket(bucket) {
  return OFF_TOPIC_BUCKETS.has(bucket);
}

function detectRepeat(userText) {
  const t = String(userText || "").trim().toLowerCase();
  if (!t) return false;
  const prev = (state.chatUserLines || []).slice(0, -1);
  if (!prev.length) return false;
  const last = String(prev[prev.length - 1] || "").trim().toLowerCase();
  return last === t || (last.length >= 2 && t.includes(last) && last.includes(t.slice(0, Math.min(6, t.length))));
}

function setThoughtVoice(line) {
  const thoughtSlot = $("#thought-slot");
  const thoughtEl = $("#play-thought");
  if (!thoughtSlot || !thoughtEl) return;
  const text = String(line || "").trim();
  if (!text) {
    thoughtSlot.setAttribute("hidden", "");
    thoughtEl.textContent = "";
    return;
  }
  thoughtEl.textContent = text;
  thoughtSlot.removeAttribute("hidden");
  state.guidanceThoughtActive = true;
}

function restoreNodeThought() {
  const thoughtSlot = $("#thought-slot");
  const thoughtEl = $("#play-thought");
  if (!thoughtSlot || !thoughtEl) return;
  state.guidanceThoughtActive = false;
  const saved = state.stashedNodeThought;
  if (saved) {
    thoughtEl.textContent = saved;
    thoughtSlot.removeAttribute("hidden");
  } else {
    thoughtSlot.setAttribute("hidden", "");
    thoughtEl.textContent = "";
  }
}

/** Former chat-hint guidance → thought-slot as character inner voice (not CS tone). */
function updateChatHint(bucket, advanced) {
  const streak = state.offTopicStreak || 0;
  const node = state.story && state.story.nodes && state.nodeId
    ? state.story.nodes[state.nodeId]
    : null;
  const free = !!(node && node.freeChat);
  let line = "";
  if (advanced) {
    line = "……門後。繼續。";
  } else if (free && state.freeChatChoicesVisible) {
    line = "……門把就喺度。你推，定停？";
  } else if (bucket && !isOffTopicBucket(bucket)) {
    line = free
      ? "……門就喺前面。"
      : (streak >= 2 ? "……好。望住主題。" : "……嗯。");
  } else if (streak >= 4) {
    line = free ? "……夠喇。門——定你仲喺度拖？" : "……夠喇。推門——定講工作。";
  } else if (streak >= 2) {
    line = "……仲喺度拖？";
  } else if (streak === 1) {
    line = free ? "……偏咗。門就喺前面。" : "……偏咗。門、檔——定你想留。";
  } else if (free) {
    line = "……走廊。門就喺前面。";
  } else {
    // non-freeChat idle: keep story thought, do not overwrite with system tone
    restoreNodeThought();
    return;
  }
  setThoughtVoice(line);
}

function matchFreeChatIntent(userText) {
  const node = state.story && state.story.nodes && state.nodeId
    ? state.story.nodes[state.nodeId]
    : null;
  if (!node || !node.freeChat || !Array.isArray(node.intents)) return null;
  const t = String(userText || "").toLowerCase();
  for (const intent of node.intents) {
    const keys = intent.keys || [];
    if (keys.some((k) => t.includes(String(k).toLowerCase()))) return intent;
  }
  return null;
}

function applyFreeChatAdvance(intent) {
  if (!intent || !intent.next) return false;
  if (intent.heat) state.heat = clampMeter(state.heat + intent.heat);
  if (intent.tension) state.tension = clampMeter(state.tension + intent.tension);
  if (intent.remember) addMemories(intent.remember);
  state.nodeId = intent.next;
  state.path.push(intent.next);
  state.proactiveNodeId = state.nodeId;
  state.proactiveCountOnNode = 0;
  state.offTopicStreak = 0;
  renderMeters();
  save();
  renderNode();
  return true;
}

function setChoicesDeferred(hidden) {
  const box = document.getElementById("choices");
  if (!box) return;
  const shouldHide = !!hidden;
  const isHidden = box.classList.contains("freechat-hidden");
  // Do not toggle an unchanged token: Chrome still emits a class mutation,
  // and chat-guide's observer used to re-enter until the play screen never painted.
  if (shouldHide !== isHidden) box.classList.toggle("freechat-hidden", shouldHide);
  if (shouldHide) {
    if (box.getAttribute("aria-hidden") !== "true") box.setAttribute("aria-hidden", "true");
  } else if (box.hasAttribute("aria-hidden")) {
    box.removeAttribute("aria-hidden");
  }
}

function syncFreeChatChoices(node) {
  /* portrait-first: never reveal gold MC buttons; keep choice data for intent fallback */
  if (node && node.freeChat) {
    if (state.freeChatNodeId !== node.id) {
      state.freeChatNodeId = node.id;
      state.freeChatChoicesVisible = false;
    }
  } else {
    state.freeChatChoicesVisible = false;
  }
  setChoicesDeferred(true);
}

function unlockFreeChatChoices(_reason) {
  const node = state.story && state.story.nodes && state.nodeId
    ? state.story.nodes[state.nodeId]
    : null;
  if (!node || !node.freeChat) return false;
  if (state.freeChatChoicesVisible) return false;
  /* portrait-first: mark unlocked for intent fallback, but never show gold MC */
  state.freeChatChoicesVisible = true;
  setChoicesDeferred(true);
  setThoughtVoice("……門把就喺度。你推，定停？");
  return true;
}

function matchFreeChatReveal(userText) {
  const node = state.story && state.story.nodes && state.nodeId
    ? state.story.nodes[state.nodeId]
    : null;
  if (!node || !node.freeChat) return false;
  const t = String(userText || "").toLowerCase();
  const keys = Array.isArray(node.revealKeys) && node.revealKeys.length
    ? node.revealKeys
    : (node.intents || []).flatMap((x) => x.keys || []);
  return keys.some((k) => t.includes(String(k).toLowerCase()));
}

function linesForBeat(bucket, tone) {
  const beat = beatProfile(currentStoryNode());
  const raw = poolFor(bucket, tone) || [];
  const ok = raw.filter((l) => lineFitsBeat(l, beat));
  return ok.length ? ok : [beatFallback(beat, tone)];
}

function pickReply(userText) {
  const tone = syncChatTone();
  const held = heldReplyTarget();
  if (held && held.half && held.rest) {
    // Second bubble is the rest of the line already chosen. Do not re-roll a topic.
    return held.rest;
  }

  const sourceText = held ? (held.userText || userText) : userText;
  const liveBucket = matchBucket(sourceText);
  let bucket = held && held.bucket ? held.bucket : liveBucket;
  const topic = held && held.topic ? held.topic : topicOf(sourceText);
  const concrete = !!(topic || isConcreteBucket(bucket));
  const lockJump = !!(held || concrete);
  const askMem = /記得|之前|頭先|今晚|你知|你記得/.test(String(userText || "").toLowerCase());
  const beatOpts = {
    userText: sourceText,
    ladder: isBoundaryText(sourceText) || BOUNDARY_BUCKETS[bucket] || BOUNDARY_BUCKETS[liveBucket],
    bucket: BOUNDARY_BUCKETS[bucket] ? bucket : boundaryBucket(sourceText, null),
    askMemory: askMem || bucket === "memory" || liveBucket === "memory",
  };

  if (!held && detectRepeat(userText)) {
    state.offTopicStreak = (state.offTopicStreak || 0) + 1;
    const useTone = state.offTopicStreak >= 2 ? "sharp" : tone;
    updateChatHint("repeat", false);
    return finishBeatLine(pickAvoidRepeat(linesForBeat("repeat", useTone), "repeat"), beatOpts);
  }

  const wantMemory = (state.playerFacts.length || state.memories.length) && (
    bucket === "memory" || liveBucket === "memory" || (!held && askMem)
  );
  if (wantMemory) {
    state.offTopicStreak = 0;
    updateChatHint("memory", false);
    return finishBeatLine(memoryChipLine(tone) || "", { askMemory: true, userText: sourceText, bucket: "memory" });
  }
  if (!lockJump && (state.playerFacts.length || state.memories.length) && Math.random() < 0.18) {
    const line = finishBeatLine(memoryChipLine(tone) || "", { askMemory: false, userText: userText });
    if (line) return line;
  }

  if (!lockJump && state.chatTopics.length && Math.random() < 0.32) {
    const echo = topicEchoLine(tone);
    if (echo) return finishBeatLine(echo, { userText: userText });
  }

  if (held && topic) {
    const echo = topicEchoLine(tone, topic);
    if (echo) return finishBeatLine(echo, { userText: sourceText, bucket: bucket });
  }

  if (lockJump && topic && Math.random() < 0.32) {
    const echo = topicEchoLine(tone, topic);
    if (echo) return finishBeatLine(echo, { userText: sourceText, bucket: bucket });
  }

  if (!lockJump && Math.random() < 0.16) {
    const aside = sceneAsideLine(tone);
    if (aside) return finishBeatLine(aside, { userText: userText });
  }

  if (!lockJump && (state.callMode || beatProfile(currentStoryNode()).tags.call) && Math.random() < 0.55) {
    const callLine = takePhoneLine("call");
    if (callLine) return finishBeatLine(callLine, { userText: userText });
  }

  if (!held) bucket = moodBucketBoost(liveBucket);

  if (isOffTopicBucket(bucket)) {
    state.offTopicStreak = (state.offTopicStreak || 0) + 1;
  } else {
    state.offTopicStreak = 0;
  }

  let useTone = tone;
  if (BOUNDARY_BUCKETS[bucket]) useTone = boundaryTone(bucket);
  else if ((state.offTopicStreak || 0) >= 2 && isOffTopicBucket(bucket)) {
    useTone = state.offTopicStreak >= 4 ? "sharp" : (tone === "warmer" ? "cold" : "sharp");
  }

  updateChatHint(bucket, false);
  let line = pickAvoidRepeat(linesForBeat(bucket, useTone), bucket);
  if (/人工智能|聊天機器人|我是AI|我是机器人|我是機械人|語言模型|ChatGPT/i.test(line)) {
    line = pickAvoidRepeat(linesForBeat("ai_ask", "cold"), "ai_ask");
  }
  return finishBeatLine(line, {
    userText: sourceText,
    ladder: !!BOUNDARY_BUCKETS[bucket] || isBoundaryText(sourceText),
    bucket: bucket,
    askMemory: false,
  });
}


function appendChat(role, text) {
  const box = $("#chat-messages");
  if (!box) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function setChatTyping(on) {
  const el = $("#chat-typing");
  if (el) el.hidden = !on;
}

async function handleChatSubmit(text) {
  const cleaned = (text || "").trim();
  if (!cleaned || state.chatBusy) return;
  notePlayerTurn(cleaned);
  state.chatBusy = true;
  noteChatActivity();
  appendChat("user", cleaned);
  pushChatMemory("user", cleaned);
  $("#chat-input").value = "";
  AudioEngine.sfxClick();
  setChatTyping(true);
  setUnread(0);
  hideIncomingToast();

  const intent = matchFreeChatIntent(cleaned);
  const shouldReveal = matchFreeChatReveal(cleaned);

  if (intent && intent.next) {
    const tone = syncChatTone();
    const bucket = intent.bucket || "greet";
    const useTone = BOUNDARY_BUCKETS[bucket] ? boundaryTone(bucket) : tone;
    const rawAck = intent.ack ? intent.ack : pickAvoidRepeat(linesForBeat(bucket, useTone), bucket);
    const ack = finishBeatLine(rawAck, {
      userText: cleaned,
      ladder: !!BOUNDARY_BUCKETS[bucket] || isBoundaryText(cleaned),
      bucket: bucket,
    });
    await deliverBotLine(ack);
    AudioEngine.sfxTransition();
    updateChatHint(intent.bucket || "greet", true);
    state.chatBusy = false;
    noteChatActivity();
    // hard intent may advance; also unlock choices in case advance fails
    unlockFreeChatChoices("行動對齊。推門——或撳下面。");
    applyFreeChatAdvance(intent);
    return;
  }

  if (shouldReveal) {
    unlockFreeChatChoices("門近咗。可以撳：推門／停低——或打字推門。");
  }

  const reply = pickReply(cleaned);
  await deliverBotLine(reply);
  AudioEngine.sfxTransition();
  state.chatBusy = false;
  noteChatActivity();
}


function greetingLines() {
  const cast = getCast();
  if (cast.greetings && cast.greetings.length) return cast.greetings.slice();
  return cast.greeting ? [cast.greeting] : [];
}

function pickGreeting() {
  const beat = beatProfile(currentStoryNode());
  const pack = greetingLines().filter((l) => lineFitsBeat(l, beat));
  const line = pickAvoidRepeat(pack.length ? pack : greetingLines(), "greet");
  return glueBeat(line, beat);
}

function resetChat() {
  const box = $("#chat-messages");
  if (box) box.innerHTML = "";
  setChatTyping(false);
  state.chatBusy = false;
  resetChatSessionMemory();
  const greet = publishSpoken(pickGreeting());
  appendChat("alex", greet);
  pushChatMemory("bot", greet);
  if ($("#screen-play") && $("#screen-play").classList.contains("active")) {
    scheduleProactivePing();
  }
}


/* ============================================================
   Story / navigation
   ============================================================ */
function pulseIn(el) {
  if (!el) return;
  el.classList.remove("anim-in");
  void el.offsetWidth;
  el.classList.add("anim-in");
}

function show(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle("active", key === name);
  });
  document.body.classList.toggle("mode-play", name === "play");
  if (name !== "play") {
    stageSettled = false;
    clearBeatAtmosphere();
  }
  if (typeof window.__ahSyncKeyboard === "function") window.__ahSyncKeyboard();
  if (name !== "play") duckBgmForVideo(false);
  if (name === "play") startIncomingRhythm();
  else stopIncomingRhythm();
  if (name !== "play") setMemoryPanelOpen(false);
  if (name === "play" || name === "ending") {
    AudioEngine.sfxTransition();
  } else {
    try { if (AudioEngine.setRain) AudioEngine.setRain(false); } catch (_) {}
    lastCuedNodeId = null;
  }
}

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ageOk: state.ageOk,
      storyId: state.storyId,
      nodeId: state.nodeId,
      path: state.path,
      memories: state.memories,
      playerFacts: sanitizeFacts(state.playerFacts),
      heat: state.heat,
      tension: state.tension,
      endings: state.endings || {},
      nightFrom: state.nightFrom || {},
    })
  );
}

function clearProgress() {
  const ageOk = state.ageOk;
  const storyId = state.storyId;
  const endings = state.endings || {};
  const nightFrom = state.nightFrom || {};
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ageOk, storyId, endings, nightFrom }));
  state.nodeId = null;
  state.path = [];
  state.memories = [];
  state.playerFacts = [];
  state.pendingFactId = null;
  state.factTurn = 0;
  state.callFromIntent = false;
  state.callIntentCountOnNode = 0;
  state.callIntentCooldownUntil = 0;
  state.heat = 20;
  state.tension = 15;
  resetChatSessionMemory();
  setCallMode(false);
  renderMemoryStrip();
  renderMeters();
}

const CAST_CARDS = [
  {
    id: "alex",
    name: "Vera",
    role: "部門主管 · 週五 23:47",
    hook: "Deadline 可以改。態度唔可以。",
    thumb: "./assets/stills/vera-03.jpg?v=3",
    featured: true,
  },
  {
    id: "morgan",
    name: "Elise",
    role: "客戶負責人 · 酒廊 21:10",
    hook: "大單前夜。夜晚講人。",
    thumb: "./assets/stills/vera-02.jpg?v=3",
    featured: false,
    act2: true,
  },
  {
    id: "sam",
    name: "Sammi",
    role: "前輩同事 · 茶水間 22:40",
    hook: "兩個杯麵。餓嘅人簽錯字。",
    thumb: "./assets/stills/sammi-01.jpg?v=3",
    featured: false,
    act2: true,
  },
];

async function pickStory(id, fresh, entry) {
  const file = STORY_FILES[id] || STORY_FILES.alex;
  try {
    await AudioEngine.unlock();
  } catch (_) {}
  AudioEngine.sfxChoice();
  const res = await fetch(file);
  if (!res.ok) throw new Error("story " + id + " " + res.status);
  state.story = await res.json();
  state.storyId = id;
  applyStoryArt(state.story);
  startAlex(!!fresh, entry || "");
}

function renderCast() {
  const box = document.getElementById("chars");
  const resumeBtn = $("#resume-alex");
  if (resumeBtn) resumeBtn.hidden = true;
  const startBtn = $("#start-alex");
  if (startBtn) startBtn.hidden = true;
  if (!box) return;

  const canResume = !!(
    state.storyId &&
    state.story &&
    state.nodeId &&
    state.story.nodes &&
    state.story.nodes[state.nodeId] &&
    !state.story.nodes[state.nodeId].ending
  );

  box.innerHTML = CAST_CARDS.map((c) => {
    const featured = c.featured ? " char-card-featured" : "";
    const showResume = canResume && state.storyId === c.id;
    const act2Btn = c.act2
      ? '<button type="button" class="btn btn-ghost" data-cast-act2="' + c.id + '">第二晚</button>'
      : "";
    return (
      '<article class="card glass char-card' + featured + '" data-cast="' + c.id + '">' +
        '<div class="char-thumb-wrap">' +
          '<img class="char-thumb" src="' + c.thumb + '" alt="' + c.name + '" />' +
          '<div class="char-thumb-glow" aria-hidden="true"></div>' +
        "</div>" +
        "<h2>" + c.name + "</h2>" +
        '<p class="role">' + c.role + "</p>" +
        '<p class="hook">' + c.hook + "</p>" +
        '<div class="stack">' +
          (showResume
            ? '<button type="button" class="btn btn-primary" data-cast-resume="' + c.id + '">繼續今晚</button>' +
              '<button type="button" class="btn btn-ghost" data-cast-start="' + c.id + '">重新開始</button>'
            : '<button type="button" class="btn btn-primary" data-cast-start="' + c.id + '">開始</button>') +
          act2Btn +
        "</div>" +
      "</article>"
    );
  }).join("");

  box.querySelectorAll("[data-cast-start]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await pickStory(btn.getAttribute("data-cast-start"), true);
      } catch (err) {
        console.error(err);
        box.insertAdjacentHTML(
          "beforeend",
          '<p class="hook">載入失敗：' + String(err.message || err) + "</p>"
        );
      }
    });
  });
  box.querySelectorAll("[data-cast-resume]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await pickStory(btn.getAttribute("data-cast-resume"), false);
      } catch (err) {
        console.error(err);
      }
    });
  });
  box.querySelectorAll("[data-cast-act2]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await pickStory(btn.getAttribute("data-cast-act2"), true, "act2");
      } catch (err) {
        console.error(err);
        box.insertAdjacentHTML(
          "beforeend",
          '<p class="hook">載入失敗：' + String(err.message || err) + "</p>"
        );
      }
    });
  });
}

function act2ContinueTarget(node) {
  const map = (state.story && state.story.act2From) || {};
  const raw = node && map[node.id];
  if (!raw) return null;
  if (typeof raw === "string") return { next: raw, heat: 0, remember: ["from_" + node.id] };
  if (!raw.next) return null;
  return {
    next: raw.next,
    heat: Number(raw.heat) || 0,
    remember: raw.remember || ["from_" + node.id],
  };
}

function noteStoryEnding(node) {
  if (!node || !node.ending || !node.id || !state.storyId) return;
  if (!state.endings || typeof state.endings !== "object") state.endings = {};
  state.endings[state.storyId] = node.id;
  if (!act2ContinueTarget(node)) return;
  if (!state.nightFrom || typeof state.nightFrom !== "object") state.nightFrom = {};
  state.nightFrom[state.storyId] = node.id;
}

function secondNightSeed() {
  const id = state.storyId;
  const fromMap = state.nightFrom || {};
  const endMap = state.endings || {};
  const endingId = fromMap[id] || endMap[id] || "";
  const target = endingId ? act2ContinueTarget({ id: endingId }) : null;
  const memories = ["act2_from_cast"];
  let heat = 24;
  if (target) {
    if (target.heat) heat = Math.max(heat, target.heat);
    (target.remember || []).forEach((mem) => {
      if (mem && memories.indexOf(mem) < 0) memories.push(mem);
    });
  }
  return { heat: clampMeter(heat), memories: memories.slice(0, MAX_MEMORIES) };
}

function applySecondNight() {
  const seed = secondNightSeed();
  state.heat = seed.heat;
  state.tension = 18;
  state.memories = seed.memories.slice();
}

function continueNextNight() {
  const node = state.story && state.story.nodes && state.story.nodes[state.nodeId];
  const target = act2ContinueTarget(node);
  if (!target || !state.story.nodes[target.next]) return;
  if (target.heat) state.heat = clampMeter(Math.max(state.heat || 0, target.heat));
  addMemories(target.remember);
  state.nodeId = target.next;
  state.path = (state.path || []).concat([target.next]);
  state.callFromIntent = false;
  state.callIntentCountOnNode = 0;
  state.callIntentCooldownUntil = 0;
  state.proactiveNodeId = state.nodeId;
  state.proactiveCountOnNode = 0;
  save();
  resetChat();
  show("play");
  renderNode();
}

function startAlex(fresh, entry) {
  AudioEngine.sfxChoice();
  if (!state.story || !state.story.nodes) return;
  state.storyId = state.story.id || state.storyId || "alex";
  const act2Id = state.story.act2;
  const wantAct2 = entry === "act2" && act2Id && state.story.nodes[act2Id];
  if (wantAct2 || fresh || !state.nodeId || !state.story.nodes[state.nodeId]) {
    state.nodeId = wantAct2 ? act2Id : state.story.start;
    state.path = [state.nodeId];
    if (wantAct2) applySecondNight();
    else {
      state.heat = 20;
      state.tension = 15;
      state.memories = [];
    }
    state.playerFacts = [];
    state.pendingFactId = null;
    state.factTurn = 0;
    state.callFromIntent = false;
    state.callIntentCountOnNode = 0;
    state.callIntentCooldownUntil = 0;
  }
  // entryfix3: unhide play and put story text in the DOM before art/TTS.
  show("play");
  const opening = state.story.nodes[state.nodeId];
  if (opening && !opening.ending) {
    const labelEl = $("#play-label");
    const textEl = $("#play-text");
    if (labelEl) labelEl.textContent = opening.label || "";
    if (textEl) textEl.textContent = opening.text || "";
  }
  applyStoryArt(state.story);
  renderMeters();
  save();
  resetChat();
  renderNode();
}

let lastCuedNodeId = null;

function nodeWantsRain(node) {
  if (!node) return false;
  return node.ambience === "rain" || node.scene === "roof" || node.look === "rain";
}

function cueNodeAudio(node) {
  try {
    if (AudioEngine.setRain) AudioEngine.setRain(nodeWantsRain(node));
  } catch (_) {}
  const nid = state.nodeId || "";
  if (!nid || nid === lastCuedNodeId) return;
  lastCuedNodeId = nid;
  try {
    if (node && node.sfx && AudioEngine.playNodeCues) AudioEngine.playNodeCues(node.sfx);
  } catch (_) {}
}

function renderNode() {
  const node = state.story.nodes[state.nodeId];
  if (!node) return;

  state.currentMood = inferMoodFromNode(node);
  applyBeatContinuity(state.story, node);

  if (node.ending) {
    applySceneLayers(state.story, node);
    cueNodeAudio(node);
    noteStoryEnding(node);
    cancelSpeech();
    setCallMode(false);
    $("#ending-kicker").textContent = node.label || "結局";
    $("#ending-title").textContent = node.endingTitle || "";
    $("#ending-text").textContent = node.text;
    const nextBtn = $("#ending-next");
    const nextNight = act2ContinueTarget(node);
    if (nextBtn) nextBtn.hidden = !(nextNight && state.story.nodes[nextNight.next]);
    speakStoryBeats(node.text);
    save();
    show("ending");
    pulseIn($("#ending-title"));
    pulseIn($("#ending-text"));
    return;
  }

  // entryfix3: show play and commit story text, then speak on a later turn
  // so speechSynthesis cannot block the first paint of #screen-play.
  show("play");
  applyNodeMeta(node);
  applySceneLayers(state.story, node);
  cueNodeAudio(node);
  syncPortraitVideo(state.story, node);
  $("#play-label").textContent = node.label || "";
  $("#play-text").textContent = node.text;
  const spoken = node.text;
  setTimeout(function () { speakStoryBeats(spoken); }, 0);

  const box = $("#choices");
  box.innerHTML = "";
  /* face-first: do not render gold MC buttons */
  if (false) (node.choices || []).forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-choice";
    const need = Number(choice.requireHeat) || 0;
    if (state.heat < need) {
      btn.disabled = true;
      btn.classList.add("is-locked");
      btn.textContent = (choice.label || "") + "（熱度不足）";
    } else {
      btn.textContent = choice.label;
      btn.addEventListener("click", () => {
        cancelSpeech();
        AudioEngine.sfxChoice();
        noteChatActivity();
        if (choice.heat) state.heat = clampMeter(state.heat + choice.heat);
        if (choice.tension) state.tension = clampMeter(state.tension + choice.tension);
        if (choice.remember) addMemories(choice.remember);
        state.nodeId = choice.next;
        state.path.push(choice.next);
        state.proactiveNodeId = state.nodeId;
        state.proactiveCountOnNode = 0;
        renderMeters();
        save();
        renderNode();
      });
    }
    box.appendChild(btn);
  });

  syncFreeChatChoices(node);
  if (node.freeChat) {
    // guidance inner voice during freeChat idle/streak; story thought already stashed
    updateChatHint(null, false);
  }
  // else: keep node.thought from renderThoughtAside (no system idle line)

  pulseIn($("#play-label"));
  pulseIn($("#play-text"));
  stageSettled = true;
}

function wireAudioControls() {
  loadAudioPrefs();
  syncMuteButtons();

  $("#btn-mute-bgm").addEventListener("click", async () => {
    await AudioEngine.unlock();
    audioPrefs.bgmMute = !audioPrefs.bgmMute;
    saveAudioPrefs();
    syncMuteButtons();
    AudioEngine.refresh();
    AudioEngine.sfxClick();
  });

  $("#btn-mute-voice").addEventListener("click", () => {
    audioPrefs.voiceMute = !audioPrefs.voiceMute;
    saveAudioPrefs();
    syncMuteButtons();
    if (audioPrefs.voiceMute) cancelSpeech();
    AudioEngine.sfxClick();
  });

  $("#btn-mute-master").addEventListener("click", async () => {
    await AudioEngine.unlock();
    audioPrefs.masterMute = !audioPrefs.masterMute;
    saveAudioPrefs();
    syncMuteButtons();
    AudioEngine.refresh();
    if (audioPrefs.masterMute) cancelSpeech();
    else AudioEngine.sfxClick();
  });
}

function wireChat() {
  const form = $("#chat-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleChatSubmit($("#chat-input").value);
  });
}


/* -------------------------------------------------------------------------- */
/* keyboard1 — iPhone Safari / in-app browser keyboard viewport               */
/* kb-mobile-20261023g                                                        */
/*                                                                            */
/* 723c719 put --app-vh back to the pre-keyboard pixel height and cleared    */
/* the fixed pin. Chrome then reported a full #screen-play / .play-stage     */
/* border box, so __ahKbSelfTest passed. On iPhone the paint stayed short:   */
/*                                                                            */
/* html is height:100% + max-height:100dvh + overflow:hidden. After Done,    */
/* Safari / the in-app webview often leaves BOTH visualViewport.height and   */
/* window.innerHeight (and 100dvh / 100vh) at the keyboard height. The play  */
/* box can be 800px tall and still be clipped by that short root, so the     */
/* portrait fills only the top half and the rest of the screen is the black  */
/* canvas (#080b12 / .play-stage #05070c). An inner stage / .play-bg /       */
/* 68vh face-gap can stay on the stuck vh even after the pin is gone.        */
/*                                                                            */
/* Rules:                                                                     */
/* - baseline / --app-vh is only ever the resting pixel height. After a      */
/*   keyboard session it is never lowered to a stuck vv or innerHeight.      */
/* - While open, #screen-play is position:fixed over the visual viewport.    */
/* - On close, that pin (position / top / height / transform) is removed     */
/*   from #screen-play. html, body, .app, stage, overlay, and .play-bg are   */
/*   locked to the baseline pixels so 100dvh cannot clip them. The face gap  */
/*   is restored to the pre-keyboard pixel height, not a stuck 68vh.         */
/* -------------------------------------------------------------------------- */
function wireKeyboardViewport() {
  const root = document.documentElement;
  const OPEN_DROP = 150;
  const STAY_DROP = 80;
  const TOOLBAR_SLOP = 140;
  let baseline = 0;
  let restingFacePx = 0;
  let keyboardOpen = false;
  let chatFocused = false;
  let sawKeyboard = false;
  let testReading = null;
  let pendingTimers = [];

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    pendingTimers.push(id);
    return id;
  }

  function clearPending() {
    pendingTimers.forEach((id) => clearTimeout(id));
    pendingTimers = [];
  }

  function isChatTarget(t) {
    if (!t) return false;
    return t.id === "chat-input" || !!(t.closest && t.closest("#chat-form, .chat-form"));
  }

  function measure() {
    if (testReading) {
      return {
        vvH: testReading.vvH,
        offsetTop: testReading.offsetTop || 0,
        layoutH: testReading.layoutH
      };
    }
    const vv = window.visualViewport;
    return {
      vvH: vv ? vv.height : window.innerHeight,
      offsetTop: vv ? vv.offsetTop : 0,
      layoutH: window.innerHeight
    };
  }

  function liveHeight() {
    const { vvH, layoutH } = measure();
    return Math.max(vvH || 0, layoutH || 0);
  }

  /* Never let the keyboard viewport shrink the resting height.
     After the keyboard has opened once, a stuck short vv/innerHeight must
     not replace the pre-keyboard baseline (toolbar slop is only for the
     address bar, before any keyboard session). */
  function rememberFullHeight() {
    const live = liveHeight();
    if (live < 160) return;
    if (!baseline) {
      if (!keyboardOpen && !chatFocused) baseline = live;
      return;
    }
    if (live > baseline + 1) {
      baseline = live;
      return;
    }
    if (sawKeyboard || keyboardOpen || chatFocused) return;
    if (live >= baseline - TOOLBAR_SLOP) baseline = live;
  }

  function rememberFace() {
    if (keyboardOpen || chatFocused) return;
    const live = liveHeight();
    if (baseline && live < baseline - 40) return;
    const face = document.querySelector("#screen-play .play-face-gap");
    if (!face) return;
    const h = Math.round(face.getBoundingClientRect().height);
    if (h >= 40) restingFacePx = h;
  }

  function isShrunkNow() {
    const { vvH, layoutH } = measure();
    if (!baseline || vvH < 160) return false;
    const gap = Math.max(0, layoutH - vvH);
    if (gap >= OPEN_DROP) return true;
    if (vvH <= baseline - OPEN_DROP) return true;
    return false;
  }

  function shouldStayOpen() {
    const { vvH } = measure();
    if (vvH < 160) return true;
    if (!baseline) return false;
    return vvH <= baseline - STAY_DROP;
  }

  function writeShellHeight() {
    const h = Math.round(baseline);
    if (h >= 160) root.style.setProperty("--app-vh", h + "px");
  }

  function writeInsets(open, offsetTop, inset) {
    root.style.setProperty("--vv-offset-top", (open ? offsetTop : 0) + "px");
    root.style.setProperty("--vv-top", (open ? offsetTop : 0) + "px");
    root.style.setProperty("--keyboard-inset", (open ? inset : 0) + "px");
  }

  function clearProps(el, props) {
    if (!el) return;
    props.forEach((p) => el.style.removeProperty(p));
  }

  function eachPlay(sel, fn) {
    document.querySelectorAll("#screen-play " + sel).forEach(fn);
  }

  function clearGeometry() {
    const play = document.getElementById("screen-play");
    clearProps(play, [
      "position", "top", "left", "right", "bottom", "width", "height",
      "max-height", "min-height", "margin", "transform", "overflow", "z-index"
    ]);
    eachPlay(".play-stage, .play-overlay", (el) => {
      clearProps(el, ["height", "max-height", "min-height", "position", "top", "transform", "overflow"]);
    });
    eachPlay(".play-face-gap", (el) => {
      clearProps(el, ["height", "min-height", "max-height", "flex"]);
    });
    eachPlay(".play-lower", (el) => {
      clearProps(el, ["max-height", "flex", "margin-top"]);
    });
    eachPlay(".narrative-bubble, .play-hud, .play-topbar", (el) => {
      el.style.removeProperty("display");
    });
    eachPlay(".play-bg, .portrait-stack", (el) => {
      clearProps(el, ["height", "max-height", "min-height", "top", "right", "bottom", "left", "transform"]);
    });
  }

  function lockPx(el, px) {
    if (!el) return;
    el.style.setProperty("height", px, "important");
    el.style.setProperty("min-height", px, "important");
    el.style.setProperty("max-height", "none", "important");
  }

  /* Beat a stuck 100dvh / 100% / 100vh clamp on the boxes that actually paint.
     #screen-play itself stays on --app-vh with no inline pin. */
  function applyRestingFrame() {
    const h = Math.round(baseline);
    if (h < 160) return;
    const px = h + "px";
    const stageNow = document.querySelector("#screen-play .play-stage");
    const stageNowH = stageNow ? stageNow.getBoundingClientRect().height : h;
    /* Bump only when the paint is still the keyboard height, so a healthy
       resize does not flicker --app-vh by a pixel. */
    if (stageNowH < h - 8 || viewportStuck()) {
      root.style.setProperty("--app-vh", (h + 1) + "px");
      void root.offsetHeight;
    }
    root.style.setProperty("--app-vh", px);
    lockPx(root, px);
    lockPx(document.body, px);
    lockPx(document.querySelector(".app"), px);
    eachPlay(".play-stage, .play-overlay", (el) => {
      lockPx(el, px);
      el.style.removeProperty("top");
      el.style.removeProperty("transform");
      el.style.removeProperty("position");
    });
    eachPlay(".play-bg", (el) => {
      lockPx(el, px);
      el.style.setProperty("top", "0px", "important");
      el.style.setProperty("right", "0px", "important");
      el.style.setProperty("bottom", "0px", "important");
      el.style.setProperty("left", "0px", "important");
      el.style.removeProperty("transform");
    });
    eachPlay(".portrait-stack", (el) => {
      /* Keep the resting inset crop; only stop a stuck vh height from collapsing it. */
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("min-height", "100%", "important");
      el.style.setProperty("max-height", "none", "important");
    });
    if (restingFacePx >= 40) {
      const facePx = restingFacePx + "px";
      eachPlay(".play-face-gap", (el) => {
        el.style.setProperty("height", facePx, "important");
        el.style.setProperty("min-height", facePx, "important");
        el.style.setProperty("max-height", facePx, "important");
        el.style.setProperty("flex", "0 0 auto", "important");
      });
    }
    void root.offsetHeight;
  }

  function clearRestingFrame() {
    [root, document.body, document.querySelector(".app")].forEach((el) => {
      if (!el) return;
      ["height", "min-height", "max-height"].forEach((p) => el.style.removeProperty(p));
    });
    eachPlay(".play-stage, .play-overlay, .play-bg, .portrait-stack, .play-face-gap", (el) => {
      clearProps(el, [
        "height", "max-height", "min-height", "top", "right", "bottom", "left",
        "transform", "position", "flex"
      ]);
    });
  }

  function viewportStuck() {
    if (!baseline) return false;
    return liveHeight() < baseline - STAY_DROP;
  }

  /* Ask WebKit to rebuild a viewport that stayed at the keyboard height. */
  function nudgeViewport() {
    if (testReading) return;
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta || meta.dataset.ahNudging === "1") return;
    const content = meta.getAttribute("content") || "";
    meta.dataset.ahNudging = "1";
    const next = /maximum-scale=1(?![0-9.])/.test(content)
      ? content.replace("maximum-scale=1", "maximum-scale=1.0001")
      : content + ",maximum-scale=1.0001";
    meta.setAttribute("content", next);
    later(() => {
      meta.setAttribute("content", content);
      delete meta.dataset.ahNudging;
      scrollToOrigin();
    }, 60);
  }

  /*
   * Desktop / visual-relative fixed: rect.top ~= CSS top, so offsetTop would
   * push the screen down into a black band — use 0.
   * iOS layout-relative fixed: CSS top = offsetTop already lands at visual
   * top (rect.top ~= 0) — keep offsetTop.
   */
  function visualTopCss(offsetTop, rectTop, rectWidth) {
    const y = Math.max(0, Math.round(offsetTop || 0));
    if (!rectWidth || rectWidth < 1) return y;
    if (y > 0 && rectTop > y * 0.5) return 0;
    return y;
  }

  function pinPlay(vvH, offsetTop) {
    const play = document.getElementById("screen-play");
    if (!play) return;
    sawKeyboard = true;
    writeShellHeight();
    const h = Math.max(180, Math.round(vvH));
    const y = Math.max(0, Math.round(offsetTop || 0));
    const { layoutH } = measure();
    const inset = Math.max(0, Math.round((layoutH || 0) - h - y));
    writeInsets(true, y, inset);

    const app = document.querySelector(".app");
    const appRect = app ? app.getBoundingClientRect() : null;
    const width = appRect && appRect.width > 20 ? Math.round(appRect.width) : window.innerWidth;
    const left = appRect && appRect.width > 20 ? Math.round(appRect.left) : 0;

    play.style.setProperty("position", "fixed", "important");
    play.style.setProperty("margin", "0", "important");
    play.style.setProperty("transform", "none", "important");
    play.style.setProperty("right", "auto", "important");
    play.style.setProperty("bottom", "auto", "important");
    play.style.setProperty("left", left + "px", "important");
    play.style.setProperty("width", width + "px", "important");
    play.style.setProperty("height", h + "px", "important");
    play.style.setProperty("max-height", h + "px", "important");
    play.style.setProperty("min-height", "0", "important");
    play.style.setProperty("overflow", "hidden", "important");
    play.style.setProperty("z-index", "4", "important");
    play.style.setProperty("top", y + "px", "important");
    const rect = play.getBoundingClientRect();
    const forcedTop = testReading && typeof testReading.rectTop === "number";
    const measuredTop = forcedTop ? testReading.rectTop : rect.top;
    const measuredWidth = forcedTop ? Math.max(rect.width, 1) : rect.width;
    const topPx = visualTopCss(y, measuredTop, measuredWidth);
    if (topPx !== y) play.style.setProperty("top", topPx + "px", "important");

    eachPlay(".play-stage, .play-overlay", (el) => {
      el.style.setProperty("position", "relative", "important");
      el.style.setProperty("top", "auto", "important");
      el.style.setProperty("transform", "none", "important");
      el.style.setProperty("height", "100%", "important");
      el.style.setProperty("max-height", "100%", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("overflow", "hidden", "important");
    });
    /* Beat face-first 68vh / 60vh so the portrait flexes inside the visible box. */
    eachPlay(".play-face-gap", (el) => {
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("flex", "1 1 0%", "important");
    });
    eachPlay(".play-lower", (el) => {
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("flex", "0 0 auto", "important");
      el.style.setProperty("margin-top", "auto", "important");
    });
    /* keyboard-open CSS hides these; keep the face-first stack on the usable box. */
    eachPlay(".narrative-bubble", (el) => el.style.setProperty("display", "block", "important"));
    eachPlay(".play-hud, .play-topbar", (el) => el.style.setProperty("display", "flex", "important"));
    eachPlay(".play-bg", (el) => {
      el.style.setProperty("height", "100%", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("top", "0px", "important");
      el.style.setProperty("right", "0px", "important");
      el.style.setProperty("bottom", "0px", "important");
      el.style.setProperty("left", "0px", "important");
    });
    eachPlay(".portrait-stack", (el) => {
      el.style.setProperty("height", "100%", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("max-height", "none", "important");
    });
  }

  function setKeyboardOpen(open) {
    if (keyboardOpen === open) return;
    keyboardOpen = open;
    document.body.classList.toggle("keyboard-open", open);
    root.classList.toggle("keyboard-open", open);
  }

  function settleClosed() {
    setKeyboardOpen(false);
    clearGeometry();
    rememberFullHeight();
    const inPlay = document.body.classList.contains("mode-play");
    if (inPlay && baseline >= 160) {
      /* Pixel locks, not 100dvh. A stuck visual viewport must not clip the portrait. */
      applyRestingFrame();
    } else {
      clearRestingFrame();
      if (sawKeyboard && baseline >= 160) writeShellHeight();
      else root.style.removeProperty("--app-vh");
    }
    writeInsets(false, 0, 0);
    scrollToOrigin();
    if (!chatFocused && sawKeyboard && viewportStuck()) nudgeViewport();
  }

  function scrollToOrigin() {
    window.scrollTo(0, 0);
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    const scroller = document.scrollingElement;
    if (scroller) scroller.scrollTop = 0;
  }

  function syncViewport() {
    if (!baseline) rememberFullHeight();
    const { vvH, offsetTop } = measure();
    const inPlay = document.body.classList.contains("mode-play");
    const shrunk = keyboardOpen ? shouldStayOpen() : isShrunkNow();
    const open = !!(chatFocused && shrunk && inPlay && vvH >= 160);

    if (!open) rememberFace();

    if (open) {
      setKeyboardOpen(true);
      pinPlay(vvH, offsetTop);
    } else {
      const wasOpen = keyboardOpen;
      settleClosed();
      /* Retry after dismiss: iOS sometimes applies offsetTop a frame late. */
      const { offsetTop: off } = measure();
      if (!chatFocused && (wasOpen || (sawKeyboard && (off > 1 || (window.scrollY || 0) > 1)))) scrollToOrigin();
    }
  }

  function onOrientation() {
    clearPending();
    chatFocused = false;
    settleClosed();
    later(() => {
      const live = liveHeight();
      if (live >= 160 && !chatFocused) baseline = live;
      settleClosed();
    }, 160);
    later(() => {
      const live = liveHeight();
      if (live >= 160 && !chatFocused) baseline = live;
      settleClosed();
    }, 520);
  }

  rememberFullHeight();
  syncViewport();
  window.__ahSyncKeyboard = syncViewport;

  window.addEventListener("resize", syncViewport);
  window.addEventListener("orientationchange", onOrientation);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncViewport);
    window.visualViewport.addEventListener("scroll", syncViewport);
  }
  window.addEventListener("pageshow", () => {
    if (!chatFocused) settleClosed();
  });

  document.addEventListener("focusin", (e) => {
    if (!isChatTarget(e.target)) return;
    clearPending();
    rememberFace();
    chatFocused = true;
    syncViewport();
    later(syncViewport, 60);
    later(syncViewport, 220);
    later(syncViewport, 500);
    later(syncViewport, 900);
  });

  document.addEventListener("focusout", (e) => {
    if (!isChatTarget(e.target)) return;
    clearPending();
    chatFocused = false;
    settleClosed();
    scrollToOrigin();
    later(syncViewport, 80);
    later(syncViewport, 280);
    later(syncViewport, 700);
    later(syncViewport, 1200);
  });

  function boxH(el) {
    if (!el) return null;
    return Math.round(el.getBoundingClientRect().height);
  }

  /* Visible paint after ancestor overflow:hidden. A full border-box clipped by
     a short html/body is the black band 723c719 missed. */
  function visibleH(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    let top = rect.top;
    let bottom = rect.bottom;
    let node = el.parentElement;
    while (node) {
      const cs = getComputedStyle(node);
      const oy = cs.overflowY;
      const ox = cs.overflow;
      if (oy === "hidden" || oy === "clip" || oy === "auto" || oy === "scroll" || ox === "hidden" || ox === "clip") {
        const pr = node.getBoundingClientRect();
        top = Math.max(top, pr.top);
        bottom = Math.min(bottom, pr.bottom);
      }
      if (node === root) break;
      node = node.parentElement;
    }
    return Math.max(0, Math.round(bottom - top));
  }

  function snapshot() {
    const stage = document.querySelector("#screen-play .play-stage");
    const play = document.getElementById("screen-play");
    const input = document.getElementById("chat-input");
    const face = document.querySelector("#screen-play .play-face-gap");
    const narr = document.querySelector("#screen-play .narrative-bubble");
    const hud = document.querySelector("#screen-play .play-hud");
    const bg = document.querySelector("#screen-play .play-bg");
    const portrait = document.querySelector("#screen-play .portrait-stack");
    const app = document.querySelector(".app");
    const { vvH, layoutH, offsetTop } = measure();
    const playRect = play ? play.getBoundingClientRect() : null;
    const inputRect = input ? input.getBoundingClientRect() : null;
    const narrRect = narr ? narr.getBoundingClientRect() : null;
    const stageCs = stage ? getComputedStyle(stage) : null;
    const playCs = play ? getComputedStyle(play) : null;
    const inlineTransform = play ? (play.style.getPropertyValue("transform") || "") : "";
    return {
      chatFocused,
      keyboardOpen,
      sawKeyboard,
      bodyClass: document.body.classList.contains("keyboard-open"),
      htmlClass: root.classList.contains("keyboard-open"),
      vvH: Math.round(vvH),
      layoutH: Math.round(layoutH),
      offsetTop: Math.round(offsetTop),
      baseline: Math.round(baseline || 0),
      appVhInline: root.style.getPropertyValue("--app-vh") || null,
      playPosition: playCs ? playCs.position : null,
      playTop: playRect ? Math.round(playRect.top) : null,
      playHeight: playRect ? Math.round(playRect.height) : null,
      playVisible: visibleH(play),
      inlinePlayHeight: play ? (play.style.getPropertyValue("height") || null) : null,
      inlinePlayTop: play ? (play.style.getPropertyValue("top") || null) : null,
      inlinePlayPosition: play ? (play.style.getPropertyValue("position") || null) : null,
      inlinePlayTransform: inlineTransform || null,
      stageHeight: stage ? boxH(stage) : null,
      stageComputed: stageCs ? stageCs.height : null,
      stageTransform: stageCs ? stageCs.transform : null,
      inlineStageHeight: stage ? (stage.style.getPropertyValue("height") || null) : null,
      stageVisible: visibleH(stage),
      bgHeight: boxH(bg),
      bgVisible: visibleH(bg),
      portraitHeight: boxH(portrait),
      portraitVisible: visibleH(portrait),
      htmlHeight: boxH(root),
      bodyHeight: boxH(document.body),
      appHeight: boxH(app),
      faceGap: face ? getComputedStyle(face).height : null,
      narrativeDisplay: narr ? getComputedStyle(narr).display : null,
      narrTop: narrRect ? Math.round(narrRect.top) : null,
      narrVisible: visibleH(narr),
      hudDisplay: hud ? getComputedStyle(hud).display : null,
      inputTop: inputRect ? Math.round(inputRect.top) : null,
      inputVisible: visibleH(input),
      inputGap: playRect && inputRect ? Math.round(playRect.bottom - inputRect.bottom) : null,
      scrollY: Math.round(window.scrollY || root.scrollTop || document.body.scrollTop || 0)
    };
  }

  function num(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * Open → close restore.
   * Injects viewport readings so headless Chrome can run the same syncViewport
   * path as iOS (it does not emulate the iOS keyboard). Leaves play mode as it found it.
   */
  window.__ahKbSelfTest = async function __ahKbSelfTest() {
    const input = document.getElementById("chat-input");
    const play = document.getElementById("screen-play");
    if (!input || !play) return { ok: false, error: "missing #chat-input or #screen-play" };

    const failures = [];
    const prevBody = document.body.className;
    const prevHtml = root.className;
    const screens = Array.from(document.querySelectorAll(".screen")).map((el) => ({
      el,
      className: el.className
    }));

    function expect(cond, msg) {
      if (!cond) failures.push(msg);
    }
    function raf() {
      return new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
    }

    let before = null;
    let mid = null;
    let after = null;
    let afterGrow = null;
    const branches = {};

    /* Both metrics stay at the keyboard height. measure() reads testReading;
       this also patches the live objects when the browser allows it. */
    function stickViewport(vvH, layoutH) {
      const undo = [];
      function patch(obj, prop, value) {
        if (!obj) return;
        try {
          const desc = Object.getOwnPropertyDescriptor(obj, prop);
          Object.defineProperty(obj, prop, { configurable: true, get: () => value });
          undo.push(() => {
            try {
              if (desc) Object.defineProperty(obj, prop, desc);
              else delete obj[prop];
            } catch (e) { /* ignore */ }
          });
        } catch (e) { /* innerHeight / vv.height often not configurable */ }
      }
      patch(window, "innerHeight", layoutH);
      patch(window.visualViewport, "height", vvH);
      return function undoStick() {
        undo.splice(0).reverse().forEach((fn) => fn());
      };
    }

    try {
      document.body.classList.add("mode-play");
      screens.forEach(({ el }) => {
        if (el === play) el.classList.add("active");
        else el.classList.remove("active");
      });

      const full = Math.round(Math.max(
        window.innerHeight,
        (window.visualViewport && window.visualViewport.height) || 0
      ));
      const freeze = document.createElement("style");
      freeze.id = "ah-kb-freeze";
      freeze.textContent = "#screen-play,#screen-play *{animation:none!important;transition:none!important}";
      document.head.appendChild(freeze);

      testReading = { vvH: full, offsetTop: 0, layoutH: full };
      chatFocused = false;
      keyboardOpen = false;
      sawKeyboard = false;
      baseline = 0;
      restingFacePx = 0;
      syncViewport();
      await raf();
      before = snapshot();

      const shrunkH = Math.max(220, Math.round(full * 0.52));
      const offset = Math.max(80, Math.round(full * 0.3));
      branches.visualRelative = visualTopCss(offset, offset, 100);
      branches.layoutRelative = visualTopCss(offset, 0, 100);
      branches.tinyError = visualTopCss(offset, 4, 100);
      branches.hidden = visualTopCss(offset, 0, 0);
      expect(branches.visualRelative === 0, "visual-relative top should be 0, got " + branches.visualRelative);
      expect(branches.layoutRelative === offset, "layout-relative top should keep offset, got " + branches.layoutRelative);
      expect(branches.tinyError === offset, "tiny rect error should keep offset, got " + branches.tinyError);
      expect(branches.hidden === offset, "hidden rect should not correct, got " + branches.hidden);
      expect(Math.abs((before.baseline || 0) - full) <= 2, "baseline " + before.baseline + " != " + full);

      testReading = { vvH: shrunkH, offsetTop: offset, layoutH: full };
      chatFocused = true;
      syncViewport();
      await raf();
      mid = snapshot();
      expect(mid.bodyClass && mid.htmlClass, "keyboard-open class missing while shrunk+focused");
      expect(mid.playPosition === "fixed", "play not fixed during keyboard, position=" + mid.playPosition);
      expect(Math.abs(num(mid.appVhInline) - full) <= 2, "open wrote shrunk --app-vh " + mid.appVhInline);
      expect(Math.abs(mid.playTop) <= 8, "play top " + mid.playTop + " (void above usable viewport)");
      expect(Math.abs(mid.playHeight - shrunkH) <= 8, "play height " + mid.playHeight + " != " + shrunkH);
      expect(mid.narrativeDisplay !== "none", "dialogue hidden during keyboard");
      expect(mid.hudDisplay !== "none", "HUD hidden during keyboard");
      expect(num(mid.faceGap) != null && num(mid.faceGap) < mid.playHeight - 24, "face-gap not inside stage " + mid.faceGap);
      expect(mid.inputGap != null && mid.inputGap >= -4 && mid.inputGap <= 64, "composer not at bottom of usable box, gap " + mid.inputGap);
      expect(!mid.stageTransform || mid.stageTransform === "none" || mid.stageTransform === "matrix(1, 0, 0, 1, 0, 0)", "stage transform " + mid.stageTransform);

      /* iOS layout-relative fixed reports rect.top ~ 0 when CSS top is already offsetTop.
         Chrome can't scroll the visual viewport, so the rect is injected. */
      testReading = { vvH: shrunkH, offsetTop: offset, layoutH: full, rectTop: 0 };
      chatFocused = true;
      syncViewport();
      await raf();
      const iosPin = snapshot();
      expect(Math.abs(num(iosPin.inlinePlayTop) - offset) <= 1, "layout-relative pin top " + iosPin.inlinePlayTop + " != " + offset);
      expect(iosPin.playPosition === "fixed", "layout-relative pin lost fixed");
      expect(Math.abs(num(iosPin.appVhInline) - full) <= 2, "layout-relative pin poisoned --app-vh " + iosPin.appVhInline);

      /* iOS Done: BOTH visualViewport.height and window.innerHeight stay at the
         keyboard height, and 100dvh/100% keep clipping html. 723c719 only restored
         the #screen-play border box, so this clamp used to false-pass. */
      const faceStuck = Math.max(36, Math.round(shrunkH * 0.42));
      const clamp = document.createElement("style");
      clamp.id = "ah-stuck-dvh-style";
      clamp.textContent = [
        "html.ah-stuck-dvh, html.ah-stuck-dvh body, html.ah-stuck-dvh body.mode-play .app {",
        "height:" + shrunkH + "px !important; min-height:0 !important; max-height:" + shrunkH + "px !important;",
        "overflow:hidden !important;}",
        "html.ah-stuck-dvh body.mode-play #screen-play.active .play-stage,",
        "html.ah-stuck-dvh body.mode-play #screen-play.active .play-overlay,",
        "html.ah-stuck-dvh body.mode-play #screen-play.active .play-bg,",
        "html.ah-stuck-dvh body.mode-play #screen-play.active .portrait-stack {",
        "height:" + shrunkH + "px !important; min-height:0 !important; max-height:" + shrunkH + "px !important;}",
        "html.ah-stuck-dvh body.mode-play #screen-play.active .play-face-gap {",
        "height:" + faceStuck + "px !important; min-height:0 !important; max-height:" + faceStuck + "px !important;",
        "flex:0 0 auto !important;}"
      ].join("");
      document.head.appendChild(clamp);
      root.classList.add("ah-stuck-dvh");
      const undoStick = stickViewport(shrunkH, shrunkH);
      try {
        testReading = { vvH: shrunkH, offsetTop: 0, layoutH: shrunkH };
        root.scrollTop = 120;
        document.body.scrollTop = 120;
        chatFocused = false;
        syncViewport();
      } finally {
        undoStick();
      }
      await raf();
      after = snapshot();
      root.classList.remove("ah-stuck-dvh");
      clamp.remove();
      expect(!after.bodyClass && !after.htmlClass, "keyboard-open stuck after blur");
      expect(Math.abs(num(after.appVhInline) - full) <= 2, "resting --app-vh not restored to " + full + "px (" + after.appVhInline + ")");
      expect(after.playPosition !== "fixed", "position stuck fixed");
      expect(!after.inlinePlayPosition, "inline play position lingered " + after.inlinePlayPosition);
      expect(!after.inlinePlayHeight, "inline play height lingered " + after.inlinePlayHeight);
      expect(!after.inlinePlayTop, "inline play top lingered " + after.inlinePlayTop);
      expect(!after.inlinePlayTransform || after.inlinePlayTransform === "none", "inline play transform lingered " + after.inlinePlayTransform);
      expect(after.scrollY === 0, "scroll offset lingered " + after.scrollY);
      expect(Math.abs(after.playHeight - full) <= 8, "play box " + after.playHeight + " != baseline " + full);
      expect(Math.abs(after.playVisible - full) <= 8, "play visible " + after.playVisible + " leaves a black band (baseline " + full + ")");
      expect(Math.abs(after.stageHeight - full) <= 8, "stage height " + after.stageHeight + " != baseline " + full);
      expect(Math.abs(after.stageVisible - full) <= 8, "stage visible " + after.stageVisible + " leaves a black band");
      expect(after.bgHeight != null && Math.abs(after.bgHeight - full) <= 8, "portrait layer " + after.bgHeight + " != baseline " + full);
      expect(Math.abs(after.bgVisible - full) <= 8, "portrait visible " + after.bgVisible + " leaves a black band");
      expect(after.portraitHeight == null || after.portraitHeight >= full - 12, "portrait stack " + after.portraitHeight + " shorter than shell " + full);
      expect(Math.abs(after.playHeight - shrunkH) > 80, "play box still keyboard-sized " + after.playHeight);
      expect(Math.abs(after.htmlHeight - full) <= 8, "html stayed at stuck viewport " + after.htmlHeight);
      expect(Math.abs(after.bodyHeight - full) <= 8, "body stayed at stuck viewport " + after.bodyHeight);
      expect(Math.abs(after.appHeight - full) <= 8, "app stayed at stuck viewport " + after.appHeight);
      expect(after.narrativeDisplay !== "none", "dialogue hidden after close");
      expect(after.hudDisplay !== "none", "HUD hidden after close");
      expect(Math.abs(num(after.faceGap) - num(before.faceGap)) <= 4, "face-gap " + after.faceGap + " != before " + before.faceGap);
      expect(after.narrVisible > 8, "dialogue clipped after dismiss");
      expect(after.inputVisible > 8, "composer clipped after dismiss");
      expect(after.narrTop != null && after.narrTop > full * 0.45, "dialogue still in the top band " + after.narrTop);
      expect(after.inputTop != null && after.inputTop > full * 0.5, "composer still in the top band " + after.inputTop);
      expect(after.inputGap != null && after.inputGap >= -4, "composer below the restored shell, gap " + after.inputGap);

      testReading = { vvH: shrunkH, offsetTop: offset, layoutH: full };
      chatFocused = true;
      syncViewport();
      testReading = { vvH: full, offsetTop: 0, layoutH: full };
      syncViewport();
      await raf();
      afterGrow = snapshot();
      expect(!afterGrow.bodyClass && !afterGrow.htmlClass, "stayed keyboard-open after vv grew while focused");
      expect(Math.abs(num(afterGrow.appVhInline) - full) <= 2, "app-vh after grow " + afterGrow.appVhInline);
      expect(afterGrow.playPosition !== "fixed", "still fixed after vv grew");
      expect(afterGrow.narrativeDisplay !== "none", "dialogue hidden after grow-close");
      expect(Math.abs(afterGrow.playHeight - full) <= 8, "play height after grow " + afterGrow.playHeight);
    } finally {
      clearPending();
      testReading = null;
      chatFocused = false;
      keyboardOpen = false;
      root.classList.remove("ah-stuck-dvh");
      const clamp = document.getElementById("ah-stuck-dvh-style");
      if (clamp) clamp.remove();
      const freeze = document.getElementById("ah-kb-freeze");
      if (freeze) freeze.remove();
      screens.forEach(({ el, className }) => {
        el.className = className;
      });
      document.body.className = prevBody;
      root.className = prevHtml;
      document.body.classList.remove("keyboard-open");
      root.classList.remove("keyboard-open");
      clearGeometry();
      clearRestingFrame();
      const live = Math.max(window.innerHeight, (window.visualViewport && window.visualViewport.height) || 0);
      if (document.body.classList.contains("mode-play")) {
        if (live >= 160) baseline = live;
        sawKeyboard = true;
        applyRestingFrame();
        writeInsets(false, 0, 0);
      } else {
        sawKeyboard = false;
        restingFacePx = 0;
        baseline = live >= 160 ? live : 0;
        root.style.removeProperty("--app-vh");
        writeInsets(false, 0, 0);
      }
    }

    const restored = !!(after && num(after.appVhInline) && Math.abs(num(after.appVhInline) - Math.round(Math.max(window.innerHeight, 0))) <= 2
      && after.bodyClass === false && after.narrativeDisplay !== "none" && after.playPosition !== "fixed");
    return {
      ok: failures.length === 0,
      restored: failures.length === 0 && restored,
      failures,
      before,
      mid,
      after,
      afterGrow,
      branches
    };
  };
}


function installExperienceHooks() {
  const GP = window.GuidePolicy;
  if (GP && typeof GP.decide === "function" && !GP.decide.__factV2) {
    const origDecide = GP.decide.bind(GP);
    const hooked = function (input) {
      const text = input && input.intent && input.intent.text;
      if (text && !state.chatBusy) notePlayerTurn(text);
      const decision = origDecide(input);
      if (decision && !decision.advance && decision.reply) {
        const id = (input && input.intent && input.intent.id) || decision.intentId || "";
        decision.reply = playerFacingReply(text, id, decision.reply);
      }
      return decision;
    };
    hooked.__factV2 = true;
    GP.decide = hooked;
  }
  const fn = window.handleChatSubmit;
  if (fn && fn.__intent1 && !fn.__experienceV2) {
    const wrapped = async function (text) {
      const cleaned = String(text || "").trim();
      if (cleaned && !state.chatBusy) notePlayerTurn(cleaned);
      return fn.apply(this, arguments);
    };
    wrapped.__intent1 = true;
    wrapped.__experienceV2 = true;
    window.handleChatSubmit = wrapped;
    try { handleChatSubmit = wrapped; } catch (_) {}
  }
}

async function init() {
  installExperienceHooks();
  wireKeyboardViewport();
  waitForVoices();
  wireAudioControls();
  wireChat();
  wireMemoryPanel();
  startLifeMotion();
  // warm decode early (still needs unlock/gesture to hear)
  try {
    AudioEngine.loadAssets && AudioEngine.loadAssets();
  } catch (_) {}

  const saved = loadSave();
  state.ageOk = !!saved.ageOk;
  state.storyId = saved.storyId && STORY_FILES[saved.storyId] ? saved.storyId : null;
  state.nodeId = saved.nodeId || null;
  state.path = Array.isArray(saved.path) ? saved.path : [];
  state.memories = Array.isArray(saved.memories) ? saved.memories.slice(0, MAX_MEMORIES) : [];
  state.playerFacts = sanitizeFacts(saved.playerFacts);
  state.heat = saved.heat == null ? 20 : clampMeter(saved.heat);
  state.tension = saved.tension == null ? 15 : clampMeter(saved.tension);
  state.endings = saved.endings && typeof saved.endings === "object" ? saved.endings : {};
  state.nightFrom = saved.nightFrom && typeof saved.nightFrom === "object" ? saved.nightFrom : {};

  if (state.storyId) {
    try {
      const res = await fetch(STORY_FILES[state.storyId]);
      if (res.ok) {
        state.story = await res.json();
        applyStoryArt(state.story);
      }
    } catch (_) {
      state.story = null;
      state.storyId = null;
    }
  }
  if (state.story && state.nodeId && !state.story.nodes[state.nodeId]) {
    state.nodeId = null;
    state.path = [];
  }

  $("#enter-btn").addEventListener("click", async () => {
    await AudioEngine.unlock();
    AudioEngine.sfxChoice();
    state.ageOk = true;
    save();
    show("cover");
  });

  $("#cover-enter").addEventListener("click", async () => {
    await AudioEngine.unlock();
    AudioEngine.sfxChoice();
    renderCast();
    show("cast");
  });

  $("#start-alex").addEventListener("click", async () => {
    await AudioEngine.unlock();
    startAlex(true);
  });
  $("#resume-alex").addEventListener("click", async () => {
    await AudioEngine.unlock();
    startAlex(false);
  });

  $("#back-cast").addEventListener("click", () => {
    cancelSpeech();
    setCallMode(false);
    AudioEngine.sfxClick();
    show("cast");
  });

  $("#btn-replay-voice").addEventListener("click", () => {
    replayLastVoice();
  });

  const endingNext = $("#ending-next");
  if (endingNext) {
    endingNext.addEventListener("click", () => {
      cancelSpeech();
      AudioEngine.sfxChoice();
      continueNextNight();
    });
  }

  $("#ending-replay").addEventListener("click", () => {
    cancelSpeech();
    clearProgress();
    startAlex(true);
  });

  $("#ending-cast").addEventListener("click", () => {
    cancelSpeech();
    AudioEngine.sfxClick();
    clearProgress();
    show("cast");
  });

  // soft click feedback on primary ghost buttons
  document.querySelectorAll(".btn").forEach((btn) => {
    if (btn.id === "enter-btn" || btn.classList.contains("btn-choice")) return;
    btn.addEventListener("click", () => {
      if (!AudioEngine.started) return;
      // choice/enter have their own sfx
    });
  });

  renderCast();

  if (!state.ageOk) {
    show("gate");
  } else {
    show("cover");
  }
}

try {
  window.__ahSpokenBlocked = spokenBlocked;
  window.__ahDeliverBot = deliverBotLine;
  window.__ahThicken = {
    beatProfile: beatProfile,
    lineFitsBeat: lineFitsBeat,
    glueBeat: glueBeat,
    finishBeatLine: finishBeatLine,
    extractPlayerFact: extractPlayerFact,
    intimacyBand: intimacyBand,
    typingDelayMs: typingDelayMs,
    splitHumanLine: splitHumanLine,
    applyBeatContinuity: applyBeatContinuity,
    beatStillSrc: beatStillSrc,
    portraitVideoSrc: portraitVideoSrc,
    boundaryTone: boundaryTone,
    state: state,
    notePlayerTurn: notePlayerTurn,
    nearDuplicate: nearDuplicate,
    pickAvoidRepeat: pickAvoidRepeat,
    pickReply: pickReply,
    playerFacingReply: playerFacingReply,
    rememberSpoken: rememberSpoken,
    spokenBlocked: spokenBlocked,
    isTelegraphic: isTelegraphic,
    ensureComplete: ensureComplete,
    listIncomingLines: function () {
      const cast = getCast();
      const greetings = cast.greetings && cast.greetings.length ? cast.greetings : (cast.greeting ? [cast.greeting] : []);
      return [].concat(greetings, cast.incoming || [], cast.firstPing || []);
    },
    incomingWaitMs: incomingWaitMs,
    incomingWindow: incomingWindow,
    incomingFollowDue: incomingFollowDue,
    repeatsSceneAsk: repeatsSceneAsk,
    pickGreeting: pickGreeting,
    greetingLines: greetingLines,
    poolFor: poolFor,
    topicEchoBank: topicEchoBank,
    sceneAsideBank: sceneAsideBank,
    topicOf: topicOf,
    pickProactiveLine: pickProactiveLine,
    pickFirstPingLine: pickFirstPingLine,
    memoryChipLine: memoryChipLine,
    memoryChipLabel: memoryChipLabel,
    preferredMemoryId: preferredMemoryId,
    takePhoneLine: takePhoneLine,
    takeInboxLine: takeInboxLine,
    secondNightSeed: secondNightSeed,
    sanitizeFacts: sanitizeFacts,
    expirePlayerFacts: expirePlayerFacts,
  };
} catch (_) {}

installExperienceHooks();
let experienceHookTries = 0;
const experienceHookTimer = setInterval(() => {
  installExperienceHooks();
  if (++experienceHookTries > 40) clearInterval(experienceHookTimer);
}, 200);

init().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    "<p style='padding:2rem;font-family:sans-serif'>載入失敗。請用本地伺服器打開（唔好直接 double-click 檔案），例如：<code>python3 -m http.server 8080</code></p>";
});

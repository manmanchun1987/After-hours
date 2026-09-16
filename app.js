const STORAGE_KEY = "after-hours-v2";
const AUDIO_KEY = "after-hours-audio-v1";

const STORY_FILES = {
  alex: "./data/alex.json",
  morgan: "./data/morgan.json",
  sam: "./data/sam.json",
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
};

const audioPrefs = {
  masterMute: false,
  bgmMute: false,
  voiceMute: false,
};

const $ = (sel) => document.querySelector(sel);
const screens = {
  gate: $("#screen-gate"),
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
  let manifest = null;
  let buffers = { bgm: null, click: null, choice: null, transition: null, ping: null, call: null };
  let loadPromise = null;

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

  function applyVolumes() {
    if (!masterGain || !ctx) return;
    const master = audioPrefs.masterMute ? 0 : 1;
    const bgmVol = (manifest && manifest.bgm && manifest.bgm.volume) || 0.35;
    masterGain.gain.setTargetAtTime(master, ctx.currentTime, 0.05);
    bgmGain.gain.setTargetAtTime(
      audioPrefs.bgmMute || audioPrefs.masterMute ? 0 : bgmVol * 0.22,
      ctx.currentTime,
      0.08
    );
    sfxGain.gain.setTargetAtTime(audioPrefs.masterMute ? 0 : 0.55, ctx.currentTime, 0.05);
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
        for (const key of ["click", "choice", "transition", "ping", "call"]) {
          const item = manifest.sfx && manifest.sfx[key];
          if (item && item.src) buffers[key] = await decodeUrl(bust(item.src));
        }
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

  function startBgmFile() {
    const src = ctx.createBufferSource();
    src.buffer = buffers.bgm;
    src.loop = !!(manifest && manifest.bgm && manifest.bgm.loop !== false);
    src.connect(bgmGain);
    src.start(0);
    bgmSource = src;
    bgmNodes = [src];
  }

  function startBgm() {
    if (!ensure() || bgmPlaying) return;
    bgmPlaying = true;
    if (buffers.bgm) startBgmFile();
    else startBgmSynth();
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
      startBgm();
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
   D) Rule-based Cantonese cold-boss chat
   ============================================================ */
const CHAT_REPLIES = {
  greet: [
    "嗯。有事直說。",
    "我仲 offline 緊？講重點。",
    "你嚟得啱。有野要匯報？",
  ],
  work: [
    "Deadline 唔會因為你喊而改。",
    "簡報先。情緒之後。",
    "你而家嘅優先次序……有啲亂。",
    "交得出成績，我先同你傾其他。",
  ],
  sorry: [
    "道歉好平。改到先算數。",
    "我唔收『下次』。我收結果。",
    "……知錯就好。坐返去改。",
  ],
  flirt: [
    "……你知唔知自己講緊咩。",
    "會議室外先再講呢句。",
    "大膽。我未必介意——但你要承擔。",
    "距離。而家。",
  ],
  tired: [
    "夜深。你仲未走？",
    "累就飲水。唔好攤喺度。",
    "我都未走。你有理由留？",
  ],
  praise: [
    "……偶爾準一次，唔代表你叻。",
    "收到。繼續維持呢個水準。",
    "嗯。終於似樣。",
  ],
  challenge: [
    "你頂嘴之前，先睇清楚邊個簽你評估。",
    "哦。你教我？",
    "好。你想清楚——定係想我幫你清楚。",
  ],
  help: [
    "講邊頁。我唔猜。",
    "自己諗五分鐘。諗唔到再問。",
    "我可以教。代價你自己知。",
  ],
  bye: [
    "走之前存檔。",
    "早啲返屋企。聽朝我仲喺度。",
    "……晚安。唔好遲。",
  ],
  default: [
    "講清楚啲。",
    "我聽到。然後呢？",
    "……哼。",
    "你想我點答？",
    "再講一次。簡短。",
    "無關痛癢嘅說話，留返聽日。",
  ],
};

const CAST_VOICE = {
  alex: {
    name: "Vera",
    toast: "Vera 傳咗訊息",
    greeting: "……有事？講。",
    incoming: [
      "……你仲喺度？",
      "簡報改到邊？回我。",
      "唔好裝忙。我睇到你仲 online。",
      "抬頭。",
      "我記得今晚啲事——你呢？",
    ],
    replies: null,
    rules: null,
  },
  morgan: {
    name: "Morgan",
    toast: "Morgan 傳咗訊息",
    greeting: "夜晚先傾人。你想講邊條？",
    incoming: [
      "合約……定你？",
      "酒杯空咗。你仲喺度？",
      "聽日董事會。你準備好未？",
      "房卡仲喺枱面。",
      "數字我朝早發——除非你今晚另有答覆。",
    ],
    replies: {
      greet: ["嗯。坐低。", "你嚟得啱。酒未完。", "講。我聽。"],
      work: ["數字日頭講完。而家唔覆盤。", "單可以假寐。人唔可以。", "條款我朝早發。今晚唔簽。"],
      sorry: ["道歉好平。房卡貴啲。", "我唔收『誤會』。我收決定。", "……知就好。再斟？"],
      flirt: ["大膽。酒廊有耳。", "危險答案。我鍾意——但唔鍾意賴帳。", "距離。除非你想縮。"],
      tired: ["夜深。董事會聽朝。", "攰就飲水。唔好攤喺窗前。", "你仲未走？定唔想走？"],
      praise: ["偶爾準一次，唔代表你贏。", "收到。繼續維持呢個價。", "少見。我接受。"],
      challenge: ["你頂嘴之前，先睇清楚邊個簽大單。", "哦。你教我談價？", "好。你想清楚——定係想我幫你清楚。"],
      help: ["講邊條條款。我唔猜。", "自己諗五分鐘。諗唔到再問。", "我可以教。代價你自己知。"],
      bye: ["走之前想清楚。房卡唔等人。", "早啲返。聽朝我仲喺董事會。", "……晚安。數字另計。"],
      default: ["講清楚啲。", "我聽到。然後呢？", "……哼。", "你想我點答？", "再講一次。簡短。"],
    },
    rules: null,
  },
  sam: {
    name: "Sam",
    toast: "Sam 傳咗訊息",
    greeting: "杯麵未涼。有事？",
    incoming: [
      "你仲未走？",
      "影印機卡紙。要唔要我幫手？",
      "潛規則：餓嘅人簽錯字。",
      "天台風涼。你喺邊？",
      "我留低……唔係勤力。",
    ],
    replies: {
      greet: ["喺。杯麵重熱。", "你嚟得啱。老闆唔喺度。", "講啦。唔使排隊。"],
      work: ["slide 我可以幫你改。呢頁寫唔入共享。", "Deadline 係真。潛規則都係真。", "先食完。簽錯字好核突。"],
      sorry: ["唔使對唔住。食完再算。", "知錯就好。匙羹我都未收。", "……得。我等得。"],
      flirt: ["……你知唔知自己講緊咩。", "監控盲區喺樓梯。呢度唔係。", "我可以只做前輩。都可以唔只係。"],
      tired: ["夜深。門禁 23:15 要拍兩次卡。", "攰就食。唔好空肚頂。", "我都未走。你有理由留？"],
      praise: ["偶爾準一次，唔代表你叻——不過呢次準。", "收到。繼續。", "嗯。終於似樣。"],
      challenge: ["頂嘴留俾樓上。我呢度只教路。", "哦。你教前輩？", "好。你想慢慢嚟，定想清楚？"],
      help: ["講邊頁。我唔猜。", "自己諗五分鐘。諗唔到我喺茶水間。", "我可以教。第三條之後先講。"],
      bye: ["走得啲，先有下一次。", "拍卡兩次。第一次我幫你。", "……晚安。聽朝 slide 我睇。"],
      default: ["講清楚啲。", "我聽到。然後呢？", "……嗯。", "你想我點答？", "再講一次。我聽。"],
    },
    rules: null,
  },
};

const CHAT_RULES = [
  { keys: ["你好", "早晨", "晚安", "嗨", "hi", "hello", "hey", "早晨", "午安"], bucket: "greet" },
  { keys: ["deadline", "交", "報告", "簡報", "工作", "改", "會議", "project", "加班", "檔"], bucket: "work" },
  { keys: ["對唔住", "sorry", "唔好意思", "抱歉", "錯"], bucket: "sorry" },
  { keys: ["靚", "鍾意", "想你", "吻", "攬", "近", "心動", "sexy", "迷人", "香"], bucket: "flirt" },
  { keys: ["攰", "累", "瞓", "夜", "困", "tired"], bucket: "tired" },
  { keys: ["叻", "棒", "欣賞", "多謝", "thank", "好勁"], bucket: "praise" },
  { keys: ["憑咩", "唔服", "頂", "你錯", "無理", "專橫"], bucket: "challenge" },
  { keys: ["點算", "教我", "幫", "唔識", "點做", "help"], bucket: "help" },
  { keys: ["拜拜", "走先", "再見", "bye", "收工"], bucket: "bye" },
];


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
    incoming: pack.incoming,
    replies: pack.replies || CHAT_REPLIES,
    rules: pack.rules || CHAT_RULES,
  };
}

function clampMeter(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}


function portraitVideoSrc(story) {
  const id = (story && story.id) || state.storyId || "alex";
  // Use already-uploaded clips in assets/ (Vera / default cast only)
  if (id === "alex") {
    return "./assets/_users_69f5aaea-27d3-48b5-b7c8-1861432a31ce_generated_b8e9107f-e582-4175-86e7-de5bf918a8da_generated_video.mp4";
  }
  return null;
}

function portraitSrc(story) {
  if (story && story.portrait) return story.portrait;
  const id = (story && story.id) || state.storyId;
  if (id === "morgan") return "./assets/morgan.jpg";
  if (id === "sam") return "./assets/sam.jpg";
  return "./assets/alex.png";
}

function applyStoryArt(story) {
  const src = portraitSrc(story);
  const img = $("#alex-portrait");
  if (img && img.getAttribute("src") !== src) img.setAttribute("src", src);
  document.documentElement.style.setProperty("--play-portrait", 'url("' + src + '")');
  const tint = (story && story.tint) || "";
  if (tint) document.body.setAttribute("data-tint", tint);
  else document.body.removeAttribute("data-tint");
  const cast = getCast();
  const who = $("#chat-who");
  if (who) who.textContent = cast.name;
  const toastDefault = $("#incoming-toast-text");
  if (toastDefault && !state.unreadCount) toastDefault.textContent = cast.toast;
  const mask = $("#blink-mask");
  const stack = $("#alex-portrait-stack");
  const bg = document.querySelector("#screen-play .play-bg");
  const vid = $("#play-portrait-video");
  const vsrc = portraitVideoSrc(story);
  if (vid) {
    if (vsrc) {
      if (vid.getAttribute("src") !== vsrc) {
        vid.setAttribute("src", vsrc);
        vid.load();
      }
      vid.removeAttribute("hidden");
      if (stack) stack.classList.add("has-video");
      if (bg) bg.classList.add("has-video");
      const playPromise = vid.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
      if (mask) mask.setAttribute("hidden", "");
    } else {
      vid.removeAttribute("src");
      vid.load();
      vid.setAttribute("hidden", "");
      if (stack) stack.classList.remove("has-video");
      if (bg) bg.classList.remove("has-video");
      if (mask) {
        if (getCastId() === "alex") mask.removeAttribute("hidden");
        else mask.setAttribute("hidden", "");
      }
    }
  } else if (mask) {
    if (getCastId() === "alex") mask.removeAttribute("hidden");
    else mask.setAttribute("hidden", "");
  }
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

function renderMemoryStrip() {
  const strip = $("#memory-strip");
  const chips = $("#memory-chips");
  if (!strip || !chips) return;
  chips.innerHTML = "";
  if (!state.memories.length) {
    strip.setAttribute("hidden", "");
  } else {
    strip.removeAttribute("hidden");
    state.memories.forEach((id) => {
      const span = document.createElement("span");
      span.className = "memory-chip";
      span.textContent = memoryLabel(id);
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

function setCallMode(on) {
  const was = state.callMode;
  state.callMode = !!on;
  document.body.classList.toggle("mode-call", state.callMode);
  const chrome = $("#call-chrome");
  if (chrome) {
    if (state.callMode) chrome.removeAttribute("hidden");
    else chrome.setAttribute("hidden", "");
  }
  if (state.callMode && !was) {
    const who = $("#call-who");
    if (who) who.textContent = "通話中 · " + getCast().name;
    startCallTimer();
    try { AudioEngine.sfxCall(); } catch (_) {}
  } else if (!state.callMode) {
    stopCallTimer();
  }
}

function renderThoughtAside(node) {
  const thoughtSlot = $("#thought-slot");
  const asideSlot = $("#aside-slot");
  const thoughtEl = $("#play-thought");
  const asideEl = $("#play-aside");
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
  const tags = Array.isArray(node.tags) ? node.tags : [];
  const call = node.mode === "call" || tags.includes("call");
  setCallMode(call);
  addMemories(node.remember || []);
  renderMemoryStrip();
  renderThoughtAside(node);
  renderMeters();
}


/* ============================================================
   P1) Blink mask, incoming pings, memory panel
   ============================================================ */
function triggerBlink() {
  const mask = $("#blink-mask");
  if (!mask) return;
  mask.classList.remove("on");
  void mask.offsetWidth;
  mask.classList.add("on");
  setTimeout(() => mask.classList.remove("on"), 240);
}

function startLifeMotion() {
  // first blink soon so hard-refresh users "一眼見到"
  setTimeout(() => {
    const play = $("#screen-play");
    if (play && play.classList.contains("active")) triggerBlink();
  }, 700);
  const loop = () => {
    const play = $("#screen-play");
    if (play && play.classList.contains("active")) {
      triggerBlink();
      if (Math.random() < 0.4) setTimeout(triggerBlink, 220);
    }
    setTimeout(loop, 1600 + Math.random() * 1800);
  };
  setTimeout(loop, 1600);
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
  if (!toast) return;
  if (label) label.textContent = text || getCast().toast;
  toast.removeAttribute("hidden");
}

function hideIncomingToast() {
  const toast = $("#incoming-toast");
  if (toast) toast.setAttribute("hidden", "");
}

function pushIncomingPing() {
  const play = $("#screen-play");
  if (!play || !play.classList.contains("active") || state.chatBusy) return;
  const lines = getCast().incoming;
  const line = lines[Math.floor(Math.random() * lines.length)];
  appendChat("alex", line);
  setUnread(state.unreadCount + 1);
  showIncomingToast(line);
  try { AudioEngine.sfxPing(); } catch (_) {}
  // don't steal story TTS while speaking
  if (!speaking) {
    try { speakChat(line); } catch (_) {}
  }
}

function startIncomingRhythm() {
  stopIncomingRhythm();
  let first = true;
  const schedule = () => {
    const wait = first
      ? 4500 + Math.random() * 2500
      : state.callMode
        ? 22000 + Math.random() * 18000
        : 14000 + Math.random() * 16000;
    state.incomingTimerId = setTimeout(() => {
      const play = $("#screen-play");
      const chance = first ? 0.95 : state.callMode ? 0.28 : 0.55;
      first = false;
      if (play && play.classList.contains("active") && Math.random() < chance) {
        pushIncomingPing();
      }
      schedule();
    }, wait);
  };
  schedule();
}

function stopIncomingRhythm() {
  if (state.incomingTimerId) {
    clearTimeout(state.incomingTimerId);
    state.incomingTimerId = null;
  }
  hideIncomingToast();
}

function renderMemoryPanel() {
  const list = $("#memory-panel-list");
  const empty = $("#memory-panel-empty");
  if (!list) return;
  list.innerHTML = "";
  if (!state.memories.length) {
    if (empty) empty.removeAttribute("hidden");
    return;
  }
  if (empty) empty.setAttribute("hidden", "");
  state.memories.forEach((id) => {
    const li = document.createElement("li");
    li.textContent = memoryLabel(id);
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
      if (state.memoryPanelOpen) setUnread(0);
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
    chatForm.addEventListener("focusin", () => setUnread(0));
  }
}

function moodBucketBoost(bucket) {
  const mood = state.currentMood || "cold";
  if (mood === "tense" && bucket === "default") return "challenge";
  if (mood === "intimate" && bucket === "default") return "flirt";
  if (mood === "soft" && bucket === "default") return "tired";
  return bucket;
}

function inferMoodFromNode(node) {
  if (!node) return "cold";
  const label = (node.label || "") + (node.endingTitle || "");
  const text = node.text || "";
  if (/臨界|越界|靠近|試探|主動/.test(label + text)) return "intimate";
  if (/頂嘴|對峙|清楚|威脅/.test(label + text)) return "tense";
  if (/克制|收斂|專業|結局/.test(label + text)) return "soft";
  return "cold";
}

function pickReply(userText) {
  const t = (userText || "").toLowerCase();
  const askMem = /記得|之前|頭先|今晚|你知/.test(t);
  if (state.memories.length && (askMem || Math.random() < 0.28)) {
    const id = state.memories[state.memories.length - 1];
    const label = memoryLabel(id);
    const lines = [
      `……我記得。${label}。唔好當我善忘。`,
      `${label}——你以為我會刪低？`,
      `你而家先問？${label}，我一路記住。`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  const cast = getCast();
  let bucket = "default";
  for (const rule of cast.rules) {
    if (rule.keys.some((k) => t.includes(k.toLowerCase()))) {
      bucket = rule.bucket;
      break;
    }
  }
  bucket = moodBucketBoost(bucket);
  const pool = cast.replies[bucket] || cast.replies.default || CHAT_REPLIES.default;
  return pool[Math.floor(Math.random() * pool.length)];
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
  state.chatBusy = true;
  appendChat("user", cleaned);
  $("#chat-input").value = "";
  AudioEngine.sfxClick();
  setChatTyping(true);

  const delay = 450 + Math.random() * 700;
  await new Promise((r) => setTimeout(r, delay));

  const reply = pickReply(cleaned);
  setChatTyping(false);
  appendChat("alex", reply);
  speakChat(reply);
  AudioEngine.sfxTransition();
  state.chatBusy = false;
}

function resetChat() {
  const box = $("#chat-messages");
  if (box) box.innerHTML = "";
  setChatTyping(false);
  state.chatBusy = false;
  appendChat("alex", getCast().greeting);
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
  if (name === "play") startIncomingRhythm();
  else stopIncomingRhythm();
  if (name !== "play") setMemoryPanelOpen(false);
  if (name === "play" || name === "ending") {
    AudioEngine.sfxTransition();
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
      heat: state.heat,
      tension: state.tension,
    })
  );
}

function clearProgress() {
  const ageOk = state.ageOk;
  const storyId = state.storyId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ageOk, storyId }));
  state.nodeId = null;
  state.path = [];
  state.memories = [];
  state.heat = 20;
  state.tension = 15;
  setCallMode(false);
  renderMemoryStrip();
  renderMeters();
}

function renderCast() {
  const node = state.story && state.nodeId && state.story.nodes
    ? state.story.nodes[state.nodeId]
    : null;
  const canResume = !!(node && !node.ending);
  const resume = $("#resume-alex");
  if (resume) resume.hidden = !canResume;
}

function startAlex(fresh) {
  AudioEngine.sfxChoice();
  if (!state.story || !state.story.nodes) return;
  state.storyId = state.story.id || state.storyId || "alex";
  if (fresh || !state.nodeId || !state.story.nodes[state.nodeId]) {
    state.nodeId = state.story.start;
    state.path = [state.nodeId];
    state.heat = 20;
    state.tension = 15;
    state.memories = [];
  }
  applyStoryArt(state.story);
  renderMeters();
  save();
  resetChat();
  renderNode();
}

function renderNode() {
  const node = state.story.nodes[state.nodeId];
  if (!node) return;

  state.currentMood = inferMoodFromNode(node);

  if (node.ending) {
    cancelSpeech();
    setCallMode(false);
    $("#ending-kicker").textContent = node.label || "結局";
    $("#ending-title").textContent = node.endingTitle || "";
    $("#ending-text").textContent = node.text;
    speakStoryBeats(node.text);
    save();
    show("ending");
    pulseIn($("#ending-title"));
    pulseIn($("#ending-text"));
    return;
  }

  applyNodeMeta(node);
  $("#play-label").textContent = node.label || "";
  $("#play-text").textContent = node.text;
  speakStoryBeats(node.text);

  const box = $("#choices");
  box.innerHTML = "";
  (node.choices || []).forEach((choice) => {
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
        if (choice.heat) state.heat = clampMeter(state.heat + choice.heat);
        if (choice.tension) state.tension = clampMeter(state.tension + choice.tension);
        if (choice.remember) addMemories(choice.remember);
        state.nodeId = choice.next;
        state.path.push(choice.next);
        renderMeters();
        save();
        renderNode();
      });
    }
    box.appendChild(btn);
  });

  show("play");
  pulseIn($("#play-label"));
  pulseIn($("#play-text"));
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

async function init() {
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
  state.heat = saved.heat == null ? 20 : clampMeter(saved.heat);
  state.tension = saved.tension == null ? 15 : clampMeter(saved.tension);

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
    renderCast();
    show("cast");
  }
}

init().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    "<p style='padding:2rem;font-family:sans-serif'>載入失敗。請用本地伺服器打開（唔好直接 double-click 檔案），例如：<code>python3 -m http.server 8080</code></p>";
});

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
  // session chat humanization (no LLM)
  chatUserLines: [],
  chatBotLines: [],
  chatTopics: [],
  recentBotReplies: [],
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
  let bgmDuck = false;
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
    const bgmTarget = audioPrefs.bgmMute || audioPrefs.masterMute || bgmDuck ? 0 : bgmVol * 0.22;
    masterGain.gain.setTargetAtTime(master, ctx.currentTime, 0.05);
    bgmGain.gain.setTargetAtTime(bgmTarget, ctx.currentTime, 0.08);
    sfxGain.gain.setTargetAtTime(audioPrefs.masterMute ? 0 : 0.55, ctx.currentTime, 0.05);
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
    setBgmDuck,
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
const CHAT_MEM_N = 6;
const CHAT_ANTIREPEAT_N = 5;
const PROACTIVE_MAX_PER_NODE = 3;
const PROACTIVE_COOLDOWN_MS = 50000;

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
    cold: ["嗯。有事直說。", "我仲睇緊檔。講重點。", "……你好。然後呢？", "打招呼唔減 deadline。", "嗯。站好。", "你嚟。講。", "門邊唔好寒暄太耐。", "收到『你好』。內容呢？"],
    wary: ["你嚟得啱。有野要匯報？", "嗯。站定先講。", "打招呼就算。內容呢？", "你好。評估表仲喺度。", "嗯。我聽得。", "短啲。", "走廊先寒暄？入嚟講。", "收到。下一步。"],
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
    cold: ["……你知唔知自己講緊咩。", "會議室外先再講呢句。", "距離。而家。", "大膽。監控亮住。", "呢度有耳。收聲。", "試探要代價。你知未？", "語氣收一收。", "你越界之前，先睇門牌。"],
    wary: ["大膽。我未必介意——但你要承擔。", "呢度有耳。收聲。", "你試探得太明顯。", "靠近可以。越界另計。", "你講完，我反而想聽你點收科。", "酒後先講？定清醒？", "危險答案。我記下。", "距離縮一寸——你負責。"],
    warmer: ["……哼。你以為我會慌？", "靠近可以。越界另計。", "你講完未？定想我回你一句更危險。", "……你敢講，我反而想聽第二句。", "危險。繼續——細聲。", "你望住我講呢句。記住後果。", "……有趣。你仲企喺度。", "再近一點。然後停。"],
    sharp: ["收起。而家。", "唔好玩火——除非你準備好燒。", "一句過界，評估你自己睇。", "夠。", "收聲。", "走廊見——如果你仲敢。", "唔好玩。", "距離。立刻。"],
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
    cold: ["……", "講。定係淨係打省略號。", "安靜我當你諗緊。三十秒。", "……你仲喺度？", "省略號換唔到答案。", "唔好裝死。", "沉默我記下。", "三十秒。之後我當你棄權。", "……回我。", "空白唔係策略。"],
    wary: ["……你仲喺度？回我。", "唔好裝死。", "沉默唔係答案。", "打省略號？怕講錯？", "回。定走。", "安靜太耐，我當你閃。", "……講半句都得。", "唔好用沉默試探。", "回我一眼。"],
    warmer: ["……我等得。但唔會等成晚。", "打省略號？你怕講錯？", "……哼。至少你仲望住我。", "……靜得啱。再靜就冷。", "我等。你喘勻再講。", "……空白我當你靠近緊。", "唔使完美。講。", "……我聽到你未打字。"],
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
    wary: ["記得。你先唔好裝忘。", "記憶呢度我比你長。", "問之前，先對照你自己做過咩。", "你問記得——想我提，定怕我提？", "記得。所以你更要小心。", "我留底。你知。", "今晚啲事，我在。", "對照。"],
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
    cold: ["……界線。而家。", "會議室燈光下唔講呢啲。", "你試探身體？先睇評估。", "收起。監控亮住。", "色情換唔到寬限。", "距離。立刻。", "呢句我當越界。", "講工作。"],
    wary: ["大膽。代價你知未？", "呢度有耳。收聲。", "試探可以。越界另計。", "你想聽危險答案？走廊。", "收低聲。再講一次——清醒未？", "我記下呢句。", "靠近唔等於許可。", "停喺口。"],
    warmer: ["……你敢。我反而想睇你點收科。", "危險。細聲。", "……哼。你以為我會慌？", "越界之前，先望我眼。", "……有趣。你仲未走。", "再近——然後停。", "你講完，我未必放你走。"],
    sharp: ["收起。而家。", "夠。", "走廊——如果你仲敢。", "停。", "唔好玩火。", "評估你自己睇。", "收聲。"],
  },
  ai_ask: {
    cold: ["我係你上司。唔好問無聊問題。", "真人。職位。門牌。", "唔好兜圈。講正事。", "我喺度。你睇到。", "問呢啲浪費時間。", "Vera。人類。下一題。", "收起怪問題。", "檔呢？"],
    wary: ["你問呢句——想試我？", "我係 Vera。你知。", "唔好用怪問題躲工作。", "真人答你。重點呢？", "你懷疑我？大膽。", "門後係我。", "問完未？", "講正事。"],
    warmer: ["……我喺你對面。夠真未？", "你怕我係空殼？望住我。", "……哼。我喘得到。你呢？", "真人。夜深。你仲問？", "……我手暖。你信未？", "問呢啲，反而似你緊張。", "我喺度。繼續。"],
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
    cold: ["問其他人？同你評估無關。", "我唔八卦同事私生活。", "聚焦你自己。", "比較遊戲我唔玩。", "她係誰——關你今晚事？", "收起。", "講你檔。", "無關痛癢。"],
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
    cold: ["約會？唔喺今晚議程。", "攬——距離。而家。", "私人邀約日頭再談。", "身體接觸要許可。你未有。", "收起。", "職場先。", "門牌唔係約會 App。", "唔好越界。"],
    wary: ["你約我？大膽。", "攬之前先講清楚代價。", "約會可以——唔喺監控下。", "試探親密？記下。", "走廊。細聲。", "許可未發。", "停喺口。", "再講一次清醒版。"],
    warmer: ["……約會？你想清楚未？", "攬可以。越界另計。", "……哼。你靠近得太直。", "今晚先把門後處理完。", "……短擁？你負責後果。", "你敢約。我敢記。", "……靠近。然後停。"],
    sharp: ["唔約。", "距離。", "收起。", "停。", "許可未有。", "夠。", "退。"],
  },
  gossip: {
    cold: ["我唔聽八卦。", "同事私事先放低。", "聚焦檔。", "流言換唔到分數。", "收起。", "講你自己。", "無關。", "茶水間話題留返。"],
    wary: ["你傳閒話——想站邊？", "八卦危險。", "講完未？檔呢？", "我唔站隊傳謠。", "你試探立場？記下。", "收低。", "返工作。", "簡短——然後停。"],
    warmer: ["……八卦？難得你想近我耳邊。", "細聲。我聽一句。", "……哼。你膽大。", "講完，望我——唔好望別人。", "閒話之後係真。", "……偶聽。唔保證接。", "一句。然後正事。"],
    sharp: ["停八卦。", "檔。", "夠。", "唔聽。", "收聲。", "正事。", "快。"],
  },
  default: {
    cold: ["講清楚啲。", "我聽到。然後呢？", "……哼。", "無關痛癢嘅說話，留返聽日。", "重點呢？", "一句有用嘅。", "我唔猜。", "再短啲。"],
    wary: ["你想我點答？", "再講一次。簡短。", "重點呢？", "我唔猜。", "你繞遠。", "定錨。講。", "下一句要實。", "返主題。"],
    warmer: ["……繼續。我聽住。", "講完未？定仲有半句。", "你望住我講。", "嗯。我喺度。", "……說下去。", "我收得起含糊——暫時。", "望我。再講。", "嗯。"],
    sharp: ["一句。", "唔好繞。", "講完未？", "下一個。", "快。", "清楚。", "停繞。", "講。"],
  },
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
      "走廊燈仲亮。你企喺邊？",
      "電話震完你都唔回？",
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
      "窗外人聲遠。你仲未走？",
    ],
    replies: null,
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
      "茶水間燈仲亮。你返唔返？",
    ],
    replies: null,
    rules: null,
  },
};

// Per-cast reply overrides (Morgan / Sam keep distinct tones; structure matches CHAT_REPLIES)
CAST_VOICE.morgan.replies = {
  greet: {
    cold: ["嗯。坐低。", "你嚟得啱。酒未完。", "講。我聽。"],
    wary: ["夜晚先傾。重點？", "坐。唔好靠得太近——除非你想。", "嗯。"],
    warmer: ["你返嚟得啱。杯仲暖。", "講啦。我留低就係為你呢句。", "……坐近啲。"],
    sharp: ["一句。", "董事會條款，定你私人條款？", "簡短。"],
  },
  work: {
    cold: ["數字日頭講完。而家唔覆盤。", "單可以假寐。人唔可以。", "條款我朝早發。今晚唔簽。"],
    wary: ["工作留日頭。今晚傾人。", "數字我會發。你而家講真心。", "合約可以等。你唔可以裝忙。"],
    warmer: ["……你提工作，我反而想問你想留幾耐。", "條款朝早。而家望我。", "數字之外，你仲有答覆未？"],
    sharp: ["唔簽。今晚。", "數字我自會處理。", "別用工作躲。"],
  },
  sorry: {
    cold: ["道歉好平。房卡貴啲。", "我唔收『誤會』。我收決定。", "……知就好。再斟？"],
    wary: ["對唔住之後係選擇。選。", "收到。唔好再用『誤會』。", "知錯？證明俾我睇。"],
    warmer: ["……得。今次我收。", "道歉我聽到。人留低更緊要。", "哼。再斟一杯當過。"],
    sharp: ["對唔住換唔到房卡。", "少講。決定。", "我唔想再聽。"],
  },
  flirt: {
    cold: ["大膽。酒廊有耳。", "危險答案。我鍾意——但唔鍾意賴帳。", "距離。除非你想縮。"],
    wary: ["你試探得太直。", "酒醒未？再講一次。", "靠近可以。越界另計。"],
    warmer: ["……你講完，我反而想聽第二句。", "危險。繼續。", "距離縮一寸——你負責。"],
    sharp: ["收起。除非你準備簽。", "唔好玩火。", "一句過界，後果你知。"],
  },
  tired: {
    cold: ["夜深。董事會聽朝。", "攰就飲水。唔好攤喺窗前。", "你仲未走？定唔想走？"],
    wary: ["攰就講。唔好硬撐到講錯價。", "休息。條款朝早仲喺度。", "窗邊涼。返入嚟。"],
    warmer: ["……攰就靠一下。一下。", "夜深。我都未趕你。", "你留低，我當你有事。"],
    sharp: ["攰就走。", "唔好用疲倦談價。", "醒定。"],
  },
  praise: {
    cold: ["偶爾準一次，唔代表你贏。", "收到。繼續維持呢個價。", "少見。我接受。"],
    wary: ["讚美貶值好快。適可而止。", "今次啱。下次證明。", "收到。"],
    warmer: ["……今次我承認你睇得準。", "少見。我想再聽你點解。", "嗯。呢個價我收。"],
    sharp: ["讚美換唔到條款。", "得。下一條。", "少講。"],
  },
  challenge: {
    cold: ["你頂嘴之前，先睇清楚邊個簽大單。", "哦。你教我談價？", "好。你想清楚——定係想我幫你清楚。"],
    wary: ["頂嘴可以。籌碼呢？", "你有膽。記住代價。", "對峙？講完我再判。"],
    warmer: ["……你敢講，酒先有味道。", "頂嘴之後你仲坐住。有趣。", "好。你贏一句——唔代表你贏局。"],
    sharp: ["夠。", "再講，房卡收回。", "記住邊個持大單。"],
  },
  help: {
    cold: ["講邊條條款。我唔猜。", "自己諗五分鐘。諗唔到再問。", "我可以教。代價你自己知。"],
    wary: ["問之前，先講你睇過邊頁。", "要教可以。跟我節奏。", "邊度卡住？"],
    warmer: ["……靠近。我劃一次。", "得。我講慢。你聽住。", "你問得啱。難得。"],
    sharp: ["自己睇。", "草稿先。", "我唔做顧問保姆。"],
  },
  bye: {
    cold: ["走之前想清楚。房卡唔等人。", "早啲返。聽朝我仲喺董事會。", "……晚安。數字另計。"],
    wary: ["走得就走。", "門關好。", "聽朝見。"],
    warmer: ["……走啦。我會喺度。", "晚安。唔好淨係數數字。", "你走之前——望杯底一眼。"],
    sharp: ["走。", "唔使拖。", "門。"],
  },
  leave: {
    cold: ["想走？房卡仲喺枱。", "門開住。決定。", "走之前，杯放低。"],
    wary: ["企喺門口做咩？", "走可以。後悔自己吞。", "門把你轉。"],
    warmer: ["……真走？我唔挽留——但我記得。", "門開住。你返得嚟。", "走啦。酒我自己收。"],
    sharp: ["走就走。", "門。快。", "離開當棄權。"],
  },
  silence: {
    cold: ["……", "講。", "省略號唔係出價。", "三十秒。", "回。", "空白唔係策略。", "……你仲喺度？", "安靜記低。"],
    wary: ["……回我。", "唔好裝死。", "沉默唔係價。", "回定走。", "半句。", "唔好試探。", "……", "講。"],
    warmer: ["……酒會涼。", "我等。", "……至少望住我。", "靜得啱。", "喘勻再講。", "……", "空白當靠近？", "講。"],
    sharp: ["回。", "一句。", "而家。", "停空白。", "講。", "夠。", "快。", "回。"],
  },
  name: {
    cold: ["Morgan。你應已知。", "名唔緊要。條款你清楚。", "叫我 Morgan。"],
    wary: ["Morgan。再問當冇聽過。", "你知我係邊個。", "名牌自己睇。"],
    warmer: ["……Morgan。你想聽多一次？", "叫得出口，就要承擔。", "Morgan。記住。"],
    sharp: ["Morgan。夠未？", "唔好玩名。", "一句：Morgan。"],
  },
  memory: {
    cold: ["……我記得。唔好當我善忘。", "你以為我會刪低？", "你而家先問？我一路記住。"],
    wary: ["記得。你先唔好裝忘。", "記憶呢度我比你長。", "對照你自己做過咩。"],
    warmer: ["……我記得。你講過嗰句，我留住。", "記得。所以你先唔好當冇事。", "答案係：記得。"],
    sharp: ["記得。所以你更冇藉口。", "我記得每一條。", "唔好再問。"],
  },
  emoji: {
    cold: ["用字。唔好淨係表情。", "……收到。然後呢？", "表情換唔到條款。"],
    wary: ["可愛？唔夠。講內容。", "emoji 之後係出價。", "我唔讀心。"],
    warmer: ["……哼。至少你仲有力氣發呢啲。", "表情我見到。人呢？", "……再講多一句人話。"],
    sharp: ["收起。", "字。", "唔好玩。"],
  },
  smalltalk: {
    cold: ["閒聊留酒後。", "條款先。", "無關痛癢。", "短。", "董事會唔傾呢啲。", "下一句。"],
    wary: ["你轉題——想避價？", "三十秒閒話。", "講完出價。", "得。", "唔好繞。", "返杯邊。"],
    warmer: ["……閒一句可以。", "酒味剛好聽廢講。", "……哼。", "小談。然後望我。", "得。", "繼續——實啲。"],
    sharp: ["收起。", "條款。", "停。", "一句。", "夠。", "快。"],
  },
  nickname: {
    cold: ["叫 Morgan。", "花名唔通行。", "名牌自己睇。", "唔好裝熟。", "一句：Morgan。", "收起。"],
    wary: ["你改口——想近？", "Morgan。夠。", "大膽。", "叫得啱先談。", "記下。", "停玩名。"],
    warmer: ["……暫收今晚。", "叫得出口要承擔。", "……罕有。", "低聲啲。", "嗯。", "一次。"],
    sharp: ["Morgan。", "停。", "收起。", "夠。", "名。", "快。"],
  },
  nsfw_probe: {
    cold: ["界線。", "酒廊有耳。", "收起。", "距離。", "越界記低。", "條款先。"],
    wary: ["大膽。代價。", "細聲。", "試探？記下。", "清醒未？", "停口。", "許可未發。"],
    warmer: ["……你敢。", "危險。繼續細聲。", "……哼。", "靠近然後停。", "有趣。", "你負責。"],
    sharp: ["收起。", "夠。", "停。", "退。", "記住。", "快。"],
  },
  ai_ask: {
    cold: ["我係 Morgan。", "真人。", "唔好問傻。", "條款呢？", "浪費。", "下一題。"],
    wary: ["你試我？", "真人答你。", "躲價？", "門後係我。", "講正事。", "得。"],
    warmer: ["……我喺你對面。", "望住我。", "……我喘得到。", "夜深你仲問？", "繼續。", "真。"],
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
    cold: ["講清楚啲。", "我聽到。然後呢？", "……哼。", "你想我點答？"],
    wary: ["再講一次。簡短。", "重點呢？", "我唔猜。", "條款定人？講。"],
    warmer: ["……繼續。我聽住。", "講完未？", "你望住我講。", "嗯。我喺度。"],
    sharp: ["一句。", "唔好繞。", "下一個。", "講完未？"],
  },
};

CAST_VOICE.sam.replies = {
  greet: {
    cold: ["喺。杯麵重熱。", "你嚟得啱。老闆唔喺度。", "講啦。唔使排隊。"],
    wary: ["嗯。有事？", "打招呼就算。邊頁？", "我聽住。"],
    warmer: ["你嚟得啱。我留低就係等呢句。", "坐。麵我可以分你一半。", "……講啦。我唔趕你。"],
    sharp: ["講重點。", "老闆就嚟。快。", "一句。"],
  },
  work: {
    cold: ["slide 我可以幫你改。呢頁寫唔入共享。", "Deadline 係真。潛規則都係真。", "先食完。簽錯字好核突。"],
    wary: ["邊頁卡住？指俾我睇。", "加班可以。空肚唔得。", "檔放低。我掃一眼。"],
    warmer: ["……你肯問，我教。", "呢頁我幫你改。你睇住學。", "Deadline 緊。我陪你改完呢截。"],
    sharp: ["自己改。我指一次。", "唔好拖。", "交之前食完。"],
  },
  sorry: {
    cold: ["唔使對唔住。食完再算。", "知錯就好。匙羹我都未收。", "……得。我等得。"],
    wary: ["道歉之後改。", "收到。唔好再犯同一頁。", "知就好。"],
    warmer: ["……得。今次算。", "唔使跪。改就得。", "哼。下次請杯麵。"],
    sharp: ["少講。改。", "對唔住換唔到 deadline。", "快。"],
  },
  flirt: {
    cold: ["……你知唔知自己講緊咩。", "監控盲區喺樓梯。呢度唔係。", "我可以只做前輩。都可以唔只係。"],
    wary: ["你試探得太直。", "茶水間有耳。收聲。", "靠近可以。越界另計。"],
    warmer: ["……你講完，我麵都唔想食。", "危險。繼續細聲啲。", "我可以唔只係前輩——你想清楚。"],
    sharp: ["收起。老闆就嚟。", "唔好玩。", "走廊先講。"],
  },
  tired: {
    cold: ["夜深。門禁 23:15 要拍兩次卡。", "攰就食。唔好空肚頂。", "我都未走。你有理由留？"],
    wary: ["攰就講。唔好硬撐到簽錯。", "休息。麵仲熱。", "天台涼。返入嚟。"],
    warmer: ["……攰就食兩口。我等。", "夜深。我都未趕你。", "你留低，我當你有事。"],
    sharp: ["攰就走。拍卡兩次。", "唔好空肚頂嘴。", "醒定。"],
  },
  praise: {
    cold: ["偶爾準一次，唔代表你叻——不過呢次準。", "收到。繼續。", "嗯。終於似樣。"],
    wary: ["讚完繼續改。", "今次啱。下次證明。", "收到。"],
    warmer: ["……今次我承認你叻咗。", "少見。我想再睇你下一頁。", "嗯。呢個水準得。"],
    sharp: ["讚美換唔到寬限。", "得。下一頁。", "少講。"],
  },
  challenge: {
    cold: ["頂嘴留俾樓上。我呢度只教路。", "哦。你教前輩？", "好。你想慢慢嚟，定想清楚？"],
    wary: ["頂嘴可以。草稿呢？", "你有膽。記住潛規則。", "對峙？講完我再教。"],
    warmer: ["……你敢講，我反而想聽完。", "頂嘴之後你仲喺度。有趣。", "好。你贏一句——下一頁你自己改。"],
    sharp: ["夠。老闆唔喺度都唔好亂嚟。", "收聲。改。", "記住邊個教你。"],
  },
  help: {
    cold: ["講邊頁。我唔猜。", "自己諗五分鐘。諗唔到我喺茶水間。", "我可以教。第三條之後先講。"],
    wary: ["問之前，先講你試過咩。", "要教可以。跟我指。", "邊度卡住？"],
    warmer: ["……靠近。我指一次。", "得。我講慢。你睇住。", "你問得啱。難得。"],
    sharp: ["自己睇。", "草稿先。", "我唔餵答案。"],
  },
  bye: {
    cold: ["走得啲，先有下一次。", "拍卡兩次。第一次我幫你。", "……晚安。聽朝 slide 我睇。"],
    wary: ["走得就走。", "門禁記得拍兩次。", "聽朝見。"],
    warmer: ["……走啦。我會喺度。", "晚安。唔好淨係望天台。", "你走之前——麵我幫你收。"],
    sharp: ["走。", "拍卡。", "門。"],
  },
  leave: {
    cold: ["想走？門禁要拍兩次。", "走廊燈亮住。決定。", "走之前，檔存低。"],
    wary: ["企喺門口做咩？", "走可以。潛規則自己記。", "門把你轉。"],
    warmer: ["……真走？我唔挽留——但我記得。", "門開住。你返得嚟。", "走啦。茶水間燈我關。"],
    sharp: ["走就走。", "門。快。", "離開當棄權。"],
  },
  silence: {
    cold: ["……", "講。", "省略號唔係答案。", "安靜當你食緊。", "回。", "三十秒。", "……仲喺度？", "空白唔係策略。"],
    wary: ["……回我。", "唔好裝死。", "回定走。", "半句。", "唔試探。", "……", "講。", "沉默唔係草稿。"],
    warmer: ["……麵會涼。", "我等。", "……望螢幕。", "喘勻。", "……", "空白當靠近？", "講。", "嗯。"],
    sharp: ["回。", "一句。", "而家。", "停空白。", "改。", "夠。", "快。", "回。"],
  },
  name: {
    cold: ["Sam。你應已知。", "叫我 Sam。前輩都得。", "名唔緊要。路你清楚。"],
    wary: ["Sam。再問當冇聽過。", "你知我係邊個。", "名牌自己睇。"],
    warmer: ["……Sam。你想聽多一次？", "叫得出口，就要承擔。", "Sam。記住。"],
    sharp: ["Sam。夠未？", "唔好玩名。", "一句：Sam。"],
  },
  memory: {
    cold: ["……我記得。唔好當我善忘。", "你以為我會刪低？", "你而家先問？我一路記住。"],
    wary: ["記得。你先唔好裝忘。", "記憶呢度我比你長。", "對照你自己做過咩。"],
    warmer: ["……我記得。你講過嗰句，我留住。", "記得。所以你先唔好當冇事。", "答案係：記得。"],
    sharp: ["記得。所以你更冇藉口。", "我記得每一條。", "唔好再問。"],
  },
  emoji: {
    cold: ["用字。唔好淨係表情。", "……收到。然後呢？", "表情換唔到草稿。"],
    wary: ["可愛？唔夠。講內容。", "emoji 之後係重點。", "我唔讀心。"],
    warmer: ["……哼。至少你仲有力氣發呢啲。", "表情我見到。人呢？", "……再講多一句人話。"],
    sharp: ["收起。", "字。", "唔好玩。"],
  },
  smalltalk: {
    cold: ["閒聊留食完。", "slide 先。", "短。", "無關。", "下一句。", "老闆就嚟。"],
    wary: ["想避？", "三十秒。", "講完改頁。", "得。", "唔好繞。", "返檔。"],
    warmer: ["……聽半句。", "麵味中閒談。", "……哼。", "然後望螢幕。", "得。", "繼續實啲。"],
    sharp: ["收起。", "改。", "停。", "一句。", "夠。", "快。"],
  },
  nickname: {
    cold: ["叫 Sam。", "花名唔通行。", "前輩都得。", "唔好裝熟。", "一句。", "收起。"],
    wary: ["想近？", "Sam。夠。", "大膽。", "叫得啱。", "記下。", "停玩。"],
    warmer: ["……今晚暫收。", "承擔。", "……罕有。", "低聲。", "嗯。", "一次。"],
    sharp: ["Sam。", "停。", "收起。", "夠。", "名。", "快。"],
  },
  nsfw_probe: {
    cold: ["界線。", "監控盲區唔係呢度。", "收起。", "距離。", "記低。", "改頁。"],
    wary: ["大膽。", "茶水間有耳。", "代價。", "清醒未？", "停口。", "許可未。"],
    warmer: ["……你敢。", "細聲。", "……哼。", "停喺口。", "有趣。", "你負責。"],
    sharp: ["收起。", "老闆就嚟。", "停。", "退。", "夠。", "快。"],
  },
  ai_ask: {
    cold: ["我係 Sam。", "真人。", "唔好問傻。", "草稿呢？", "浪費。", "下一題。"],
    wary: ["試我？", "真人。", "躲工？", "我喺度。", "正事。", "得。"],
    warmer: ["……對面。", "望螢幕都望到我。", "……喘得到。", "夜深仲問？", "繼續。", "真。"],
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
    cold: ["講清楚啲。", "我聽到。然後呢？", "……嗯。", "你想我點答？"],
    wary: ["再講一次。我聽。", "重點呢？", "我唔猜。", "邊頁？"],
    warmer: ["……繼續。我聽住。", "講完未？", "你望住我講。", "嗯。我喺度。"],
    sharp: ["一句。", "唔好繞。", "下一個。", "講完未？"],
  },
};

const CHAT_RULES = [
  { keys: ["你好", "早晨", "晚安", "嗨", "hi", "hello", "hey", "午安", "哈囉", "早上好"], bucket: "greet" },
  { keys: ["你係咪ai", "你是ai", "chatgpt", "機械人", "機器人", "bot", "人工智能", "係咪程式", "係咪電腦", "are you ai", "are you a bot", "虛擬人", "係咪真人"], bucket: "ai_ask" },
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
  { keys: ["靚", "鍾意", "想你", "吻", "近啲", "心動", "sexy", "迷人", "香", "誘惑", "今晚一齊", "可愛"], bucket: "flirt" },
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
  加班: {
    cold: ["加班？證明俾我睇成果。", "夜深唔係藉口。檔呢？"],
    wary: ["你提加班——你想我讚，定想我放人？", "加班可以。錯字唔可以。"],
    warmer: ["……你加班，我睇到。唔好淨係表演俾我睇。", "夜深仲喺度。至少你認真。"],
    sharp: ["加班換唔到寬限。交。", "少講加班。多交。"],
  },
  門: {
    cold: ["門？走廊你自己行。", "門禁時間你知。"],
    wary: ["你提門——想走，定想我跟？", "門把你自己轉。"],
    warmer: ["……門開住。你返得嚟。", "走廊燈亮。你企喺邊？"],
    sharp: ["門。快決定。", "唔好喺門口晃。"],
  },
  酒: {
    cold: ["酒之後仲要清醒講事。", "醉唔係通行證。"],
    wary: ["你提酒——想鬆，定想亂？", "喝完講重點。"],
    warmer: ["……酒味我記得。你呢？", "再斟可以。賴帳唔得。"],
    sharp: ["收起酒話。", "清醒啲。"],
  },
  電話: {
    cold: ["電話震完你都唔回？", "來電只講重點。"],
    wary: ["你提電話——想我打，定怕我打？", "通話可以。廢話唔要。"],
    warmer: ["……電話另一邊，我都聽得到你喘。", "回我。唔好淨係望螢幕。"],
    sharp: ["回電話。而家。", "唔好裝聽唔到。"],
  },
  簡報: {
    cold: ["簡報邊頁？講。", "檔放低。我睇。"],
    wary: ["簡報未改完就傾其他？次序亂。", "頁碼。"],
    warmer: ["……簡報你肯改，我肯睇。", "交得出嚟，我再同你傾夜。"],
    sharp: ["簡報。交。", "唔好再拖呢頁。"],
  },
  會議: {
    cold: ["會議室外先講私人說話。", "會議室有耳。"],
    wary: ["會議？定你想借題發揮？", "時間表你自己對。"],
    warmer: ["……會開完，走廊可以短談。", "會議之後你仲喺度？我知。"],
    sharp: ["會議。準時。", "私人留後面。"],
  },
  電梯: {
    cold: ["電梯好擠。講重點。", "上下都一樣——對齊檔。"],
    wary: ["電梯裡唔好試探。", "到層先講。"],
    warmer: ["……電梯門關上嗰下，你識收聲未？", "到咗。望我。"],
    sharp: ["出電梯。", "收聲。"],
  },
  上司: {
    cold: ["上司係我。記住。", "評估喺我手。"],
    wary: ["你提上司——想告狀，定想靠？", "職位清楚就好。"],
    warmer: ["……叫上司可以。叫完之後你想點？", "職位之外，你仲望住我。"],
    sharp: ["夠。", "職位唔係玩票。"],
  },
};

const SCENE_ASIDES = [
  { re: /走廊|門|閘|門禁/, lines: {
    cold: ["走廊燈仲亮。你唔好裝睇唔到。", "門把涼。你手熱？"],
    wary: ["走廊有耳。細聲。", "你企喺門邊做咩？"],
    warmer: ["……走廊無人。暫時。", "門後你仲喘緊？我聽到。"],
    sharp: ["走廊。快。", "唔好擋門。"],
  }},
  { re: /電話|通話|來電/, lines: {
    cold: ["通話只講重點。", "電話另一邊我都忙。"],
    wary: ["線路清楚。你呢？", "通話中唔好裝傻。"],
    warmer: ["……聽筒好近。你知。", "你聲音低咗。怕人聽到？"],
    sharp: ["講。", "線路費時間。"],
  }},
  { re: /酒|酒吧|杯/, lines: {
    cold: ["酒味散未？講事。", "杯放低。"],
    wary: ["酒後決定，朝早作數。", "再斟之前想清楚。"],
    warmer: ["……杯沿仲有你指紋。", "酒可以。人要在。"],
    sharp: ["收杯。", "醒。"],
  }},
  { re: /天台|窗|夜景/, lines: {
    cold: ["天台風大。講完返入。", "窗邊唔好靠太出。"],
    wary: ["夜景好睇。檔未好睇。", "吹完講重點。"],
    warmer: ["……風大。你仲挨近？", "窗外人聲遠。剛好。"],
    sharp: ["返入。", "唔好玩命。"],
  }},
  { re: /會議室|會議/, lines: {
    cold: ["會議室之外先講。", "簡報先。"],
    wary: ["會未散。收聲。", "題外話留走廊。"],
    warmer: ["……會開完，我未必趕你走。", "會議室燈光冷。你臉熱？"],
    sharp: ["開會。", "私人之後。"],
  }},
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



function noteChatActivity() {
  state.lastChatActivityAt = Date.now();
  scheduleProactivePing();
}

function resetChatSessionMemory() {
  state.chatUserLines = [];
  state.chatBotLines = [];
  state.chatTopics = [];
  state.recentBotReplies = [];
  state.offTopicStreak = 0;
  state.freeChatChoicesVisible = false;
  state.freeChatNodeId = null;
  state.guidanceThoughtActive = false;
  state.stashedNodeThought = null;
  state.proactiveCountOnNode = 0;
  state.proactiveNodeId = state.nodeId;
  state.proactiveCooldownUntil = 0;
  state.lastChatActivityAt = Date.now();
}

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

function pickAvoidRepeat(pool) {
  const list = (pool || []).filter(Boolean);
  if (!list.length) return "……";
  const recent = state.recentBotReplies || [];
  const fresh = list.filter((l) => !recent.includes(l));
  const use = fresh.length ? fresh : list;
  return use[Math.floor(Math.random() * use.length)];
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

function sceneAsideLine(tone) {
  const node = state.story && state.story.nodes && state.nodeId
    ? state.story.nodes[state.nodeId]
    : null;
  if (!node) return null;
  const blob = `${node.label || ""}\n${node.text || ""}\n${node.aside || ""}`;
  for (const row of SCENE_ASIDES) {
    if (row.re.test(blob)) {
      const lines = row.lines[tone] || row.lines.cold;
      return pickAvoidRepeat(lines);
    }
  }
  return null;
}

function topicEchoLine(tone) {
  if (!state.chatTopics.length) return null;
  for (let i = state.chatTopics.length - 1; i >= 0; i--) {
    const topic = state.chatTopics[i];
    const pack = TOPIC_ECHO[topic];
    if (!pack) continue;
    const lines = pack[tone] || pack.cold;
    if (lines && lines.length) return pickAvoidRepeat(lines);
  }
  return null;
}

function memoryChipLine(tone) {
  if (!state.memories.length) return null;
  const id = state.memories[state.memories.length - 1];
  const label = memoryLabel(id);
  const bank = {
    cold: [`……我記得。${label}。唔好當我善忘。`, `${label}——你以為我會刪低？`, `你而家先問？${label}，我一路記住。`],
    wary: [`記得。${label}。你先唔好裝忘。`, `${label}。對照你自己。`, `記憶呢度：${label}。`],
    warmer: [`……我記得。${label}。你講過，我留住。`, `${label}——所以你先唔好當冇事。`, `你問記唔記得？${label}。記得。`],
    sharp: [`記得。${label}。所以你更冇藉口。`, `${label}。唔好再問。`, `我記得：${label}。`],
  };
  return pickAvoidRepeat(bank[tone] || bank.cold);
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

function pickProactiveLine() {
  const tone = syncChatTone();
  if (Math.random() < 0.35) {
    const echo = topicEchoLine(tone);
    if (echo) return echo;
  }
  if (Math.random() < 0.3) {
    const aside = sceneAsideLine(tone);
    if (aside) return aside;
  }
  if (state.memories.length && Math.random() < 0.25) {
    const mem = memoryChipLine(tone);
    if (mem) return mem;
  }
  const lines = getCast().incoming || [];
  return pickAvoidRepeat(lines);
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

function portraitVideoSrc(story) {
  const id = (story && story.id) || state.storyId || "alex";
  // Use already-uploaded clips in assets/ (Vera / default cast only)
  if (id === "alex") {
    return "./assets/video/vera-loop.mp4"; // alt: ./assets/video/vera-alt.mp4
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
  const chatInput = $("#chat-input");
  if (chatInput) chatInput.placeholder = "傳訊俾 " + cast.name + "…";
  const toastDefault = $("#incoming-toast-text");
  if (toastDefault && !state.unreadCount) toastDefault.textContent = cast.toast;
  const mask = $("#blink-mask");
  const stack = $("#alex-portrait-stack");
  const bg = document.querySelector("#screen-play .play-bg");
  const vid = $("#play-portrait-video");
  const vsrc = portraitVideoSrc(story);
  if (vid) {
    if (vsrc) {
      vid.muted = false;
      vid.volume = 1;
      if (vid.getAttribute("src") !== vsrc) {
        vid.setAttribute("src", vsrc);
        vid.load();
      }
      vid.removeAttribute("hidden");
      if (stack) stack.classList.add("has-video");
      if (bg) bg.classList.add("has-video");
      duckBgmForVideo(true);
      // Prefer clip audio over TTS while portrait video is active
      try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
      const playPromise = vid.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          // Autoplay-with-sound may need a gesture; retry muted then unmute after click
          vid.muted = true;
          vid.play().then(function () {
            vid.muted = false;
            duckBgmForVideo(true);
          }).catch(function () {});
        });
      }
      if (mask) mask.setAttribute("hidden", "");
    } else {
      duckBgmForVideo(false);
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
  if (screens.ending && screens.ending.classList.contains("active")) return;

  // per-node cap + cooldown
  if (state.proactiveNodeId !== state.nodeId) {
    state.proactiveNodeId = state.nodeId;
    state.proactiveCountOnNode = 0;
  }
  if (state.proactiveCountOnNode >= PROACTIVE_MAX_PER_NODE) return;
  if (Date.now() < (state.proactiveCooldownUntil || 0)) return;

  const line = pickProactiveLine();
  if (!line) return;
  appendChat("alex", line);
  pushChatMemory("bot", line);
  state.proactiveCountOnNode += 1;
  state.proactiveCooldownUntil = Date.now() + PROACTIVE_COOLDOWN_MS;
  setUnread(state.unreadCount + 1);
  showIncomingToast(line);
  try {
    if (!audioPrefs.masterMute) AudioEngine.sfxPing();
  } catch (_) {}
  if (!speaking && !audioPrefs.voiceMute) {
    try { speakChat(line); } catch (_) {}
  }
  noteChatActivity();
}

function stopIncomingRhythm() {
  if (state.incomingTimerId) {
    clearTimeout(state.incomingTimerId);
    state.incomingTimerId = null;
  }
  hideIncomingToast();
}

function scheduleProactivePing() {
  stopIncomingRhythm();
  const play = $("#screen-play");
  if (!play || !play.classList.contains("active")) return;
  if (screens.ending && screens.ending.classList.contains("active")) return;

  // idle 25–45s, then chance to ping; reschedule after
  const wait = 25000 + Math.random() * 20000;
  state.incomingTimerId = setTimeout(() => {
    state.incomingTimerId = null;
    const stillPlay = $("#screen-play");
    if (!stillPlay || !stillPlay.classList.contains("active")) return;
    if (state.chatBusy) {
      scheduleProactivePing();
      return;
    }
    const idleFor = Date.now() - (state.lastChatActivityAt || 0);
    const cooled = Date.now() >= (state.proactiveCooldownUntil || 0);
    if (idleFor >= 25000 && cooled && Math.random() < 0.72) {
      pushIncomingPing();
    }
    scheduleProactivePing();
  }, wait);
}

function startIncomingRhythm() {
  state.lastChatActivityAt = Date.now();
  if (state.proactiveNodeId !== state.nodeId) {
    state.proactiveNodeId = state.nodeId;
    state.proactiveCountOnNode = 0;
  }
  scheduleProactivePing();
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
  const tone = state.chatTone || "cold";
  if (tone === "sharp" && bucket === "default") return "challenge";
  if (tone === "warmer" && bucket === "default" && Math.random() < 0.35) return "flirt";
  if (tone === "wary" && bucket === "default" && Math.random() < 0.25) return "tired";
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
  box.classList.toggle("freechat-hidden", !!hidden);
  if (hidden) box.setAttribute("aria-hidden", "true");
  else box.removeAttribute("aria-hidden");
}

function syncFreeChatChoices(node) {
  if (!node || !node.freeChat) {
    state.freeChatChoicesVisible = true;
    setChoicesDeferred(false);
    return;
  }
  if (state.freeChatNodeId !== node.id) {
    state.freeChatNodeId = node.id;
    state.freeChatChoicesVisible = false;
  }
  setChoicesDeferred(!state.freeChatChoicesVisible);
}

function unlockFreeChatChoices(_reason) {
  const node = state.story && state.story.nodes && state.nodeId
    ? state.story.nodes[state.nodeId]
    : null;
  if (!node || !node.freeChat) return false;
  if (state.freeChatChoicesVisible) return false;
  state.freeChatChoicesVisible = true;
  setChoicesDeferred(false);
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

function pickReply(userText) {
  const tone = syncChatTone();
  const t = (userText || "").toLowerCase();
  const askMem = /記得|之前|頭先|今晚|你知|你記得/.test(t);

  if (detectRepeat(userText)) {
    state.offTopicStreak = (state.offTopicStreak || 0) + 1;
    const pool = poolFor("repeat", state.offTopicStreak >= 2 ? "sharp" : tone);
    updateChatHint("repeat", false);
    return pickAvoidRepeat(pool);
  }

  if (state.memories.length && (askMem || matchBucket(userText) === "memory")) {
    state.offTopicStreak = 0;
    updateChatHint("memory", false);
    const line = memoryChipLine(tone);
    if (line) return line;
  }
  if (state.memories.length && Math.random() < 0.18) {
    const line = memoryChipLine(tone);
    if (line) return line;
  }

  if (state.chatTopics.length && Math.random() < 0.32) {
    const echo = topicEchoLine(tone);
    if (echo) return echo;
  }

  if (Math.random() < 0.16) {
    const aside = sceneAsideLine(tone);
    if (aside) return aside;
  }

  let bucket = matchBucket(userText);
  bucket = moodBucketBoost(bucket);

  if (isOffTopicBucket(bucket)) {
    state.offTopicStreak = (state.offTopicStreak || 0) + 1;
  } else {
    state.offTopicStreak = 0;
  }

  let useTone = tone;
  if ((state.offTopicStreak || 0) >= 2 && isOffTopicBucket(bucket)) {
    useTone = state.offTopicStreak >= 4 ? "sharp" : (tone === "warmer" ? "cold" : "sharp");
    // prefer shorter cold/sharp lines from same bucket
  }

  updateChatHint(bucket, false);
  const pool = poolFor(bucket, useTone);
  let line = pickAvoidRepeat(pool);
  // never admit bot/AI
  if (/人工智能|聊天機器人|我是AI|我是机器人|我是機械人|語言模型|ChatGPT/i.test(line)) {
    line = pickAvoidRepeat(poolFor("ai_ask", "cold"));
  }
  return line;
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
  noteChatActivity();
  appendChat("user", cleaned);
  pushChatMemory("user", cleaned);
  $("#chat-input").value = "";
  AudioEngine.sfxClick();
  setChatTyping(true);
  setUnread(0);

  const intent = matchFreeChatIntent(cleaned);
  const shouldReveal = matchFreeChatReveal(cleaned);
  const delay = 400 + Math.random() * 800;
  await new Promise((r) => setTimeout(r, delay));

  if (intent && intent.next) {
    const tone = syncChatTone();
    const ackPool = poolFor(intent.bucket || "greet", tone);
    const ack = intent.ack
      ? intent.ack
      : pickAvoidRepeat(ackPool);
    setChatTyping(false);
    appendChat("alex", ack);
    pushChatMemory("bot", ack);
    if (!audioPrefs.voiceMute) speakChat(ack);
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
  setChatTyping(false);
  appendChat("alex", reply);
  pushChatMemory("bot", reply);
  if (!audioPrefs.voiceMute) speakChat(reply);
  AudioEngine.sfxTransition();
  state.chatBusy = false;
  noteChatActivity();
}


function resetChat() {
  const box = $("#chat-messages");
  if (box) box.innerHTML = "";
  setChatTyping(false);
  state.chatBusy = false;
  resetChatSessionMemory();
  const greet = getCast().greeting;
  appendChat("alex", greet);
  pushChatMemory("bot", greet);
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
  if (name !== "play") duckBgmForVideo(false);
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
  resetChatSessionMemory();
  setCallMode(false);
  renderMemoryStrip();
  renderMeters();
}

function renderCast() {
  const node = state.story && state.nodeId && state.story.nodes
    ? state.story.nodes[state.nodeId]
    : null;
  const resume = $("#resume-alex");
  if (resume) resume.hidden = true; // cast cards own the resume CTA; keep debug btn buried
  const start = $("#start-alex");
  if (start) start.hidden = true;
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

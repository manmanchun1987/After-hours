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
    cold: ["嗯。有事直說。", "我仲睇緊檔。講重點。", "……你好。然後呢？"],
    wary: ["你嚟得啱。有野要匯報？", "嗯。站定先講。", "打招呼就算。內容呢？"],
    warmer: ["……嗯。坐低講。", "你仲未走？我知。", "講啦。我聽住。"],
    sharp: ["簡短。", "有事？一秒。", "唔好浪費我時間。"],
  },
  work: {
    cold: ["Deadline 唔會因為你喊而改。", "簡報先。情緒之後。", "你而家嘅優先次序……有啲亂。"],
    wary: ["交得出成績，我先同你傾其他。", "邊頁未改？講清楚。", "加班唔係表演。係結果。"],
    warmer: ["……你肯做，我睇到。交得出嚟再傾。", "檔案放低。我睇完回你。", "夜深仲改？……至少認真。"],
    sharp: ["唔好同我講忙。交。", "再拖，評估你自己知。", "一句：邊時交。"],
  },
  sorry: {
    cold: ["道歉好平。改到先算數。", "我唔收『下次』。我收結果。", "……知錯就好。坐返去改。"],
    wary: ["對唔住之後係行動。唔係眼神。", "收到。唔好再犯同一條。", "道歉我聽到。檔呢？"],
    warmer: ["……得。今次我記低。", "知就好。唔使跪低——改就得。", "哼。下次用成績補償。"],
    sharp: ["對唔住換唔到 deadline。", "少講。快改。", "我唔想再聽第二句。"],
  },
  flirt: {
    cold: ["……你知唔知自己講緊咩。", "會議室外先再講呢句。", "距離。而家。"],
    wary: ["大膽。我未必介意——但你要承擔。", "呢度有耳。收聲。", "你試探得太明顯。"],
    warmer: ["……哼。你以為我會慌？", "靠近可以。越界另計。", "你講完未？定想我回你一句更危險。"],
    sharp: ["收起。而家。", "唔好玩火——除非你準備好燒。", "一句過界，評估你自己睇。"],
  },
  tired: {
    cold: ["夜深。你仲未走？", "累就飲水。唔好攤喺度。", "我都未走。你有理由留？"],
    wary: ["攰就講。唔好硬撐到錯字。", "門禁時間你自己知。", "休息五分鐘。之後繼續。"],
    warmer: ["……攰就企近啲燈。唔好瞓枱。", "你留低，我當你有事。", "夜深。我都喺度。"],
    sharp: ["攰就走。唔好阻住。", "唔好用疲倦當藉口。", "醒定。再錯我唔收。"],
  },
  praise: {
    cold: ["……偶爾準一次，唔代表你叻。", "收到。繼續維持呢個水準。", "嗯。終於似樣。"],
    wary: ["讚得太密會貶值。適可而止。", "今次啱。下次證明唔係運氣。", "收到。"],
    warmer: ["……今次我承認你做得好。", "少見。我接受呢個價。", "嗯。繼續——我想睇你下一手。"],
    sharp: ["讚美換唔到寬限。", "得。下一件。", "少講好聽話。交貨。"],
  },
  challenge: {
    cold: ["你頂嘴之前，先睇清楚邊個簽你評估。", "哦。你教我？", "好。你想清楚——定係想我幫你清楚。"],
    wary: ["頂嘴可以。證據呢？", "你有膽。記住代價。", "對峙？得。講完我再判。"],
    warmer: ["……你敢講，我反而想聽完。", "頂嘴之後，你仲企喺度。有趣。", "好。你贏一句——唔代表你贏局。"],
    sharp: ["夠。收聲。", "你再講一句，走廊見。", "評估表喺我手。記住。"],
  },
  help: {
    cold: ["講邊頁。我唔猜。", "自己諗五分鐘。諗唔到再問。", "我可以教。代價你自己知。"],
    wary: ["問之前，先講你試過咩。", "要教可以。跟足我節奏。", "唔好裝傻。邊度卡住？"],
    warmer: ["……靠近。我指一次。", "得。我講慢啲——你聽住。", "你問得啱。難得。"],
    sharp: ["自己睇。", "再問之前交草稿。", "我唔做保姆。"],
  },
  bye: {
    cold: ["走之前存檔。", "早啲返屋企。聽朝我仲喺度。", "……晚安。唔好遲。"],
    wary: ["走得就走。唔好依依不捨。", "門關好。", "聽朝見。準時。"],
    warmer: ["……走啦。我會喺度。", "晚安。唔好淨係望電話。", "你走之前——望我一眼。"],
    sharp: ["走。", "唔使拖。", "門。"],
  },
  leave: {
    cold: ["想走？走廊燈亮住。", "門禁唔等人。決定。", "走之前，檔放低。"],
    wary: ["你企喺門口做咩？進定退。", "走可以。後悔自己吞。", "門把你自己轉。"],
    warmer: ["……真走？我唔挽留——但我記得。", "門開住。你返得嚟。", "走啦。我會睇住螢幕。"],
    sharp: ["走就走。唔好回頭。", "門。快。", "離開就當你棄權。"],
  },
  silence: {
    cold: ["……", "講。定係淨係打省略號。", "安靜我當你諗緊。三十秒。"],
    wary: ["……你仲喺度？回我。", "唔好裝死。", "沉默唔係答案。"],
    warmer: ["……我等得。但唔會等成晚。", "打省略號？你怕講錯？", "……哼。至少你仲望住我。"],
    sharp: ["回。", "唔好浪費氣。", "一句。而家。"],
  },
  name: {
    cold: ["Vera。你應已知。", "名唔緊要。職位你清楚。", "叫我 Vera。唔好裝熟。"],
    wary: ["Vera。再問當你冇聽過。", "你知我係邊個。", "名牌喺門。自己睇。"],
    warmer: ["……Vera。你想聽多一次？", "叫得出口，就要承擔距離。", "Vera。記住呢個音。"],
    sharp: ["Vera。夠未？", "唔好玩名。", "一句：Vera。"],
  },
  memory: {
    cold: ["……我記得。唔好當我善忘。", "你以為我會刪低？", "你而家先問？我一路記住。"],
    wary: ["記得。你先唔好裝忘。", "記憶呢度我比你長。", "問之前，先對照你自己做過咩。"],
    warmer: ["……我記得。你講過嗰句，我留住。", "記得。所以你先唔好當冇事。", "你問『記唔記得』——答案係：記得。"],
    sharp: ["記得。所以你更冇藉口。", "我記得每一條。", "唔好再問。我知。"],
  },
  emoji: {
    cold: ["用字。唔好淨係表情。", "……收到。然後呢？", "表情換唔到答案。"],
    wary: ["可愛？唔夠。講內容。", "emoji 之後係重點。", "我唔讀心。"],
    warmer: ["……哼。至少你仲有力氣發呢啲。", "表情我見到。人呢？", "……得。再講多一句人話。"],
    sharp: ["收起。", "字。", "唔好玩。"],
  },
  default: {
    cold: ["講清楚啲。", "我聽到。然後呢？", "……哼。", "無關痛癢嘅說話，留返聽日。"],
    wary: ["你想我點答？", "再講一次。簡短。", "重點呢？", "我唔猜。"],
    warmer: ["……繼續。我聽住。", "講完未？定仲有半句。", "你望住我講。", "嗯。我喺度。"],
    sharp: ["一句。", "唔好繞。", "講完未？", "下一個。"],
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
    cold: ["……", "講。定係淨係省略號。", "安靜我當你諗價。"],
    wary: ["……你仲喺度？", "唔好裝死。", "沉默唔係出價。"],
    warmer: ["……我等得。但酒會涼。", "省略號？你怕講錯價？", "……至少你仲望住我。"],
    sharp: ["回。", "一句。而家。", "唔好浪費氣。"],
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
    cold: ["……", "講。定係淨係省略號。", "安靜我當你食緊。"],
    wary: ["……你仲喺度？", "唔好裝死。", "沉默唔係答案。"],
    warmer: ["……我等得。但麵會涼。", "省略號？你怕講錯？", "……至少你仲望住螢幕。"],
    sharp: ["回。", "一句。而家。", "唔好浪費氣。"],
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
  default: {
    cold: ["講清楚啲。", "我聽到。然後呢？", "……嗯。", "你想我點答？"],
    wary: ["再講一次。我聽。", "重點呢？", "我唔猜。", "邊頁？"],
    warmer: ["……繼續。我聽住。", "講完未？", "你望住我講。", "嗯。我喺度。"],
    sharp: ["一句。", "唔好繞。", "下一個。", "講完未？"],
  },
};

const CHAT_RULES = [
  { keys: ["你好", "早晨", "晚安", "嗨", "hi", "hello", "hey", "午安", "哈囉"], bucket: "greet" },
  { keys: ["deadline", "交", "報告", "簡報", "工作", "改", "會議", "project", "加班", "檔", "slide", "評估", "方案"], bucket: "work" },
  { keys: ["對唔住", "sorry", "唔好意思", "抱歉", "錯咗", "我錯"], bucket: "sorry" },
  { keys: ["靚", "鍾意", "想你", "吻", "攬", "近啲", "心動", "sexy", "迷人", "香", "誘惑", "今晚一齊"], bucket: "flirt" },
  { keys: ["攰", "累", "瞓", "夜", "困", "tired", "好眼瞓"], bucket: "tired" },
  { keys: ["叻", "棒", "欣賞", "多謝", "thank", "好勁", "謝謝", "你最好"], bucket: "praise" },
  { keys: ["憑咩", "唔服", "頂", "你錯", "無理", "專橫", "憑什麼", "挑戰"], bucket: "challenge" },
  { keys: ["點算", "教我", "幫", "唔識", "點做", "help", "點解"], bucket: "help" },
  { keys: ["我想走", "離開", "出門", "返屋企", "閃人", "走唔走", "我想閃"], bucket: "leave" },
  { keys: ["拜拜", "走先", "再見", "bye", "收工", "晚安啦"], bucket: "bye" },
  { keys: ["你叫咩", "你嘅名", "貴姓", "你係邊個", "what's your name", "名叫"], bucket: "name" },
  { keys: ["你記得", "記得唔", "記唔記得", "之前", "頭先嗰", "你知唔知我"], bucket: "memory" },
];

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

function pickReply(userText) {
  const tone = syncChatTone();
  const t = (userText || "").toLowerCase();
  const askMem = /記得|之前|頭先|今晚|你知|你記得/.test(t);

  if (state.memories.length && (askMem || matchBucket(userText) === "memory")) {
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
  const pool = poolFor(bucket, tone);
  return pickAvoidRepeat(pool);
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

  const delay = 400 + Math.random() * 800;
  await new Promise((r) => setTimeout(r, delay));

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

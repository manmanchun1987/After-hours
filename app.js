const STORAGE_KEY = "after-hours-v1";

const state = {
  ageOk: false,
  story: null,
  nodeId: null,
  path: [],
};

const $ = (sel) => document.querySelector(sel);
const screens = {
  gate: $("#screen-gate"),
  cast: $("#screen-cast"),
  play: $("#screen-play"),
  ending: $("#screen-ending"),
};

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
      nodeId: state.nodeId,
      path: state.path,
    })
  );
}

function clearProgress() {
  const ageOk = state.ageOk;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ageOk }));
  state.nodeId = null;
  state.path = [];
}

async function init() {
  const res = await fetch("./data/alex.json");
  state.story = await res.json();
  const saved = loadSave();
  state.ageOk = !!saved.ageOk;
  state.nodeId = saved.nodeId || null;
  state.path = Array.isArray(saved.path) ? saved.path : [];

  $("#enter-btn").addEventListener("click", () => {
    state.ageOk = true;
    save();
    show("cast");
  });

  $("#start-alex").addEventListener("click", () => startAlex(true));
  $("#resume-alex").addEventListener("click", () => startAlex(false));
  $("#back-cast").addEventListener("click", () => {
    if (window.speechSynthesis) speechSynthesis.cancel();
    show("cast");
  });
  $("#ending-replay").addEventListener("click", () => {
    clearProgress();
    startAlex(true);
  });
  $("#ending-cast").addEventListener("click", () => {
    clearProgress();
    show("cast");
  });

  renderCast();

  if (!state.ageOk) {
    show("gate");
  } else if (state.nodeId && state.story.nodes[state.nodeId]) {
    renderCast();
    show("cast");
  } else {
    show("cast");
  }
}

function renderCast() {
  const canResume =
    state.nodeId &&
    state.story.nodes[state.nodeId] &&
    !state.story.nodes[state.nodeId].ending;
  $("#resume-alex").hidden = !canResume;
}

function startAlex(fresh) {
  if (fresh || !state.nodeId || !state.story.nodes[state.nodeId]) {
    state.nodeId = state.story.start;
    state.path = [state.nodeId];
  }
  save();
  renderNode();
}

function renderNode() {
  const node = state.story.nodes[state.nodeId];
  if (!node) return;

  if (node.ending) {
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

  $("#play-label").textContent = node.label || "";
  $("#play-text").textContent = node.text;
  speakStoryBeats(node.text);
  const box = $("#choices");
  box.innerHTML = "";
  (node.choices || []).forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-choice";
    btn.textContent = choice.label;
    btn.addEventListener("click", () => {
      state.nodeId = choice.next;
      state.path.push(choice.next);
      save();
      renderNode();
    });
    box.appendChild(btn);
  });
  show("play");
  pulseIn($("#play-label"));
  pulseIn($("#play-text"));
}


function extractSpokenLines(text) {
  if (!text) return [];
  const lines = [];
  const re = /「([^」]+)」/g;
  let m;
  while ((m = re.exec(text))) lines.push(m[1]);
  return lines;
}

function pickCantoneseVoice() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const prefer = [
    (v) => /zh[-_]HK/i.test(v.lang),
    (v) => /yue|cantonese/i.test(v.name + v.lang),
    (v) => /zh[-_]TW/i.test(v.lang),
    (v) => /^zh/i.test(v.lang),
  ];
  for (const test of prefer) {
    const hit = voices.find(test);
    if (hit) return hit;
  }
  return null;
}

function speakStoryBeats(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const lines = extractSpokenLines(text);
  if (!lines.length) return;
  const voice = pickCantoneseVoice();
  lines.forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line);
    u.lang = (voice && voice.lang) || "zh-HK";
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.pitch = 1.05;
    // slight stagger so lines queue naturally
    setTimeout(() => speechSynthesis.speak(u), i * 30);
  });
}

function startIdleLife() {
  const closed = document.getElementById("alex-portrait-blink");
  const idles = [
    document.getElementById("alex-idle-pen"),
    document.getElementById("alex-idle-adjust"),
    document.getElementById("alex-idle-phone"),
    document.getElementById("alex-idle-twirl"),
  ].filter(Boolean);
  if (!closed && !idles.length) return;

  let busy = false;

  const blinkOnce = () => {
    if (!closed || busy) return;
    closed.classList.add("on");
    setTimeout(() => closed.classList.remove("on"), 90 + Math.random() * 50);
  };

  const scheduleBlink = () => {
    setTimeout(() => {
      blinkOnce();
      if (Math.random() < 0.22) setTimeout(blinkOnce, 180);
      scheduleBlink();
    }, 2200 + Math.random() * 3200);
  };

  const playIdleAction = () => {
    if (busy || !idles.length) return;
    const el = idles[Math.floor(Math.random() * idles.length)];
    busy = true;
    if (closed) closed.classList.remove("on");
    el.classList.add("on");
    const hold = 1400 + Math.random() * 1600;
    setTimeout(() => {
      el.classList.remove("on");
      setTimeout(() => { busy = false; }, 480);
    }, hold);
  };

  const scheduleIdle = () => {
    setTimeout(() => {
      // only fidget while play screen is active
      const play = document.getElementById("screen-play");
      if (play && play.classList.contains("active") && Math.random() < 0.7) {
        playIdleAction();
      }
      scheduleIdle();
    }, 4500 + Math.random() * 5500);
  };

  scheduleBlink();
  scheduleIdle();
}

startIdleLife();

init().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    "<p style='padding:2rem;font-family:sans-serif'>載入失敗。請用本地伺服器打開（唔好直接 double-click 檔案），例如：<code>python3 -m http.server 8080</code></p>";
});

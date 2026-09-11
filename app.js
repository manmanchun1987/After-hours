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
  $("#back-cast").addEventListener("click", () => show("cast"));
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
    save();
    show("ending");
    return;
  }

  $("#play-label").textContent = node.label || "";
  $("#play-text").textContent = node.text;
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
}

init().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    "<p style='padding:2rem;font-family:sans-serif'>載入失敗。請用本地伺服器打開（唔好直接 double-click 檔案），例如：<code>python3 -m http.server 8080</code></p>";
});

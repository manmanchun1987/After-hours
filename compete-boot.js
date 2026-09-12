/* compete-1 boot: three routes + meters. No canvas overlay. */
(function () {
  const FILES = { alex: "./data/alex.json", morgan: "./data/morgan.json", sam: "./data/sam.json" };
  const CAST = [
    { id: "alex", name: "Vera", role: "部門主管", hook: "「Deadline 可以改。態度唔可以。」", featured: true },
    { id: "morgan", name: "Morgan", role: "客戶負責人", hook: "大單前夜，酒廊「只係傾生意」。" },
    { id: "sam", name: "Sam", role: "前輩同事", hook: "教你「潛規則」嘅肝夜加班。" }
  ];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function meters() {
    if (typeof state.heat !== "number") state.heat = 20;
    if (typeof state.tension !== "number") state.tension = 15;
    const heatEl = document.querySelector("#meter-heat");
    const tenEl = document.querySelector("#meter-tension");
    if (heatEl) heatEl.style.width = state.heat + "%";
    if (tenEl) tenEl.style.width = state.tension + "%";
    document.body.classList.toggle("heat-high", state.heat >= 55);
    document.body.classList.toggle("tension-high", state.tension >= 55);
    document.body.dataset.tint = (state.story && state.story.tint) || "cold";
  }
  function applyChoiceStats(choice) {
    if (!choice) return;
    if (choice.heat) state.heat = clamp(state.heat + choice.heat, 0, 100);
    if (choice.tension) state.tension = clamp(state.tension + choice.tension, 0, 100);
    meters();
  }
  function paintCast() {
    const root = document.querySelector("#chars");
    if (!root) return;
    root.innerHTML = "";
    CAST.forEach((c) => {
      const canResume = state.storyId === c.id && state.nodeId && state.story && state.story.nodes[state.nodeId] && !state.story.nodes[state.nodeId].ending;
      const art = document.createElement("article");
      art.className = "card glass char-card" + (c.featured ? " char-card-featured" : "");
      art.innerHTML = '<div class="char-thumb-wrap"><img class="char-thumb" src="./assets/alex.png" alt=""></div><h2>' + c.name + "</h2><div class=\"role\">" + c.role + '</div><p class="hook">' + c.hook + '</p><div class="stack"><button class="btn btn-primary" type="button" data-start="' + c.id + '">開始</button><button class="btn btn-ghost" type="button" data-resume="' + c.id + '"' + (canResume ? "" : " hidden") + ">繼續上次</button></div>';
      root.appendChild(art);
    });
    root.querySelectorAll("[data-start]").forEach((btn) => btn.addEventListener("click", () => bootStart(btn.getAttribute("data-start"), true)));
    root.querySelectorAll("[data-resume]").forEach((btn) => btn.addEventListener("click", () => bootStart(btn.getAttribute("data-resume"), false)));
  }
  async function bootStart(id, fresh) {
    try { if (typeof AudioEngine !== "undefined" && AudioEngine.unlock) await AudioEngine.unlock(); } catch (_) {}
    const res = await fetch(FILES[id]);
    state.story = await res.json();
    state.storyId = id;
    if (fresh || !state.nodeId || !state.story.nodes[state.nodeId]) {
      state.nodeId = state.story.start; state.path = [state.nodeId]; state.memories = []; state.heat = 20; state.tension = 15;
    }
    const img = document.querySelector("#alex-portrait");
    if (img) img.style.opacity = "";
    const dead = document.querySelector("#l2d-canvas");
    if (dead) dead.remove();
    if (typeof startAlex === "function") startAlex(false);
    else if (typeof renderNode === "function") renderNode();
    meters();
  }
  const prevRender = window.renderNode;
  window.renderNode = function () {
    const node = state.story && state.story.nodes[state.nodeId];
    if (prevRender) prevRender();
    if (!node) return;
    meters();
    const box = document.querySelector("#choices");
    if (!box) return;
    box.querySelectorAll("button").forEach((btn, i) => {
      const choice = (node.choices || [])[i];
      if (!choice) return;
      if (state.heat < (choice.requireHeat || 0)) {
        btn.disabled = true; btn.classList.add("is-locked"); btn.textContent = choice.label + "（熱度不足）"; return;
      }
      btn.addEventListener("click", function () { applyChoiceStats(choice); });
    });
  };
  function ready() {
    try {
      const saved = JSON.parse(localStorage.getItem("after-hours-v1") || "{}");
      if (saved.storyId) state.storyId = saved.storyId;
      if (Number.isFinite(saved.heat)) state.heat = saved.heat;
      if (Number.isFinite(saved.tension)) state.tension = saved.tension;
    } catch (_) {}
    paintCast(); meters();
    ["#enter-btn", "#back-cast", "#ending-cast"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.addEventListener("click", () => setTimeout(paintCast, 80));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else setTimeout(ready, 0);
})();

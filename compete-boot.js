(function () {
  var FILES = { alex: "./data/alex.json", morgan: "./data/morgan.json", sam: "./data/sam.json" };
  var CAST = [
    { id: "alex", name: "Vera", role: "部門主管", hook: "Deadline 可以改。態度唔可以。", portrait: "./assets/stills/vera-03.jpg" },
    { id: "morgan", name: "Elise", role: "客戶負責人", hook: "大單前夜。夜晚講人。", portrait: "./assets/stills/vera-02.jpg" },
    { id: "sam", name: "Sammi", role: "前輩同事", hook: "兩個杯麵。餓嘅人簽錯字。", portrait: "./assets/stills/vera-01.jpg" }
  ];
  function faceOf(id) {
    for (var i = 0; i < CAST.length; i++) if (CAST[i].id === id) return CAST[i].portrait;
    return "./assets/stills/vera-03.jpg";
  }
  function meters() {
    if (typeof state === "undefined") return;
    if (typeof state.heat !== "number") state.heat = 20;
    if (typeof state.tension !== "number") state.tension = 15;
    if (typeof renderMeters === "function") {
      renderMeters();
      return;
    }
    var heatEl = document.getElementById("meter-heat");
    var tenEl = document.getElementById("meter-tension");
    if (heatEl) heatEl.style.width = state.heat + "%";
    if (tenEl) tenEl.style.width = state.tension + "%";
  }
  function paintCast() {
    var root = document.getElementById("chars");
    if (!root) return;
    root.innerHTML = "";
    var save = {};
    try { save = JSON.parse(localStorage.getItem("after-hours-v2") || "{}"); } catch (e) {}
    CAST.forEach(function (c) {
      var art = document.createElement("article");
      art.className = "card glass char-card char-card--" + c.id;
      var img = document.createElement("img");
      img.className = "char-thumb char-thumb--" + c.id;
      img.src = c.portrait;
      img.alt = c.name;
      var wrap = document.createElement("div");
      wrap.className = "char-thumb-wrap";
      wrap.appendChild(img);
      var body = document.createElement("div");
      body.className = "char-body";
      var h = document.createElement("h2");
      h.textContent = c.name;
      var role = document.createElement("div");
      role.className = "role";
      role.textContent = c.role;
      var hook = document.createElement("p");
      hook.className = "hook";
      hook.textContent = c.hook;
      var actions = document.createElement("div");
      actions.className = "char-actions";
      var start = document.createElement("button");
      start.className = "btn btn-primary";
      start.type = "button";
      start.textContent = "開始";
      start.addEventListener("click", function () { bootStart(c.id, true); });
      actions.appendChild(start);
      var canResume = save && save.storyId === c.id && save.nodeId;
      if (canResume) {
        var resume = document.createElement("button");
        resume.className = "btn btn-ghost";
        resume.type = "button";
        resume.textContent = "繼續";
        resume.addEventListener("click", function () { bootStart(c.id, false); });
        actions.appendChild(resume);
      }
      body.appendChild(h);
      body.appendChild(role);
      body.appendChild(hook);
      body.appendChild(actions);
      art.appendChild(wrap);
      art.appendChild(body);
      root.appendChild(art);
    });
  }
  function bootStart(id, fresh) {
    fetch(FILES[id]).then(function (res) { return res.json(); }).then(function (story) {
      story.portrait = faceOf(id);
      state.story = story;
      state.storyId = id;
      if (fresh) {
        state.nodeId = story.start;
        state.path = [story.start];
        state.memories = [];
        state.heat = 20;
        state.tension = 15;
      } else {
        try {
          var save = JSON.parse(localStorage.getItem("after-hours-v2") || "{}");
          if (save && save.storyId === id && save.nodeId && story.nodes[save.nodeId]) {
            state.nodeId = save.nodeId;
            state.path = save.path || [save.nodeId];
            state.memories = save.memories || [];
            state.heat = typeof save.heat === "number" ? save.heat : 20;
            state.tension = typeof save.tension === "number" ? save.tension : 15;
          } else {
            state.nodeId = story.start;
            state.path = [story.start];
          }
        } catch (e) {
          state.nodeId = story.start;
          state.path = [story.start];
        }
      }
      if (typeof applyStoryArt === "function") applyStoryArt(story);
      if (typeof startAlex === "function") startAlex(!!fresh);
      else if (typeof renderNode === "function") renderNode();
      meters();
    });
  }
  function ready() {
    paintCast();
    var enter = document.getElementById("enter-btn");
    if (enter) enter.addEventListener("click", function () { setTimeout(paintCast, 100); });
    var back = document.getElementById("back-cast");
    if (back) back.addEventListener("click", function () { setTimeout(paintCast, 100); });
    var toCast = document.getElementById("ending-cast");
    if (toCast) toCast.addEventListener("click", function () { setTimeout(paintCast, 100); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();

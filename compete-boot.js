(function () {
  var FILES = { alex: "./data/alex.json", morgan: "./data/morgan.json", sam: "./data/sam.json" };
  var CAST = [
    { id: "alex", name: "Vera", role: "部門主管", hook: "Deadline 可以改。態度唔可以。" },
    { id: "morgan", name: "Morgan", role: "客戶負責人", hook: "大單前夜，酒廊只係傾生意。" },
    { id: "sam", name: "Sam", role: "前輩同事", hook: "教你潛規則嘅肝夜加班。" }
  ];
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function meters() {
    if (typeof state === "undefined") return;
    if (typeof state.heat !== "number") state.heat = 20;
    if (typeof state.tension !== "number") state.tension = 15;
    var heatEl = document.getElementById("meter-heat");
    var tenEl = document.getElementById("meter-tension");
    if (heatEl) heatEl.style.width = state.heat + "%";
    if (tenEl) tenEl.style.width = state.tension + "%";
  }
  function paintCast() {
    var root = document.getElementById("chars");
    if (!root) return;
    root.innerHTML = "";
    CAST.forEach(function (c) {
      var art = document.createElement("article");
      art.className = "card glass char-card";
      var img = document.createElement("img");
      img.className = "char-thumb";
      img.src = "./assets/alex.png";
      var wrap = document.createElement("div");
      wrap.className = "char-thumb-wrap";
      wrap.appendChild(img);
      var h = document.createElement("h2");
      h.textContent = c.name;
      var role = document.createElement("div");
      role.className = "role";
      role.textContent = c.role;
      var hook = document.createElement("p");
      hook.className = "hook";
      hook.textContent = c.hook;
      var start = document.createElement("button");
      start.className = "btn btn-primary";
      start.type = "button";
      start.textContent = "開始";
      start.addEventListener("click", function () { bootStart(c.id, true); });
      art.appendChild(wrap);
      art.appendChild(h);
      art.appendChild(role);
      art.appendChild(hook);
      art.appendChild(start);
      root.appendChild(art);
    });
  }
  function bootStart(id, fresh) {
    fetch(FILES[id]).then(function (res) { return res.json(); }).then(function (story) {
      state.story = story;
      state.storyId = id;
      state.nodeId = story.start;
      state.path = [story.start];
      state.memories = [];
      state.heat = 20;
      state.tension = 15;
      if (typeof startAlex === "function") startAlex(false);
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

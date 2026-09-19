(function () {
  var FILES = { alex: "./data/alex.json", morgan: "./data/morgan.json", sam: "./data/sam.json" };
  var OPENERS = {
    alex: "週五夜深。你係 Vera 手下，簡報佢話未夠，尾班電梯門開過你都無入。門後聲平：「入嚟。唔好喇走廊度似野。」",
    morgan: "酒廊外係維港燈。你係 Elise 嘅對接同事，日頭合約數字定咗。佢轉杯，聲唔高：「紙日頭講完。而家講人。」",
    sam: "加班室螢幕只照住你同 Sammi。你係佢帶嘅後輩。佢鬆開工牌繩，好似問一句靜野：「潛規則唔寫紙上。你要學，定交差就走？」"
  };
  var CAST = [
    { id: "alex", name: "Vera", role: "部門主管", you: "你係佢手下。簡報未過，今晚未走。", hook: "佢叫你入房。你可以推門、停一停、或講想走。", brief: "簡報未過。佢叫你入。", portrait: "./assets/stills/vera-03.jpg?v=2" },
    { id: "morgan", name: "Elise", role: "客戶負責人", you: "你係跟單同事。日頭數字定咗。", hook: "佢要你答：人，定條款。", brief: "日頭講完紙。佢問人。", portrait: "./assets/stills/vera-02.jpg?v=2" },
    { id: "sam", name: "Sammi", role: "前輩同事", you: "你係佢帶嘅後輩。今晚加班室只剩你兩個。", hook: "佢問你學潛規則定交差。", brief: "夜深。佢問學定走。", portrait: "./assets/stills/vera-01.jpg?v=2" }
  ];
  function faceOf(id) {
    if (id === "sam" || id === "sammi") return "./assets/stills/vera-01.jpg?v=2";
    if (id === "morgan" || id === "elise") return "./assets/stills/vera-02.jpg?v=2";
    return "./assets/stills/vera-03.jpg?v=2";
  }
  function castOf(id) {
    for (var i = 0; i < CAST.length; i++) if (CAST[i].id === id) return CAST[i];
    return CAST[0];
  }
  function fixVoice() {
    if (typeof CAST_VOICE === "undefined") return;
    if (CAST_VOICE.sam) { CAST_VOICE.sam.name = "Sammi"; CAST_VOICE.sam.toast = "Sammi 傳咗訊息"; }
    if (CAST_VOICE.morgan) { CAST_VOICE.morgan.name = "Elise"; CAST_VOICE.morgan.toast = "Elise 傳咗訊息"; }
  }
  function ensureBriefStyle() {
    if (document.getElementById("you-brief-css")) return;
    var s = document.createElement("style");
    s.id = "you-brief-css";
    s.textContent = ".you-line{font-size:13px;color:#c9b48a;margin:.35rem 0 .2rem;line-height:1.45}.cast-lead{margin:0 0 .8rem;color:#9aa3b2;font-size:13px;line-height:1.5}#you-brief{font-size:12px;color:#b7a88a;margin:0 0 .35rem}";
    document.head.appendChild(s);
  }
  function paintCast() {
    ensureBriefStyle();
    var root = document.getElementById("chars");
    if (!root) return;
    root.innerHTML = "";
    var lead = document.getElementById("cast-lead");
    if (!lead) {
      lead = document.createElement("p");
      lead.id = "cast-lead";
      lead.className = "cast-lead";
      lead.textContent = "你一直係同一個人：公司未走得嘅下屬。握邊條夜，就係握今晚跟邊個。";
      if (root.parentNode) root.parentNode.insertBefore(lead, root);
    }
    var save = {};
    try { save = JSON.parse(localStorage.getItem("after-hours-v2") || "{}"); } catch (e) {}
    CAST.forEach(function (c) {
      var art = document.createElement("article");
      art.className = "card glass char-card char-card--" + c.id;
      var img = document.createElement("img"); img.className = "char-thumb char-thumb--" + c.id; img.src = c.portrait; img.alt = c.name;
      var wrap = document.createElement("div"); wrap.className = "char-thumb-wrap"; wrap.appendChild(img);
      var body = document.createElement("div"); body.className = "char-body";
      var h = document.createElement("h2"); h.textContent = c.name;
      var role = document.createElement("div"); role.className = "role"; role.textContent = c.role;
      var you = document.createElement("p"); you.className = "you-line"; you.textContent = c.you;
      var hook = document.createElement("p"); hook.className = "hook"; hook.textContent = c.hook;
      var actions = document.createElement("div"); actions.className = "char-actions";
      var start = document.createElement("button"); start.className = "btn btn-primary"; start.type = "button"; start.textContent = "開始";
      start.addEventListener("click", function () { bootStart(c.id, true); });
      actions.appendChild(start);
      if (save && save.storyId === c.id && save.nodeId) {
        var resume = document.createElement("button"); resume.className = "btn btn-ghost"; resume.type = "button"; resume.textContent = "繼續";
        resume.addEventListener("click", function () { bootStart(c.id, false); });
        actions.appendChild(resume);
      }
      body.appendChild(h); body.appendChild(role); body.appendChild(you); body.appendChild(hook); body.appendChild(actions);
      art.appendChild(wrap); art.appendChild(body); root.appendChild(art);
    });
  }
  function applyBrief(story, id) {
    var c = castOf(id);
    var n = story.nodes && story.nodes[story.start];
    if (n && OPENERS[id]) n.text = OPENERS[id];
    var box = document.getElementById("you-brief");
    if (!box) {
      box = document.createElement("p");
      box.id = "you-brief";
      var host = document.querySelector(".play-card") || document.getElementById("play-text");
      if (host && host.parentNode) host.parentNode.insertBefore(box, host);
    }
    if (box) box.textContent = (c && c.brief) || "";
  }
  function bootStart(id, fresh) {
    fetch(FILES[id]).then(function (res) { return res.json(); }).then(function (story) {
      story.portrait = faceOf(id);
      story.name = id === "sam" ? "Sammi" : id === "morgan" ? "Elise" : "Vera";
      story.chatName = story.name;
      applyBrief(story, id);
      state.story = story;
      state.storyId = id;
      if (fresh) {
        state.nodeId = story.start; state.path = [story.start]; state.memories = []; state.heat = 20; state.tension = 15;
      } else {
        try {
          var save = JSON.parse(localStorage.getItem("after-hours-v2") || "{}");
          if (save && save.storyId === id && save.nodeId && story.nodes[save.nodeId]) {
            state.nodeId = save.nodeId; state.path = save.path || [save.nodeId];
            state.memories = save.memories || []; state.heat = typeof save.heat === "number" ? save.heat : 20; state.tension = typeof save.tension === "number" ? save.tension : 15;
          } else { state.nodeId = story.start; state.path = [story.start]; }
        } catch (e) { state.nodeId = story.start; state.path = [story.start]; }
      }
      if (typeof applyStoryArt === "function") applyStoryArt(story);
      if (typeof startAlex === "function") startAlex(!!fresh);
      else if (typeof renderNode === "function") renderNode();
    });
  }
  function ready() {
    ensureBriefStyle(); fixVoice();
    if (typeof portraitSrc === "function") {
      portraitSrc = function (story) {
        var id = (story && story.id) || (typeof state !== "undefined" && state.storyId) || "alex";
        return faceOf(id);
      };
    }
    paintCast();
    var enter = document.getElementById("enter-btn");
    if (enter) enter.addEventListener("click", function () { setTimeout(function () { fixVoice(); paintCast(); }, 50); });
    var back = document.getElementById("back-cast");
    if (back) back.addEventListener("click", function () { setTimeout(paintCast, 50); });
    var toCast = document.getElementById("ending-cast");
    if (toCast) toCast.addEventListener("click", function () { setTimeout(paintCast, 50); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();

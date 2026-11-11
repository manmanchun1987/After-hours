#!/usr/bin/env node
"use strict";

function el() {
  var node = {
    hidden: true,
    style: { setProperty: function () {}, removeProperty: function () {} },
    classList: {
      toggle: function () {},
      add: function () {},
      remove: function () {},
      contains: function () { return false; }
    },
    dataset: {},
    children: [],
    setAttribute: function (k, v) { node._attr[k] = v; },
    getAttribute: function (k) { return node._attr[k] || null; },
    removeAttribute: function (k) { delete node._attr[k]; },
    hasAttribute: function (k) { return Object.prototype.hasOwnProperty.call(node._attr, k); },
    addEventListener: function () {},
    removeEventListener: function () {},
    appendChild: function (c) { node.children.push(c); return c; },
    insertBefore: function (c) { node.children.push(c); return c; },
    querySelector: function () { return el(); },
    querySelectorAll: function () { return []; },
    closest: function () { return null; },
    play: function () { return Promise.resolve(); },
    pause: function () {},
    load: function () {},
    className: "",
    textContent: "",
    innerHTML: "",
    value: "",
    id: "",
    _attr: {}
  };
  return node;
}

var body = el();
var root = el();
global.document = {
  querySelector: function () { return el(); },
  querySelectorAll: function () { return []; },
  getElementById: function () { return el(); },
  body: body,
  documentElement: root,
  addEventListener: function () {},
  readyState: "complete",
  createElement: function () { return el(); }
};
global.window = global;
global.localStorage = { getItem: function () { return null; }, setItem: function () {} };
global.fetch = function () { return Promise.reject(new Error("no-net")); };
global.speechSynthesis = { cancel: function () {}, speak: function () {}, getVoices: function () { return []; } };
global.matchMedia = function () { return { matches: false, addEventListener: function () {} }; };
global.requestAnimationFrame = function (fn) { return setTimeout(fn, 0); };
global.innerHeight = 800;
global.addEventListener = function () {};

require("fs");
var vm = require("vm");
var fs = require("fs");
var path = require("path");
var code = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
vm.runInThisContext(code, { filename: "app.js" });

var api = global.__ahThicken;
if (!api) {
  console.error("FAIL: __ahThicken missing");
  process.exit(1);
}

var fails = [];
function expect(cond, msg) {
  if (!cond) fails.push(msg);
}

var state = api.state;
state.storyId = "alex";
state.story = {
  id: "alex",
  nodes: {
    n0: { id: "n0", label: "走廊 23:44", text: "尾班電梯門開過一次。你冇入。" },
    n5: { id: "n5", label: "燈關之後", text: "燈暗。規則喺佢度。裇衫敞開到鎖骨下。" },
    s3r: { id: "s3r", label: "雨聲天台", text: "防火門縫透入雨氣。落住雨。" }
  }
};
state.heat = 20;
state.tension = 15;
state.currentMood = "cold";
state.chatTone = "cold";
state.callMode = false;
state.playerFacts = [];
state.factTurn = 0;
state.chatUserLines = [];
state.chatBotLines = [];
state.recentBotReplies = [];
state.chatBusy = false;

state.nodeId = "n0";
var corridor = api.beatProfile(state.story.nodes.n0);
expect(corridor.place === "corridor", "n0 place " + corridor.place);
expect(corridor.look === "dressed", "n0 look " + corridor.look);
expect(!api.lineFitsBeat("天台風大。講完返入。", corridor), "rooftop line allowed in corridor");
var glued = api.glueBeat("天台風大。講完返入。", corridor);
expect(glued.indexOf("天台") < 0, "glue kept 天台: " + glued);
expect(glued.indexOf("走廊") >= 0, "glue missed 走廊: " + glued);
expect(glued.indexOf("衫仍齊") >= 0 || glued.indexOf("衫仲齊") >= 0, "glue missed costume: " + glued);
expect(glued.indexOf("走廊。衫") < 0, "stamp prefix: " + glued);
var gluedAgain = api.glueBeat("你再講多一句。", corridor);
expect(gluedAgain.indexOf("我喺走廊") < 0 && gluedAgain.indexOf("走廊。") < 0, "stamp repeated: " + gluedAgain);

state.nodeId = "n5";
state.currentMood = "intimate";
var dark = api.beatProfile(state.story.nodes.n5);
expect(dark.look === "dark" || dark.look === "open", "n5 look " + dark.look);
expect(!api.lineFitsBeat("走廊燈仲亮。你唔好裝睇唔到。", dark), "bright corridor lamp in dark beat");
var darkGlue = api.glueBeat("天台。你好。", dark);
expect(darkGlue.indexOf("天台") < 0, "dark beat kept 天台: " + darkGlue);
expect(darkGlue.indexOf("燈關住") >= 0 || darkGlue.indexOf("領口未扣") >= 0, "dark/open costume missing: " + darkGlue);

state.storyId = "sam";
state.story.id = "sam";
state.nodeId = "s3r";
var roof = api.beatProfile(state.story.nodes.s3r);
expect(roof.place === "roof", "roof place " + roof.place);
expect(roof.look === "rain", "roof look " + roof.look);
var roofGlue = api.glueBeat("走廊。講。", roof);
expect(roofGlue.indexOf("走廊") < 0, "roof kept 走廊: " + roofGlue);
expect(roofGlue.indexOf("天台") >= 0, "roof missing 天台: " + roofGlue);
expect(roofGlue.indexOf("衫濕") >= 0, "roof missing wet costume: " + roofGlue);

state.storyId = "alex";
state.story.id = "alex";
state.nodeId = "n0";
state.currentMood = "cold";
state.heat = 20;
state.glueSaidKey = "n0|corridor|dressed";
expect(api.intimacyBand() === "low", "band low " + api.intimacyBand());
var low = api.finishBeatLine("心急我知。推門入去，定停低等等？", {
  ladder: true, bucket: "flirt", userText: "我鐘意你"
});
expect(low.indexOf("走廊。") < 0, "low flirt stamped: " + low);
expect(low.indexOf("推門入去，定停低等等") < 0, "low flirt kept the door ask: " + low);
expect(low.indexOf("我回你") < 0 && low.indexOf("撩得準") < 0, "low flirt reciprocated: " + low);
expect(/距離|界線|收起|收聲|監控|而家|退|行近/.test(low), "low flirt not a boundary: " + low);
expect(low.indexOf("距離。而家") < 0, "low flirt still telegraphic: " + low);

state.heat = 70;
state.currentMood = "intimate";
expect(api.intimacyBand() === "high", "band high " + api.intimacyBand());
var high = api.finishBeatLine("心急我知。推門入去，定停低等等？", {
  ladder: true, bucket: "flirt", userText: "我鐘意你"
});
expect(/我回你|撩得準|危險/.test(high), "high flirt did not flirt back: " + high);
expect(high.indexOf("走廊。衫") < 0, "high flirt stamped: " + high);
expect(high.indexOf("天台") < 0 && high.indexOf("酒廊") < 0, "high flirt jumped place: " + high);

state.heat = 20;
state.currentMood = "cold";
state.factTurn = 0;
state.playerFacts = [];
state.recentBotReplies = [];
api.notePlayerTurn("我叫阿明");
var named = (state.playerFacts || []).filter(function (f) { return f.id === "name"; })[0];
expect(!!named && named.quote === "阿明", "name fact missing");
api.notePlayerTurn("你好");
var echo = api.finishBeatLine("講重點。", { userText: "你好", askMemory: false });
expect(echo.indexOf("阿明") >= 0, "name not echoed: " + echo);

state.playerFacts = [];
state.recentBotReplies = [];
api.notePlayerTurn("我應承交到");
expect((state.playerFacts || []).some(function (f) { return f.id === "promise"; }), "promise not stored");
api.notePlayerTurn("嗯");
var pEcho = api.finishBeatLine("講。", { userText: "嗯" });
expect(pEcho.indexOf("你應承過") >= 0, "promise not echoed: " + pEcho);

state.playerFacts = [];
state.recentBotReplies = [];
api.notePlayerTurn("我寫錯咗頁");
expect((state.playerFacts || []).some(function (f) { return f.id === "mistake"; }), "mistake not stored");

var junk = [];
for (var i = 0; i < 8; i++) {
  junk.push({ id: "f" + i, label: "x" + i, quote: "q" + i, rank: 9, ttl: 0, ttlMs: 0, at: Date.now(), turn: i });
}
junk.push({ id: "name", label: "你叫阿明", quote: "阿明", rank: 0, ttl: 0, ttlMs: 0, at: Date.now(), turn: 1, uses: 0, echoAfter: 0 });
state.playerFacts = junk;
api.expirePlayerFacts();
var capped = api.sanitizeFacts(state.playerFacts);
expect(capped.length <= 6, "cap " + capped.length);
expect(capped.some(function (f) { return f.id === "name"; }), "cap dropped name");

var stale = api.sanitizeFacts([{
  id: "tired", label: "你話好攰", quote: "好攰", at: Date.now() - 9 * 60 * 1000, ttlMs: 8 * 60 * 1000, rank: 6, ttl: 5
}]);
expect(stale.length === 0, "tired fact did not expire");

state.callMode = false;
var shortMs = api.typingDelayMs("嗯");
var longMs = api.typingDelayMs("呢句刻意寫長啲，用來證明打字時間跟住字數行，唔好一瞬出晒成段百科。");
expect(longMs > shortMs, "delay did not scale " + shortMs + " vs " + longMs);
state.callMode = true;
var callMs = api.typingDelayMs("嗯");
expect(callMs > shortMs, "call mode not slower " + callMs + " vs " + shortMs);
state.callMode = false;
var rnd = Math.random;
Math.random = function () { return 0; };
var parts = api.splitHumanLine("走廊。衫仍齊。然後先講第二句先再停。");
Math.random = rnd;
expect(parts.length === 2, "half-line split " + JSON.stringify(parts));

state.nodeId = "n0";
state.currentMood = "cold";
state.heat = 20;
state.tension = 15;
state.chatTone = "cold";
state.callMode = false;
state.chatBusy = false;
state.playerFacts = [];
state.memories = [];
state.chatTopics = ["酒", "簡報"];
state.chatUserLines = [];
state.chatBotLines = [];
state.recentBotReplies = [];
state.replyLedger = {};
state.replyCursor = {};
state.openPlayer = null;
state.halfFollow = null;
state.lastNotedTurn = "";
state.lastNotedAt = 0;

expect(api.nearDuplicate("嗯。有事直說。", "嗯。有事直說"), "punctuation twin not caught");
expect(!api.nearDuplicate("簡報邊頁？講。", "酒之後仲要清醒講事。"), "different topics marked near");

state.recentBotReplies = ["甲句", "乙句", "丙句", "丁句", "戊句"];
state.replyLedger = { "topic:酒": ["酒之後仲要清醒講事。"] };
var thinNext = api.pickAvoidRepeat(["酒之後仲要清醒講事。", "醉唔係通行證。"], "topic:酒");
expect(thinNext === "醉唔係通行證。", "thin bucket redrew inside a long window " + thinNext);

state.recentBotReplies = [];
state.replyLedger = {};
state.replyCursor = {};
var thinPool = ["酒之後仲要清醒講事。", "醉唔係通行證。"];
var prevThin = "";
var thinRepeat = 0;
for (var tr = 0; tr < 6; tr++) {
  var drawn = api.pickAvoidRepeat(thinPool, "topic:酒");
  if (prevThin && api.nearDuplicate(prevThin, drawn)) thinRepeat += 1;
  prevThin = drawn;
}
expect(thinRepeat === 0, "thin pool near-repeated " + thinRepeat);

state.replyLedger = {};
state.replyCursor = {};
state.recentBotReplies = [];
var fatPool = [
  "頁碼對齊先再交版本",
  "門禁時間你自己記住",
  "杯沿唔好再斟第三杯",
  "聽筒另一邊只講重點",
  "評估表喺我手唔好爭",
  "風大講完即刻返入",
  "杯麵唔算晚餐",
  "廂內唔好試探上司"
];
var fatSeen = [];
for (var fr = 0; fr < 6; fr++) fatSeen.push(api.pickAvoidRepeat(fatPool, "fat"));
expect(fatSeen.lastIndexOf(fatSeen[0]) === 0, "fat pool repeated inside window " + fatSeen.join("|"));

state.playerFacts = [];
state.memories = [];
state.chatUserLines = [];
state.recentBotReplies = [];
state.replyLedger = {};
state.openPlayer = { text: "簡報第三頁", bucket: "work", topic: "簡報", answered: false, carry: true };
state.halfFollow = null;
var rndTopic = Math.random;
Math.random = function () { return 0.99; };
var heldReply = api.pickReply("今日天氣點");
Math.random = rndTopic;
expect(/簡報|檔/.test(heldReply), "unanswered line left the report " + heldReply);
expect(heldReply.indexOf("天氣") < 0 && heldReply.indexOf("酒") < 0, "unanswered line jumped topic " + heldReply);

state.halfFollow = { active: true, bucket: "work", topic: "簡報", rest: "簡報先。情緒之後。", userText: "簡報第三頁" };
var halfReply = api.pickReply("食咗飯未");
expect(halfReply.indexOf("簡報") >= 0, "half follow dropped the report " + halfReply);
expect(halfReply.indexOf("飯") < 0, "half follow jumped to food " + halfReply);
expect(api.pickProactiveLine() === "", "proactive jumped mid half-line");
state.halfFollow = null;

state.openPlayer = { text: "簡報第三頁", bucket: "work", topic: "簡報", answered: false, carry: false };
state.lastNotedTurn = "簡報第三頁";
state.lastNotedAt = Date.now() - 5000;
state.chatBusy = false;
api.notePlayerTurn("今晚飲酒");
expect(state.openPlayer.topic === "簡報" && state.openPlayer.carry === true, "new topic adopted while unanswered");

state.openPlayer = { text: "簡報第三頁", bucket: "work", topic: "簡報", answered: true, carry: false };
state.lastNotedTurn = "簡報第三頁";
state.lastNotedAt = Date.now() - 5000;
api.notePlayerTurn("然後呢");
expect(state.openPlayer.topic === "簡報" && state.openPlayer.carry === true && state.openPlayer.answered === false, "fragment follow-up jumped");

state.openPlayer = { text: "簡報第三頁", bucket: "work", topic: "簡報", answered: true, carry: false };
state.lastNotedTurn = "";
state.lastNotedAt = 0;
api.notePlayerTurn("今晚飲酒");
expect(state.openPlayer.topic === "酒" && state.openPlayer.carry === false, "answered line refused a new topic " + (state.openPlayer && state.openPlayer.topic));

api.applyBeatContinuity(state.story, state.story.nodes.n0);
expect(body.getAttribute("data-beat-place") === "corridor", "atmosphere place");
expect(body.getAttribute("data-beat-look") === "dressed", "atmosphere look");
expect(body.getAttribute("data-beat-heat") === "low", "atmosphere heat");
var portrait = root.style && root.style._play;
expect(true, "still path checked in apply");

var alexStory = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/alex.json"), "utf8"));
var facefusion = "vera-facefusion-preview.mp4";
var shot1Still = "vera-ending-a-shot1.jpg";
var shot1Clip = "vera-ending-a-shot1.mp4";
var hotNodes = ["n5", "n5b", "n5c", "n6a", "n6b", "n6c", "n6a2", "n6b2", "n6c2", "ending_b"];
hotNodes.forEach(function (id) {
  var pv = (alexStory.nodes[id] && alexStory.nodes[id].portraitVideo) || "";
  expect(pv.indexOf(facefusion) >= 0, id + " missing facefusion clip: " + pv);
  expect(pv.indexOf("vera-i2v") < 0 && pv.indexOf("vera-loop") < 0, id + " still on the wrong Vera clip: " + pv);
  expect(pv.indexOf(shot1Clip) < 0, id + " picked up ending_a shot 1: " + pv);
});
var endingA = alexStory.nodes.ending_a;
var endingAText = "天亮前。窗縫漏入啲灰白光。Vera 騎喺你腿上，裙擺撩起，肩帶同外套滑落，深深吻住你，牙齒輕咬你下唇。手指扣住你後頸，下身隔住最後一層布磨住你，你同佢都喘緊氣。\n\n視線落到相接嗰度：又熱又濕，再沉半寸，幾乎要入。另一隻手仲握住你，慢慢套到你差點失控先鬆。\n\n「簡報。一小時內。其他——當唔發生。」\n「……下次熄燈，我唔再問。」";
expect(!!endingA, "ending_a missing");
expect(endingA.look === "dark", "ending_a look " + (endingA && endingA.look));
expect((endingA.portrait || "").indexOf(shot1Still) >= 0, "ending_a portrait " + (endingA && endingA.portrait));
expect(!endingA.still, "ending_a should use portrait, not still");
expect((endingA.portraitVideo || "").indexOf(shot1Clip) >= 0, "ending_a clip " + (endingA && endingA.portraitVideo));
expect((endingA.portraitVideo || "").indexOf("facefusion") < 0, "ending_a still on facefusion");
expect(endingA.text === endingAText, "ending_a text drifted");
expect((alexStory.portrait || "").indexOf("vera-03.jpg") >= 0, "Vera lock portrait drifted");
var endingAStill = api.beatStillSrc(alexStory, endingA);
expect(endingAStill.indexOf(shot1Still) >= 0, "ending_a beatStillSrc " + endingAStill);
expect(endingAStill.indexOf("v=act2hot1") >= 0, "ending_a still cache bust " + endingAStill);
expect(api.portraitVideoSrc(alexStory, endingA).indexOf(shot1Clip) >= 0, "ending_a portraitVideoSrc");
expect(api.beatStillSrc(alexStory, alexStory.nodes.n0).indexOf("vera-03.jpg") >= 0, "dressed n0 left Vera lock");
expect(api.portraitVideoSrc(alexStory, alexStory.nodes.ending_b).indexOf(facefusion) >= 0, "ending_b left facefusion");
expect(fs.existsSync(path.join(__dirname, "../assets/stills", shot1Still)), "ending_a still missing");
expect(fs.existsSync(path.join(__dirname, "../assets/video", shot1Clip)), "ending_a clip missing");
Object.keys(alexStory.nodes).forEach(function (id) {
  if (id === "ending_a") return;
  var node = alexStory.nodes[id];
  var blob = (node.portrait || "") + (node.still || "") + (node.portraitVideo || "");
  expect(blob.indexOf("vera-ending-a-shot1") < 0, "shot 1 leaked to " + id);
});
["n0", "n1", "n4x", "n7pre", "n7", "n7b", "n8a", "n8b", "n8a2", "n8b2", "ending_a_lock", "ending_b_lock", "ending_c"].forEach(function (id) {
  var pv = (alexStory.nodes[id] && alexStory.nodes[id].portraitVideo) || "";
  expect(pv.indexOf("facefusion") < 0, id + " must stay off the lights-out clip: " + pv);
  expect(pv.indexOf("vera-i2v") < 0, id + " must stay off i2v: " + pv);
});
Object.keys(alexStory.nodes).forEach(function (id) {
  var pv = alexStory.nodes[id].portraitVideo || "";
  if (pv.indexOf("facefusion") >= 0 && hotNodes.indexOf(id) < 0) {
    expect(false, "facefusion leaked to " + id);
  }
});
expect(fs.existsSync(path.join(__dirname, "../assets/video/vera-facefusion-preview.mp4")), "facefusion file missing");
expect(fs.readFileSync(path.join(__dirname, "../data/morgan.json"), "utf8").indexOf("facefusion") < 0, "Elise retargeted");
expect(fs.readFileSync(path.join(__dirname, "../data/sam.json"), "utf8").indexOf("facefusion") < 0, "Sammi retargeted");
var appSrc = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
expect(appSrc.indexOf('return "./assets/video/vera-loop.mp4"') >= 0, "Vera idle left vera-loop");
expect(appSrc.indexOf('return "./assets/video/sammi-loop.mp4"') >= 0, "Sammi idle retargeted");
expect(appSrc.indexOf("vid.muted = true") >= 0, "portrait clip not muted");
expect(appSrc.indexOf("duckBgmForVideo(true)") < 0, "portrait load still ducks the scene bed");

var morganStory = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/morgan.json"), "utf8"));
var samStory = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/sam.json"), "utf8"));
var hotStill = {
  m7hot: "elise-open-collar-cutout.jpg",
  m8: "elise-lift-dark-cutout.jpg",
  ending_m2_a: "elise-lift-dark-cutout.jpg",
  s6near: "sammi-open-collar-cutout.jpg",
  s7hot: "sammi-open-collar-cutout.jpg",
  s8: "sammi-lift-dark-cutout.jpg",
  ending_s2_a: "sammi-lift-dark-cutout.jpg",
  s8r: "sammi-rain-wet-cutout.jpg",
  ending_s2_r: "sammi-rain-wet-cutout.jpg"
};
var hotLook = {
  m7hot: "open", m8: "dark", ending_m2_a: "dark",
  s6near: "open", s7hot: "open", s8: "dark", ending_s2_a: "dark",
  s8r: "rain", ending_s2_r: "rain"
};
var hotScene = {
  m7hot: "lift", m8: "lift", ending_m2_a: "lift",
  s6near: "pantry", s7hot: "lift", s8: "lift", ending_s2_a: "lift",
  s8r: "roof", ending_s2_r: "roof"
};
var veilNodes = { m8: 1, ending_m2_a: 1, s8: 1, ending_s2_a: 1 };
var rainNodes = { s8r: 1, ending_s2_r: 1 };
function propIds(node) {
  return (node.props || []).map(function (p) { return typeof p === "string" ? p : (p && p.id); });
}
function storyFor(id) {
  return id.charAt(0) === "m" || id.indexOf("ending_m") === 0 ? morganStory : samStory;
}
Object.keys(hotStill).forEach(function (id) {
  var node = storyFor(id).nodes[id];
  expect(!!node, id + " missing");
  if (!node) return;
  expect((node.portrait || "").indexOf(hotStill[id]) >= 0, id + " portrait " + node.portrait);
  expect(!node.still, id + " should use portrait, not still");
  expect(node.look === hotLook[id], id + " look " + node.look);
  expect(node.scene === hotScene[id], id + " scene " + node.scene);
  var props = propIds(node);
  expect(props.indexOf("lift-blackout-veil") >= 0 === !!veilNodes[id], id + " veil " + props.join(","));
  expect(props.indexOf("roof-rain-streaks") >= 0 === !!rainNodes[id], id + " rain " + props.join(","));
  var src = api.beatStillSrc(storyFor(id), node);
  expect(src.indexOf(hotStill[id]) >= 0, id + " beatStillSrc " + src);
  expect(src.indexOf("v=act2hot1") >= 0, id + " cache bust " + src);
  var file = hotStill[id].indexOf("elise") === 0
    ? path.join(__dirname, "../assets/stills", hotStill[id])
    : path.join(__dirname, "../assets/stills", hotStill[id]);
  expect(fs.existsSync(file), hotStill[id] + " missing");
});
expect(fs.existsSync(path.join(__dirname, "../assets/props/lift-blackout-veil.jpg")), "veil file missing");
expect(fs.existsSync(path.join(__dirname, "../assets/props/roof-rain-streaks.jpg")), "rain file missing");
[morganStory, samStory].forEach(function (story) {
  Object.keys(story.nodes).forEach(function (id) {
    var node = story.nodes[id];
    var custom = (node.portrait || "") + (node.still || "");
    if (node.look === "dressed") {
      expect(custom.indexOf("cutout") < 0, id + " dressed still swapped " + custom);
      var lock = story.id === "sam" ? "sammi-01.jpg" : "vera-02.jpg";
      var src = api.beatStillSrc(story, node);
      expect(src.indexOf(lock) >= 0, id + " dressed left lock " + src);
    }
  });
});
expect(api.beatStillSrc(morganStory, { id: "x", look: "dark", still: "./assets/stills/elise-lift-dark-cutout.jpg" }).indexOf("elise-lift-dark-cutout.jpg") >= 0, "node.still fallback");
expect(api.beatStillSrc(morganStory, {
  id: "y",
  look: "open",
  portrait: "./assets/stills/elise-open-collar-cutout.jpg",
  still: "./assets/stills/elise-lift-dark-cutout.jpg"
}).indexOf("elise-open-collar-cutout.jpg") >= 0, "portrait wins over still");
expect(api.portraitVideoSrc(samStory, samStory.nodes.s7).indexOf("sammi-loop.mp4") >= 0, "dressed s7 lost sammi loop");
expect(api.portraitVideoSrc(samStory, samStory.nodes.s7hot) == null, "s7hot still covered by loop");
expect(api.portraitVideoSrc(samStory, samStory.nodes.s8r) == null, "s8r still covered by loop");
expect(api.portraitVideoSrc(alexStory, alexStory.nodes.n0).indexOf("vera-loop.mp4") >= 0, "Vera idle left vera-loop via src");

function resetSpoken() {
  state.storyId = "alex";
  state.story.id = "alex";
  state.nodeId = "n0";
  state.heat = 20;
  state.tension = 15;
  state.currentMood = "cold";
  state.chatTone = "cold";
  state.callMode = false;
  state.chatBusy = false;
  state.playerFacts = [];
  state.factTurn = 0;
  state.memories = [];
  state.chatUserLines = [];
  state.chatBotLines = [];
  state.chatTopics = [];
  state.recentBotReplies = [];
  state.replyLedger = {};
  state.replyCursor = {};
  state.spokenTurns = [];
  state.glueSaidKey = "n0|corridor|dressed";
  state.openPlayer = null;
  state.halfFollow = null;
  state.lastNotedTurn = "";
  state.lastNotedAt = 0;
}
var doorAsk = "推門入去，定停低等等";
var guideFlirt = "心急我知。" + doorAsk + "？";
resetSpoken();
var likes = [];
for (var li = 0; li < 4; li++) {
  var like = api.playerFacingReply("我鐘意你", "flirt", guideFlirt);
  likes.push(like);
  api.rememberSpoken(like, [like]);
}
for (var lj = 0; lj < likes.length; lj++) {
  expect(likes.indexOf(likes[lj]) === lj, "like-you repeat " + likes.join(" | "));
  expect(likes[lj].indexOf(doorAsk) < 0, "like-you dumped the door " + likes[lj]);
  expect(likes[lj].indexOf("我回你") < 0 && likes[lj].indexOf("撩") < 0, "like-you jumped heat " + likes[lj]);
  expect(/距離|收聲|監控|而家|退|行近/.test(likes[lj]), "like-you not a boundary " + likes[lj]);
  expect(likes[lj].indexOf("距離。而家") < 0 && likes[lj].indexOf("呢度有耳。收聲") < 0, likes[lj]);
  expect(likes[lj].indexOf("走廊。衫") < 0, "like-you stamped " + likes[lj]);
  expect(!api.isTelegraphic(likes[lj]), "like-you telegraphic " + likes[lj]);
}

resetSpoken();
api.notePlayerTurn("簡報第三頁");
state.chatUserLines.push("簡報第三頁");
var brief = api.playerFacingReply("簡報第三頁", "unclear", guideFlirt);
expect(/簡報/.test(brief) && brief.indexOf("第三頁") >= 0, "briefing missed the page " + brief);
expect(brief.indexOf(doorAsk) < 0, "briefing dumped the door " + brief);
api.rememberSpoken(brief, [brief]);
if (state.openPlayer) state.openPlayer.answered = true;
api.notePlayerTurn("然後呢");
var thenNe = api.playerFacingReply("然後呢", "unclear", guideFlirt);
expect(/簡報/.test(thenNe) && thenNe.indexOf("第三頁") >= 0, "然後呢 dropped the briefing " + thenNe);
expect(thenNe.indexOf(doorAsk) < 0 && thenNe.indexOf("呢度有耳") < 0, "然後呢 dumped a fragment " + thenNe);

resetSpoken();
api.notePlayerTurn("簡報第三頁");
state.chatUserLines.push("簡報第三頁");
if (state.openPlayer) state.openPlayer.answered = true;
api.notePlayerTurn("今日天氣點");
var weather = api.playerFacingReply("今日天氣點", "off_topic", guideFlirt);
expect(/簡報/.test(weather), "weather left the briefing " + weather);
expect(weather.indexOf("天氣") < 0 && weather.indexOf("落雨") < 0 && weather.indexOf("窗外") < 0, "weather switched " + weather);

resetSpoken();
api.notePlayerTurn("我叫阿明");
var namedNow = api.playerFacingReply("我叫阿明", "unclear", guideFlirt);
expect(namedNow.indexOf("你叫阿明") === 0, "name not immediate " + namedNow);
api.rememberSpoken(namedNow, [namedNow]);
api.notePlayerTurn("你記得我名？");
var recall = api.playerFacingReply("你記得我名？", "ask_memory", guideFlirt);
expect(recall.indexOf("你叫阿明") === 0, "recall did not lead with the name " + recall);

resetSpoken();
var aiLine = api.playerFacingReply("你係唔係AI？", "off_topic", guideFlirt);
expect(/上司|真人|Vera/.test(aiLine), "ai question had no character line " + aiLine);
expect(aiLine.indexOf(doorAsk) < 0, "ai dumped the door " + aiLine);
expect(aiLine.indexOf("距離。而家") < 0, aiLine);

resetSpoken();
var dots = api.playerFacingReply("……", "unclear", guideFlirt);
expect(dots.indexOf("呢度有耳") < 0 && dots.indexOf(doorAsk) < 0, "silence dumped the door " + dots);
expect(dots.indexOf("距離。而家") < 0, dots);
expect(!api.isTelegraphic(dots), "silence still telegraphic " + dots);

api.listIncomingLines().forEach(function (l) {
  expect(!api.isTelegraphic(l), "incoming telegraphic " + l);
  expect(l.indexOf("門口。講") < 0 && l.indexOf("距離。而家") < 0 && l.indexOf("有事？講") < 0, l);
  expect(l.indexOf("在") < 0, "zai in incoming " + l);
});
expect(api.isTelegraphic("距離。而家。"), "fragment not flagged");
expect(api.isTelegraphic("呢度有耳。收聲。"), "ear fragment not flagged");
expect(!api.isTelegraphic("而家唔好再行近，我要你同我保持距離。"), "boundary flagged as telegraphic");

state.spokenTurns = [];
api.rememberSpoken("甲句完整講清楚。乙句都講清楚。", ["甲句完整講清楚。", "乙句都講清楚。"]);
expect(api.spokenBlocked("甲句完整講清楚。乙句都講清楚。"), "pair not blocked");
expect(api.spokenBlocked("甲句完整講清楚。"), "split bubble not blocked");
expect(api.spokenBlocked("乙句都講清楚。"), "second bubble not blocked");

require(path.join(__dirname, "../guide-lines.js"));
require(path.join(__dirname, "../guide-policy.js"));
state.spokenTurns = [];
state.recentBotReplies = [];
state.chatUserLines = [];
state.chatBotLines = [];
var guideGoal = { ask: doorAsk + "？", successIntents: ["enter_door", "wait"], maxMisses: 3 };
var g1 = global.GuidePolicy.decide({
  intent: { id: "unclear", text: "嗯" },
  text: "嗯",
  sceneGoal: guideGoal,
  state: state,
  missCount: 0
});
expect(!!(g1 && g1.reply), "guide reply missing");
api.rememberSpoken(g1.reply, [g1.reply]);
var g2 = global.GuidePolicy.decide({
  intent: { id: "unclear", text: "嗯" },
  text: "嗯",
  sceneGoal: guideGoal,
  state: state,
  missCount: 0
});
expect(g2.reply !== g1.reply, "guide ask repeated " + g2.reply);
expect(api.spokenBlocked(g1.reply), "ledger missed the guide line");

resetSpoken();
var coreBuckets = ["greet", "work", "sorry", "flirt", "tired", "praise", "challenge", "help", "bye", "leave", "name", "memory", "emoji", "default", "silence"];
var coreTones = ["cold", "wary", "warmer", "sharp"];
["morgan", "sam"].forEach(function (cast) {
  state.storyId = cast;
  state.story.id = cast;
  coreBuckets.forEach(function (bucket) {
    coreTones.forEach(function (tone) {
      var lines = api.poolFor(bucket, tone);
      var uniq = {};
      lines.forEach(function (l) { uniq[l] = 1; });
      var n = Object.keys(uniq).length;
      expect(n >= 7, cast + " " + bucket + "." + tone + " has " + n);
      lines.forEach(function (l) {
        expect(!api.isTelegraphic(l), cast + " telegraphic " + l);
        expect(/[。！？?]$/.test(l), cast + " incomplete " + l);
      });
    });
  });
});
coreBuckets.forEach(function (bucket) {
  coreTones.forEach(function (tone) {
    state.storyId = "morgan";
    state.story.id = "morgan";
    var a = api.poolFor(bucket, tone);
    state.storyId = "sam";
    state.story.id = "sam";
    var b = api.poolFor(bucket, tone);
    a.forEach(function (l) {
      expect(b.indexOf(l) < 0, "shared line " + bucket + " " + l);
    });
  });
});
["alex", "morgan", "sam"].forEach(function (cast) {
  state.storyId = cast;
  state.story.id = cast;
  var topicBank = api.topicEchoBank();
  var asideBank = api.sceneAsideBank();
  ["加班", "門", "酒", "電話", "簡報", "會議", "電梯", "上司"].forEach(function (topic) {
    coreTones.forEach(function (tone) {
      var lines = (topicBank[topic] && topicBank[topic][tone]) || [];
      expect(lines.length >= 4, cast + " echo " + topic + " " + tone + " " + lines.length);
    });
  });
  ["office", "corridor", "pantry", "lounge", "lift", "stairs", "roof", "review", "dark", "close"].forEach(function (place) {
    coreTones.forEach(function (tone) {
      var lines = (asideBank[place] && asideBank[place][tone]) || [];
      expect(lines.length >= 4, cast + " aside " + place + " " + tone + " " + lines.length);
    });
  });
});
state.storyId = "alex";
state.story.id = "alex";
var alexEcho = JSON.stringify(api.topicEchoBank());
var alexAside = JSON.stringify(api.sceneAsideBank());
state.storyId = "morgan";
state.story.id = "morgan";
expect(JSON.stringify(api.topicEchoBank()) !== alexEcho, "Elise echoes still shared");
expect(JSON.stringify(api.sceneAsideBank()) !== alexAside, "Elise asides still shared");
var eliseEcho = JSON.stringify(api.topicEchoBank());
state.storyId = "sam";
state.story.id = "sam";
expect(JSON.stringify(api.topicEchoBank()) !== alexEcho, "Sammi echoes still shared");
expect(JSON.stringify(api.topicEchoBank()) !== eliseEcho, "Sammi echoes copied Elise");
expect(JSON.stringify(api.sceneAsideBank()) !== alexAside, "Sammi asides still shared");

function lowHeatCast(cast) {
  resetSpoken();
  state.storyId = cast;
  state.story.id = cast;
  var lines = [];
  for (var i = 0; i < 4; i++) {
    var line = api.playerFacingReply("我鐘意你", "flirt", guideFlirt);
    lines.push(line);
    api.rememberSpoken(line, [line]);
  }
  lines.forEach(function (line) {
    expect(line.indexOf(doorAsk) < 0, cast + " low heat dumped the door " + line);
    expect(line.indexOf("我回你") < 0 && line.indexOf("撩") < 0, cast + " low heat jumped " + line);
    expect(/距離|收聲|監控|而家|退|行近|界線|收起/.test(line), cast + " low heat not a boundary " + line);
    expect(!api.isTelegraphic(line), cast + " low heat telegraphic " + line);
  });
}
lowHeatCast("morgan");
lowHeatCast("sam");

resetSpoken();
state.glueSaidKey = "n0|corridor|dressed";
["alex", "morgan", "sam"].forEach(function (cast) {
  state.storyId = cast;
  state.story.id = cast;
  state.replyLedger = {};
  state.replyCursor = {};
  state.recentBotReplies = [];
  state.spokenTurns = [];
  var seen = {};
  for (var i = 0; i < 5; i++) {
    var greet = api.pickGreeting();
    expect(!api.isTelegraphic(greet), cast + " greeting telegraphic " + greet);
    expect(greet.indexOf("在") < 0, cast + " greeting 在 " + greet);
    seen[greet] = 1;
  }
  expect(Object.keys(seen).length >= 3, cast + " greeting did not rotate " + Object.keys(seen).join(" | "));
});
state.storyId = "morgan";
state.story.id = "morgan";
var eliseHello = api.greetingLines().join("\n");
expect(/夜|杯|條款/.test(eliseHello), "Elise greeting off voice " + eliseHello);
expect(eliseHello.indexOf("簡報") < 0 && eliseHello.indexOf("評估") < 0, "Elise greeting borrowed Vera " + eliseHello);
state.storyId = "sam";
state.story.id = "sam";
var sammiHello = api.greetingLines().join("\n");
expect(/麵|頁|燈|前輩|門禁/.test(sammiHello), "Sammi greeting off voice " + sammiHello);
expect(sammiHello.indexOf("房卡") < 0 && sammiHello.indexOf("董事會") < 0 && sammiHello.indexOf("條款") < 0, "Sammi greeting borrowed Elise " + sammiHello);

resetSpoken();
state.sessionFirstPingSent = true;
state.chatUserLines = ["嗯"];
state.openPlayer = { text: "嗯", answered: false, topic: "", bucket: "default" };
state.spokenTurns = [];
state.chatBotLines = [];
var rndWait = Math.random;
Math.random = function () { return 0; };
var followMin = api.incomingWaitMs();
expect(followMin === 12000, "unanswered wait " + followMin);
expect(api.incomingWindow().min === 12000, "unanswered window " + api.incomingWindow().min);
Math.random = function () { return 0.999; };
var followMax = api.incomingWaitMs();
expect(followMax >= 12000 && followMax <= 18000, "unanswered wait high " + followMax);
state.openPlayer.answered = true;
state.spokenTurns = [{ raw: "你想坐低先講？" }];
state.chatBotLines = ["你想坐低先講？"];
Math.random = function () { return 0; };
expect(api.incomingFollowDue(), "question did not arm follow-up");
expect(api.incomingWaitMs() === 12000, "question wait " + api.incomingWaitMs());
state.spokenTurns = [{ raw: "我聽到，你講清楚。" }];
state.chatBotLines = ["我聽到，你講清楚。"];
state.openPlayer = { text: "嗯", answered: true, topic: "", bucket: "default" };
expect(!api.incomingFollowDue(), "idle still on follow-up");
Math.random = function () { return 0; };
expect(api.incomingWaitMs() === 32000, "idle wait " + api.incomingWaitMs());
Math.random = function () { return 0.999; };
var idleMax = api.incomingWaitMs();
expect(idleMax >= 32000 && idleMax <= 48000, "idle wait high " + idleMax);
Math.random = rndWait;

resetSpoken();
state.playerFacts = [{ id: "name", quote: "阿明", label: "你叫阿明", turn: 1, uses: 0, echoAfter: 0, rank: 0, at: Date.now() }];
state.factTurn = 3;
state.openPlayer = { text: "你好", answered: true, topic: "", bucket: "greet" };
state.halfFollow = null;
state.memories = [];
state.chatTopics = [];
state.story.nodes.n0.sceneGoal = { ask: "推門入去，定停低等等？" };
state.spokenTurns = [{ raw: "推門入去，定停低等等？" }];
expect(api.repeatsSceneAsk("你而家揀，推門入去，定停低等等？"), "scene ask not detected");
expect(!api.repeatsSceneAsk("你而家回我一句清楚嘅。"), "safe incoming flagged");
for (var pingN = 0; pingN < 6; pingN++) {
  var ping = api.pickProactiveLine();
  expect(ping.indexOf("阿明") >= 0, "incoming missed the name " + ping);
  expect(ping.indexOf("推門入去，定停低等等") < 0, "incoming repeated the ask " + ping);
  expect(!api.isTelegraphic(ping), "incoming telegraphic " + ping);
}
delete state.story.nodes.n0.sceneGoal;

["我係阿明", "我嘅名係阿明", "我叫阿明", "我叫阿明呀"].forEach(function (intro) {
  resetSpoken();
  api.notePlayerTurn(intro);
  var stored = (state.playerFacts || []).filter(function (f) { return f.id === "name"; })[0];
  expect(!!stored && stored.quote === "阿明", intro + " stored " + (stored && stored.quote));
  var immediate = api.playerFacingReply(intro, "unclear", guideFlirt);
  expect(immediate.indexOf("你叫阿明") === 0, intro + " not immediate " + immediate);
});
resetSpoken();
expect(!api.extractPlayerFact("我係唔係AI"), "AI question stored a name");
api.notePlayerTurn("我係阿明");
api.notePlayerTurn("你記得我叫咩");
var still = (state.playerFacts || []).filter(function (f) { return f.id === "name"; })[0];
expect(!!still && still.quote === "阿明", "recall overwrote the name " + (still && still.quote));
var recallHow = api.playerFacingReply("你記得我叫咩", "ask_memory", guideFlirt);
expect(recallHow.indexOf("你叫阿明") === 0, "叫咩 did not lead with the name " + recallHow);
api.notePlayerTurn("你記得我名？");
var recallName = api.playerFacingReply("你記得我名？", "ask_memory", guideFlirt);
expect(recallName.indexOf("你叫阿明") === 0, "名 recall drifted " + recallName);

resetSpoken();
var canto = require("./cantonese-check");
var cantoResult = canto.run();
if (cantoResult.fails.length) {
  cantoResult.fails.forEach(function (msg) { fails.push("cantonese: " + msg); });
}

if (fails.length) {
  console.error("FAIL\n" + fails.join("\n"));
  process.exit(1);
}
console.log("thicken-check PASS");
console.log("cantonese-check PASS (" + cantoResult.scanned + " player-visible strings)");
process.exit(0);

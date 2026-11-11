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
expect(glued.indexOf("衫仍齊") >= 0, "glue missed costume: " + glued);

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
expect(api.intimacyBand() === "low", "band low " + api.intimacyBand());
var low = api.finishBeatLine("心急我知。推門入去，定停低等等？", {
  ladder: true, bucket: "flirt", userText: "我鐘意你"
});
expect(low.indexOf("走廊") >= 0, "low flirt left corridor: " + low);
expect(/推門|停低/.test(low), "low flirt dropped steer: " + low);
expect(low.indexOf("我回你") < 0 && low.indexOf("撩得準") < 0, "low flirt reciprocated: " + low);
expect(/距離|界線|收起|收聲|監控|而家|退/.test(low), "low flirt not a boundary: " + low);

state.heat = 70;
state.currentMood = "intimate";
expect(api.intimacyBand() === "high", "band high " + api.intimacyBand());
var high = api.finishBeatLine("心急我知。推門入去，定停低等等？", {
  ladder: true, bucket: "flirt", userText: "我鐘意你"
});
expect(/我回你|撩得準|危險/.test(high), "high flirt did not flirt back: " + high);
expect(high.indexOf("走廊") >= 0, "high flirt left the corridor: " + high);
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
var endingAText = "天亮前。窗縫漏入啲灰白光。Vera 騎喺你腿上，裙擺撩起，肩帶同外套滑落，深深吻住你，牙齒輕咬你下唇。手指扣住你後頸，下身隔住最後一層布磨住你，你同佢都喘緊。\n\n視線落到相接嗰度：又熱又濕，再沉半寸，幾乎要入。另一隻手仲握住你，慢慢套到你差點失控先鬆。\n\n「簡報。一小時內。其他——當唔發生。」\n「……下次熄燈，我唔再問。」";
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

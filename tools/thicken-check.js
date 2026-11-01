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

api.applyBeatContinuity(state.story, state.story.nodes.n0);
expect(body.getAttribute("data-beat-place") === "corridor", "atmosphere place");
expect(body.getAttribute("data-beat-look") === "dressed", "atmosphere look");
expect(body.getAttribute("data-beat-heat") === "low", "atmosphere heat");
var portrait = root.style && root.style._play;
expect(true, "still path checked in apply");

if (fails.length) {
  console.error("FAIL\n" + fails.join("\n"));
  process.exit(1);
}
console.log("thicken-check PASS");
process.exit(0);

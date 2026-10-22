#!/usr/bin/env node
/**
 * tools/auto-playtest.js — local fake-AI reply harness (no paid LLM).
 *
 * Loads intent-patterns → intent-engine → guide-lines → guide-policy in Node
 * (IIFE globals on globalThis; setInterval stubbed so install() does not hang).
 *
 * Usage (repo root):
 *   node tools/auto-playtest.js
 *   node tools/auto-playtest.js --chars=alex
 *   node tools/auto-playtest.js --seed=42
 *
 * Writes tools/PLAYTEST-LAST.md and prints a markdown report to stdout.
 * Exit 0 always (report carries pass/fail); use --strict to exit 1 on any FAIL.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");
var OUT_MD = path.join(__dirname, "PLAYTEST-LAST.md");

var args = process.argv.slice(2);
function argVal(name, fallback) {
  var pref = "--" + name + "=";
  for (var i = 0; i < args.length; i++) {
    if (args[i].indexOf(pref) === 0) return args[i].slice(pref.length);
    if (args[i] === "--" + name && args[i + 1]) return args[i + 1];
  }
  return fallback;
}
var STRICT = args.indexOf("--strict") >= 0;
var SEED = Number(argVal("seed", "42")) || 42;
var CHAR_FILTER = argVal("chars", "alex,morgan,sam");

// --- deterministic RNG (Mulberry32) so reports are stable across runs ---
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
var rng = mulberry32(SEED);
Math.random = rng;

// Keep process from hanging on IntentEngine.install setInterval
var _intervals = [];
global.setInterval = function (fn, ms) {
  var id = _intervals.length + 1;
  _intervals.push(id);
  return id;
};
global.clearInterval = function () {};

function loadScript(rel) {
  var full = path.join(ROOT, rel);
  var code = fs.readFileSync(full, "utf8");
  vm.runInThisContext(code, { filename: full });
}

loadScript("intent-patterns.js");
loadScript("intent-engine.js");
loadScript("guide-lines.js");
loadScript("guide-policy.js");

var IntentEngine = global.IntentEngine || globalThis.IntentEngine;
var GuidePolicy = global.GuidePolicy || globalThis.GuidePolicy;
var GuideLines = global.GuideLines || globalThis.GuideLines;

if (!IntentEngine || !GuidePolicy || !GuideLines) {
  console.error("FAIL: engines did not attach to globalThis");
  process.exit(2);
}

// --- goal label map (mirror guide-policy INTENT_HINT_LABELS) ---
var INTENT_HINT_LABELS = {
  enter_door: "推門入去",
  wait: "停低等等",
  agree: "應承繼續",
  refuse: "唔入／離開",
  ask_want: "講清楚你想點",
  flirt: "再近啲",
  challenge: "頂真講",
  apologize: "認錯收斂",
  ask_memory: "提頭先嗰句",
  follow: "跟住入"
};

var CS_RE =
  /請輸入正確|有什麼可以幫你|很樂意為你|AI助手|語言模型|請重試|我唔明白你的意思|請選擇正確|invalid option|please (enter|select|try)/i;

var LITERARY_RE =
  /霜氣|滲出|冷意爬|空氣凝結|門把凉(?![。.])|答案唔喺我嘴|走廊兩個選項。清楚未|推定停。我唔代你揀|指引？入去。或企定|少問我想。推門。|^選。$|^入。$|^門。而家。$|^停。門。$/;

// Action tokens per intent id for steer checks
var INTENT_STEER_TOKENS = {
  enter_door: ["推門", "入去", "入嚟", "開門", "進去", "推開"],
  wait: ["停低", "等等", "等陣", "企定", "停"],
  agree: ["應承", "繼續", "配合", "改"],
  refuse: ["唔入", "離開", "走", "閃"],
  ask_want: ["講清楚", "你想點", "想點"],
  flirt: ["近", "站近", "靠近"],
  challenge: ["頂真", "點解", "頂嘴"],
  apologize: ["認錯", "道歉"],
  ask_memory: ["頭先", "記得", "之前"]
};

function loadChar(name) {
  var p = path.join(ROOT, "data", name + ".json");
  if (!fs.existsSync(p)) return null;
  var data = JSON.parse(fs.readFileSync(p, "utf8"));
  return { name: name, nodes: data.nodes || data };
}

function pickScenes(char) {
  var nodes = char.nodes;
  var scenes = [];
  function add(id) {
    if (!nodes[id]) return;
    var n = nodes[id];
    if (!n.sceneGoal) return;
    scenes.push({
      char: char.name,
      id: id,
      label: n.label || id,
      node: Object.assign({ id: id }, n)
    });
  }
  if (char.name === "alex") {
    add("n0"); // corridor start
    add("n1"); // mid
    add("n2a"); // mid agree-only
  } else if (char.name === "morgan") {
    add("m1");
    add("m3"); // door-ish
  } else if (char.name === "sam") {
    add("s1");
    add("s2x");
  }
  return scenes;
}

/** Battery of player inputs tagged by expected category. */
function batteryFor(scene) {
  var goal = scene.node.sceneGoal || {};
  var success = goal.successIntents || [];
  var rows = [];

  function add(cat, text, expectIntent) {
    rows.push({ cat: cat, text: text, expectIntent: expectIntent || null });
  }

  // Success paraphrases — pick lines that should hit each success intent
  if (success.indexOf("enter_door") >= 0) {
    add("success", "開門啦", "enter_door");
    add("success", "我入去先", "enter_door");
    add("success", "推門入去", "enter_door");
  }
  if (success.indexOf("wait") >= 0) {
    add("success", "等等", "wait");
    add("success", "等陣", "wait");
    add("success", "停低先", "wait");
  }
  if (success.indexOf("agree") >= 0) {
    add("success", "好呀", "agree");
    add("success", "得啦繼續", "agree");
    add("success", "我應承", "agree");
  }
  if (success.indexOf("ask_want") >= 0) {
    add("success", "你想我點", "ask_want");
    add("success", "我應該點做", "ask_want");
  }
  if (success.indexOf("challenge") >= 0) {
    add("success", "點解要我留", "challenge");
    add("success", "我頂真問", "challenge");
  }
  if (success.indexOf("flirt") >= 0) {
    add("success", "我企近啲", "flirt");
    add("success", "俾我靠近", "flirt");
  }
  if (success.indexOf("refuse") >= 0) {
    add("success", "我走先", "refuse");
    add("success", "唔入喇", "refuse");
  }

  // Shared miss / unclear / nonsense / off-topic / mixed
  add("wait_soft", "未準備好", "wait");
  add("enter_soft", "開個門先", "enter_door");
  add("unclear", "嗯", null);
  add("unclear", "……", null);
  add("nonsense", "哈哈", null);
  add("nonsense", "asdf", null);
  add("nonsense", "kkkk", null);
  add("off_topic", "今日天氣點", "off_topic");
  add("off_topic", "食咗飯未", "off_topic");
  add("mixed_hesitation", "想入又未敢停低認位先", null);
  add("ask_want", "你想點啊", "ask_want");

  return rows;
}

function goalSteerTokens(goal) {
  var tokens = [];
  var seen = {};
  function push(t) {
    t = String(t || "").trim();
    if (!t || seen[t]) return;
    seen[t] = 1;
    tokens.push(t);
  }
  if (!goal) return tokens;
  if (goal.ask) {
    String(goal.ask)
      .split(/[，,／\/定？?。.\s]+/)
      .forEach(push);
  }
  var hints = goal.hints || {};
  Object.keys(hints).forEach(function (k) {
    push(hints[k]);
  });
  (goal.successIntents || []).forEach(function (id) {
    push(INTENT_HINT_LABELS[id]);
    (INTENT_STEER_TOKENS[id] || []).forEach(push);
  });
  return tokens.filter(Boolean);
}

function replySteersToGoal(reply, goal) {
  if (!reply) return false;
  var tokens = goalSteerTokens(goal);
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i].replace(/[。？?！!]/g, "");
    if (t && reply.indexOf(t) >= 0) return true;
  }
  // Broad action fallbacks when goal is door-ish
  var successes = goal.successIntents || [];
  if (successes.indexOf("enter_door") >= 0 || successes.indexOf("wait") >= 0) {
    if (/推門|入去|入嚟|開門|停低|等等|推定停|推[，,]?定停/.test(reply)) return true;
  }
  if (successes.indexOf("agree") >= 0 && /應承|繼續|好|得/.test(reply)) return true;
  if (successes.indexOf("ask_want") >= 0 && /講清楚|你想點|想點/.test(reply)) return true;
  if (successes.indexOf("challenge") >= 0 && /頂真|點解/.test(reply)) return true;
  if (successes.indexOf("flirt") >= 0 && /近|靠近/.test(reply)) return true;
  if (successes.indexOf("refuse") >= 0 && /唔入|離開|走/.test(reply)) return true;
  return false;
}

function scoreTurn(ctx) {
  var fails = [];
  var warns = [];
  var human = 100;
  var reply = ctx.reply;
  var goal = ctx.goal;
  var cat = ctx.cat;
  var advanced = !!ctx.advance;

  // Success path: advance with null reply is correct — pass
  if (advanced) {
    return {
      pass: true,
      fails: [],
      warns: [],
      human: 100,
      note: "advance (success intent)"
    };
  }

  // Empty reply
  if (!reply || !String(reply).trim()) {
    fails.push("empty_reply");
    human -= 40;
  } else {
    var r = String(reply);

    // CS tone
    if (CS_RE.test(r) || (/客服/.test(r) && !/唔做客服/.test(r))) {
      fails.push("cs_tone");
      human -= 50;
    }

    // Old literary / cryptic when clear pools exist
    if (LITERARY_RE.test(r)) {
      fails.push("literary_cryptic");
      human -= 35;
    }
    // Ultra-short cryptic (no goal action word)
    if (r.replace(/\s/g, "").length <= 6 && !/推|停|入|等|應承|講清楚/.test(r)) {
      fails.push("too_cryptic_short");
      human -= 25;
    }

    // Goal steer required whenever sceneGoal exists and we did not advance
    if (goal && !replySteersToGoal(r, goal)) {
      fails.push("no_goal_steer");
      human -= 40;
    }

    // Length band
    var len = r.length;
    if (len < 6) {
      warns.push("short_reply");
      human -= 10;
    } else if (len > 120) {
      warns.push("long_reply");
      human -= 5;
    }

    // Anti-repeat
    var recent = ctx.recentBotReplies || [];
    if (recent.indexOf(r) >= 0) {
      warns.push("exact_repeat");
      human -= 20;
    }

    // Nonsense path: clear 聽唔明 + steer
    if (cat === "nonsense") {
      var ack = /聽唔明|亂打|亂碼|無意思|無內容|砸字|哈+|鍵盤|無意義|呢句無|温吞|砸字|唔好再/.test(r);
      if (!ack) {
        warns.push("nonsense_no_ack");
        human -= 15;
      }
      if (!replySteersToGoal(r, goal)) {
        // already failed above; reinforce
        human -= 5;
      }
    }
  }

  if (human < 0) human = 0;
  return {
    pass: fails.length === 0,
    fails: fails,
    warns: warns,
    human: human,
    note: fails.length ? fails.join(",") : warns.length ? "warn:" + warns.join(",") : "ok"
  };
}

function freshState() {
  return {
    guideMissCount: 0,
    recentBotReplies: [],
    chatUserLines: [],
    chatBotLines: [],
    chatTone: "cold",
    offTopicStreak: 0,
    chatMemory: []
  };
}

function runScene(scene) {
  var goal = scene.node.sceneGoal;
  var state = freshState();
  var battery = batteryFor(scene);
  var results = [];

  for (var i = 0; i < battery.length; i++) {
    var row = battery[i];
    var classified = IntentEngine.classify(row.text, {
      node: scene.node,
      state: state,
      tone: "cold"
    });
    // Attach text onto intent for GuidePolicy nonsense detection
    var intent = {
      id: classified.id,
      text: row.text,
      score: classified.score,
      detail: classified.detail
    };

    var decision = GuidePolicy.decide({
      intent: intent,
      text: row.text,
      node: scene.node,
      sceneGoal: goal,
      state: state,
      missCount: state.guideMissCount,
      tone: "cold"
    });

    if (!decision) {
      results.push({
        cat: row.cat,
        text: row.text,
        intentGot: intent.id,
        expectIntent: row.expectIntent,
        advance: false,
        reply: null,
        strategy: null,
        score: {
          pass: false,
          fails: ["no_decision"],
          warns: [],
          human: 0,
          note: "GuidePolicy returned null"
        }
      });
      continue;
    }

    if (typeof GuidePolicy.applyMissToState === "function") {
      GuidePolicy.applyMissToState(state, decision);
    }

    var reply = decision.reply;
    if (reply) {
      state.recentBotReplies = (state.recentBotReplies || []).concat([reply]).slice(-12);
      state.chatBotLines = (state.chatBotLines || []).concat([reply]).slice(-50);
    }
    state.chatUserLines = (state.chatUserLines || []).concat([row.text]).slice(-50);

    // After success advance, reset miss for next battery item (new "attempt")
    if (decision.advance) {
      state.guideMissCount = 0;
    }

    var scored = scoreTurn({
      reply: reply,
      goal: goal,
      cat: row.cat,
      advance: decision.advance,
      recentBotReplies: (state.recentBotReplies || []).slice(0, -1) // prior only
    });

    // Soft intent expectation check (warn only — soft-pass is intentional)
    if (row.expectIntent && intent.id !== row.expectIntent && !decision.advance) {
      // If we expected success but didn't advance, that's a real miss for success paraphrases
      if (row.cat === "success") {
        scored.warns.push("intent_mismatch_want_" + row.expectIntent + "_got_" + intent.id);
        scored.human = Math.max(0, scored.human - 10);
        // success paraphrase that didn't classify/advance → fail steer path already; mark intent fail
        if (!decision.advance) {
          scored.fails.push("success_no_advance");
          scored.pass = false;
          scored.note = scored.fails.join(",");
        }
      } else {
        scored.warns.push("intent_mismatch_want_" + row.expectIntent + "_got_" + intent.id);
      }
    }
    if (row.cat === "success" && row.expectIntent && intent.id === row.expectIntent && !decision.advance) {
      // classified OK but goal didn't treat as success (intent not in successIntents — shouldn't happen)
      scored.fails.push("classified_ok_but_no_advance");
      scored.pass = false;
      scored.note = scored.fails.join(",");
    }

    results.push({
      cat: row.cat,
      text: row.text,
      intentGot: intent.id,
      expectIntent: row.expectIntent,
      advance: !!decision.advance,
      reply: reply,
      strategy: decision.strategy,
      missCount: decision.missCount,
      score: scored
    });
  }

  return results;
}

function summarize(all) {
  var pass = 0;
  var fail = 0;
  var warnTurns = 0;
  var humanSum = 0;
  var failByNode = {};
  var failReasons = {};

  all.forEach(function (block) {
    block.results.forEach(function (r) {
      humanSum += r.score.human;
      if (r.score.pass) {
        pass++;
        if (r.score.warns && r.score.warns.length) warnTurns++;
      } else {
        fail++;
        var key = block.char + "/" + block.id;
        failByNode[key] = (failByNode[key] || 0) + 1;
        (r.score.fails || []).forEach(function (f) {
          failReasons[f] = (failReasons[f] || 0) + 1;
        });
      }
    });
  });

  var total = pass + fail;
  return {
    pass: pass,
    fail: fail,
    total: total,
    warnTurns: warnTurns,
    humanAvg: total ? Math.round((humanSum / total) * 10) / 10 : 0,
    failByNode: failByNode,
    failReasons: failReasons
  };
}

function renderMarkdown(all, summary, meta) {
  var lines = [];
  lines.push("# Fake-AI auto-playtest");
  lines.push("");
  lines.push("- When: **" + meta.when + "**");
  lines.push("- Seed: `" + meta.seed + "`");
  lines.push("- Engines: IntentEngine `" + (IntentEngine.version || "?") + "` · GuidePolicy `" + (GuidePolicy.version || "?") + "` · GuideLines `" + (GuideLines.version || "?") + "`");
  lines.push("- Result: **" + summary.pass + " PASS** / **" + summary.fail + " FAIL** / " + summary.total + " turns · human-avg **" + summary.humanAvg + "** · warn-turns " + summary.warnTurns);
  lines.push("");
  lines.push("## Fail reasons");
  lines.push("");
  var reasons = Object.keys(summary.failReasons);
  if (!reasons.length) {
    lines.push("_none_");
  } else {
    reasons.sort(function (a, b) {
      return summary.failReasons[b] - summary.failReasons[a];
    });
    reasons.forEach(function (r) {
      lines.push("- `" + r + "`: " + summary.failReasons[r]);
    });
  }
  lines.push("");
  lines.push("## Nodes with systematic fails");
  lines.push("");
  var nodes = Object.keys(summary.failByNode);
  if (!nodes.length) {
    lines.push("_none_");
  } else {
    nodes.sort(function (a, b) {
      return summary.failByNode[b] - summary.failByNode[a];
    });
    nodes.forEach(function (n) {
      lines.push("- **" + n + "**: " + summary.failByNode[n] + " fails");
    });
  }
  lines.push("");
  lines.push("## Per-scene turns");
  lines.push("");

  all.forEach(function (block) {
    lines.push("### " + block.char + " / `" + block.id + "` — " + block.label);
    lines.push("");
    lines.push("| Result | Cat | Input | Intent | Strat | Human | Reply / note |");
    lines.push("|---|---|---|---|---|---|---|");
    block.results.forEach(function (r) {
      var mark = r.score.pass ? (r.score.warns.length ? "WARN" : "PASS") : "FAIL";
      var replyShow = r.advance
        ? "_(advance)_"
        : JSON.stringify(r.reply || "").slice(0, 80);
      var note = r.score.note || "";
      lines.push(
        "| " +
          mark +
          " | " +
          r.cat +
          " | " +
          JSON.stringify(r.text) +
          " | `" +
          r.intentGot +
          "`" +
          (r.expectIntent ? " (want `" + r.expectIntent + "`)" : "") +
          " | " +
          (r.strategy || (r.advance ? "close" : "—")) +
          " | " +
          r.score.human +
          " | " +
          replyShow +
          (note && mark !== "PASS" ? " · " + note : "") +
          " |"
      );
    });
    lines.push("");
  });

  lines.push("## How to run");
  lines.push("");
  lines.push("```bash");
  lines.push("node tools/auto-playtest.js");
  lines.push("node tools/auto-playtest.js --seed=7 --chars=alex");
  lines.push("node tools/auto-playtest.js --strict   # exit 1 if any FAIL");
  lines.push("```");
  lines.push("");
  lines.push("Local heuristics only — no paid LLM judge. Does not touch live play path.");
  lines.push("");
  return lines.join("\n");
}

function main() {
  var want = CHAR_FILTER.split(",").map(function (s) {
    return s.trim();
  }).filter(Boolean);
  var all = [];
  want.forEach(function (name) {
    var ch = loadChar(name);
    if (!ch) {
      console.error("skip missing data/" + name + ".json");
      return;
    }
    pickScenes(ch).forEach(function (scene) {
      all.push({
        char: scene.char,
        id: scene.id,
        label: scene.label,
        results: runScene(scene)
      });
    });
  });

  var summary = summarize(all);
  var when = new Date().toLocaleString("en-CA", {
    timeZone: "Asia/Hong_Kong",
    hour12: false
  }).replace(",", "") + " HKT";
  var md = renderMarkdown(all, summary, { when: when, seed: SEED });
  fs.writeFileSync(OUT_MD, md, "utf8");
  console.log(md);

  // STATUS snippet for operators
  console.log("\n--- STATUS snippet ---");
  console.log(
    when +
      "：auto-playtest " +
      summary.pass +
      "P/" +
      summary.fail +
      "F/" +
      summary.total +
      " · human-avg " +
      summary.humanAvg +
      " · see tools/PLAYTEST-LAST.md"
  );

  if (STRICT && summary.fail > 0) process.exit(1);
}

main();

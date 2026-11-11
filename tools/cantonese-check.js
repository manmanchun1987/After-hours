#!/usr/bin/env node
"use strict";

/**
 * Player-visible spoken-Hong-Kong lint.
 * Scope matches CANTONESE.md and the 2026-11-11 audit §1.
 * Patterns match audit §4. Does not flag every 卻 or 那, and does not
 * scan intent matcher keys, code identifiers, or file ids.
 */

var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");

var ZAI_OK = ["心不在焉", "現在", "實在", "存在", "在意", "在乎", "在場", "正在", "好在", "在於"];
var BA_OK = ["門把", "把手", "把握", "一把", "把關", "把風"];
var ZHE_OK = ["着數", "着火", "着地", "着緊", "着涼"];
var CAI_ONLY = ["才離開", "才剛", "才鬆", "才開"];
var SIMPLE = ["却", "解开", "松开", "拉开", "摊开", "额头", "轻轻", "握着"];
var PHRASES = [
  "還在", "却還", "說完", "直說", "說下去", "給唔給", "給你",
  "很久", "很重", "喝完", "站好", "站定", "別用", "坐進",
  "係誰", "有野", "騎在", "兩邊都喘"
];

function covered(s, i, ch, compounds) {
  for (var c = 0; c < compounds.length; c++) {
    var word = compounds[c];
    var from = 0;
    var at = word.indexOf(ch, from);
    while (at !== -1) {
      var start = i - at;
      if (start >= 0 && s.slice(start, start + word.length) === word) return true;
      from = at + 1;
      at = word.indexOf(ch, from);
    }
  }
  return false;
}

function wholeWord(s, word) {
  var hits = [];
  var from = 0;
  var at = s.indexOf(word, from);
  while (at !== -1) {
    var before = at === 0 ? "" : s.charAt(at - 1);
    var after = s.charAt(at + word.length);
    var beforeOk = !before || !/[A-Za-z]/.test(before);
    var afterOk = !after || !/[A-Za-z]/.test(after);
    if (beforeOk && afterOk) hits.push({ name: word, index: at });
    from = at + word.length;
    at = s.indexOf(word, from);
  }
  return hits;
}

function lintString(s) {
  var hits = [];
  if (!s) return hits;
  var i;
  for (i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (ch === "在" && !covered(s, i, "在", ZAI_OK)) hits.push({ name: "在", index: i });
    else if (ch === "把" && !covered(s, i, "把", BA_OK)) hits.push({ name: "把", index: i });
    else if (ch === "着" && !covered(s, i, "着", ZHE_OK)) hits.push({ name: "着", index: i });
    else if (ch === "擇" || ch === "择") hits.push({ name: "擇", index: i });
  }
  if (s.indexOf("自已") >= 0) hits.push({ name: "自已", index: s.indexOf("自已") });
  if (s.indexOf("升級") >= 0) hits.push({ name: "升級", index: s.indexOf("升級") });
  if (s.indexOf("升级") >= 0) hits.push({ name: "升級", index: s.indexOf("升级") });
  SIMPLE.forEach(function (w) {
    var at = s.indexOf(w);
    if (at >= 0) hits.push({ name: w, index: at });
  });
  CAI_ONLY.forEach(function (w) {
    var at = s.indexOf(w);
    if (at >= 0) hits.push({ name: w, index: at });
  });
  PHRASES.forEach(function (w) {
    var at = s.indexOf(w);
    if (at >= 0) hits.push({ name: w, index: at });
  });
  wholeWord(s, "Sam").forEach(function (h) { hits.push(h); });
  wholeWord(s, "Morgan").forEach(function (h) { hits.push(h); });
  return hits;
}

function snippet(s, index) {
  var a = Math.max(0, index - 10);
  var b = Math.min(s.length, index + 12);
  return s.slice(a, b).replace(/\n/g, "↵");
}

function pushHits(fails, where, s) {
  var hits = lintString(s);
  var seen = {};
  hits.forEach(function (h) {
    var key = h.name + "@" + h.index;
    if (seen[key]) return;
    seen[key] = 1;
    fails.push(where + " [" + h.name + "] …" + snippet(s, h.index) + "…");
  });
  return hits.length;
}

function walkStrings(node, loc, visit) {
  if (typeof node === "string") visit(loc, node);
  else if (Array.isArray(node)) node.forEach(function (x, i) { walkStrings(x, loc + "[" + i + "]", visit); });
  else if (node && typeof node === "object") {
    Object.keys(node).forEach(function (k) {
      walkStrings(node[k], loc ? loc + "." + k : k, visit);
    });
  }
}

function scanStory(file, data, fails) {
  var n = 0;
  ["title", "hook", "name", "chatName"].forEach(function (k) {
    if (typeof data[k] === "string") {
      n++;
      pushHits(fails, file + " " + k, data[k]);
    }
  });
  if (data.memoryLabels) {
    walkStrings(data.memoryLabels, "memoryLabels", function (loc, s) {
      n++;
      pushHits(fails, file + " " + loc, s);
    });
  }
  if (data.phone) {
    walkStrings(data.phone, "phone", function (loc, s) {
      n++;
      pushHits(fails, file + " " + loc, s);
    });
  }
  var nodes = data.nodes || {};
  Object.keys(nodes).forEach(function (id) {
    var node = nodes[id];
    if (!node || typeof node !== "object") return;
    ["text", "thought", "aside", "label", "endingTitle", "mid"].forEach(function (k) {
      if (typeof node[k] === "string") {
        n++;
        pushHits(fails, file + " nodes." + id + "." + k, node[k]);
      }
    });
    (node.choices || []).forEach(function (ch, i) {
      if (ch && typeof ch.label === "string") {
        n++;
        pushHits(fails, file + " nodes." + id + ".choices[" + i + "].label", ch.label);
      }
    });
    (node.intents || []).forEach(function (intent, i) {
      if (intent && typeof intent.ack === "string") {
        n++;
        pushHits(fails, file + " nodes." + id + ".intents[" + i + "].ack", intent.ack);
      }
    });
    var goal = node.sceneGoal;
    if (goal && typeof goal.ask === "string") {
      n++;
      pushHits(fails, file + " nodes." + id + ".sceneGoal.ask", goal.ask);
    }
    if (goal && goal.hints) {
      walkStrings(goal.hints, "nodes." + id + ".sceneGoal.hints", function (loc, s) {
        n++;
        pushHits(fails, file + " " + loc, s);
      });
    }
  });
  return n;
}

function lineAt(src, index) {
  var line = 1;
  for (var i = 0; i < index && i < src.length; i++) if (src.charAt(i) === "\n") line++;
  return line;
}

function extractStrings(src) {
  var out = [];
  var i = 0;
  while (i < src.length) {
    var c = src.charAt(i);
    if (c === "/" && src.charAt(i + 1) === "/") {
      while (i < src.length && src.charAt(i) !== "\n") i++;
      continue;
    }
    if (c === "/" && src.charAt(i + 1) === "*") {
      i += 2;
      while (i < src.length && !(src.charAt(i) === "*" && src.charAt(i + 1) === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      var q = c;
      var start = i;
      i++;
      var s = "";
      while (i < src.length) {
        if (src.charAt(i) === "\\") {
          var n = src.charAt(i + 1);
          if (n === "n") s += "\n";
          else if (n === "t") s += "\t";
          else if (n === "r") s += "\r";
          else s += n;
          i += 2;
          continue;
        }
        if (q === "`" && src.charAt(i) === "$" && src.charAt(i + 1) === "{") {
          i += 2;
          var depth = 1;
          while (i < src.length && depth) {
            if (src.charAt(i) === "{") depth++;
            else if (src.charAt(i) === "}") depth--;
            if (depth) i++;
            else i++;
          }
          continue;
        }
        if (src.charAt(i) === q) {
          i++;
          break;
        }
        s += src.charAt(i);
        i++;
      }
      out.push({ index: start, line: lineAt(src, start), text: s });
      continue;
    }
    i++;
  }
  return out;
}

function labeledArrayRanges(src, label) {
  var ranges = [];
  var re = new RegExp(label + "\\s*:\\s*\\[", "g");
  var m;
  while ((m = re.exec(src))) {
    var i = m.index + m[0].length;
    var depth = 1;
    var inStr = null;
    while (i < src.length && depth) {
      var c = src.charAt(i);
      if (inStr) {
        if (c === "\\") { i += 2; continue; }
        if (c === inStr) inStr = null;
        i++;
        continue;
      }
      if (c === "/" && src.charAt(i + 1) === "/") {
        while (i < src.length && src.charAt(i) !== "\n") i++;
        continue;
      }
      if (c === "/" && src.charAt(i + 1) === "*") {
        i += 2;
        while (i < src.length && !(src.charAt(i) === "*" && src.charAt(i + 1) === "/")) i++;
        i += 2;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { inStr = c; i++; continue; }
      if (c === "[") depth++;
      else if (c === "]") depth--;
      i++;
    }
    ranges.push([m.index, i]);
  }
  return ranges;
}

function callRanges(src, name) {
  var ranges = [];
  var re = new RegExp(name + "\\s*\\(", "g");
  var m;
  while ((m = re.exec(src))) {
    var i = m.index + m[0].length;
    var depth = 1;
    var inStr = null;
    while (i < src.length && depth) {
      var c = src.charAt(i);
      if (inStr) {
        if (c === "\\") { i += 2; continue; }
        if (c === inStr) inStr = null;
        i++;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { inStr = c; i++; continue; }
      if (c === "(") depth++;
      else if (c === ")") depth--;
      i++;
    }
    ranges.push([m.index, i]);
  }
  return ranges;
}

function inRanges(index, ranges) {
  for (var i = 0; i < ranges.length; i++) {
    if (index >= ranges[i][0] && index < ranges[i][1]) return true;
  }
  return false;
}

function scanJsStrings(file, src, fails, skipRanges) {
  var n = 0;
  extractStrings(src).forEach(function (item) {
    if (skipRanges && inRanges(item.index, skipRanges)) return;
    if (!/[\u4e00-\u9fff]/.test(item.text)) return;
    n++;
    pushHits(fails, file + ":" + item.line, item.text);
  });
  return n;
}

function scanHtml(file, src, fails) {
  var masked = src
    .replace(/<!--[\s\S]*?-->/g, function (m) { return m.replace(/[^\n]/g, " "); })
    .replace(/<script[\s\S]*?<\/script>/gi, function (m) { return m.replace(/[^\n]/g, " "); })
    .replace(/<style[\s\S]*?<\/style>/gi, function (m) { return m.replace(/[^\n]/g, " "); });
  var n = 0;
  function take(index, s) {
    if (!s || !/[\u4e00-\u9fff]/.test(s)) return;
    n++;
    pushHits(fails, file + ":" + lineAt(masked, index), s);
  }
  var attr = /\b(?:placeholder|aria-label|alt|title)\s*=\s*"([^"]*)"/g;
  var m;
  while ((m = attr.exec(masked))) take(m.index, m[1]);
  var text = />([^<]+)</g;
  while ((m = text.exec(masked))) take(m.index + 1, m[1]);
  return n;
}

function selfTest() {
  var bad = ["騎在你腿上", "把你手", "你擇", "選擇角色", "自已", "叫 Sam。", "Morgan。", "升級前", "却還握著", "握着", "才鬆", "才剛開始", "兩邊都喘", "說完", "直說", "有野", "坐進"];
  var good = ["門把就喺度", "現在", "實在", "心不在焉", "在意", "把手", "一把", "把握", "Sammi", "Elise", "人才", "她係邊個", "那一下", "視線卻落", "着數", "……門把就喺度。你推，定停？"];
  var fails = [];
  bad.forEach(function (s) {
    if (!lintString(s).length) fails.push("self-test missed " + s);
  });
  good.forEach(function (s) {
    var h = lintString(s);
    if (h.length) fails.push("self-test false positive " + s + " " + h.map(function (x) { return x.name; }).join(","));
  });
  return fails;
}

function run() {
  var fails = selfTest();
  var scanned = 0;
  ["data/alex.json", "data/morgan.json", "data/sam.json", "data/alex.mobile-safe.json"].forEach(function (rel) {
    var data = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
    scanned += scanStory(rel, data, fails);
  });
  var app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  var skip = []
    .concat(labeledArrayRanges(app, "keys"))
    .concat(labeledArrayRanges(app, "revealKeys"))
    .concat(callRanges(app, "unlockFreeChatChoices"));
  scanned += scanJsStrings("app.js", app, fails, skip);
  scanned += scanJsStrings("guide-lines.js", fs.readFileSync(path.join(ROOT, "guide-lines.js"), "utf8"), fails, null);
  scanned += scanHtml("index.html", fs.readFileSync(path.join(ROOT, "index.html"), "utf8"), fails);
  scanned += scanHtml("m.html", fs.readFileSync(path.join(ROOT, "m.html"), "utf8"), fails);
  return { fails: fails, scanned: scanned };
}

if (require.main === module) {
  var result = run();
  if (result.fails.length) {
    console.error("cantonese-check FAIL (" + result.fails.length + ")\n" + result.fails.join("\n"));
    process.exit(1);
  }
  console.log("cantonese-check PASS (" + result.scanned + " player-visible strings)");
}

module.exports = { run: run, lintString: lintString };

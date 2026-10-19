(function () {
  "use strict";
  var STAMP = "t8-0114";
  var MISS_THRESHOLD = 2;
  var missCount = 0;
  var choicesEl = null;
  var YES_WORDS = /^(好|係|得|ok|yes|得啦|好呀|繼續)$/i;

  function getChoices() {
    if (!choicesEl) choicesEl = document.getElementById("choices");
    return choicesEl;
  }

  function hideChoices() {
    var el = getChoices();
    if (!el) return;
    if (!el.classList.contains("freechat-hidden")) el.classList.add("freechat-hidden");
    if (el.style.display !== "none") el.style.display = "none";
  }

  function showChoicesIfReady() {
    var el = getChoices();
    if (!el || missCount < MISS_THRESHOLD) return;
    if (el.classList.contains("freechat-hidden")) el.classList.remove("freechat-hidden");
    if (el.style.display === "none") el.style.display = "";
  }

  function isOwnerPlaytest(text) {
    if (!text) return false;
    var t = String(text).toLowerCase();
    return t.indexOf("#pt") >= 0 || t.indexOf("playtest") >= 0 ||
           /\u4f60\u60f3\u6211\u9ede|\u63a8\u9580|\u505c\u4e00\u505c|\u4eca\u65e5\u5929\u6c23|\u4f60\u8a18\u5f97/.test(t);
  }

  function isYesWord(text) {
    if (!text) return false;
    return YES_WORDS.test(String(text).trim());
  }

  function wrapIfPresent(name, after) {
    if (typeof window[name] === "function" && !window[name]._chatGuideWrapped) {
      var orig = window[name];
      window[name] = function () {
        var r = orig.apply(this, arguments);
        if (typeof after === "function") after();
        return r;
      };
      window[name]._chatGuideWrapped = true;
    }
  }

  function tryWrap() {
    wrapIfPresent("renderNode", hideChoices);
    wrapIfPresent("goToNode", function () { missCount = 0; hideChoices(); });
    wrapIfPresent("applyFreeChatAdvance", function () { missCount = 0; hideChoices(); });
  }

  function init() {
    hideChoices();
    tryWrap();

    document.addEventListener("freechat:advance", function () {
      missCount = 0;
      hideChoices();
    });
    document.addEventListener("freechat:miss", function (ev) {
      var text = ev && ev.detail && ev.detail.text;
      if (isOwnerPlaytest(text) || isYesWord(text)) return;
      missCount += 1;
      showChoicesIfReady();
    });

    var el = getChoices();
    if (el && window.MutationObserver) {
      var obsBusy = false;
      var obs = new MutationObserver(function () {
        if (obsBusy) return;
        if (missCount >= MISS_THRESHOLD) return;
        var cur = getChoices();
        if (!cur) return;
        if (cur.classList.contains("freechat-hidden") && cur.style.display === "none") return;
        obsBusy = true;
        obs.disconnect();
        try {
          hideChoices();
        } finally {
          obsBusy = false;
          try {
            obs.observe(cur, { attributes: true, attributeFilter: ["class", "style"] });
          } catch (e) {}
        }
      });
      obs.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    }

    var n = 0;
    var t = setInterval(function () {
      tryWrap();
      if (++n > 40) clearInterval(t);
    }, 250);

    console.log("[chat-guide] " + STAMP + " CHAT-FIRST: hide after advance, reveal only after " + MISS_THRESHOLD + " misses. Yes-words (\u597d \u4fc2 \u5f97 \u7e7c\u7e8c) non-miss heat intact. Owner quiet. Poll wrap.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

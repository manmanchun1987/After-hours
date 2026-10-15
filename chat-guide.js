(function () {
  "use strict";
  var STAMP = "t4-entryfix3";
  var MISS_THRESHOLD = 2;
  var missCount = 0;
  var choicesEl = null;

  function getChoices() {
    if (!choicesEl) choicesEl = document.getElementById("choices");
    return choicesEl;
  }

  function hideChoices() {
    var el = getChoices();
    if (!el) return;
    // Chrome fires a class mutation even when the token is already present.
    // Writing again from the observer retriggers it and wedges the main thread
    // before #screen-play can paint. Only write when the value actually changes.
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

  function wrapIfPresent(name, after) {
    if (typeof window[name] === "function") {
      var orig = window[name];
      window[name] = function () {
        var r = orig.apply(this, arguments);
        if (typeof after === "function") after();
        return r;
      };
    }
  }

  function init() {
    hideChoices();
    wrapIfPresent("renderNode", hideChoices);
    wrapIfPresent("goToNode", function () { missCount = 0; hideChoices(); });
    wrapIfPresent("applyFreeChatAdvance", function () { missCount = 0; hideChoices(); });

    document.addEventListener("freechat:advance", function () {
      missCount = 0;
      hideChoices();
    });
    document.addEventListener("freechat:miss", function (ev) {
      var text = ev && ev.detail && ev.detail.text;
      if (isOwnerPlaytest(text)) return;
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
        // already hidden — do not write class/style (that re-enters this observer)
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

    console.log("[chat-guide] " + STAMP + " CHAT-FIRST: hide after advance, reveal only after " + MISS_THRESHOLD + " misses. Yes-words (\u597d \u4fc2 \u5f97) heat intact. Owner quiet.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

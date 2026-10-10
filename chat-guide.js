(function () {
  "use strict";
  var STAMP = "t3-0716";
  var MISS_THRESHOLD = 2;
  var missCount = 0;
  var choicesEl = null;

  function getChoices() {
    if (!choicesEl) choicesEl = document.getElementById("choices");
    return choicesEl;
  }

  function hideChoices() {
    var el = getChoices();
    if (el) {
      el.classList.add("freechat-hidden");
      el.style.display = "none";
    }
  }

  function showChoicesIfReady() {
    var el = getChoices();
    if (el && missCount >= MISS_THRESHOLD) {
      el.classList.remove("freechat-hidden");
      el.style.display = "";
    }
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
      var obs = new MutationObserver(function () {
        if (missCount < MISS_THRESHOLD) hideChoices();
      });
      obs.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    }

    console.log("[chat-guide] " + STAMP + " CHAT-FIRST: hide after advance, reveal only after " + MISS_THRESHOLD + " misses. Yes-words heat intact. Owner quiet.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

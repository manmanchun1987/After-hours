(function () {
  "use strict";
  var STAMP = "colloq-guide-20261022";
  var MISS_THRESHOLD = 2;
  var missCount = 0;
  var choicesEl = null;
  var YES_WORDS = /^(好|好呀|好啊|好啦|係|係呀|係啦|得|得啦|得嘅|ok|okay|ok lah|yes|yeah|sure|繼續|繼續啦|應承|我應承)$/i;

  function getChoices() {
    if (!choicesEl) choicesEl = document.getElementById("choices");
    return choicesEl;
  }

  function currentNode() {
    try {
      var st = window.state;
      if (!st || !st.story || !st.story.nodes || !st.nodeId) return null;
      return st.story.nodes[st.nodeId] || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * CHAT-FIRST absolute (CEO 2026-10-23): never show #choices / gold MC buttons.
   * Choice JSON still drives intent fallback next-targets; advance via chat only.
   * Prior rule that showed choices on non-freeChat beats is revoked.
   */
  function shouldHideChoices() {
    return true;
  }

  function hideChoices() {
    var el = getChoices();
    if (!el) return;
    if (!el.classList.contains("freechat-hidden")) el.classList.add("freechat-hidden");
    if (el.style.display !== "none") el.style.display = "none";
    var zone = document.getElementById("action-zone");
    if (zone && zone.style.display !== "none") zone.style.display = "none";
  }

  function showChoices() {
    /* Revoked: never reveal gold buttons on play. */
    hideChoices();
  }

  function syncChoices() {
    hideChoices();
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
    wrapIfPresent("renderNode", syncChoices);
    wrapIfPresent("goToNode", function () {
      missCount = 0;
      syncChoices();
    });
    wrapIfPresent("applyFreeChatAdvance", function () {
      missCount = 0;
      syncChoices();
    });
    wrapIfPresent("unlockFreeChatChoices", function () {
      syncChoices();
    });
    wrapIfPresent("setChoicesDeferred", function () {
      syncChoices();
    });
  }

  function init() {
    syncChoices();
    tryWrap();

    document.addEventListener("freechat:advance", function () {
      missCount = 0;
      syncChoices();
    });
    document.addEventListener("freechat:miss", function (ev) {
      var text = ev && ev.detail && ev.detail.text;
      if (isOwnerPlaytest(text) || isYesWord(text)) return;
      missCount += 1;
      syncChoices();
    });

    // Fallback miss count: freeChat chat submits that are not yes-words / owner playtests.
    document.addEventListener(
      "submit",
      function (ev) {
        var form = ev.target;
        if (!form || form.id !== "chat-form") return;
        var node = currentNode();
        if (!node || !node.freeChat) return;
        try {
          if (window.state && window.state.freeChatChoicesVisible) return;
        } catch (e) {}
        var input = document.getElementById("chat-input");
        var text = input ? input.value : "";
        if (isOwnerPlaytest(text) || isYesWord(text)) return;
        // Defer so app handleChatSubmit can unlock first; then re-sync.
        setTimeout(function () {
          try {
            if (window.state && window.state.freeChatChoicesVisible) {
              syncChoices();
              return;
            }
          } catch (e) {}
          missCount += 1;
          syncChoices();
        }, 50);
      },
      true
    );

    var el = getChoices();
    if (el && window.MutationObserver) {
      var obsBusy = false;
      var obs = new MutationObserver(function () {
        if (obsBusy) return;
        var cur = getChoices();
        if (!cur) return;
        var wantHide = shouldHideChoices();
        var isHidden =
          cur.classList.contains("freechat-hidden") && cur.style.display === "none";
        if (wantHide === isHidden) return;
        obsBusy = true;
        obs.disconnect();
        try {
          syncChoices();
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
      syncChoices();
      if (++n > 40) clearInterval(t);
    }, 250);

    console.log(
      "[chat-guide] " +
        STAMP +
        " CHAT-FIRST absolute: never show #choices; advance via chat+intent. Yes-words heat intact."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

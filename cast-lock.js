/* load after app.js */
(function () {
  if (typeof CAST_VOICE !== "undefined") {
    if (CAST_VOICE.sam) {
      CAST_VOICE.sam.name = "Sammi";
      CAST_VOICE.sam.toast = "Sammi 傳咗訊息";
    }
    if (CAST_VOICE.morgan) {
      CAST_VOICE.morgan.name = "Elise";
      CAST_VOICE.morgan.toast = "Elise 傳咗訊息";
    }
  }
  if (typeof portraitSrc === "function") {
    portraitSrc = function (story) {
      if (story && story.portrait && String(story.portrait).indexOf("stills/") >= 0) return story.portrait;
      var id = (story && story.id) || (typeof state !== "undefined" && state.storyId) || "alex";
      if (id === "sam") return "./assets/stills/vera-01.jpg?v=3";
      if (id === "morgan") return "./assets/stills/vera-02.jpg?v=3";
      return "./assets/stills/vera-03.jpg?v=3";
    };
  }
})();

(function () {
  var STORE = "AH_LLM_KEY";
  function key() { try { return localStorage.getItem(STORE) || ""; } catch (e) { return ""; } }
  function setKey(v) { try { if (v) localStorage.setItem(STORE, v); else localStorage.removeItem(STORE); } catch (e) {} }
  function node() {
    return (typeof state !== "undefined" && state.story && state.story.nodes && state.story.nodes[state.nodeId]) || null;
  }
  function who() {
    if (typeof state !== "undefined" && state.story) return state.story.chatName || state.story.name || "Vera";
    return "Vera";
  }
  function poles(n) {
    if (!n || !n.intents) return [];
    return n.intents.map(function (it) { return (it.keys && it.keys[0]) || ""; }).filter(Boolean);
  }
  function findIntent(tag) {
    var n = node();
    if (!n || !n.intents || !tag) return null;
    var t = String(tag);
    var i, it, k;
    for (i = 0; i < n.intents.length; i++) {
      it = n.intents[i];
      for (k = 0; k < (it.keys || []).length; k++) {
        if (t.indexOf(it.keys[k]) >= 0 || String(it.keys[k]).indexOf(t) >= 0) return it;
      }
    }
    return null;
  }
  function paintGate() {
    var card = document.querySelector(".gate-card");
    if (!card || document.getElementById("llm-key")) return;
    var lab = document.createElement("p");
    lab.className = "fine";
    lab.textContent = "可選：貼 OpenRouter 免費 key，對白會跟住你講。空白=假 AI。Key 只留喺呢部機。";
    var inp = document.createElement("input");
    inp.id = "llm-key";
    inp.type = "password";
    inp.autocomplete = "off";
    inp.placeholder = "sk-or-...";
    inp.value = key();
    inp.style.cssText = "width:100%;margin:.35rem 0;padding:.45rem;background:#111;color:#ddd;border:1px solid #333;border-radius:6px";
    inp.addEventListener("change", function () { setKey(inp.value.trim()); });
    card.appendChild(lab);
    card.appendChild(inp);
  }
  async function askModel(userText) {
    var n = node();
    var sys = "你係" + who() + "。只用香港口語廣東話，短句。玩家係未走得嘅下屬。\n而家場面：" + (n && n.text ? n.text : "") + "\n可選推進標籤：" + poles(n).join(" / ") + "\n只回 JSON：{\"reply\":\":廣東話一句\",\"tag\":\"標籤或空\"} 唔好字幕。tag 必須係上面其中一個，或空。";
    var res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key(),
        "HTTP-Referer": location.origin,
        "X-Title": "After Hours"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        temperature: 0.6,
        messages: [{ role: "system", content: sys }, { role: "user", content: userText }]
      })
    });
    if (!res.ok) throw new Error(res.status);
    var data = await res.json();
    var raw = (((data || {}).choices || [])[0] || {}).message || {};
    raw = String(raw.content || "");
    var json = null;
    try { json = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch (e) {
      var m = raw.match(/\{[\s\S]*\}/);
      if (m) try { json = JSON.parse(m[0]); } catch (e2) {}
    }
    return json || { reply: raw.slice(0, 80), tag: "" };
  }
  function bindForm() {
    var form = document.getElementById("chat-form");
    if (!form || form.dataset.llm === "1") return;
    form.dataset.llm = "1";
    form.addEventListener("submit", function (e) {
      if (!key()) return;
      var input = document.getElementById("chat-input");
      var text = input ? String(input.value || "").trim() : "";
      if (!text) return;
      e.preventDefault();
      e.stopPropagation();
      if (input) input.value = "";
      if (typeof appendChat === "function") appendChat("user", text);
      if (typeof setChatTyping === "function") setChatTyping(true);
      askModel(text).then(function (out) {
        if (typeof setChatTyping === "function") setChatTyping(false);
        var reply = (out && out.reply) || "…講。";
        var it = findIntent(out && out.tag);
        if (typeof appendChat === "function") appendChat("alex", reply);
        if (it && it.next && typeof applyFreeChatAdvance === "function") {
          it.ack = reply;
          applyFreeChatAdvance(it);
        }
      }).catch(function () {
        if (typeof setChatTyping === "function") setChatTyping(false);
        if (typeof handleChatSubmit === "function") handleChatSubmit(text);
        else if (typeof appendChat === "function") appendChat("alex", "線不穩。用回假 AI。");
      });
    }, true);
  }
  function ready() {
    paintGate();
    bindForm();
    setInterval(bindForm, 1000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();

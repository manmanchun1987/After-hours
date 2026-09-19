# QUALITY bar

Read TASTE.md · CAST.lock.md · AUTOMATION.md.

Every hour score pillars STORY / PICTURE / SOUND / FEEL 1–5.
Write tickets for the lowest pillar first, then the next, max 5.
**If INTENT tickets (DISPATCH T1–T5) are open → hourly MUST thicken intent; never monitor-only.** If INTENT closed AND all pillars ≥4 AND no other tickets → monitor regressions only; do not invent chase tickets.

Must still: CAST.lock, chat-first, scene ids, audible+visible advance, BGM on enter, Safari, Cantonese.

## Intent > pool matching (北辰)
**成功 KPI：意圖體感接近真 AI ＞ 加劇情／畫面／音效刷分。**
- 對白主路徑 = 本地 `IntentEngine`（結構化意圖 → 行為 → 回覆材料）
- **禁止**再開「加 yes-words／keys 對池」類 ticket；新票只准：加意圖、場景規則、回覆材料
- `chat-guide` 可留 miss／藏 choices，但**推進必須以意圖結果為準**，唔好覆蓋 IntentEngine
- OpenRouter／API key＝可選，唔係預設；**唔好催用戶貼 key**

## Live gate
- 硬刷 `?v=intent1`（或而家最新 intent cache）驗收：
  1. 「你想我點？」→ `ask_want`
  2. 「推門」／「入去」→ `enter_door`（可推進）
  3. 離題天氣 → `off_topic`（入戲擋＋升級，唔客服腔）

## Never
Imagine faces · **CDN pin／stub `app.js`（jsDelivr 鎖舊版）** · stolen Live2D · user upload · silent jumps · Ken Burns as soul · hotlink random CDNs for engine

## Ideas gate
Hourly may propose ≤3 ideas into `IDEAS.md` as `proposed` only.
No code / no build tickets until `approved` (user or CEO).
Ideas must serve intent-feels-like-AI; else `rejected`.
Banned→rejected: CDN pin/stub app.js, yes-words/key pools, nag OpenRouter, Vera lock look, out-of-scope rewrites.
While DISPATCH T1–T5 open: build those first; ideas may be written in parallel but must not steal build slots.

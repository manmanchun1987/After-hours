# DISPATCH — open tickets

> 每次 run 讀本檔。
> 有 P0 INTENT T1–T5 開票 → 必須做意圖，禁止 monitor-only。

## Open

- **INTENT/GUIDE T-natural-1 (Lane B)**: Rewrite guide-lines HINT/PRESSURE/CALLOUT/THOUGHTS/FALLBACK/CS_BLOCK to clear spoken Cantonese. Each line must make obvious what Vera wants (推門入去 / 停低等等 / 講清楚你想點). Soft cold boss tone OK; ban cryptic poetry. Keep anti-repeat pool size ≥25 each if possible. Bump version stamp. **Nonsense/gibberish** (哈哈哈哈、keyboard smash、單標點、空白意義): classify unclear (唔 promote off_topic); GuidePolicy uses NONSENSE_HINT/PRESSURE/CALLOUT — 聽唔明 + steer to sceneGoal; miss escalate; no CS「請輸入正確選項」.
- **Lane C 暫停寫 data**（AUTOMATION／LANES 2026-10-16）：只讀；sceneGoal 改動走 IDEAS approved。
- **P0 STORY restore** — data/*.json 禁止單節 stub；Lane C 只補 sceneGoal，禁刪 nodes／choices／ending。驗收：alex.json nodes≥20。（已從完整 graphs 復原，仍開作禁区）
- **CODE restore-engine** — Live stub loader without parts。第一票：確保 app.js 完整 + parts (intent-patterns/engine + guide + chat-guide) 載入，禁 stub。（2026-10-21 檢查：live 無 stub，本地載入正常，IntentEngine 存在；保留作監察）

## Closed / done

- Lane A intent42 thicken patterns（ask_want mixed wait hesitation + off_topic mixed enter soft for corridor）。 Cache ?v=intent42。 Real wc=17107。 Soft-pass smoke ok。
- Lane A intent39 thicken patterns（同義加厚 T2 even longer mixed wait+enter fuzzy/typos for CHAT-FIRST soft-pass）。 Cache ?v=intent39。 Real wc=15435。 Soft-pass smoke ok。
- 之前 intent25–intent38 同義加厚進度。
- T3 CODE keep chat-guide hide — 確認成功 typed line 後仍 freechat-hidden，2 miss 先亮；renderNode 唔會 always reveal。

## Scores (monitor)
STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4

無開 INTENT 票時：只監察回歸，禁發明追票。 Ideas 只 proposed。
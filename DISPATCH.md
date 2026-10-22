# DISPATCH — open tickets

> 每次 run 讀本檔。
> 有 P0 INTENT T1–T5 開票 → 必須做意圖，禁止 monitor-only。

## Open

- **auto-playtest gate (FEEL)** — Before claiming FEEL thicken / guide-feel work, run `node tools/auto-playtest.js` and skim `tools/PLAYTEST-LAST.md`. Local heuristics only (用字正確 · 有引導去目標 · 似唔似人). Do not claim FEEL up if corridor + mid-node battery shows systematic `no_goal_steer` / `literary_cryptic` / `cs_tone` fails. Tool only — does not change live play path.

- **P0 STORY restore** — data/*.json 禁止單節 stub；Lane C 只補 sceneGoal，禁刪 nodes／choices／ending。驗收：alex.json nodes≥20。（已從完整 graphs 復原，仍開作禁区）
- **CODE restore-engine** — Live stub loader without parts。第一票：確保 app.js 完整 + parts (intent-patterns/engine + guide + chat-guide) 載入，禁 stub。（2026-10-21 檢查：live 無 stub，本地載入正常，IntentEngine 存在；保留作監察）

## Closed / done

- **fakeai4 pack (2026-10-22 CEO)** INTENT patterns thicken (I-20261021-02/01 + I-20261020-09) ?v=fakeai4；GUIDE goalSteerPhrase from sceneGoal；STORY sceneGoal backfill alex28/morgan22/sam21；FEEL full-history skim chatUserLines+chatBotLines cap 50 (no second brain).
- Lane B T-natural-1: clear spoken Cantonese guide lines + nonsense steer (guide-clear1).
- Lane A intent42 thicken patterns（ask_want mixed wait hesitation + off_topic mixed enter soft for corridor）。 Cache ?v=intent42。 Real wc=17107。 Soft-pass smoke ok。
- Lane A intent39 thicken patterns（同義加厚 T2 even longer mixed wait+enter fuzzy/typos for CHAT-FIRST soft-pass）。 Cache ?v=intent39。 Real wc=15435。 Soft-pass smoke ok。
- 之前 intent25–intent38 同義加厚進度。
- T3 CODE keep chat-guide hide — 確認成功 typed line 後仍 freechat-hidden，2 miss 先亮；renderNode 唔會 always reveal。

## Scores (monitor)
STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4

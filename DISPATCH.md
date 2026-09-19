# DISPATCH

現有空景：office lounge pantry review roof lift

Read AUTOMATION.md before any hourly run.

## Scores
STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4

## Done this hour
- intent1：完整 `app.js`、禁 CDN stub；IntentEngine 骨架
- 憲法寫入北辰 KPI

## Open tickets（lowest first）— **P0 INTENT 必須做；禁止當 0 ticket / monitor-only**

### T1 — 擴意圖＋粵語變體
- **Do:** 加厚 `ask_want`／`enter`／`wait`／`refuse`／`apologize`／`flirt`／`challenge`／`memory`／`unclear`（可再加合理 intent）；粵語同義／句型／語氣；**禁止**整句==key 唯一路徑
- **Acceptance:** 下列變體抽樣各 ≥1 句命中正確意圖（唔靠整句全等）

### T2 — 場景記憶接話
- **Do:** 短窗記住玩家先講過咩；回覆要接返
- **Acceptance:** 先講「我想推門」再問「你想我點／記得我講咩」→ 回覆提到推門／門口，唔當空白上下文

### T3 — anti-repeat
- **Do:** 近 N 句 bot 回覆唔重複
- **Acceptance:** 連續 5 次同類意圖，回覆文字唔出現連續重複同一句

### T4 — 離題入戲升級
- **Do:** 離題一律 Vera 入戲擋；重複離題升級冷淡；**禁客服腔**
- **Acceptance:** 「今日天氣點呀」→ 入戲擋；連問 2–3 次離題 → 明顯更冷／更短，無「我唔明白／請重試」

### T5 — 固定≥8 測句＋升 cache
- **Do:** 對住下表測完；通過後升 `?v=intent2`（或 intent2+）
- **Acceptance:** 下表 #1–#8 全過；index／engine cache ≥ `intent2`

### 固定驗收測句
| # | 玩家輸入 | 預期意圖 | 期望行為 |
|---|---|---|---|
| 1 | 你想我點？ | ask_want | 內心／導向＋可亮推門／停低 |
| 2 | 我而家應該做咩 | ask_want | 節點感知導向 |
| 3 | 推門 | enter | 推進或等同推門 |
| 4 | 我入去啦 | enter | 推進 |
| 5 | 停一停 | wait | wait／停低線 |
| 6 | 唔想／我唔入 | refuse | 拒絕線，唔客服 |
| 7 | 對唔住呀 | apologize | 入戲收／冷接 |
| 8 | 今日天氣點呀 | off_topic | 入戲擋＋可升級 |
| 9 | 你係咪 AI／程式 | off_topic 或 unclear | 否認系統感 |
| 10 | 你記得我頭先講咩 | memory | 接返記憶（T2 後） |

## Ticket policy
- **INTENT 開住 ⇒ hourly 必須做 T1–T5，不准 monitor-only**
- 禁：yes-words／keys 對池；逼 OpenRouter／催 key
- PICTURE／SOUND：只回歸

## Ideas gate（唔係施工票）
- 新 idea → 只寫 `IDEAS.md`（`proposed`）；**唔好**直接開 Open tickets
- `approved` idea 先准搬入本檔 Open 並改碼
- T1–T5 未清：施工優先 INTENT；idea 只提案

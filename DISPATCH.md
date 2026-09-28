# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：`?v=split1b`；柔軟過關＋guide＋禁空檔＋禁 CDN／禁原文唯一

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1b`。

## Scores
STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4

## Done this hour
- **hourly 06:12 METHOD SCOUT AJ**：pick 行 Presence/呼吸感 + letter AJ CSS scale breathe；CODE AJ 待 F hook；禁 Imagine/上傳/CF；Pages+Safari
- **hourly 05:11 A+B+C INTENT T2**：patterns **split1bv** +我過去開門／去開門先／幫你推門／門畀我開／等我唵吓／唵一陣／等我唵氣／慢住先／你想點先／跟住點算／而家點做先啦／你記唔記得頭先喪句／頭先講過咩嚕架／幾點鐘啦／出面凍唔凍；guide HINT/PRESSURE/MEM；alex n0 keys 材料加厚；固定測句+split1bv 本地 classify 51/51 PASS；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 03:11 A+B INTENT T2**：patterns **split1bq** 加厚門把／唾／講咩嚕；cache `?v=split1b`

## Open tickets（lowest first）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE AJ — locked-still breathe presence
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 wait / linger 節 locked still
#### CODE AG — success/fail stamp slam
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 success/fail beat
#### CODE AF — scene-cut shutter wipe
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 room-change / goToNode 轉場
#### CODE AE — choice heat-rim pulse
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 `#choices` heat delta
#### CODE AD — review dossier paper slide
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 review 節

### GUIDE
#### GUIDE T1 — sceneGoal on key nodes
- **Status:** n0 已有 sceneGoal；n2a–n2c 補 sceneGoal+freeChat
#### GUIDE T2 — strategy replies
- **Status:** 已實作 strategy 池；split1bv 加厚開門先／唵吓／想點先 HINT
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；pressure 池份在；待 live 硬刷確認（F 未升 cache）

### INTENT
#### T1 — 擴意圖＋粵語變體
- **Status:** **DONE intent2 + split1m** — live classify PASS
#### T2 — 場景記憶接話
- **Status:** split1bv 等我唵吓／頭先講過咩嚕架／我過去開門；對準 recentUserLines 仍待 F
#### T3 — anti-repeat
- **Status:** pickFrom / pickAnti 已過濾 recentBotReplies
#### T4 — 離題入戲升級
- **Status:** offTopicStreak + sharp 池已有
#### T5 — 固定≥8 測句＋升 cache
- **Status:** live classify PASS；cache `?v=split1b`；F 暫緩未升

### 固定驗收測句
| # | 玩家輸入 | 預期意圖 | 期望行為 |
|---|---|---|---|
| 1 | 你想我點？ | ask_want | 導向推門／停低 |
| 3 | 推門 | enter | 推進 |
| 5 | 停一停 | wait | 停低 |
| 8 | 今日天氣點呀 | off_topic | 入戲擋 |
| 10 | 你記得我頭先講呀 | memory | 接記憶 |

## Ticket policy
- **INTENT 或 GUIDE 開住 ⇒ hourly 必須做對應票，不准 monitor-only**
- 禁：yes-words／keys 對池；逼 OpenRouter／催 key；CDN pin／stub

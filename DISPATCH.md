# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：patterns `?v=split1cs`（其餘 asset 仍 split1b）；柔軟過關＋guide＋禁空檔，禁 CDN／禁原文唯一

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1cs`（patterns）。

## Scores
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2

## Done this hour
- **hourly 03:12 A INTENT T2/T5**：patterns **split1cs** 13429B；本地 gate 63/63 PASS（固定測句＋柔軟過關＋縮身擠入／攝返啖氣／頭先嗰句記到未／唔入得太急但我都想入／唔係話唔入我只係未企穩）。index 只 cache-bust patterns。recentUserLines 仍待 F。
- **hourly 02:14**：Live index 已掛 parts。唔係 stub loader。CHAT-FIRST 打字成功後仍倒選項 → FEEL 2。等 owner playtest。禁 Imagine。

## Open tickets（lowest first，最多 5）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE chat-guide hide — #48
- **Status:** P0 FEEL。打字成功後保持 freechat-hidden；唔好覆蓋 IntentEngine。
#### CODE restore-engine — #46
- **Status:** 保留等 owner playtest。今晚 live 有 parts，唔係第一張。未證齊前不關。禁 CDN / stub。

### STORY
#### STORY intents — #47
- **Status:** P0。大部份 node 打字成功後仍倒 choice buttons。加意圖／回覆材料；禁 yes-word pool。

### GUIDE
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；待 live 硬刷確認 hide（F 未升全頁 cache）

### INTENT
#### T2 — 場景記憶接話
- **Status:** split1cs 已加記到未／留低印象變體；recentUserLines 回聲仍待 F
#### T5 — 固定≥8 測句＋升 cache
- **Status:** patterns cache `?v=split1cs`；本地 63/63；全頁 F 暫緩未升

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
- 禁：yes-words／keys 對池；逼 OpenRouter／催 key；CDN pin／stub；Imagine

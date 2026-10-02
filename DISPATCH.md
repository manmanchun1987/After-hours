# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：patterns `?v=split1cx`（其餘 asset 仍 split1b）；柔軟過關＋guide＋禁空檔，禁 CDN／禁原文唯一

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1cx`（patterns）。

## Scores
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2

## Done this hour
- **hourly 07:07 驗 live**：index 掛齊 parts，app.js 119953B 完整引擎（唔係 b64 stub loader）。#46 restore-engine 保留、唔係第一張。CHAT-FIRST 打字成功後仍可倒選項 → FEEL 2。等 owner playtest。禁 Imagine。
- **hourly 06:15 A INTENT T2/T5**：patterns **split1cx** 20028B；本地 gate 133/133 PASS（固定 5 句＋柔軟過關）。index 只 cache-bust patterns（7276→7276）。recentUserLines 回聲仍待 F。
- **hourly 06:07 驗 live**：index 掛齊 parts。app.js 119953B。#46 唔係第一張。FEEL 2。

## Open tickets（lowest first，最多 5）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE chat-guide hide — #48
- **Status:** P0 FEEL。打字成功後保持 freechat-hidden；唔好覆蓋 IntentEngine。index chat-guide 仍 `?v=split1b`，等 owner playtest。Lane A 唔改 chat-guide。

### STORY
#### STORY intents — #47
- **Status:** P0。大部份 node 打字成功後仍倒 choice buttons。加意圖／回覆材料；禁 yes-word pool。Lane C。

### GUIDE
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；待 owner 硬刷確認 hide（F 未升全頁 cache）

### INTENT
#### T2 — 場景記憶接話
- **Status:** split1cx 已加記唔記得實／印唔印實／掛住頭先嚟句；recentUserLines 回聲仍待 F
#### T5 — 固定≥8 測句＋升 cache
- **Status:** patterns cache `?v=split1cx`；本地 133/133；全頁 F 暫緩未升

### 保留（唔占 5 張額）
#### CODE restore-engine — #46
- **Status:** 07:07 live 有 parts，唔係 stub loader，唔係第一張。未證齊前不關。禁 CDN / stub。

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

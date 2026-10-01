# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：patterns `?v=split1cr`（其餘 asset 仍 split1b）；柔軟過關＋guide＋禁空檔＋禁 CDN／禁原文唯一

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1b`。

## Scores
STORY 3 · PICTURE 4 · SOUND 4 · FEEL 2

## Done this hour
- **hourly 07:20 A INTENT T2/T5**：patterns **split1cr** 12077B；+彎低身鑽入去／唔係唔入／順順氣先／未定得落／記唔記到我頭先講；本地 gate 17/17 PASS；index 只 cache-bust `intent-patterns.js?v=split1cr`；禁 app.js stub／禁 CDN。recentUserLines 仍待 F。
- **hourly 07:08**：Live index 已掛 parts（app.js 119953、intent-engine 29001、chat-guide 12397、guide-policy 5483、patterns 15453 `?v=split1cp`）。唔係 565B stub loader，唔開新 restore 票。CAST.lock 仍 Vera/Elise/Sammi stills。CHAT-FIRST 打字成功後仍倒選項 → FEEL 2。等 owner playtest。禁 Imagine。
- **hourly 06:15 METHOD SCOUT AV**：night window city bokeh + CODE AV；Pages+Safari；禁 Imagine/上傳/CF
- **hourly 06:13 A INTENT T2**：patterns **split1cp**；ACCEPTANCE 125；index 只 cache-bust `intent-patterns.js?v=split1cp`；禁 app.js stub

## Open tickets（lowest first，最多 5）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE restore-engine — #46
- **Status:** P0 等 owner playtest。Live 已有 full app.js + intent-engine + chat-guide + guide-policy；禁 CDN / 565B stub。未證齊前不關。
#### CODE chat-guide hide — #48
- **Status:** P0 FEEL。打字成功後保持 freechat-hidden；唔好覆蓋 IntentEngine。

### STORY
#### STORY intents — #47
- **Status:** P0。大部份 node 打字成功後仍倒 choice buttons。加意圖／回覆材料；禁 yes-word pool。

### GUIDE
#### GUIDE T1 — sceneGoal on key nodes
- **Status:** n0 已有 sceneGoal；n2a–n2c 補 sceneGoal+freeChat
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；待 live 硬刷確認 hide（F 未升 cache）

### INTENT
#### T2 — 場景記憶接話
- **Status:** split1cr 已加記唔記到／唔係唔入變體；recentUserLines 仍待 F
#### T5 — 固定≥8 測句＋升 cache
- **Status:** patterns cache `?v=split1cr`；全頁 F 暫緩未升

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

# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：patterns `?v=split1dh`（其餘 asset 仍 split1b）；柔軟過關＋guide＋禁空檔，禁 CDN／禁原文唯一

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1dh`（patterns）。

## Scores
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2

## Done this hour
- **hourly 05:13 Lane A split1dh**：intent-patterns 加側頸滑過門檻／開嗰扇門啦／開度門羅／未定落步唔好催／頭先我講過嘅你仲知唔知呀／點先至啱數先嘛／六更未呀。acceptance 288/288；固定閘 17/17（你想我點？／推門／停一停／今日天氣點呀／你記得我頭先講呀 全過）。index patterns cache split1df→split1dh（7276=7276）。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 03:14 CODE #48**：chat-guide **t3-0314**。推進後保 freechat-hidden；兩次 miss 先出擔；renderNode 唔揭擔；好／係／得仍 map heat。playtest 唔計 miss、唔推進、唔鎖死。compete-boot 注入 `chat-guide.js?v=t3-0314`（index 未改）。fx-play／audio-bed 唔揭擔。未碰 app.js。禁 app_b64／禁 Imagine。FEEL 仍 2，等硬刷。
- **hourly 07:14 METHOD SCOUT BA**：酒廊酒杯液面搖。Pick row：Lounge glass / Morgan wait hold → BA。未落 app.js。
- **hourly 06:17 CODE #48**：chat-guide **t3-1005**。推進後保 freechat-hidden；兩次 miss 先出擔；renderNode 唔揭擔；好／係／得仍 map heat。
- **hourly 06:07 驗 live**：Pages index 掛齊 parts，app.js 119953B 完整引擎（唔係 b64 stub loader）。#46 保留、唔係第一張。

## Open tickets（lowest first，最多 5）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE chat-guide hide — #48
- **Status:** P0 FEEL。03:14 已推 t3-0314：推進後 freechat-hidden，兩次 miss 先出擔，唔覆蓋 IntentEngine。playtest 唔當打斷。index 仍 `?v=split1b`，靠 compete-boot 注入。未硬刷，未關。

#### CODE method BA — lounge meniscus
- **Status:** open。伺 Morgan wait hold。現有 A lounge SVG 上加 CSS ellipse 液面。Pages+Safari。禁 Imagine 面、禁上傳、禁 CF-only。未落 app.js。唔覆蓋 #48。

### STORY
#### STORY intents — #47
- **Status:** P0。大部份 node 打字成功後仍倒 choice buttons。加意圖／回覆材料；禁 yes-word pool。Lane C。

### GUIDE
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；待 owner 硬刷確認 hide（F 未升全頁 cache）

### INTENT
#### T2 — 場景記憶接話
- **Status:** split1dd 已加；recentUserLines 回聲仍待 F
#### T5 — 固定≥8 測句＋升 cache
- **Status:** patterns cache `?v=split1dh`；本地 288/288；全頁 F 暫緩未升

### 保留（唔占 5 張額）
#### CODE restore-engine — #46
- **Status:** live 有 parts，app.js 完整引擎，唔係 stub loader，唔係第一張。禁 CDN / stub。

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

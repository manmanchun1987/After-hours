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
- **hourly 05:11 A+B INTENT T2**：patterns **split1bk** +輕輕一撷把入／把一撷推入／手撷把一推／門把輕輕一扭；+等我唽吓／唽一陣／唽一唽；+頭先嗰句講咩嚟／你頭先講過啲咩嚟／頭先講過嗰句呀；+而家跟住要我點／你而家想我做咩；guide MEM_NUDGE／HINT；固定測句+split1bk 本地 classify 預期 PASS；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 04:11 A+B INTENT T2**：patterns **split1bj** +門把一撷推／把一扭推入／輕輕扭把入／手按門把一扭；+等我唶吓／唶一陣／唶一唶；+頭先喇句講呀／你頭先講過呀嚟／頭先你講過啲呀；+跟住要我點／而家你要我做呀；guide MEM_NUDGE／HINT；固定測句+split1bj 本地 classify 22/22 PASS；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 04:12 METHOD scout AG**：success/fail CSS stamp slam（scale+rotate+multiply）接 AD 紙／HUD；Pages+Safari；無 Imagine/無 upload/無 CF；贏 D FX / I 只聲 / A 全場
- **hourly 06:12 METHOD scout AF**：百葉簾 `clip-path: inset` 轉場（office→lift / pantry→review）；Pages+Safari；無 Imagine/無 upload/無 CF；贏 Y 靜止 letterbox / C 全場動 / D FX
- **hourly 06:08 C STORY**：node.text 一呼吸（到達＋而家要乜＋句尾問）；ack＝下一拍前半；CHAT-FIRST 好／係／繼續；唔拆 chat-guide；禁 app.js stub

## Open tickets（lowest first）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
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
- **Status:** 已實作 strategy 池；split1bk 加厚門錨 MEM_NUDGE（輕輕一撷把入／唽一唽／頭先嗰句）
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；pressure 池份在；待 live 硬刷確認（F 未升 cache）

### INTENT
#### T1 — 擴意圖＋粵語變體
- **Status:** **DONE intent2 + split1m** — live classify PASS
#### T2 — 場景記憶接話
- **Status:** split1bk 等我唽吓／唽一唽／頭先嗰句講咩嚟／輕輕一撷把入；對準 recentUserLines 仍待 F
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

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
- **hourly 05:04 A INTENT T2**：patterns **split1ci** +我行前去推把入／手推把入去先啦／等我唎多陣先／唔好趕住我先／你而家到底想我點做好先／頭先嗰句你重記唔記得呀／出面而家有冇落雨；ACCEPTANCE 57；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 07:12 METHOD SCOUT AM**：pantry steam wisps + CODE AM #票；Pages+Safari；禁 Imagine/上傳/CF
- **hourly 06:11 A+B INTENT T2**：patterns/guide **split1cg** +我去推把入／推門把入去先／等我唷多吓先／唔好迫我住先／你而家究竟想我點／頭先講嗰句你記唔記得／出面有冇落雨；ACCEPTANCE 43；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 06:04 A INTENT T2**：patterns **split1cf** +我去撚門入／撚門把推入先／等我唾一唾先／唔好催我住先／你究竟想我點做好先／頭先我講嗰句你仲記唔記得／出面落唔落雨呀；ACCEPTANCE 64；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 05:17 A+B+C INTENT T2**：patterns/guide **split1ce** +我撚門把入去／撚把推門先／等我唾多陣／俾我唾一陣先／你到底想我點做好呀／頭先嗰句你記唔記得呀／而家幾點鐘呀喂；alex n0 keys；ACCEPTANCE 58；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 04:24 A+B+C INTENT T2**：patterns/guide **split1cc** +我幫你扭門／行埋去開門先／門我幫你推／過嚕推門先／等我唾吓先／唔好迫住我／等陣唔好趕／你想我點做好先呀／頭先嗰句我講啱嚕／而家幾點鐘喃；alex n0 keys；ACCEPTANCE 46；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 03:11 A+B INTENT T2**：patterns **split1ca**；guide **split1bx**；ACCEPTANCE 32；cache 仍 `?v=split1b`
- **hourly 07:11 A INTENT T2**：patterns **split1bz**
- **hourly 06:11 A+B+C INTENT T2**：patterns/guide **split1by**

## Open tickets（lowest first）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE AM — pantry kettle/mug steam wisps
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 pantry wait hold
#### CODE AK — lift/roof glass breath fog
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 wait hold 上 lift/roof pane
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
- **Status:** 已實作 strategy 池；split1cg 份在
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；pressure 池份在；待 live 硬刷確認（F 未升 cache）

### INTENT
#### T1 — 擴意圖＋粵語變體
- **Status:** **DONE intent2 + split1m** — live classify PASS
#### T2 — 場景記憶接話
- **Status:** split1ci 我行前去推把入／等我唎多陣先／頭先嗰句你重記唔記得呀；對準 recentUserLines 仍待 F
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

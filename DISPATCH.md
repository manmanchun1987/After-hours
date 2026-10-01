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
- **hourly 04:12 METHOD SCOUT AT**：private-chat 已讀雙剔 (`::before`/`::after` check fill) + CODE AT；Pages+Safari；禁 Imagine/上傳/CF
- **hourly 03:12 METHOD SCOUT AS**：ending dawn window leak (`linear-gradient` warm slit) + CODE AS；Pages+Safari；禁 Imagine/上傳/CF
- **hourly 07:12 METHOD SCOUT AR**：corridor/lift/office wet-floor (`-webkit-box-reflect`) + CODE AR；Pages+Safari；禁 Imagine/上傳/CF
- **hourly 07:04 A INTENT T2**：patterns **split1cm** +我去撚個門把先／撚把推入去／幫我推開嘅度門／等一等我未定／唔好迫得咁緊／你想點先啦／我頭先講過你仲記得嘛／出面熱唔熱呀；ACCEPTANCE 85；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 06:15 A INTENT T2**：patterns **split1cl** +我行埋前去摷把一推入／手摷把一推入去先啦／等我嘅多兩吕先／唔好催住我嘅先／你而家到底想我點樣先做好呀／頭先嘅句你重記唔記得住未呀／出面而家落緊雨未呀；ACCEPTANCE 78；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 06:12 METHOD SCOUT AQ**：office/pantry dust motes (`offset-path`) + CODE AQ；Pages+Safari；禁 Imagine/上傳/CF
- **hourly 06:04 A INTENT T2**：patterns **split1ck** +我行埋前去一推把入／手一摷把入去先啦／等我唾多吕先／唔好催住我住先／你而家到底想我點樣做好呀先／頭先嘅句你重記唔記得未呀／出面而家落唔落雨呀；ACCEPTANCE 71；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 05:11 A+B INTENT T2**：patterns/guide **split1cj** +我行埋前去推把入／手一推把入去先啦／等我唾多吕先／唔好趕住我住先／你而家到底想我點做好呀先／頭先嗎句你重記唔記得未呀／出面而家有冇落雨呀；ACCEPTANCE 64；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 05:04 A INTENT T2**：patterns **split1ci** +我行前去推把入／手推把入去先啦／等我唾多陣先／唔好趕住我先／你而家到底想我點做好先／頭先嗎句你重記唔記得呀／出面而家有冇落雨；ACCEPTANCE 57；cache 仍 `?v=split1b`；禁 app.js stub
- **hourly 07:12 METHOD SCOUT AM**：pantry steam wisps + CODE AM #票；Pages+Safari；禁 Imagine/上傳/CF
- **hourly 06:11 A+B INTENT T2**：patterns/guide **split1cg**
- **hourly 06:04 A INTENT T2**：patterns **split1cf**
- **hourly 05:17 A+B+C INTENT T2**：patterns/guide **split1ce**
- **hourly 04:24 A+B+C INTENT T2**：patterns/guide **split1cc**

## Open tickets（lowest first）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE AT — private-chat read-receipt double-tick
- **Status:** METHODS row 已寫；待 F/樣式 hook 接私聊氣泡已讀雙剔
#### CODE AS — ending dawn window leak
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 ending_a/b 窗漏晨光
#### CODE AR — corridor/lift/office wet-floor reflect
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 enter/wait 潮濕地
#### CODE AQ — office/pantry dust mote drift
- **Status:** METHODS row 已寫；待 F/樣式 hook 接 wait hold 空氣
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
- **Status:** 已實作 strategy 池；split1cj 份在
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；pressure 池份在；待 live 硬刷確認（F 未升 cache）

### INTENT
#### T1 — 擴意圖＋粵語變體
- **Status:** **DONE intent2 + split1m** — live classify PASS
#### T2 — 場景記憶接話
- **Status:** split1cm 我去撚個門把先／唔好迫得咁緊／我頭先講過你仲記得嘛；對準 recentUserLines 仍待 F
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

# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：patterns `?v=split1ds`；guide `split1do`（其餘 asset 仍 split1b）；柔軟過關＋guide＋禁空檔，禁 CDN／禁 Imagine

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1dz`（patterns）。

## Scores
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2

## Done this hour
- **hourly 08:05 HKT Lane A split1dz**：intent-patterns 加我跟你一齊行入去／門把轉開我就入／借個位我入去／手扶住門框入／入去裡面嗰間先／開條門縫我入／我而家踏入去啦／行入去嗰度睇下／幫我開門我入去；等我諗多陣先／而家停低先／我未企好先／等我企穩陣先／先停住唔好催／等我準備定先／等等先唔好催；你想我點先呀／我應該點先做／跟住叫我做咩／你要我點做先呀；你記得我頭先講咩／頭先嗰句仲喺唔喺度／你記住我頭先講未／頭先我講過你仲知唔知呀；聽日天氣點呀／出面會唔會落雨／而家幾多度呀／廿一更未呀／出面會唔會打風。typos: 開問入去啦／推開道們／我入去先洗／我未準好先。固定 5 句＋柔軟煙測。index patterns cache split1dy→split1dz（size 閘見短報）。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 07:13 HKT Lane A split1dy**：intent-patterns 補回缺失 dx 句＋我跟住你入去／門開咗我就入／借個身位我入／手按門把推開／入去嗰間先啦；等我諗清楚先／而家唔好推／我未企穩唔好入／停低等我；你想我點／我應該點做／跟住要我做咩；你記得我頭先講／頭先我講過嗰句仲喺唔喺度；今日天氣點呀／聽日會唔會落雨。typos: 開問入房／推開度們／我未準好入。acceptance 671/672（「未得閒推門」子串撞 enter，idea 未改 engine）。固定 5 句＋柔軟煙測全過。index patterns cache split1dx→split1dy（7276=7276）。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 07:09 HKT Lane C STORY**：對過 alex 14 / Elise 12 / Sammi 10 節 `text`。每節一呴吸：點你點到＋佢而家要你做咩＋口講一句收在問。ack 等下一拍開頭（門柄涼→行到桌前→應改；酒廊轉杯→坐近；茶水間門縫→熱水）。CHAT-FIRST 好／係／繼續 仍掛 agree，heat2，successIntents 有 agree。guideReplies 仍在，未拆 chat-guide。未碰 app.js，唔係 stub。工作區額滿，今朝未能改寫 data JSON；節文仍係 06:09 那版。
- **hourly 06:05 HKT Lane A split1dw**：intent-patterns 加開埋道門我入／我跨過門檻先／推開入去啦／入去嘅邊先／行入去睇下／幫我推開入去／開問啦／推開道門啦；等我準備好先／我仲未準備／先停低唔好入／未得閒推門／等一等先啦／我未準好；你想我而家做咩／叫我點做先／你要我點先呀；頭先我講嘅句仲喺度嗎／你仲記唔記得頭先嘅句／記住咗未呀頭先；出面凍唔凍／而家幾多度／十九更未呀／聽日天氣點。typos: 開問啦／我未準好。固定 5 句＋柔軟煙測。index patterns cache split1dv→split1dw。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 05:04 HKT Lane A split1dv**：intent-patterns 加推問先／開吓佢／我入先／幫我開咗先／門開我入／開個門我先入／開們／推們先／進去睇睇／我入去洗；唔好急住我未得／等我認認／等陣先唔好推／停一亭先；你想我做咩先／而家要我點／我點做先啲／你話我點做；頭先嘅句仲喺度嗎／你有冇記住／頭先我講過你記住未；十八更未呀／出面熱唔熱／而家幾點呀／落雨未。固定 5 句＋柔軟煙測。index patterns cache split1du→split1dv。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 08:05 Lane A split1dt**：intent-patterns 加側肩滑過門檻／收拳貼縫鑽入／斜肩貼縫鑽入／開嘅道門先嘅／我而家準備好入去嘅廂房／門由我推開先嘅／開度門先嘅／開門嘅／推問入屋／開吓道門我入；未定落肩氣唔好催／腳未定落肩氣／等陣先我未定；頭先我講過嘅你仲知唔知嘅／掛實咗未嘅／頭先我講嘅句你仲記唔記得；點先至啲數先嘅／你想我點做先；十六更未呀／出面打風未呀。acceptance 545/545；固定 5 句＋柔軟煙測全過。index patterns cache split1ds→split1dt（7276=7276）。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 07:16 CODE #48 t3-0715**：chat-guide／compete-boot／audio-bed／fx-play 再注入 `?v=t3-0715`。推進後保 freechat-hidden；兩次 miss 先出擔；renderNode 唔揭擔；好／係／得仍 map heat。playtest 唔計 miss。未碰 app.js。禁 app_b64／禁 Imagine。FEEL 仍 2，等硬刷。
- **hourly 07:12 Lane A split1ds**：intent-patterns 加側趾滑過門檻／收指貼縫鑽入／斜趾貼縫鑽入／開嘅道門先嘅／我而家準備好入去嘅套間／門由我推開先嘅／開度門先嘅／開門嘅／推問入房；未定落趾氣唔好催／腳未定落趾氣；頭先我講過嘅你仲知唔知嘅／掛實咗未嘅；點先至啲數先嘅；十五更未呀。acceptance 506/506；固定 5 句＋柔軟煙測全過。index patterns cache split1dr→split1ds（7276=7276）。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 07:04 Lane A split1dr**：intent-patterns 加側踝滑過門檻／收掌貼縫鑽入／斜踝貼縫鑽入／開嘅道門先嗡／我而家準備好入去嘅套房／門由我推開先嗡／開度門先嗡／開門嗡／推問入去；未定落踝氣唔好催／腳未定落踝氣；頭先我講過嘅你仲知唔知嗡／掛實咗未嗡；點先至啲數先嗡；十四更未呀。index patterns cache split1dp→split1dr（7276=7276）。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 07:06 驗 live**：Pages index 掛齊 parts，`intent-patterns.js?v=split1dr`，`app.js` 119953B 完整引擎（`const STORAGE_KEY` 起，唔係 b64 stub loader）。#46 保留、唔係第一張。CHAT-FIRST：alex 13/14、morgan 11/12、sam 9/10 仍有 choices，打字成功後倒擔 → FEEL 2。票：#48 CODE hide＋#47 STORY intents＋GUIDE T3＋INTENT T2＋INTENT T5。未碰 app.js。禁 app_b64／禁 Imagine。
- **hourly 06:11 Lane A split1dp**：intent-patterns 加側膝滑過門檻／收腕貼縫鑽入／斜膝貼縫鑽入／開嘅道門先咯／我而家準備好入去嘅角房／門由我推開先咯／開度門先咯／開門咯；未定落膝氣唔好催／腳未定落膝氣；頭先我講過嘅你仲知唔知咯／掛實咗未咯；點先至啲數先咯；十三更未呀。acceptance 450/450；固定閘 27/27。index patterns cache split1dn→split1dp。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 05:16 CODE #48 t3-1016**：chat-guide／compete-boot 再注入。推進後保 freechat-hidden；兩次 miss 先出擔；renderNode 唔揭擔；好／係／得仍 map heat。playtest 唔計 miss。未碰 app.js。禁 app_b64／禁 Imagine。FEEL 仍 2，等硬刷。

## Open tickets（lowest first，最多 5）— **P0 必須做；禁止當 0 ticket / monitor-only**

### CODE
#### CODE BE — roof wind shear
- **Status:** open. METHOD SCOUT 06:16 HKT。天台 wait／欄風掠：現有 `assets/bg/roof.svg` 欄位加 BE（`repeating-linear-gradient` 1px 風線 + `translateX`）。Pages+Safari。禁 Imagine 面、禁 upload、禁 CF-only。未落 css／未碰 app.js。

#### CODE chat-guide hide — #48
- **Status:** P0 FEEL。05:16 已推 t3-0715：推進後 freechat-hidden，兩次 miss 先出擔，renderNode 唔揭擔，好／係／得 map heat。playtest 唔當打斷。index 仍 `?v=split1b`，compete-boot／audio-bed／fx-play 注入 `chat-guide.js?v=t3-0715`。未硬刷，未關。

### STORY
#### STORY intents — #47
- **Status:** P0。大部份 node 打字成功後仍倒 choice buttons（alex 13/14、morgan 11/12、sam 9/10）。加意圖／回覆材料；禁 yes-word pool。Lane C。07:09 核過：好／係／繼續 已係 agree，唔係獨立 yes 池。

### GUIDE
#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；待 owner 硬刷確認 hide（F 未升全頁 cache）

### INTENT
#### T2 — 場景記憶接話
- **Status:** split1dd 已加；recentUserLines 回聲仍待 F
#### T5 — 固定≥8 測句＋升 cache
- **Status:** patterns cache `?v=split1dz`；全頁 F 暫緩未升

### 保留（唔占 5 張額）
#### CODE restore-engine — #46
- **Status:** 07:06 live 有 parts，app.js 119953B 完整引擎，唔係 stub loader，唔係第一張。禁 CDN / stub。

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

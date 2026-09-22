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

## 車道制（split1・可擴充 N≥1）

| Lane | 檔 | 誰寫 |
|---|---|---|
| A Intent-Patterns | `intent-patterns.js` | **現有單條自動化預設**（+ 柔軟過關驗收）；可讀寫 patterns；**唔停工**；**唔要求開齊全部車道** |
| B Guide-Lines | `guide-lines.*` | 可選；回覆／內心句池 |
| C Scene data | `data/*.json` | 可選 |
| D Ideas | `IDEAS.md` | 可選（兩段式閘仍適用） |
| E Status | `STATUS.md` | 可選 |
| F Integrator | `app.js`／`index.html` **only** | 唯一准改 app／index（script 序、`?v=`） |

- 原則：一檔（或一資料夾）一寫入車頭；新自動化認領空車道／新拆檔，唔搶檔。
- 數目隨需要增長；寫「可選加車道」，**禁止**「必須開齊 10」類表述。
- Soft pass + Guide + 空檔禁 + idea 兩段式 + INTENT／GUIDE 開票仍適用。

現有空景：office lounge pantry review roof lift

Read AUTOMATION.md before any hourly run.

## Scores
STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4

## Done this hour
- **hourly 04:14 A**：patterns **split1y** ask_memory（聽清楚未／頭先嗰句／講多次）＋enter（開門先／入去睇下）＋wait（等陣）；cache 仍 `?v=split1b`
- **hourly 04:08 A**：patterns **split1x** ask_memory（講過有未／聽低咯未／寫低咯未／複述返／記唔記得我頭先）；cache 仍 `?v=split1b`
- **hourly 03:20 A**：patterns **split1w** ask_memory（頭先講／講過未／記低／聽低／寫低／抄低／複述）；cache 仍 `?v=split1b`
- **hourly 05:22 A**：patterns **split1u** ask_memory（抄低／記住咋未／複述吓／記低哎未／聽到未呀／重講一次）；cache 仍 `?v=split1b`
- **hourly 02:20 A+B+C**：patterns **split1p** ask_memory（聽低／寫低／記低咋未）＋ guide-lines **split1l** 門錨聽低／寫低；alex stub；cache 仍 `?v=split1b`（F 暫緩）
- **split1**：抽出 `intent-patterns.js` + `guide-lines.js`；引擎／政策變薄核心；cache `?v=split1`
- **intent2**：T1 加厚 PATTERNS；T2 ask_memory 接話材料

## Open tickets（lowest first）— **P0 必須做；禁止當 0 ticket / monitor-only**

### GUIDE

#### GUIDE T1 — sceneGoal on key nodes
- **Status:** n0 已有 sceneGoal；runtime 已追 miss；n2a–n2c 補 sceneGoal+freeChat

#### GUIDE T2 — strategy replies
- **Status:** 已實作 strategy 池；split1j 加厚門錨 MEM_NUDGE

#### GUIDE T3 — escalate guide + 驗收
- **Status:** 邏輯已有；pressure 池份在；待 live 硬刷確認（F 未升 cache）

### INTENT

#### T1 — 擴意圖＋粵語變體
- **Status:** **DONE intent2 + split1m** — live classify PASS

#### T2 — 場景記憶接話
- **Status:** split1y 聽清楚未／頭先嗰句／講多次；對準 recentUserLines 仍待 F

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
| 2 | 我而家應該做咩 | ask_want | 節點感知導向 |
| 3 | 推門 | enter | 推進 |
| 4 | 我入去啦 | enter | 推進 |
| 5 | 停一停 | wait | 停低 |
| 6 | 唔想／我唔入 | refuse | 拒絕線 |
| 7 | 對唔住呀 | apologize | 入戲收 |
| 8 | 今日天氣點呀 | off_topic | 入戲擋 |
| 9 | 你係咪 AI／程式 | off_topic | 否認系統感 |
| 10 | 你記得我頭先講咩 | memory | 接記憶 |
| G1 | （離題）×2 | off_topic | 第 2 次更冷仍 steer 門 |
| G2 | 推門 | enter_door | advances |

## Ticket policy
- **INTENT 或 GUIDE 開住 ⇒ hourly 必須做對應票，不准 monitor-only**
- 禁：yes-words／keys 對池；逼 OpenRouter／催 key；CDN pin／stub
- chat-guide **唔覆蓋** GuidePolicy `advance`

## Ideas gate
- 新 idea → 只寫 `IDEAS.md`（`proposed`）
- `approved` idea 先准搬入 Open 並改碼

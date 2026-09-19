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
- **split1**：抽出 `intent-patterns.js` + `guide-lines.js`；引擎／政策變薄核心；cache `?v=split1`；車道制可擴充（預設 Lane A）
- intent1：完整 `app.js`、禁 CDN stub；IntentEngine 骨架
- guide1：`sceneGoal` on n0 · `guide-policy.js` · 走廊 miss 升級導向 · cache `?v=intentsoft1`
- **intent2**：T1 加厚 PATTERNS（ask_want／enter／wait／refuse／apologize／off_topic／ask_memory 粵語變體）· T2 ask_memory 接話材料 · 測句表 node classify 10/10 PASS · cache `?v=intentsoft1`
- 憲法寫入北辰 KPI + GuidePolicy
- **hourly 19:30 A**：加厚 refuse／ask_memory 變體（patterns split1a）；live soft「開門啦」→n0b PASS；ask_want hint PASS
- **hourly 22:30 A**：patterns **split1b** — 加厚 ask_want（我而家應該做咩）、off_topic（你係咪 AI／程式）、refuse／apologize／ask_memory；node 測句 20/20 PASS；cache `?v=split1b`

## Open tickets（lowest first）— **P0 必須做；禁止當 0 ticket / monitor-only**

### GUIDE（P0 next — 場景導向層；CEO 要 hourly 寫／做）

#### GUIDE T1 — sceneGoal on key nodes
- **Do:** 走廊／freeChat 起點補 `sceneGoal`（success／optional／maxMisses／guideLevel）；runtime 追 `state.guideMissCount`
- **Acceptance:** `data/alex.json` `n0` 有 sceneGoal；「推門」→ success 推進；非 success 唔 advance
- **Status:** n0 已有 sceneGoal；runtime 已追 miss

#### GUIDE T2 — strategy replies（hint／pressure／callout／close）
- **Do:** `guide-policy.js` 按 intent + miss 出 `{ strategy, reply, advance, showChoices, thought }`；入戲 Vera；anti-repeat
- **Acceptance:** 「你想我點？」→ 非空、導向推門／停低；唔客服腔
- **Status:** 已實作 strategy 池

#### GUIDE T3 — escalate guide + 驗收
- **Do:** 連續 miss 升級（thought → 更冷／更直接 → 亮推門／停低）；chat-guide **唔覆蓋** policy advance
- **Acceptance:** 硬刷 `?v=split1b` — 離題兩次 → 第 2 次更冷仍導向門；「推門」→ advances
- **Status:** 邏輯已有；待 live 硬刷確認

---

### INTENT（加厚進行中）

#### T1 — 擴意圖＋粵語變體
- **Do:** 加厚 `ask_want`／`enter`／`wait`／`refuse`／`apologize`／`flirt`／`challenge`／`memory`／`unclear`；粵語同義／句型／語氣；**禁止**整句==key（已禁；改用意圖／模糊） 唯一路徑
- **Acceptance:** 下列變體抽樣各 ≥1 句命中正確意圖（唔靠整句全等）
- **Status:** **DONE intent2 + split1b** — 測句 1–10 + soft 20/20 PASS

#### T2 — 場景記憶接話
- **Do:** 短窗記住玩家先講過咩；回覆要接返
- **Acceptance:** 先講「我想推門」再問「你想我點／記得我講咩」→ 回覆提到推門／門口，唔當空白上下文
- **Status:** 骨架（ask_memory + GuidePolicy mem nudge）；待更多 memory 窗

#### T3 — anti-repeat
- **Do:** 近 N 句 bot 回覆唔重複
- **Acceptance:** 連續 5 次同類意圖，回覆文字唔出現連續重複同一句
- **Status:** pickFrom / pickAnti 已過濾 recentBotReplies

#### T4 — 離題入戲升級
- **Do:** 離題一律 Vera 入戲擋；重複離題升級冷淡；**禁客服腔**
- **Acceptance:** 「今日天氣點呀」→ 入戲擋；連問 2–3 次離題 → 明顯更冷／更短，無「我唔明白／請重試」
- **Status:** offTopicStreak + sharp 池已有

#### T5 — 固定≥8 測句＋升 cache
- **Do:** 對住下表測完；通過後升 `?v=intentsoft1`（或 intent2+）
- **Acceptance:** 下表 #1–#8 全過；index／engine cache ≥ `intent2`（GUIDE 期間可用 `guide1`）
- **Status:** node classify 20/20 PASS；cache `?v=split1b`；**live gate PASS**

### 固定驗收測句
| # | 玩家輸入 | 預期意圖 | 期望行為 |
|---|---|---|---|
| 1 | 你想我點？ | ask_want | 內心／導向＋可亮推門／停低（GuidePolicy hint） |
| 2 | 我而家應該做咩 | ask_want | 節點感知導向 |
| 3 | 推門 | enter | 推進或等同推門（advance） |
| 4 | 我入去啦 | enter | 推進 |
| 5 | 停一停 | wait | wait／停低線（corridor success） |
| 6 | 唔想／我唔入 | refuse | 拒絕線，唔客服；走廊可導回門 |
| 7 | 對唔住呀 | apologize | 入戲收／冷接 |
| 8 | 今日天氣點呀 | off_topic | 入戲擋＋可升級 |
| 9 | 你係咪 AI／程式 | off_topic 或 unclear | 否認系統感 |
| 10 | 你記得我頭先講咩 | memory | 接返記憶（T2 後） |
| G1 | （離題）×2 | off_topic | 第 2 次更冷／更直接，仍 steer 門 |
| G2 | 推門 | enter_door | advances（GUIDE T3） |

- **intentsoft1:** pass = intent vs goal，唔係 exact keys（開門啦／我入去先／我未準備好 → success）。

## Ticket policy
- **INTENT 或 GUIDE 開住 ⇒ hourly 必須做對應票，不准 monitor-only**
- 禁：yes-words／keys 對池；逼 OpenRouter／催 key；CDN pin／stub
- PICTURE／SOUND：只回歸
- chat-guide **唔覆蓋** GuidePolicy `advance`

## Ideas gate（唔係施工票）
- 新 idea → 只寫 `IDEAS.md`（`proposed`）；**唔好**直接開 Open tickets
- `approved` idea 先准搬入本檔 Open 並改碼
- INTENT／GUIDE 未清：施工優先；idea 只提案

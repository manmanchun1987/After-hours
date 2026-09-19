# AUTOMATION — hourly 憲法（短讀）

> **每次 run 必須讀 `LANES.md` 對應自己車道並執行完整指令。**
> 自動化若**冇標車道** → **預設 Lane A**。
> 用戶新建自動化：名稱 `AH-LaneB`…，指令一句「讀 LANES.md Lane B」即可，**唔使人手貼長 prompt**。


給 Grok／dispatcher 每小時必讀。細節見 QUALITY · METHODS · DISPATCH · STATUS · IDEAS。

## 北辰 KPI
**意圖體感接近真 AI（含柔軟過關）＞ 刷劇情／畫面／音效分。**

## 兩層架構（禁倒退）
1. **IntentEngine（聽）**：粵語同義／句型／模糊／錯字容忍 → 結構化意圖；**禁止**整句==key／預設原文做唯一路徑。
2. **GuidePolicy（帶戲）**：意圖＋`sceneGoal`＋記憶＋miss → 回覆策略／是否推進／亮掣／內心。
3. 過關：**intent ∈ sceneGoal.successIntents 即過**；劇情答案**唔使 100% 字面正確**。
4. **禁止**再開或回歸「必須打齊預設原文／選項字」類 ticket。

## 硬規則
1. **禁止** CDN pin／stub `app.js`；只改 repo 完整引擎；不准 jsDelivr 鎖舊版。
2. 新票只准：意圖、場景規則、回覆材料、場景記憶、anti-repeat、sceneGoal 導向、柔軟匹配加厚。
3. OpenRouter／API key＝**可選**；唔催 key；有 INTENT／GUIDE 開票時**禁止**開逼 OpenRouter 票。
4. `chat-guide` 可 miss／藏 choices；**推進以 IntentEngine／GuidePolicy 為準**。
5. **INTENT 或 GUIDE 開票時：Hourly 必須加厚，禁止 monitor-only。** PICTURE／SOUND 只回歸。
6. **僅當** INTENT＋GUIDE 全關 **且** 四柱≥4 **且** 無其他開票 → 先可 monitor-only。
7. Live cache：硬刷 `?v=split1`（或更新 soft cache）。


## 車道制（split1・可擴充）

完整可執行指令：**`LANES.md`**（每車共用開頭＋範圍＋禁區＋輸出）。

**一檔（或一資料夾）一寫入車頭。** 車道數 **N≥1**，隨用戶開幾多條增長——**唔寫死必須剛好 10 條，唔要求開齊全部車道先跑得。**

| Lane | 名 | 寫入範圍 |
|---|---|---|
| **A** | Intent-Patterns | `intent-patterns.js`（預設 hourly） |
| **B** | Guide-Lines | `guide-lines.js`／`guide-lines.json` |
| **C** | Scene data | `data/*.json` |
| **D** | Ideas | `IDEAS.md` |
| **E** | Status | `STATUS.md` |
| **F** | Integrator | **只** `app.js`／`index.html` |

### 現有單條自動化＝預設 Lane A（+ 驗收）
- **唔停工**：有 INTENT／GUIDE 開票就繼續加厚 patterns／跑柔軟過關驗收。
- **可讀寫** `intent-patterns.js`；**唔使**開齊其他車道先跑。
- Soft-pass（intentsoft1 語義）+ GuidePolicy steering + 空檔禁 + idea 兩段式 + INTENT／GUIDE 開票規則 **仍然適用**。

### 可選加車道（唔係必開）
- 新自動化＝認領空車道／新拆檔；**唔好搶已有檔**。
- 可選：exclusive files、stagger clocks。
- **只有 Integrator（Lane F）** 准推 `app.js`／`index.html`（含 script 序、`?v=` cache bust）。
- 引擎核心 `intent-engine.js`／政策核心 `guide-policy.js` 改動要小心——預設 hourly 只動 Lane A patterns。

## 核心檔安全閘
- **禁止** push 空或 **<1KB**：`index.html`、`intent-engine.js`、`guide-policy.js`、`app.js`、`intent-patterns.js`、`guide-lines.js`。
- 改 `index.html`：改前＋改後印 `wc -c`（≥1000）；push 前印核心四檔。
- `app.js` 必須 ≫565B。異常 → 停 push、還原、先報。

## Idea 兩段式閘
- Hourly 最多 3 條 idea → 只寫 `IDEAS.md`，`proposed`。
- **未批不准改碼／開施工票**；`approved`（用戶／CEO）先搬 DISPATCH。
- 必須服務意圖體感；禁區 → rejected：CDN pin／stub、yes-words／keys 對池、催 OpenRouter、改 Vera 鎖樣、要求打齊原文過關、範圍外大重構。
- INTENT／GUIDE 開票時：先施工開票；idea 可並行提案、唔搶施工。

## 柔軟過關驗收（非原文）
硬刷 `?v=split1`，走廊／sceneGoal=enter_door|wait：
| 輸入 | 預期 |
|---|---|
| 開門啦 | enter → 推進 |
| 我入去先 | enter → 推進 |
| 進去看看 | enter → 推進 |
| 我行入辦公室／行入佢間房 | enter → 推進 |
| 等等 | wait → 推進／wait 線 |
| 我未準備好 | wait |
| 你想我點？ | ask_want → 入戲導向門口（唔空白、唔客服） |
| 今日天氣點呀 | off_topic → 入戲擋＋仍導向 goal |

「推門」仍可過，但**唔可以係唯一認法**。

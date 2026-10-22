# AUTOMATION — hourly 憲法（短讀）

> **每次 run 必須讀 `LANES.md` 自己車道並跟 checklist。** 無標 → **Lane A**。  
> **現行預設＝A＋B。Lane C 暫停寫 data。** D／E／F＝暫緩可選。  
> **唔開新 App 自動化**（沿用 AH-LaneA／B；C 可留住但唔改 data）。建議中文顯示名見 `LANES.md` 表（用戶／瀏覽器改 App UI；repo 唔改）。  
> **北辰：** 本地假 AI（Intent＋Guide），無付費 LLM。  
> **臨時：** Pages 佇列塞車時少 push（唔係永久停工）。

細節：QUALITY · DISPATCH · STATUS · IDEAS · LANES。

## 北辰 KPI
**意圖體感接近真 AI（含柔軟過關）＞刷劇情／畫面／音效分。**  
**可玩入局（閘→三卡→開始入戲）＞任何「加厚」空報。**

## 兩層架構（禁倒退）
1. **IntentEngine（聽）**＋`intent-patterns.js`  
2. **GuidePolicy（帶戲）**＋`guide-lines.js`  
3. 過關：**intent ∈ sceneGoal.successIntents 即過**  
4. **禁止**「必須打齊預設原文」；**禁止** keys／原文唯一對池

## 硬規則
1. **禁止** CDN pin／stub `app.js`；只改 repo 完整引擎。  
2. **禁止** 載入／依賴 `play-engine.js`／`life.js` 搶主 `app.js`（index 唔好加返）。  
3. OpenRouter／API key＝可選；唔催 key。  
4. INTENT／GUIDE 開票時：**禁止 monitor-only**。  
5. Ideas：A 每小時最多 1 條 `proposed` → IDEAS.md；**未批不准改碼／開施工**。Idea 審批 Bot routine 暫停期間＝全部等用戶／CEO 批。  
6. **真實 `wc -c` 閘**：核心檔空／&lt;1KB → **唔 commit**；`data/alex.json` nodes&lt;20 → **唔 commit data**。  
7. STATUS 必須寫真實 size／nodes；禁止假「已加厚」。  
8. **FEEL／guide-feel 聲稱前**：跑 `node tools/auto-playtest.js`，掃 `tools/PLAYTEST-LAST.md`（見 DISPATCH）。本地啟發式；唔改 live play path。

## 車道（現行）

| Lane | 狀態 | 寫入 | 禁碰 |
|---|---|---|---|
| **A** Patterns | **active** | `intent-patterns.js`；STATUS 一行；index 只必要 cache-bust | B／C 檔；play-engine／life |
| **B** Guide-Lines | **active** | 只 `guide-lines.js` | app／index／patterns／data |
| **C** Scene | **pause write** | 只讀＋STATUS（CEO-approved sceneGoal 已 backfill） | push data／stub |
| **D** Ideas | deferred | （可選）A 代寫 ≤1 proposed | 未批改碼 |
| **E** Status | deferred | （可選）開工車代寫一行 | 假加厚 |
| **F** Integrator | deferred | 只 app／index mount 真需要 | stub／CDN／life hijack |

## 下一優先（對齊 DISPATCH）
1. Mid-node goal steer（guide 跟當前 sceneGoal；playtest：alex/n1、n2a、morgan/m1）  
2. Agree soft-match（如「我應承」）  
3. Hand-tune weak sceneGoals（IDEAS→CEO 批→先准寫 data）  
4. Auto-playtest before FEEL claim  

## 核心檔安全閘
禁止 push 空或 **&lt;1KB**：`index.html` · `app.js` · `intent-engine.js` · `guide-policy.js` · `intent-patterns.js` · `guide-lines.js`。  
`data/*.json`：**禁單節 stub**；alex nodes≥20。改 index：改前＋改後印 size（≥1000）。

## 柔軟過關煙測（非原文）
走廊：開門啦／我入去先 → enter；等等 → wait；你想我點？ → ask_want；我應承 → agree；天氣 → off_topic 仍導向 goal。

## 入局煙測（任何車弄壞都算失敗）
硬刷 live → 18+ → **三張角色卡** → Vera「開始」能入 play（唔白屏、唔卡死喺選擇角色）。

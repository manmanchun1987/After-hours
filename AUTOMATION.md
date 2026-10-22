# AUTOMATION — 閒置延續憲法（短讀）

> **北辰：** 本地假 AI（Intent＋Guide），無付費 LLM。意圖體感＞刷分空報。  
> **自動化只做一件事：** 用戶瞓覺／靜音 ≥2 小時時，**延續**已經吩咐過 CEO 嘅工作。**禁止**日間發明平行票、禁止自己開新施工線、禁止「為跑而跑」。  
> **Grok.com App hourly A–F：已暫停／暫緩。** 閒置接力＝CEO Bot routine「**瞓覺先跑 After Hours**」（≥2h silence）。  
> **該 routine 跑時工作內容＝A＋B**（讀 `LANES.md` 該車＋checklist）。**C＝pause write data。** D／E／F＝deferred。無標 → **Lane A**。  
> **唔開新 App 自動化**；唔聲稱 App UI 顯示名（除非已核實）。  
> **臨時：** Pages 佇列塞車時少 push（唔係永久停工）。

細節：QUALITY · DISPATCH · STATUS · IDEAS · LANES。

## 北辰 KPI
**成隻 game 工種（鎖）：** 假AI對話｜劇情資料｜產品殼（邏輯＋畫面＋音效）｜驗收對標；管理＝CEO批＋瞓覺先跑（唔算第5產線）。
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
5. Ideas：A 每次 idle run 最多 1 條 `proposed` → IDEAS.md；**未批不准改碼／開施工**。Idea 審批 Bot routine 暫停期間＝全部等用戶／CEO 批。**禁止為填額而發明 idea。**  
6. **真實 `wc -c` 閘**：核心檔空／&lt;1KB → **唔 commit**；`data/alex.json` nodes&lt;20 → **唔 commit data**。  
7. STATUS 必須寫真實 size／nodes；禁止假「已加厚」。  
8. **FEEL／guide-feel 聲稱前**：跑 `node tools/auto-playtest.js`，掃 `tools/PLAYTEST-LAST.md`（見 DISPATCH）。本地啟發式；唔改 live play path。

## 車道（現行；只喺 idle routine 跑時施工）

| Lane | 狀態 | 寫入 | 禁碰 |
|---|---|---|---|
| **A** Patterns | **active when idle routine** | `intent-patterns.js`；STATUS 一行；index 只必要 cache-bust | B／C 檔；play-engine／life；日間發明票 |
| **B** Guide-Lines | **active when idle routine** | 只 `guide-lines.js` | app／index／patterns／data；日間發明票 |
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

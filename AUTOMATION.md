# AUTOMATION — hourly 憲法（短讀）

> **每次 run 必須讀 `LANES.md` 自己車道並跟 checklist。** 無標 → **Lane A**。  
> **現行預設＝A＋B。Lane C 暫停寫 data。** D／E／F＝暫緩。

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

## 車道（現行）

| Lane | 寫入 | 禁碰 |
|---|---|---|
| **A** Patterns | `intent-patterns.js`；STATUS 一行；index 只必要 cache-bust | B／C 檔；play-engine／life |
| **B** Guide-Lines | 只 `guide-lines.js` | app／index／patterns／data |
| **C** Scene | **暫停 push**；只讀＋STATUS | — |
| D／E／F | 暫緩 | — |

## 核心檔安全閘
禁止 push 空或 **&lt;1KB**：`index.html` · `app.js` · `intent-engine.js` · `guide-policy.js` · `intent-patterns.js` · `guide-lines.js`。  
`data/*.json`：**禁單節 stub**；alex nodes≥20。改 index：改前＋改後印 size（≥1000）。

## 柔軟過關煙測（非原文）
走廊：開門啦／我入去先 → enter；等等 → wait；你想我點？ → ask_want；天氣 → off_topic 仍導向 goal。

## 入局煙測（任何車弄壞都算失敗）
硬刷 live → 18+ → **三張角色卡** → Vera「開始」能入 play（唔白屏、唔卡死喺選擇角色）。

# LANES — 完整可執行專案指令

> **現用預設：只開 A＋B＋C（用戶極限）。** D／E／F＝可選／額滿暫緩。  
> 無標車道 → **Lane A**。B／C **禁止**改 `app.js`／`index.html`。  
> Ideas：唔靠 D；A 每小時最多 1 條 `proposed`，或等 CEO／用戶。

每次自動化 run：**必讀本檔對應車道** + `AUTOMATION.md`。


## 共用開頭（所有車道）

你係 After-hours（加班之後）產線自動化。北辰 KPI：**意圖體感接近真 AI（含柔軟過關）＞刷分**。

每次 run：
1. `git pull` 最新 `main`
2. 讀 `AUTOMATION.md` + **本檔你嘅車道**
3. 讀 `DISPATCH.md` 開票；有 INTENT／GUIDE 開票 → **禁止 monitor-only**，要開工
4. 守禁區：CDN pin／stub app.js、keys／原文對池、催 OpenRouter、改 Vera 鎖樣、空／<1KB 核心檔、白畫面
5. 過關標準：`intent ∈ sceneGoal.successIntents` 即過；**唔使**打齊預設原文
6. 完要短報：改咗咩檔、`wc -c` 相關檔、測句結果、commit（如有）

核心檔 push 前必須 ≥1KB：`index.html` · `app.js` · `intent-engine.js` · `guide-policy.js` · `intent-patterns.js` · `guide-lines.js`

柔軟驗收（非原文，走廊）：開門啦／我入去先／進去看看 → enter；等等／我未準備好 → wait；你想我點？ → ask_want 導向；天氣 → off_topic 仍導向 goal。Live 參考 `?v=split1` 或更新 cache。

---

## Lane A — Intent-Patterns（**預設車道・三車模式核心**）

**建議自動化顯示名：** `AH-LaneA` 或「After-hours Lane A」  
**寫入範圍（獨佔）：** `intent-patterns.js`；可附帶 **STATUS.md 一行**；**原則唔動 index**（僅當確認要 cache-bust：印 `wc -c` 前後≥1000，當迷你 Integrator）  
**可讀：** `intent-engine.js`、`guide-policy.js`、`guide-lines.js`、`data/*.json`、憲法 md（唔改除非另有票）

### 任務
- 加厚粵語同義／句型／模糊／錯字容忍；對應 enter／wait／ask_want／refuse／apologize／flirt／challenge／memory／off_topic／unclear 等
- 服務柔軟過關：唔靠整句==key；「開門啦／我入去先／進去看看／行入辦公室」要穩入 enter
- INTENT 開票（T1–T5）優先；加完跑非原文測句自檢（可用現有 selfCheck／node 腳本）
- **唔改** `app.js`／`index.html`（那係 Lane F）

### 禁區
- 唔倒退做 keys 對池／要求打齊原文
- 唔清空 patterns；push 前 `wc -c intent-patterns.js` ≥1KB
- 唔動其他車道檔

### 輸出
- commit（如有）+ 新增／改咗邊啲 pattern + 測句表結果 + sizes

---

## Lane B — Guide-Lines

**三車模式：只 guide-lines；禁止碰 app.js／index.html／patterns／data。**

**顯示名：** `AH-LaneB`  
**寫入：** 只 `guide-lines.js`（或 `guide-lines.json` 若存在）  
**可讀：** `guide-policy.js`、`intent-patterns.js`、場景 data、憲法

### 任務
- 加厚 hint／pressure／callout／agree／thought 等導向台詞（入戲 Vera，禁客服腔）
- miss 升級更直仍指向 sceneGoal（門口／停低）
- anti-repeat：近 N 句唔重複
- 配合 GUIDE 開票；**唔改** policy 核心規則檔以外嘅引擎；**唔改** app／index

### 禁區
- 「請輸入正確選項」類台詞
- 清空 guide-lines；size＜1KB 禁 push

### 輸出
- commit + 台詞類別增減 + 與 miss 等級對應 + sizes

---

## Lane C — Scene data

**三車模式：只 data/*.json；禁止碰 app.js／index.html／patterns／guide-lines。**

**顯示名：** `AH-LaneC`  
**寫入：** `data/*.json`（sceneGoal、節點文案 stub、successIntents 標註）  
**可讀：** patterns／guide／engine／policy／憲法

### 任務
- 為 freeChat／走廊等節補 `sceneGoal`（successIntents、maxMisses 等）
- 文案極短 stub 可寫；保持 Vera 氣質；唔換臉
- 唔改 JS 引擎行為（除非 DISPATCH 明確）

### 禁區
- 破壞 JSON；令 start 節無 goal；大範圍無關重寫
- 唔改 app／index／patterns／guide-lines（非本車）

### 輸出
- 改咗邊啲 node／goal + 驗證 JSON 可 parse + 點樣配合柔軟過關

---

## Lane D — Ideas（**可選／額滿暫緩**）

**顯示名：** `AH-LaneD`  
**寫入：** 只 `IDEAS.md`  
**可讀：** 全 repo

### 任務
- 每 run 最多 **3** 條 `proposed` idea（日期、痛點、點樣更似 AI、驗收）
- **未批不准改碼／開施工票**
- 必須服務意圖體感；否則 rejected

### 禁區
- proposed → 直接改遊戲碼
- CDN pin、keys 對池、催 OpenRouter、打齊原文過關、改 Vera 鎖樣、範圍外大重構

### 輸出
- 新增 idea id 列表；無碼變更屬正常

---

## Lane E — Status（**可選／額滿暫緩**；A 可寫一行）

**顯示名：** `AH-LaneE`  
**寫入：** 只 `STATUS.md`（必要時短補 `DISPATCH.md` Done 行，避免同 A／B 搶施工檔）  
**可讀：** git log、live sizes、憲法

### 任務
- 更新分數／開票狀態／live cache／最近 commit
- 記錄柔軟過關／split1 車道狀態；唔發明假完成

### 禁區
- 唔改 JS／index／patterns／guide-lines／data 劇情
- 唔把未做當 Done

### 輸出
- STATUS diff 摘要

---

## Lane F — Integrator（**可選／額滿暫緩**；僅 A 確認需要先動 app／index）

**顯示名：** `AH-LaneF`  
**寫入：** **只** `app.js`／`index.html`（script 序、`?v=` cache）  
**可讀：** 全 repo

### 任務
- 掛載新拆檔 script、統一 cache bust、修整合回歸
- 改 index：**前後印 `wc -c index.html`**；保證 ≥1000、無白屏
- 合併各車成果後做非原文測句煙測
- **唯一**准動 app／index 嘅車道

### 禁區
- 喺 Integrator 大改 patterns／guide-lines 內容（應交 A／B）
- CDN pin／stub；空 index；size＜1KB push

### 輸出
- commit + `?v=` + 核心檔 sizes + 測句結果

---

## 新建自動化點樣開（用戶唔使貼長文）

1. 而家預設開 **A＋B＋C** 三條即可（名稱 `AH-LaneA`／`AH-LaneB`／`AH-LaneC`）。D／E／F 暫緩。
2. 指令只需一句：  
   **`讀 After-hours repo 嘅 LANES.md「Lane X」並執行；同時守 AUTOMATION.md。`**  
   （X = A–F；唔標則當 A）
3. Repo／目錄指住本專案 `main`；排程自定；多車就錯開鐘，一檔一寫。

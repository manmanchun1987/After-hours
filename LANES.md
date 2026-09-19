# LANES — A＋B＋C 完整可執行指令

> **現行唯一預設：三車 A＋B＋C。** D／E／F 暫緩。無標 → **A**。  
> 用戶開自動化：名稱 `AH-LaneA`／`AH-LaneB`／`AH-LaneC`；指令一句「讀 LANES.md 該車並執行；守 AUTOMATION.md」。

---

## 共用開頭（每次 run）
1. `git pull` main  
2. 讀 `AUTOMATION.md` + **本檔你嘅車道** + `DISPATCH.md` 開票  
3. 有 INTENT／GUIDE 開票 → **禁止 monitor-only**，要開工  
4. 禁：CDN pin／stub、keys／原文唯一、催 OpenRouter、改 Vera 鎖樣、空／<1KB 核心檔、白屏  
5. 過關：intent∈sceneGoal 即過；Live 驗 `?v=split1`  
6. 短報：改檔、`wc -c`、測句、commit（如有）

---

## Lane A — Intent-Patterns（預設核心）

**寫入：** `intent-patterns.js`；可 STATUS **一行**；原則唔動 index（只必要 cache-bust：印前後 size≥1000）  
**禁碰：** guide-lines、data（非必要）、app.js（非上述例外）

### 每次 run checklist
- [ ] pull + 讀 DISPATCH INTENT 開票  
- [ ] 加厚 patterns（同義／模糊／錯字）；服務柔軟過關  
- [ ] （可選）IDEAS ≤1 條 proposed；未批唔改碼  
- [ ] `wc -c intent-patterns.js` ≥1KB  
- [ ] 非原文煙測（開門啦／我入去先／等等…）  
- [ ] commit＋短報  

---

## Lane B — Guide-Lines

**寫入：只** `guide-lines.js`（或 .json）  
**禁碰：** app.js／index.html／intent-patterns／data

### 每次 run checklist
- [ ] pull + 讀 GUIDE 開票  
- [ ] 加厚 hint／pressure／callout／thought；入戲、禁客服腔  
- [ ] miss 升級仍導向 sceneGoal；anti-repeat  
- [ ] `wc -c guide-lines.js` ≥1KB  
- [ ] 唔改 app／index  
- [ ] commit＋短報  

---

## Lane C — Scene data

**寫入：只** `data/*.json`（sceneGoal、successIntents、短 stub）  
**禁碰：** app.js／index.html／patterns／guide-lines

### 每次 run checklist
- [ ] pull + 對齐走廊／freeChat 節 goal  
- [ ] 補／修 `sceneGoal.successIntents`（enter／wait 等）  
- [ ] JSON 可 parse；唔刪 start  
- [ ] 唔改 JS／index  
- [ ] commit＋短報  

---

## Lane D／E／F — 暫緩
唔開新自動化認領。F（合拼 app／index）**僅當 A 確認需要**且印 size 閘；**禁止 B／C** 做 Integrator。

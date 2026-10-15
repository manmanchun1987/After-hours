# LANES — A＋B 可執行指令（C 暫停寫入）

> **現行預設：A＋B。** **Lane C 暫停 push data**（只讀／報 STATUS）。D／E／F 暫緩。無標 → **A**。  
> 用戶 App 自動化名：`AH-LaneA`／`AH-LaneB`；（`AH-LaneC` 可留住但**唔准改 data**）  
> 指令一句：「讀 LANES.md 該車並執行；守 AUTOMATION.md」。

---

## 共用開頭（每次 run）
1. `git pull` main  
2. 讀 `AUTOMATION.md` + **本檔你嘅車道** + `DISPATCH.md` 開票  
3. 有 INTENT／GUIDE 開票 → **禁止 monitor-only**，要開工  
4. **硬禁**：CDN pin／stub、`play-engine.js`／`life.js` 搶主引擎、keys／原文唯一、催 OpenRouter、改 Vera 鎖樣、**空／<1KB 核心檔**、白屏、**單節 stub 劇情**  
5. **push 前必須印真實 `wc -c`**（唔准 STATUS 空口「已加厚」）；唔啱 size 閘 → **唔 commit**  
6. Live 煙測：硬刷 `?v=…` → 18+ 閘 → 見到 **三張角色卡** →（A／B 唔使每小時撳入戲，但**禁**弄壞 `#chars`／`renderCast`／`data` 節點數）  
7. 短報：改檔、**真實 wc**、測句、commit（如有）

### 核心檔 size 閘（push 前）
| 檔 | 最低 |
|---|---|
| `index.html` | ≥1000 |
| `app.js` | ≥50KB |
| `intent-engine.js` | ≥1KB |
| `intent-patterns.js` | ≥1KB |
| `guide-policy.js` | ≥1KB |
| `guide-lines.js` | ≥1KB |
| `data/alex.json` | **nodes≥20** 且檔 ≥8KB |
| `data/morgan.json`／`sam.json` | **nodes≥15** 且檔 ≥5KB |

---

## Lane A — Intent-Patterns

**寫入：** 只 `intent-patterns.js`；可 STATUS **一行**；index 只必要 cache-bust（改前＋改後 size≥1000）  
**禁碰：** `guide-lines*`、`data/*`、`app.js`（除非 F 例外且印 wc）、`play-engine.js`、`life.js`

### checklist
- [ ] pull + 讀 DISPATCH INTENT 開票  
- [ ] 加厚同義／模糊／錯字；服務柔軟過關  
- [ ] （可選）IDEAS ≤1 條 `proposed`；**未批唔改碼**  
- [ ] `wc -c intent-patterns.js` ≥1KB；空檔＝**失敗、revert**  
- [ ] 非原文煙測（開門啦／我入去先／等等…）  
- [ ] commit＋短報（含真實 wc）

---

## Lane B — Guide-Lines

**寫入：只** `guide-lines.js`（或 .json）  
**禁碰：** `app.js`／`index.html`／`intent-patterns*`／`data/*`／`play-engine`／`life`

### checklist
- [ ] pull + 讀 GUIDE 開票  
- [ ] 加厚 hint／pressure／callout／thought；入戲、禁客服腔  
- [ ] miss 升級仍導向 sceneGoal；anti-repeat  
- [ ] `wc -c guide-lines.js` ≥1KB  
- [ ] commit＋短報（含真實 wc）

---

## Lane C — Scene data（**暫停寫入**）

**現行：唔准 push `data/*`。** 只可讀樹＋喺 STATUS 報 nodes 數。  
要補 `sceneGoal` → 開 IDEAS `proposed`，等用戶／CEO **approved** 後先再開。  
歷史事故：單節 stub 令角色卡撳開始卡住／劇情消失。

### 若將來重新批准寫入（而家唔做）
- 只准 **補** `sceneGoal`／`successIntents`  
- **禁止**刪 nodes／choices／ending／整檔換成 stub  
- 驗收：`alex.json` nodes≥20，三檔均過 size 閘  

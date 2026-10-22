# LANES — A–F（對齊本地假 AI 優先）

> **自動化哲學（2026-10-22）：** 自動化**只**用來喺用戶瞓覺／靜音 ≥2 小時時，**延續**已經吩咐過 CEO 嘅工作——**唔准**日間發明平行票、唔准自己開新施工線。  
> **Grok.com App hourly A–F：已暫停／暫緩**（唔當日間定時開工）。閒置接力靠 **CEO Bot routine「瞓覺先跑 After Hours」**（靜音 ≥2h 先跑）。  
> **該 routine 跑嘅時候工作內容仍係 A＋B**（Intent-Patterns／Guide-Lines）。**C＝pause write**（唔准改 `data/*`；例外：2026-10-22 CEO 批 50-node expand batch 已完成，之後再開 pause）。**D／E／F＝deferred**。無標 → **A**。  
> 指令一句：「讀 LANES.md 該車並執行；守 AUTOMATION.md」。  
> **北辰：** 本地假 AI（Intent＋Guide），無付費 LLM。  
> **唔聲稱** Grok.com／App UI 顯示名（除非已核實）；repo 只記車道 id／狀態。  
> **臨時：** Pages 佇列塞車時少 push（唔係永久停工）。

### 成隻 game 工種（鎖 · 2026-10-22）
1. **假 AI 對話** — Intent＋Guide＋auto-playtest（北辰）
2. **劇情資料** — `data/*`；pause write，批先改
3. **產品殼** — 邏輯上線＋畫面活感＋內容音效（三執行位，同一類）
4. **驗收對標** — 硬刷／金掣／競品清單
**管理**（唔算第 5 產線）：CEO 批票；「瞓覺先跑」（靜≥2h 延續已交工）。App hourly 已 pause。

### 車道 id（參考；App UI 名唔保證）
舊 App id（`AH-LaneA`–`AH-LaneF`）可留作對照，但**唔代表** grok.com 而家仍有 hourly 喺跑。對照：

| id | 車 | 狀態 |
|---|---|---|
| `AH-LaneA` | A Intent-Patterns | active **when idle routine runs** |
| `AH-LaneB` | B Guide-Lines | active **when idle routine runs** |
| `AH-LaneC` | C Scene | **pause write**（2026-10-22 CEO 批：50-node expand batch 已寫入；批後 resume pause） |
| `AH-LaneD` | D Ideas | **deferred** |
| `AH-LaneE` | E Status | **deferred** |
| `AH-LaneF` | F Integrator | **deferred** |

---

## 共用開頭（每次 run）
1. `git pull` main  
2. 讀 `AUTOMATION.md` + **本檔你嘅車道** + `DISPATCH.md` 開票  
3. 有 INTENT／GUIDE 開票 → **禁止 monitor-only**，要開工  
4. **硬禁**：CDN pin／stub、`play-engine.js`／`life.js` 搶主引擎、keys／原文唯一、催 OpenRouter、改 Vera 鎖樣、**空／&lt;1KB 核心檔**、白屏、**單節 stub 劇情**  
5. **push 前必須印真實 `wc -c`**（唔准 STATUS 空口「已加厚」）；唔啱 size 閘 → **唔 commit**  
6. Live 煙測：硬刷 `?v=…` → 18+ 閘 → 見到 **三張角色卡** →（A／B idle run 唔使每次撳入戲，但**禁**弄壞 `#chars`／`renderCast`／`data` 節點數）  
7. FEEL 聲稱前：跑 `node tools/auto-playtest.js`，掃 `tools/PLAYTEST-LAST.md`（見 DISPATCH FEEL gate）  
8. 短報：改檔、**真實 wc**、測句、commit（如有）

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

### 已 ship（唔重做）
fakeai4（patterns＋sceneGoal＋history skim cap 50）· guide-clear1 · `tools/auto-playtest.js`（FEEL 閘）

### 下一優先（DISPATCH 開票）
1. **Mid-node goal steer** — guide 池／history reflect 必須跟**當前** `sceneGoal`（playtest 仍門心：alex/n1、n2a、morgan/m1）  
2. **Agree soft-match** — 同義如「我應承」要入 success  
3. **Hand-tune weak sceneGoals** — 推斷錯嘅先開 IDEAS／等 CEO 批再改 data  
4. **Auto-playtest before FEEL claim** — 已寫喺 DISPATCH

---

## Lane A — Intent-Patterns · **active when idle routine**

| | |
|---|---|
| **寫入** | 只 `intent-patterns.js`；可 STATUS **一行**；index 只必要 cache-bust（改前＋改後 size≥1000） |
| **讀** | AUTOMATION／本車／DISPATCH INTENT 開票；可讀 `data/*` 睇 `successIntents`（唔改） |
| **狀態** | **active when idle routine**（預設車；日間唔自己開工） |
| **禁碰** | `guide-lines*`、`data/*`、`app.js`（除非 F 例外且印 wc）、`play-engine.js`、`life.js` |

### checklist
- [ ] pull + 讀 DISPATCH INTENT 開票（尤其 **agree soft-match**）  
- [ ] 加厚同義／模糊／錯字；服務柔軟過關（含同意句如「我應承」）  
- [ ] （可選）IDEAS ≤1 條 `proposed`；**未批唔改碼**  
- [ ] `wc -c intent-patterns.js` ≥1KB；空檔＝**失敗、revert**  
- [ ] 非原文煙測（開門啦／我入去先／等等…／我應承→agree）  
- [ ] commit＋短報（含真實 wc）

---

## Lane B — Guide-Lines · **active when idle routine**

| | |
|---|---|
| **寫入** | 只 `guide-lines.js`（或 .json） |
| **讀** | AUTOMATION／本車／DISPATCH GUIDE 開票；可讀 `data/*` 睇當前 `sceneGoal`（唔改）；可跑 auto-playtest |
| **狀態** | **active when idle routine**（日間唔自己開工） |
| **禁碰** | `app.js`／`index.html`／`intent-patterns*`／`data/*`／`play-engine`／`life` |

### checklist
- [ ] pull + 讀 GUIDE 開票（尤其 **mid-node goal steer**）  
- [ ] 加厚 hint／pressure／callout／thought；入戲、禁客服腔  
- [ ] 池／history reflect **跟當前 sceneGoal**（唔好永遠推門）；miss 升級仍導向 goal；anti-repeat  
- [ ] FEEL 加厚前：`node tools/auto-playtest.js`；掃 alex/n1、n2a、morgan/m1  
- [ ] `wc -c guide-lines.js` ≥1KB  
- [ ] commit＋短報（含真實 wc）

---

## Lane C — Scene data · **pause（寫入）**

| | |
|---|---|
| **寫入** | **唔准** push `data/*`（例外：CEO **approved** hand-tune；**2026-10-22 23:39** 已做完 1–4 批，之後再 pause） |
| **讀** | 讀樹＋STATUS 報 nodes／size；可對照 playtest 弱節點開 IDEAS `proposed` |
| **狀態** | **pause write**（CEO 2026-10-22 批 50-node expand 已 ship；resume pause）；read-only／STATUS ok |
| **禁碰** | 刪 nodes／choices／ending；整檔 stub |

### checklist
- [ ] pull + 讀 DISPATCH STORY restore（監察）  
- [ ] 報 alex／morgan／sam nodes＋真實 size（過閘先報「健康」）  
- [ ] 弱 sceneGoal → IDEAS `proposed`（hand-tune）；**未批唔改 data**  
- [ ] 唔 commit `data/*`  
- [ ] 只 STATUS 一行（如有）

### 若將來重新批准寫入（而家唔做）
- 只准 **補** `sceneGoal`／`successIntents`  
- **禁止**刪 nodes／choices／ending／整檔換成 stub  
- 驗收：`alex.json` nodes≥20，三檔均過 size 閘  

---

## Lane D — Ideas · **deferred**

| | |
|---|---|
| **寫入** | 暫緩；平時由 A 可選寫 ≤1 條 `proposed` 入 IDEAS.md |
| **讀** | IDEAS／QUALITY／DISPATCH |
| **狀態** | **deferred optional** |
| **禁碰** | 未批就改碼／開施工 |

### checklist
- [ ] 無專屬定時施工；有用戶／CEO 叫先開（唔准日間發明）  
- [ ] 新 idea 只 `proposed`；等批  

---

## Lane E — Status · **deferred**

| | |
|---|---|
| **寫入** | 暫緩專車；A 可寫 STATUS **一行** |
| **讀** | STATUS／DISPATCH scores |
| **狀態** | **deferred optional** |
| **禁碰** | 假「已加厚」、空口 FEEL 升分（要先 auto-playtest） |

### checklist
- [ ] 無專屬定時；需要時由開工車順帶寫一行  
- [ ] 寫真實 size／nodes／playtest 摘要  

---

## Lane F — Integrator · **deferred**

| | |
|---|---|
| **寫入** | 暫緩；**只**當 app／index **mount／cache-bust 真需要**（印前後 wc） |
| **讀** | index／app 載入序；DISPATCH CODE restore-engine |
| **狀態** | **deferred optional**（唔為加厚而碰） |
| **禁碰** | stub wipe、play-engine／life 搶主、CDN pin、空／&lt;1KB 核心檔 |

### checklist
- [ ] 默認唔開工；A／B 搞唔掂 mount 先叫 F  
- [ ] 改 index／app 前後印 `wc -c`；過 size 閘先 commit  
- [ ] Live：18+ → 三卡 → 開始入戲  

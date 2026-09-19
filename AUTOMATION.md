# AUTOMATION — hourly 憲法（短讀）

> **每次 run 必須讀 `LANES.md` 自己車道並跟 checklist。** 無標車道 → **Lane A**。  
> **現行唯一預設＝三車 A＋B＋C**（用戶極限）。D／E／F＝暫緩。

細節：QUALITY · DISPATCH · STATUS · IDEAS · LANES。

## 北辰 KPI
**意圖體感接近真 AI（含柔軟過關）＞刷劇情／畫面／音效分。**

## 兩層架構（禁倒退）
1. **IntentEngine（聽）**＋`intent-patterns.js`：粵語同義／句型／模糊／錯字 → 結構化意圖。  
2. **GuidePolicy（帶戲）**＋`guide-lines.js`：意圖＋`sceneGoal`＋記憶＋miss → 回覆／推進／亮掣／內心。  
3. 過關：**intent ∈ sceneGoal.successIntents 即過**；劇情答案**唔使 100% 字面正確**。  
4. **禁止**「必須打齊預設原文／選項字」ticket 或回歸；**禁止** keys／原文唯一對池。

## 硬規則
1. **禁止** CDN pin／stub `app.js`；只改 repo 完整引擎。  
2. OpenRouter／API key＝**可選**；唔催 key。  
3. INTENT／GUIDE 開票時：**禁止 monitor-only**；PICTURE／SOUND 只回歸。  
4. Live 驗收硬刷：**`?v=split1`**（或更新 soft／split cache）。  
5. Ideas：唔靠 D；**A 每小時最多 1 條** `proposed` → IDEAS.md，或等 CEO／用戶批。

## 三車模式（唯一預設）

| Lane | 寫入 | 禁碰 |
|---|---|---|
| **A** Patterns | `intent-patterns.js`；可 STATUS **一行**；index 只必要 cache-bust＋size 閘 | B／C 檔 |
| **B** Guide-Lines | **只** `guide-lines.js`（或 .json） | app／index／patterns／data |
| **C** Scene | **只** `data/*.json` | app／index／patterns／guide-lines |
| D／E／F | **暫緩** | — |
| F 例外 | 僅 **A 確認**要合拼／掛 script 先動 app／index，且印 `wc -c` | B／C 永唔做 Integrator |

## 核心檔安全閘
禁止 push 空或 **<1KB**：`index.html` · `app.js` · `intent-engine.js` · `guide-policy.js` · `intent-patterns.js` · `guide-lines.js`。  
改 index：改前＋改後印 size（≥1000）；push 前印核心檔。

## 柔軟過關煙測（非原文）
走廊：開門啦／我入去先／進去看看 → enter；等等／我未準備好 → wait；你想我點？ → ask_want 導向；天氣 → off_topic 仍導向 goal。  
「推門」可過但**唔可以係唯一認法**。

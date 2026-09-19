# AUTOMATION — hourly 憲法（短讀）

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
7. Live cache：硬刷 `?v=intentsoft1`（或更新 soft cache）。

## 核心檔安全閘
- **禁止** push 空或 **<1KB**：`index.html`、`intent-engine.js`、`guide-policy.js`、`app.js`。
- 改 `index.html`：改前＋改後印 `wc -c`（≥1000）；push 前印核心四檔。
- `app.js` 必須 ≫565B。異常 → 停 push、還原、先報。

## Idea 兩段式閘
- Hourly 最多 3 條 idea → 只寫 `IDEAS.md`，`proposed`。
- **未批不准改碼／開施工票**；`approved`（用戶／CEO）先搬 DISPATCH。
- 必須服務意圖體感；禁區 → rejected：CDN pin／stub、yes-words／keys 對池、催 OpenRouter、改 Vera 鎖樣、要求打齊原文過關、範圍外大重構。
- INTENT／GUIDE 開票時：先施工開票；idea 可並行提案、唔搶施工。

## 柔軟過關驗收（非原文）
硬刷 `?v=intentsoft1`，走廊／sceneGoal=enter_door|wait：
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

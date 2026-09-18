# AUTOMATION — hourly 憲法（短讀）

給 Grok／dispatcher 每小時必讀。細節見 QUALITY · METHODS · DISPATCH · STATUS。

## 北辰
**意圖分析接近 AI = 遊戲成功。** KPI：意圖體感 ＞ 加劇情／畫面／音效刷分。

## 硬規則
1. **禁止** CDN pin／stub `app.js`；只改 repo 完整引擎；不准 jsDelivr 鎖舊版。
2. 對白主路徑 = **本地 IntentEngine**。禁止再開「加 yes-words／keys 對池」ticket；新票＝加意圖、場景規則、回覆材料。
3. OpenRouter／API key＝**可選**，唔係預設；唔好催用戶貼 key。
4. `chat-guide` 可留 miss／藏 choices；**推進必須以意圖結果為準**，唔好覆蓋 IntentEngine。
5. Hourly：若 STORY/PICTURE/SOUND/FEEL **皆 ≥4** 且 **0 ticket** → **只監察回歸**，唔好空轉 chase。
6. 驗收：硬刷 `?v=intent1`（或最新 intent cache）——「你想我點？」「推門／入去」「離題天氣」三句要啱意圖。

## 回歸最少檢查
- `app.js` bytes ≫ 565；index 直接 `./app.js?v=…`（無 jsDelivr loader）
- 走廊三句意圖正確；行為掣仍可用

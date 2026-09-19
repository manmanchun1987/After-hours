# AUTOMATION — hourly 憲法（短讀）

給 Grok／dispatcher 每小時必讀。細節見 QUALITY · METHODS · DISPATCH · STATUS。

## 北辰
**意圖分析接近 AI = 遊戲成功。** KPI：意圖體感 ＞ 加劇情／畫面／音效刷分。

## 硬規則
1. **禁止** CDN pin／stub `app.js`；只改 repo 完整引擎；不准 jsDelivr 鎖舊版。
2. 對白主路徑 = **本地 IntentEngine**。禁止「加 yes-words／keys 對池」ticket；新票＝意圖、場景規則、回覆材料、場景記憶、anti-repeat。
3. OpenRouter／API key＝**可選**；唔催 key；有 INTENT 開票時**禁止**開逼 OpenRouter 票。
4. `chat-guide` 可 miss／藏 choices；**推進以意圖結果為準**，唔覆蓋 IntentEngine。
5. **有 INTENT 開票（見 DISPATCH T1–T5）時：Hourly 必須做意圖加厚，禁止 monitor-only／空轉。** PICTURE／SOUND 只回歸。
6. **僅當** INTENT 票全關 **且** 四柱≥4 **且** 無其他開票 → 先可 monitor-only。
7. 驗收：硬刷 `?v=intent2`（完成 T5 後）——對住 DISPATCH 測句表。


## Idea 兩段式閘
1. Hourly **可**產出最多 **3** 條 idea，**只寫入 `IDEAS.md`**，狀態一律 `proposed`（日期、痛點一句、點樣更似 AI、驗收一句）。
2. **未批不准改碼／不准開施工 ticket**。只有 `status: approved`（用戶或 CEO）先可搬去 DISPATCH Open 同動手。
3. Idea 必須服務「意圖體感接近真 AI」；否則 `rejected`。
4. 禁區一律 rejected：CDN pin／stub app.js、yes-words／keys 對池、催 OpenRouter、改 Vera 鎖樣、範圍外大重構。
5. **P0 INTENT T1–T5 未完成時：hourly 先做 T1–T5**；idea 提案可並行寫 IDEAS，**唔好搶施工**。
6. 每條保留：id、proposed_at、status、pain／how、acceptance、rationale。

## 回歸最少檢查
- `app.js` bytes ≫ 565；index 直接 `./app.js?v=…`
- DISPATCH 測句意圖正確；行為掣仍可用

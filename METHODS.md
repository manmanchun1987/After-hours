# METHODS — 自動化點择畫面方法

鎖臉：Vera/Elise/Sammi 只用 `assets/stills/vera-01.jpg` `02` `03`。禁 Imagine 新臉。

## 按缺口選
1. 節有 `scene` 但缺 SVG → CODE 加 **空景 SVG**（無人）到 `assets/bg/{scene}.svg`，風格夜、暗、港式辦公室/酒廊。
2. 同場重覆 → **覆用**現有 SVG，唔好新開檔。
3. 要動態氣氛 → `fx.css` 窗閃/雨/燈管/監控，唔好濾鏡當美術。
4. 推關成功失敗 → `fx-play.js` sweep/火花/震。
5. 免費網上不可用時：唔好熱鏈外站片（Pexels/Mixkit 會 403）；唔好用網上真人臉、未授權 Live2D。
6. 角色識郁/口型 → 只嵌已有對白片，唔好自己出新臉片。

## 禁
濾鏡當高級美術、換臉、要玩家 upload、改爛 index 介面。

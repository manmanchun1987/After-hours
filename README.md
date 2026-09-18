# 加班之後 After Hours

18+ 職場權力感文字互動。免費、無廣告。靜態頁，GitHub Pages 可開。

## 階段性交貨（compete-1）

- Vera 完整線 + 週一評核室隱藏線
- Morgan（酒廊／房卡）
- Sam（肝夜前輩）
- 熱度／張力條；選擇會加減數值
- 內心、旁白、通話、記憶、私聊、BGM／SFX／粵語 TTS

## 本地打開

不要直接 double-click。用：

```bash
python3 -m http.server 8080
```

開 http://127.0.0.1:8080

## 改劇情

編輯 `data/alex.json`、`data/morgan.json`、`data/sam.json`。
選擇可加 `heat`、`tension`、`remember`、`requireHeat`。

## 自動化／對白憲法（intent1）

- 讀 `AUTOMATION.md`（hourly 短憲法）、`QUALITY.md`、`METHODS.md`、`DISPATCH.md`
- 對白主路徑：本地 IntentEngine；禁止 CDN pin／stub `app.js`
- 驗收：`?v=intent1` —「你想我點？」「推門／入去」「離題天氣」
- OpenRouter 可選，非預設


# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。
唔服務「意圖體感接近真 AI」→ `rejected`。

## 禁區（一律 rejected）
- CDN pin／stub `app.js`／jsDelivr 鎖舊版
- yes-words／keys 對池
- 催 OpenRouter／逼貼 key
- 改 Vera 鎖樣
- 要求玩家打齊預設原文／選項字先過關（違反柔軟過關）
- 範圍外大重構

## 欄位（每條必填）
| field | 說明 |
|---|---|
| id | 如 `I-20260919-01` |
| proposed_at | ISO 日期 |
| status | `proposed`／`approved`／`rejected`／`done` |
| pain | 一句邊個痛點 |
| how | 點樣令意圖更似 AI |
| acceptance | 一句驗收 |
| rationale | 點解服務北辰 KPI |

## Template（複製開新條）

```md
### I-YYYYMMDD-##
- proposed_at: YYYY-MM-DD
- status: proposed
- pain: …
- how: …
- acceptance: …
- rationale: …
```

## Proposed
（hourly 新 idea 寫喺呢度；最多每次 +3）

## Approved
（用戶／CEO 標記後搬嚟；先准開 DISPATCH 施工票）

## Rejected / Done
（留底）

> 北辰：idea 必須令「意圖匹配即過關」更似真 AI，唔係更似填字遊戲。

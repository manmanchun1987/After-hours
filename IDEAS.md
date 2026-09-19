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
（hourly 新 idea 寫哉呢度；最多每次 +3）

### I-20260920-01
- proposed_at: 2026-09-20
- status: proposed
- pain: 走廊 bias 下含「入」嘅 refuse（我唔入／我唔入去）會被判 enter_door，拒絕體感似推門
- how: 引擎走廊例外：若 refuse 分數明顯高於 enter 且有否定詞（唔／不／別），優先 refuse；patterns 繼續避免短 token「我入」
- acceptance: 「我唔入」「我唔入去」→ refuse；「我入去先」仍 enter
- rationale: 柔軟過關唔等於把拒絕當推進，意圖更似真對話

### I-20260919-01
- proposed_at: 2026-09-19
- status: proposed
- pain: 玩家講完「我想推門」再問「你記得我講咥」時，若 chatMemory 結構唔係純字串陣列，接話可能 miss
- how: 統一 pushChatMemory 寫入短窗 recentUserLines（最近 6 句 user text），ask_memory 優先讀呢個窗
- acceptance: 先講「我想推門」→「你記得我頭先講咥」→ 回覆必含門／推
- rationale: 令記憶意圖更似真 AI 短時記憶，唔似空白客服

### I-20260919-02
- proposed_at: 2026-09-19
- status: proposed
- pain: 走廊以外 freeChat 節點（若有）未掛 sceneGoal，GuidePolicy 唔入場
- how: 為有 freeChat 嘅後續節點補輕量 sceneGoal（successIntents 對應該節行為）
- acceptance: 非 n0 freeChat 節點離題亦入戲擋，唔空白
- rationale: 意圖＋場景導向貫穿全線，體感更似 AI 帶戲

### I-20260919-03
- proposed_at: 2026-09-19
- status: proposed
- pain: refuse 在走廊 successIntents 外時回覆偏短，玩家可能以為卡住
- how: refuse 材料加「走廊最終仍導回門」的入戲短句（非客服）
- acceptance: 「我唔入」→ 入戲冷接＋仍提到門／推，唔死路
- rationale: 拒絕意圖仍服務場景目標，更似真角色而非規則機

## Approved
（用戶／CEO 標記後搬嚟；先准開 DISPATCH 施工票）

## Rejected / Done
（留底）

> 北辰：idea 必須令「意圖匹配即過關」更似真 AI，唔係更似填字遊戲。

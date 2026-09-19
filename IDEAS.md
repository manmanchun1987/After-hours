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
（hourly 新 idea 寫喂呢度；最多每次 +3）

### I-20260919-01
- proposed_at: 2026-09-19
- status: proposed
- pain: 玩家講完「我想推門」再問「你記得我講咽」時，若 chatMemory 結構唔係純字串陣列，接話可能 miss
- how: 統一 pushChatMemory 寫入短窗 recentUserLines（最近 6 句 user text），ask_memory 優先讀呢個窗
- acceptance: 先講「我想推門」→「你記得我頭先講咽」→ 回覆必含門／推
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

### I-20260920-01
- proposed_at: 2026-09-20
- status: proposed
- pain: 連續離題第 2 句壓力池同第 1 句 hint 聲線差唔夠大，升級體感弱
- how: pressure／callout 再拉開短句長度同冷度差（唔改政策核心）
- acceptance: G1 離題×2 第 2 句明顯更短更冷，仍 steer 門
- rationale: 升級要似人發脾氣，唔似同一句 recast

### I-20260920-02
- proposed_at: 2026-09-20
- status: proposed
- pain: 走廊 bias 令「我唔入／我唔想而家入」在 n0 被判 enter_door，拒絕體感假陽性
- how: 引擎（F 批核後）改 corridor：僅當 enter 明顯高於 refuse 先覆蓋；「唔+入／唔想+推」優先 refuse
- acceptance: 走廊「我唔入」「我唔想推門」→ refuse；「我入去」仍 enter
- rationale: 意圖聽得準先似 AI；唔好把拒絕當過關推門

### I-20260920-03
- proposed_at: 2026-09-20
- status: proposed
- pain: 粵語句尾助詞（喎／吖／喎／啲）同錯字「諧下／諧吓」仍可能 miss wait／enter
- how: Lane A 繼續把助詞當可選尾巴，唔當另一意圖；引擎側（須 F）可 strip 句尾助詞再 score
- acceptance: 「開門喎」「我要諧下」→ enter／wait，唔 unclear
- rationale: 口語尾巴唔改變意圖，先似人聽人講

## Approved
（用戶／CEO 標記後搬嚟；先准開 DISPATCH 施工票）

## Rejected / Done
（留底）

> 北辰：idea 必須令「意圖匹配即過關」更似真 AI，唔係更似填字遊戲。

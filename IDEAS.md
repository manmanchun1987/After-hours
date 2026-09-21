# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260922-01
- proposed_at: 2026-09-22
- status: proposed
- pain: 「聽低／寫低／記低咋」同「記得」同一詞族，引擎若未 normalize 可能 miss
- how: Lane A 已加聽低／寫低變體；F 可把 記低|聽低|寫低|記住|記得 視為同一記憶詞族
- acceptance: 「聽低未」「寫低未」「記低咋未」→ ask_memory
- rationale: 口語記憶問法更似真 AI 聽人說話

### I-20260921-04
- proposed_at: 2026-09-21
- status: proposed
- pain: 「記低未／有円記低」口語可能 miss ask_memory，引擎當 unclear
- how: Lane A 已加記低／聽低變體；F 可把 記低|記住|記得 視為同一記憶詞族
- acceptance: 「有円記低」「記低未」→ ask_memory
- rationale: 口語記憶問法更似真 AI 聽人說話

### I-20260919-01
- proposed_at: 2026-09-19
- status: proposed
- pain: 玩家講完「我想推門」再問「你記得我講咽」時，若 chatMemory 結構唔係純字串陣列，接話可能 miss
- how: 統一 pushChatMemory 寫入短窗 recentUserLines（最近 6 句 user text），ask_memory 優先讀呢個窗
- acceptance: 先講「我想推門」→「你記得我頭先講咽」→ 回覆必含門／推
- rationale: 令記憶意圖更似真 AI 短時記憶

### I-20260919-02
- proposed_at: 2026-09-19
- status: proposed
- pain: 走廊以外 freeChat 節點未掛 sceneGoal
- how: 為有 freeChat 的後續節點補輕量 sceneGoal
- acceptance: 非 n0 freeChat 離題亦入戲擋
- rationale: 意圖＋場景導向貫穿

### I-20260919-03
- proposed_at: 2026-09-19
- status: proposed
- pain: refuse 在走廊 successIntents 外時回覆偏短
- how: refuse 材料加導回門的入戲短句
- acceptance: 「我唔入」→ 入戲冷接＋仍提門
- rationale: 拒絕仍服務場景目標

### I-20260920-01
- proposed_at: 2026-09-20
- status: proposed
- pain: 連續離題第 2 句與 hint 聲線差不夠
- how: pressure／callout 拉開短句與冷度
- acceptance: G1 離題×2 第 2 句更短更冷，仍 steer 門
- rationale: 升級要似人

### I-20260920-02
- proposed_at: 2026-09-20
- status: proposed
- pain: 走廊 bias 令「我唔入」被判 enter_door
- how: 引擎（F）僅當 enter 明顯高於 refuse 先覆蓋
- acceptance: 「我唔入」「我唔想推門」→ refuse
- rationale: 意圖聽得準

### I-20260920-03
- proposed_at: 2026-09-20
- status: proposed
- pain: 句尾助詞（喎／吤）可 miss wait／enter
- how: 助詞當可選尾巴；引擎可 strip
- acceptance: 「開門喎」→ enter
- rationale: 口語尾巴唔改意圖

### I-20260920-04
- proposed_at: 2026-09-20
- status: proposed
- pain: ask_memory 命中後若 MEM_NUDGE 抽到「停」句，但玩家頭先講「推門」，接話會錯錨
- how: GuidePolicy（須 F）按 recentUserLines 擇含門／推 定 停 的 nudge，唔隨機抽
- acceptance: 先「我想推門」再「你記得我頭先講」→ 回覆含推／門，唔講停
- rationale: 記憶要對準玩家上一句

### I-20260920-05
- proposed_at: 2026-09-20
- status: proposed
- pain: 歷史 patterns 用「諸」代「諳」，玩家打正字「諳吓」可能靠錯字位先命中
- how: Lane A 已並存諳／諸；引擎（F）可統一 normalize 諳|諸|想清楚
- acceptance: 「我要諳吓」「我要諸吓」皆 wait
- rationale: 錯字同義雙向，唔靠單一錯字

### I-20260921-01
- proposed_at: 2026-09-21
- status: proposed
- pain: ask_memory 命中後 MEM_NUDGE 仍隨機，未能保證接住玩家上一句（推門 vs 停）
- how: 引擎（F）用 recentUserLines 擇含門／推 定 停 的 nudge；本小時只加厚門錨材料，未改 F
- acceptance: 先「我想推門」再「你記得我頭先講」→ 回覆含推／門，唔講停
- rationale: T2 場景記憶接話更似短時記憶 AI

### I-20260921-02
- proposed_at: 2026-09-21
- status: proposed
- pain: ask_memory 命中後若引擎未讀 recentUserLines，門錨材料仍可能同「停」句並存抽中
- how: F 批核後按上一句含推／門 優先抽門錨 MEM_NUDGE；Lane B 已加厚門錨句
- acceptance: 先「我想推門」再「你有円記住我講」→ 回覆含推／門
- rationale: T2 短窗記憶更似真 AI

### I-20260921-03
- proposed_at: 2026-09-21
- status: proposed
- pain: ask_memory 同 enter 可同時命中（「我頭先話開門」），引擎若優先 enter 會跳過接話
- how: F 批核後 ask_memory 優先於 enter 當句含 記得／頭先／記住
- acceptance: 「我頭先話開門」→ ask_memory（可附帶 enter 特徵但不推進）
- rationale: T2 接話先於推進，更似聽完先答

## Approved

## Rejected / Done

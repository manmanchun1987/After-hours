# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260929-01
- proposed_at: 2026-09-29
- status: proposed
- pain: 「手輕輕推門把入／把一擷輕輕入／等我唾吓／唾一唾／頭先嗰句講咩嚕／而家跟住點做好先」可 miss；記憶接話未接 recentUserLines
- how: Lane A split1bq 已加；F 可 normalize 唾吓|唾一唾|把一擷輕輕入|嗰句講咩嚕 為 wait/ask_memory/enter 詞族，並接 recentUserLines
- acceptance: 「等我唾吓」「唾一唾」「頭先嗰句講咩嚕」「手輕輕推門把入」→ wait / ask_memory / enter_door
- rationale: T2 口語停低＋輕輕擷把入門＋記憶問法更似真 AI

### I-20260929-02
- proposed_at: 2026-09-29
- status: proposed
- pain: 走廊口語「幫我開門／入屋先／等我售啞氣／你要我做乜」仍可能被當成 unclear，柔軟過關唔夠
- how: Lane A split1br 已加 patterns；F 可把 幫我開門|入屋先|售啞氣|你要我做乜 接 sceneGoal.successIntents
- acceptance: 「幫我開門」「入屋先」→ enter_door；「等我售啞氣」「唔好催」→ wait；「你要我做乜」→ ask_want
- rationale: 更口語同義，意圖體感接近真 AI

### I-20260929-03
- proposed_at: 2026-09-29
- status: proposed
- pain: 「我過去開門／門畎我開／等我唵吓／慢住先／頭先講過咩嚕架」引擎已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 唵吓|慢住先|門畎我開
- acceptance: 先講「等我唵吓」再開「你記得我頭先講呀」→ wait 後 ask_memory 回聲唵吓而非客服腔
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

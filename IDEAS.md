# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260929-01
- proposed_at: 2026-09-29
- status: proposed
- pain: 「手輕輕推門把入／把一擷輕輕入／等我唎吓／唎一唎／頭先嗰句講咩嚟／而家跟住點做好先」可 miss；記憶接話未接 recentUserLines
- how: Lane A split1bq 已加；F 可 normalize 唎吓|唎一唎|把一擷輕輕入|嗰句講咩嚟 為 wait/ask_memory/enter 詞族，並接 recentUserLines
- acceptance: 「等我唎吓」「唎一唎」「頭先嗰句講咩嚟」「手輕輕推門把入」→ wait / ask_memory / enter_door
- rationale: T2 口語停低＋輕輕擷把入門＋記憶問法更似真 AI

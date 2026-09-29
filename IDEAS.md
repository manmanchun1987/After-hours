# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260930-07
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我行埋去推把入／等我唷多陣先／頭先嗰句你重記唔記得」patterns split1ch 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唷多陣先|重記唔記得
- acceptance: 先「等我唷多陣先」再「頭先嗰句你重記唔記得」→ wait 後 ask_memory 回聲唷多陣
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-06
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我去推把入／等我唷多吓先／頭先講嗰句你記唔記得」patterns split1cg 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唷多吓先|講嗰句你記唔記得
- acceptance: 先「等我唷多吓先」再「頭先講嗰句你記唔記得」→ wait 後 ask_memory 回聲唷多吓
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-05
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我去撚門入／等我唾一唾先／頭先我講嗰句你仲記唔記得」patterns split1cf 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 撚門入|唾一唾先|仲記唔記得
- acceptance: 先「等我唾一唾先」再「頭先我講嗰句你仲記唔記得」→ wait 後 ask_memory 回聲唾一唾
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

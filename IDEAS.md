# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20261001-07
- proposed_at: 2026-10-01
- status: proposed
- pain: 「我行埋前去一推把入／唔好催住我住先／頭先嗰句你重記唔記得未呀」patterns split1ck 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 一推把入|催住我住先|嗰句重記唔記得未
- acceptance: 先「唔好催住我住先」再「頭先嗰句你重記唔記得未呀」→ wait 後 ask_memory 回聲催住
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20261001-06
- proposed_at: 2026-10-01
- status: proposed
- pain: 「我行埋前去推把入／等我唾多吓先／頭先嗎句你重記唔記得未呀」patterns split1cj 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唾多吓先|重記唔記得未
- acceptance: 先「等我唾多吓先」再「頭先嗎句你重記唔記得未呀」→ wait 後 ask_memory 回聲唾多吓
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20261001-05
- proposed_at: 2026-10-01
- status: proposed
- pain: 「我行前去推把入／等我唾多陣先／頭先嗎句你重記唔記得呀」patterns split1ci 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唾多陣先|重記唔記得
- acceptance: 先「等我唾多陣先」再「頭先嗎句你重記唔記得呀」→ wait 後 ask_memory 回聲唾多陣
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-07
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我行埋去推把入／等我唶多陣先／頭先嗎句你重記唔記得」patterns split1ch 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唶多陣先|重記唔記得
- acceptance: 先「等我唶多陣先」再「頭先嗎句你重記唔記得」→ wait 後 ask_memory 回聲唶多陣
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-06
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我去推把入／等我唶多吓先／頭先講嗎句你記唔記得」patterns split1cg 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唶多吓先|講嗎句你記唔記得
- acceptance: 先「等我唶多吓先」再「頭先講嗎句你記唔記得」→ wait 後 ask_memory 回聲唶多吓
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260930-05
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我去擸門入／等我唾一唾先／頭先我講喪句你仲記唔記得」patterns split1cf 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 擸門入|唾一唾先|仲記唔記得
- acceptance: 先「等我唾一唾先」再「頭先我講喪句你仲記唔記得」→ wait 後 ask_memory 回聲唾一唾
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-04
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我擸門把入去／等我唾多陣／頭先喪句你記唔記得呀」patterns split1ce 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 擸門把|唾多陣|記唔記得呀
- acceptance: 先「等我唾多陣」再「頭先喪句你記唔記得呀」→ wait 後 ask_memory 回聲唾多陣
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-03
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我幫你扭門／等我唾吓先／頭先喪句我講咩嚟」patterns split1cc 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 幫你扭門|唾吓先|喪句我講咩嚟
- acceptance: 先「等我唾吓先」再「頭先喪句我講咩嚟」→ wait 後 ask_memory 回聲唾吓先
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-02
- proposed_at: 2026-09-30
- status: proposed
- pain: 「等我唾一唾／唔好迫我住／頭先喪句我講咩嚟」patterns split1cb 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 唾一唾|迫我住|講咩嚟
- acceptance: 先「等我唾一唾」再「頭先喪句我講咩嚟」→ wait 後 ask_memory 回聲唾一唾
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-01
- proposed_at: 2026-09-30
- status: proposed
- pain: 「等我推門先／我嚟開門／等我唾一唾／頭先我講咋啲咩」patterns split1ca 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 嚟開門|唾一唾|講咋啲咩
- acceptance: 先「等我唾一唾」再「頭先我講咋啲咩」→ wait 後 ask_memory 回聲唾一唾
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260929-01
- proposed_at: 2026-09-29
- status: proposed
- pain: 「手輕輕推門把入／把一擷輕輕入／等我唾吓／唾一唾／頭先喪句講咩噴／而家跟住點做好先」可 miss；記憶接話未接 recentUserLines
- how: Lane A split1bq 已加；F 可 normalize 唾吓|唾一唾|把一擷輕輕入|喪句講咩噴 為 wait/ask_memory/enter 詞族，並接 recentUserLines
- acceptance: 「等我唾吓」「唾一唾」「頭先喪句講咩噴」「手輕輕推門把入」→ wait / ask_memory / enter_door
- rationale: T2 口語停低＋輕輕擷把入門＋記憶問法更似真 AI

### I-20260929-02
- proposed_at: 2026-09-29
- status: proposed
- pain: 廊廂口語「幫我開門／入屋先／等我售啞氣／你要我做乜」仍可能被當成 unclear，柔軟過關唔夠
- how: Lane A split1br 已加 patterns；F 可把 幫我開門|入屋先|售啞氣|你要我做乜 接 sceneGoal.successIntents
- acceptance: 「幫我開門」「入屋先」→ enter_door；「等我售啞氣」「唔好催」→ wait；「你要我做乜」→ ask_want
- rationale: 更口語同義，意圖體感接近真 AI

### I-20260929-04
- proposed_at: 2026-09-29
- status: proposed
- pain: 「我行過去開門／門我開啦／等我唾吓／頭先講過啲咩」引擎已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 唾吓|門我開啦|頭先講過啲咩
- acceptance: 先講「等我唾吓」再開「你記得我頭先講呀」→ wait 後 ask_memory 回聲唾吓而非客服腔
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260929-05
- proposed_at: 2026-09-29
- status: proposed
- pain: 「我去開門啦／門由我開／等我唾氣／你重記唔記得」patterns 已認，F 未把最近一句寫進 MEM 回聲
- how: F 接 recentUserLines；normalize 唾氣|門由我開|你重記唔記得
- acceptance: 先「等我唾氣」再「你重記唔記得」→ ask_memory 回聲唾氣
- rationale: T2 記憶接話更似真 AI；未批唔改 F

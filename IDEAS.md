# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260927-05
- proposed_at: 2026-09-27
- status: proposed
- pain: 「等我唶吓／唶一陣／喘一喘／背過未／有冇溫功課／你記唔記得頭先」可 miss
- how: Lane A split1bb 已加；F 可 normalize 唶吓|喘一喘|背過未|記唔記得頭先 為對應詞族
- acceptance: 「等我唶吓」「喘一喘」「背過未」「你記唔記得頭先」→ wait / ask_memory
- rationale: T2 口語停低＋記憶問法更似真 AI

### I-20260927-04
- proposed_at: 2026-09-27
- status: proposed
- pain: 「等我唲吓／唲一陣／歇一歇／背書未／有冇默功課」可 miss；唲同停低、背書同記憶詞族
- how: Lane A split1ba 已加等我唲吓／唲一陣／歇一歇／背書未／有冇默功課／溫過未；F 可 normalize 唲吓|歇一歇|背書|默功課 為對應詞族
- acceptance: 「等我唲吓」「唲一陣」「歇一歇」「背書未」「有冇默功課」→ wait / ask_memory
- rationale: T2 口語停低＋記憶問法更似真 AI

### I-20260927-03
- proposed_at: 2026-09-27
- status: proposed
- pain: 「等我唸吓／唸一陣／功課默未／默功課未」可 miss；唸同停低、默功課同記憶詞族
- how: Lane A split1ay 已加等我唸吓／唸一陣／功課默未／默功課未；F 可 normalize 唸吓|功課默|默功課 為對應詞族
- acceptance: 「等我唸吓」「唸一陣」「功課默未」「默功課未」→ wait / ask_memory
- rationale: T2 口語停低＋記憶問法更似真 AI

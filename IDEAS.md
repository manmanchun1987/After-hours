# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260927-02
- proposed_at: 2026-09-27
- status: proposed
- pain: 「等我唾吓／唾一陣／功課背未／複習功課未／有冇溫習功課」可 miss；唾同停低、功課複習同記憶詞族
- how: Lane A split1ax 已加等我唾吓／唾一陣／係我唾吓／功課背未／複習功課未／有冇溫習功課；F 可 normalize 唾吓|功課背|複習功課|溫習功課 為對應詞族
- acceptance: 「等我唾吓」「唾一陣」「功課背未」「複習功課未」「有冇溫習功課」→ wait / ask_memory
- rationale: T2 口語停低＋記憶問法更似真 AI

### I-20260927-01
- proposed_at: 2026-09-27
- status: proposed
- pain: 「等我唷吓／唷一陣／背功課未／功課溫返未／有冇複課」可 miss；唷同停低、功課同記憶詞族
- how: Lane A split1aw 已加等我唷吓／唷一陣／係我唷吓／背功課／溫返功課／有冇複課；F 可 normalize 唷吓|複課|背功課|溫返功課 為對應詞族
- acceptance: 「等我唷吓」「唷一陣」「背功課未」「溫返功課未」「有冇複課」→ wait / ask_memory
- rationale: T2 口語停低＋記憶問法更似真 AI

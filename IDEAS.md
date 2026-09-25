# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20260926-01
- proposed_at: 2026-09-26
- status: proposed
- pain: 「唸底未／溫底未／背出囗未／默出囗未／溫過未」可 miss ask_memory；唸／溫／出囗同記低詞族
- how: Lane A split1ar 已加唸底／唸低／唸齊／唸返／溫底／溫返／溫過／背出囗／默出囗／記返底／聽返底；F 可 normalize 唸底|溫底|背出囗|默出囗 為記憶詞族
- acceptance: 「唸底未」「溫底未」「背出囗未」「默出囗未」「溫過未」→ ask_memory
- rationale: T2 口語記憶問法更似真 AI

### I-20260925-04
- proposed_at: 2026-09-25
- status: proposed
- pain: 「複誦未／複讀未／默書未／背過未／講返出囜未／聽晒底未」可 miss ask_memory
- how: Lane A split1ao 已加複誦／複讀／默書／背過／講返出囜／讀返出囜／聽晒底／記晒底；F 可 normalize 複誦|複讀|默書|背過 為記憶詞族
- acceptance: 「複誦未」「默書未」「背過未」「講返出囜未」「聽晒底未」→ ask_memory
- rationale: T2 口語記憶問法更似真 AI

### I-20260925-03
- proposed_at: 2026-09-25
- status: proposed
- pain: 「背低未／默低未／錄底未／收底未／抄晒底未」可 miss ask_memory；背低／默／錄底／收底同記低詞族
- how: Lane A split1an 已加背低／默低／默晒／抄晒底／背返／默返／錄底／收底／寫晒底；F 可 normalize 背低|默低|錄底|收底|抄晒底 為記憶詞族
- acceptance: 「背低未」「默低未」「錄底未」「收底未」「抄晒底未」→ ask_memory
- rationale: T2 口語記憶問法更似真 AI

### I-20260925-02
- proposed_at: 2026-09-25
- status: proposed
- pain: 「抄底未／背晒未／抄齊晒未／錄齊晒未／收齊晒未」可 miss ask_memory；底／背／齊晒同記低詞族
- how: Lane A split1am 已加抄底／背晒／背齊／抄齊晒／錄齊晒／收齊晒；F 可 normalize 抄底|背晒|背齊|抄齊晒|錄齊晒|收齊晒 為記憶詞族
- acceptance: 「抄底未」「背晒未」「抄齊晒未」「錄齊晒未」「收齊晒未」→ ask_memory
- rationale: T2 口語記憶問法更似真 AI

### I-20260925-01
- proposed_at: 2026-09-25
- status: proposed
- pain: 「有冇錄低／你有冇錄返／聽晒齊未呀／收返未呀」可 miss ask_memory；錄／收返／晒齊同記低詞族
- how: Lane A split1aj 已加聽晒齊／記晒齊／收晒／錄低／錄返／複述齊／講返齊／聽返齊／收返／記返齊；F 可 normalize 錄低|錄返|收返|聽晒齊|記晒齊 為記憶詞族
- acceptance: 「有冇錄低」「你有冇錄返」「聽晒齊未呀」「收返未呀」「記晒齊未」→ ask_memory
- rationale: T2 口語記憶問法更似真 AI

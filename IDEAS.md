# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

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


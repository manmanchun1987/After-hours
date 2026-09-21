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

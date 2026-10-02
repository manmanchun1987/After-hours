# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20261003-05
- proposed_at: 2026-10-03
- status: proposed
- pain: 「你仲記唔記得實嘋句但腳未企實」patterns split1cy 會同時中 ask_memory 同 wait；最高分獨贏，唔會先答記得實再接腳未企實
- how: F／引擎：ask_memory≥1 且 wait≥1 時唔當 unclear，回覆先接記得實再重述未企實。未批唔改 engine
- acceptance: 「你仲記唔記得實嘋句但腳未企實」→ ask_memory（或先 memory 再接 wait），唔係 refuse／unclear；「腳未企實先」仍 wait
- rationale: 混合記憶接話更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261003-04
- proposed_at: 2026-10-03
- status: proposed
- pain: 「你記唔記得實我頭先話腳未踩實」patterns split1cx 會同時中 ask_memory 同 wait；最高分獨贏，唔會先答記得再接腳未踩實
- how: F／引擎：ask_memory≥1 且 wait≥1 時唔當 unclear，回覆先接記得再重述未踩實。未批唔改 engine
- acceptance: 「你記唔記得實我頭先話腳未踩實」→ ask_memory（或先 memory 再接 wait），唔係 refuse／unclear；「腳未踩實先」仍 wait
- rationale: 混合記憶接話更似真 AI；禁 yes-word pool；未批唔開施工票


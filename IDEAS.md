# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20261012-02
- proposed_at: 2026-10-12
- status: proposed
- pain: 步入／踏進去等新同義已加，但混合句「步入去但等等」或長句多意圖時分類仍可能不穩；最長匹配優先未實作
- how: F／引擎：匹配時優先最長 phrase match；當 refuse/wait 與 enter 同時命中，看否定／停詞權重決定。未批唔改 engine
- acceptance: 「我而家步入去先」→ enter_door；「唔好幫我步入」→ refuse；「步入去但等等先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20261013-04
- proposed_at: 2026-10-13
- status: proposed
- pain: 踏進去／走進去新同義已加，但混合句「踏進去但等等」「唔好幫我踏進去」仍可能最長優先未穩；否定權重未實作
- how: F／引擎：匹配時優先最長 phrase；同時命中 enter + wait/refuse 時，看否定／停／未準備權重決定。未批唔改 engine
- acceptance: 「我而家踏進去先」→ enter_door；「唔好幫我踏進去」→ refuse；「踏進去但等等先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261013-03
- proposed_at: 2026-10-13
- status: proposed
- pain: 入單／踏入／開個門等新同義已加厚，但混合句「入單但等吓」「唔好幫我踏入」仍可能最長優先未穩；否定權重未實作
- how: F／引擎：匹配時優先最長 phrase；同時命中 enter + wait/refuse 時，看否定／停／未準備權重決定。未批唔改 engine
- acceptance: 「我而家入單先」→ enter_door；「唔好幫我踏入」→ refuse；「入單但等吓先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261013-02
- proposed_at: 2026-10-13
- status: proposed
- pain: 混合句「入單但等等」「唔好幫我入單」等多意圖時，最長 phrase 優先 + 否定／停詞權重未實作，可能誤判 enter
- how: F／引擎：匹配時優先最長 phrase；同時命中 enter + wait/refuse 時，看否定／停／未準備權重決定。未批唔改 engine
- acceptance: 「我而家入單先」→ enter_door；「唔好幫我入單」→ refuse；「入單但等等先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261013-01
- proposed_at: 2026-10-13
- status: proposed
- pain: 入單／走入單等新同義已加，但混合句「入單但等等」或長句多意圖時分類仍可能不穩；最長匹配優先未實作
- how: F／引擎：匹配時優先最長 phrase match；當 refuse/wait 與 enter 同時命中，看否定／停詞權重決定。未批唔改 engine
- acceptance: 「我而家入單先」→ enter_door；「唔好幫我入單」→ refuse；「入單但等等先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261012-02
- proposed_at: 2026-10-12
- status: proposed
- pain: 步入／踏進去等新同義已加，但混合句「步入去但等等」或長句多意圖時分類仍可能不穩；最長匹配優先未實作
- how: F／引擎：匹配時優先最長 phrase match；當 refuse/wait 與 enter 同時命中，看否定／停詞權重決定。未批唔改 engine
- acceptance: 「我而家步入去先」→ enter_door；「唔好幫我步入」→ refuse；「步入去但等等先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261012-03
- proposed_at: 2026-10-12
- status: proposed
- pain: 走進／步入等已覆蓋，但「想入去但未準備好」「入去又等等」等混合意圖長句仍可能誤判為 enter 而非 wait；否定詞權重與最長匹配未在 engine 實作
- how: 意圖層：對同時命中 enter_door + wait/refuse 的句，優先 wait/refuse 若有停／未準備／唔好；或 F 加最長 phrase 優先。未批唔改碼
- acceptance: 「我想走進去但等等先」→ wait；「唔好幫我走進去」→ refuse；「我而家走進去先」→ enter_door
- rationale: 多意圖消歧更似真 AI 理解；服務柔軟過關；禁 yes-word；未批唔開票

### I-20261012-04
- proposed_at: 2026-10-12
- status: proposed
- pain: 跳入／爬入／跑入等新同義已加，但混合句「跳入去但等等」或長句多意圖時分類仍可能不穩；最長匹配優先未實作
- how: F／引擎：匹配時優先最長 phrase match；當 refuse/wait 與 enter 同時命中，看否定／停詞權重決定。未批唔改 engine
- acceptance: 「我而家跳入去先」→ enter_door；「唔好幫我跳入」→ refuse；「跳入去但等等先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261012-05
- proposed_at: 2026-10-12
- status: proposed
- pain: 溜進去／潛進去等新同義已加，但混合句「溜進去但等等」或長句多意圖時分類仍可能不穩；最長匹配優先未實作
- how: F／引擎：匹配時優先最長 phrase match；當 refuse/wait 與 enter 同時命中，看否定／停詞權重決定。未批唔改 engine
- acceptance: 「我而家溜進去先」→ enter_door；「唔好幫我溜進去」→ refuse；「溜進去但等等先」→ wait 優先
- rationale: 上下文／優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261014-01
- proposed_at: 2026-10-14
- status: proposed
- pain: 更多口語變體如「推開喲度入去」「等我認定先」已覆蓋部分，但常見錯字「入去睇下」「開個们」或粵語諧音模糊仍可能漏；系統性模糊距離未在 patterns 層
- how: A／patterns：加常見錯字／諧音同義（入去睇下、開個們、等我想吓）；或 F 加簡單編輯距離。未批唔改 engine
- acceptance: 「推開喲度入去睇」→ enter_door；「等我認定先」→ wait；「唔好幫我開個们」→ refuse
- rationale: 模糊／錯字更似真 AI 理解；服務柔軟過關；禁 yes-word pool；未批唔開施工票

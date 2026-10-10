# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20261011-03
- proposed_at: 2026-10-11
- status: proposed
- pain: 衝入／闖入等新同義已加 patterns，但若玩家用「衝進去」或混合「我衝入但等等」可能分類不穩；長句優先未有
- how: F／引擎：匹配時優先最長 phrase，或 refuse/wait 與 enter 衝突時看否定／停詞權重。未批唔改 engine
- acceptance: 「我而家衝入去先」→ enter_door；「唔好幫我衝入」→ refuse；「衝入但等等先」→ wait 或 refuse 優先
- rationale: 更似真 AI 理解上下文／否定／優先；禁 yes-word pool；未批唔開施工票

### I-20261011-02
- proposed_at: 2026-10-11
- status: proposed
- pain: patterns split1fj 已加唔好幫我塞入／溜入 refuse 長句，但若 enter 子串多命中分數仍可能 enter 獨贏；否定語意被動詞蓋
- how: F／引擎：若句含唔好／咪／別 + 入門動詞，refuse 優先於 enter_door 子串分。未批唔改 engine
- acceptance: 「唔好幫我塞入」→ refuse；「我而家塞入去先」仍 enter_door；「推門」仍 enter_door
- rationale: 否定優先更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261011-01
- proposed_at: 2026-10-11
- status: proposed
- pain: 「唔好幫我擠入」係拒絕／停低，但句裡有「擠入」，classify 被 enter_door 子串搶走；玩家講唔好入都會被當推門
- how: F／引擎：句有唔好／咪／別 且語意係拒絕入時，唔准「擠入／入去」子串獨贏 enter。未批唔改 engine
- acceptance: 「唔好幫我擠入」→ refuse 或 wait，唔係 enter_door；單獨「我而家擠入去先」仍 enter_door；「推門」仍 enter_door
- rationale: 否定入門唔好被動詞子串蓋過，意圖更似真 AI；禁 yes-word pool；未批唔開施工票


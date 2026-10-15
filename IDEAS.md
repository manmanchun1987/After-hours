# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20261016-01
- proposed_at: 2026-10-16
- status: proposed
- pain: intent26 加厚後，更長混合「我而家開個门入去認清楚但未敢停低認位」「推開個們入去覽吓但等陣先認清楚」已部分覆蓋，但更遠諦音如「開個门入去覽下但等陣先認清楚位」或「踏入去瞧吓但停低認位先等陣」仍可能漏；可再加厚
- how: A／patterns：加更多長距離混合諦音同義。未批唔改 engine
- acceptance: 「我而家開個门入去認清楚但未敢停低認位」→ enter_door 或 wait；「推開個們入去覽吓但等陣先認清楚」→ enter_door
- rationale: 更遠模糊／長混合句更似真 AI；服務柔軟過關；未批唔開施工票

### I-20261015-08
- proposed_at: 2026-10-15
- status: proposed
- pain: intent24 加厚後，更長混合「我而家推開個門入去瞧吓但等陣先」「開個們入去認清楚但未敢停低」已部分覆蓋，但更多口語距離如「我而家推開個門入去覽吓但等陣先認清楚位」或「開個门入去瞧吓但停低認位先」仍可能漏；可再加厚
- how: A／patterns：加更多長距離混合諦音同義。未批唔改 engine
- acceptance: 「我而家推開個門入去瞧吓但等陣先」→ enter_door 或 wait；「開個們入去認清楚但未敢停低」→ enter_door
- rationale: 更遠模糊／長混合句更似真 AI；服務柔軟過關；未批唔開施工票

### I-20261015-07
- proposed_at: 2026-10-15
- status: proposed
- pain: intent23 加厚後，更長混合「推開個門入去覽吓但等陣先認清楚位」已部分覆蓋，但更多口語距離如「我而家推開個門入去瞧吓但等陣先」或「開個們入去認清楚但未敢停低」仍可能漏；可再加厚
- how: A／patterns：加更多長距離混合諦音同義。未批唔改 engine
- acceptance: 「推開個門入去但等陣先認清楚」→ enter_door 或 wait；「開個們入去瞧吓但停低認位」→ enter_door
- rationale: 更遠模糊／長混合句更似真 AI；服務柔軟過關；未批唔開施工票

### I-20261015-06
- proposed_at: 2026-10-15
- status: proposed
- pain: intent22 加厚後，更遠混合「推開個門入去但等陣先認清楚」「開個們入去瞧吓但停低認位」已覆蓋，但更長諦音／距離如「推開個門入去覽吓但等陣先認清楚位」或「踏入去認清楚但未敢停低」仍可能漏；可再加厚距離模糊
- how: A／patterns：加更多長距離混合諦音同義（推開個門入去覽吓但等陣先認清楚、踏入去認清楚但未敢停低、開個們入去覽下認位但等等）。未批唔改 engine
- acceptance: 「推開個門入去但等陣先認清楚」→ enter_door 或 wait 導向；「踏入去認清楚但未敢」→ wait；「開個們入去瞧吓但停低認位」→ enter_door
- rationale: 更遠模糊／長混合句更似真 AI 理解猶豫；服務柔軟過關；禁 yes-word pool；未批唔開施工票

### I-20261015-05
- proposed_at: 2026-10-15
- status: proposed
- pain: intent20 加厚後，混合句「推開個門入去但等等」「開個們入去瞧吓但停」已覆蓋，但更遠諦音如「推開個門入去但等陣先認清楚」或「踏入去但未敢認位」仍可能漏；可再加厚距離模糊
- how: A／patterns：加更多混合諦音同義（推開個門入去但等陣先、踏入去但未敢認位、開個們入去認清楚但停）。未批唔改 engine
- acceptance: 「推開個門入去但等等」→ enter_door 或 wait 導向；「踏入去但未敢認位」→ wait；「開個們入去認清楚但停」→ enter_door
- rationale: 更遠模糊／混合句更似真 AI 理解猶豫；服務柔軟過關；禁 yes-word pool；未批唔開施工票

### I-20261015-04
- proposed_at: 2026-10-15
- status: proposed
- pain: intent19 加厚後，更多口語如「推開個門入去但等等」「開個們入去瞧吓但停」已部分覆蓋，但更遠混合「推開個門入去但等陣先認清楚」仍可能漏；patterns 可再加厚
- how: A／patterns：加更多混合諦音同義。未批唔改 engine
- acceptance: 「推開個門入去但等等」→ enter_door；「開個們入去瞧吓但停」→ enter_door
- rationale: 混合句更似真 AI 理解猶豫；服務柔軟過關；禁 yes-word pool；未批唔開施工票

### I-20261015-03
- proposed_at: 2026-10-15
- status: proposed
- pain: intent17 加厚後，更多口語如「推開個門入去瞧吓先」「開個噬度入去覽」「踏入去瞧下先」「入喵認清楚」已覆蓋，但混合否定「推開個門入去但等等」或諦音距離「開個們入去瞧吓」仍可能漏；patterns 可再加厚模糊距離
- how: A／patterns：加更多諦音／混合句同義（推開個門入去但等等、開個們入去瞧吓、踏入去瞧下先）。未批唔改 engine
- acceptance: 「推開個門入去瞧吓先」→ enter_door；「開個噬度入去覽」→ enter_door；「踏入去瞧下先」→ enter_door；「入喵認清楚」→ enter_door
- rationale: 模糊／諦音更似真 AI 理解；服務柔軟過關；禁 yes-word pool；未批唔開施工票

### I-20261015-02
- proposed_at: 2026-10-15
- status: proposed
- pain: intent15 加厚後，更多口語如「推開噬度入去覽吓」「開個們入去覽下」「踏入去覽下先」已覆蓋，但混合否定「推開噬度入去但等等」或諦音「開個們入去覽」仍可能漏；patterns 可再加厚模糊距離
- how: A／patterns：加更多諦音／混合句同義（推開噬度入去但等等、開個們入去覽下、踏入去覽下先）。未批唔改 engine
- acceptance: 「推開噬度入去覽吓」→ enter_door；「開個們入去覽下」→ enter_door；「踏入去覽下先」→ enter_door
- rationale: 模糊／諦音更似真 AI 理解；服務柔軟過關；禁 yes-word pool；未批唔開施工票

### I-20261015-01
- proposed_at: 2026-10-15
- status: proposed
- pain: intent12 加厚後，更多口語如「推開噬度入去覽吓」「踏入去覽下先」已覆蓋，但混合否定「推開噬度入去但等等」或諦音「開個們入去」仍可能漏；patterns 可再加厚模糊距離
- how: A／patterns：加更多諦音／混合句同義（推開噬度入去但等等、開個們入去覽下、踏入去覽下先）。未批唔改 engine
- acceptance: 「推開噬度入去覽吓」→ enter_door；「開個們入去覽下」→ enter_door；「踏入去覽下先」→ enter_door
- rationale: 模糊／諦音更似真 AI 理解；服務柔軟過關；禁 yes-word pool；未批唔開施工票

### I-20261014-03
- proposed_at: 2026-10-14
- status: proposed
- pain: 更多口語變體如「推開啄度入去」「等我認定先」已覆蓋部分，但常見錯字「入去覽下」「開個们」或粵語諦音模糊仍可能漏；系統性模糊距離未在 patterns 層
- how: A／patterns：加常見錯字／諦音同義（入去覽下、開個們、等我想吓）；或 F 加簡單編輯距離。未批唔改 engine
- acceptance: 「推開啄度入去覽」→ enter_door；「等我認定先」→ wait；「唔好幫我開個们」→ refuse
- rationale: 模糊／錯字更似真 AI 理解；服務柔軟過關；禁 yes-word pool；未批唔開施工票

# IDEAS — two-stage gate

Hourly ≤1 proposed only. No code / no 施工票 until user/CEO approved. Must serve 意圖更似 AI。

## Proposed

### I-20261019-07: Natural mixed enter_door with soft refuse hesitation for corridor
- status: proposed
- lane: A
- why: 現時 enter_door 長句已加厚，但混合拒絕猶豫（例：我入去先但唔好幫我推門等陣先認位再等等）識別仍偏單向模板。加多些更自然的「想進但帶拒絕停低」同義變體，讓 IntentEngine 聽到更似真人對話式猶豫進門。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261019-06: Natural mixed unclear with soft clarification hesitation for corridor
- status: proposed
- lane: A
- why: 現時 unclear 多落 default，混合猶豫詢語（例：呢...你想我點先停低認位再等等但未敢企定？）識別仍偏簡。加多些更自然的「含糊再問清楚」同義變體，讓 IntentEngine 聽到更似真人對話式猶豫後導向 goal。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261018-14: Natural mixed agree with soft wait hesitation for corridor
- status: proposed
- lane: A
- why: 現時 agree 主要短句（好／係／得／繼續），但混合猶豫（例：好啦但等陣先停低認位再推門入去）識別仍偏模板。加多些更自然的「同意但猶後猶後」同義變體，讓 IntentEngine 聽到更似真人對話式同意後停低。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261018-12: Natural mixed refuse with soft wait hesitation for corridor
- status: proposed
- lane: A
- why: 現時 refuse 較短，混合猶豫（例：唔好幫我入去但等陣先停低認位再等等）識別仍偏模板。加多些更自然的「拒絕但猶後猶後」同義變體，讓 IntentEngine 聽到更似真人對話式拒絕後停低。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261017-19: Natural mixed ask_want with soft wait hesitation for corridor
- status: proposed
- lane: A
- why: 現時 ask_want 主要短句，但混合詢語（例：你想我點先停低認位再等等但未敢企定？）仍偏模板。加多些更自然的「先問清楚再猶後猶後」同義變體，讓 IntentEngine 聽到更似真人對話式猶豫後問意圖。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261017-10: Natural off_topic mixed with soft return to ask_want for corridor
- status: proposed
- lane: A
- why: 現時 off_topic 如天氣已能識別，但混合詢語（例：天氣咗熱但你想我點先停低認位再入去？）仍偏模板。加多些更自然的「先離題再問清楚」同義變體，讓 IntentEngine 聽到更似真人對話式變題後回歸意圖。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261016-14: Natural ask_want mixed with soft enter hesitation for corridor
- status: proposed
- lane: A
- why: 現時 enter_door 長句已加厚，但 ask_want 與 enter 混合詢語（例：你想我點樣先開個門入去覽吓但等陣先認清楚位）識別仍偏模板。加多些更自然的「先問清楚再猶後猶後進」「你想我點先停低認位再踏入」同義變體，讓 IntentEngine 聽到更似真人對話式猶豫。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261016-11: Natural hesitation mixed wait+enter for corridor enter_door
- status: proposed
- lane: A
- why: 現時長句已加厚但偏模板式。加多些更自然的猶豫／認位／停低再進同義變體（例：我先停低認位再進去覽吓但未敢企定、開個門先認清楚位再踏入去但等陣先等等）讓 IntentEngine 聽到更似真人猶豫進門。
- serve: 意圖體感更接近真 AI，柔軟過關仍主。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

## Approved
（等用戶／CEO 標 approved 先搬 DISPATCH）

## Rejected
（禁區：CDN pin/stub、yes-words/keys 對池、催 OpenRouter、改 Vera 鎖樣、範圍外大重構）

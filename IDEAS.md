# IDEAS — two-stage gate

Hourly ≤1 proposed only. No code / no 施工票 until user/CEO approved. Must serve 意圖更似 AI。

## Proposed

### I-20261021-02: Natural mixed unclear with soft enter+wait clarification for corridor
- status: approved
- lane: A
- why: 現時 unclear 多落 default，混合含糊進門猶後再確認（例：呢...我可能入去但等陣先停低認位再等等你想我點？）識別仍偏簡。加多些更自然的「含糊猶後後導向 goal」同義變體，讓 IntentEngine 聽到更似真人對話式不確定後停低再問意圖。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261021-01: Natural mixed ask_memory with soft wait hesitation for corridor
- status: approved
- lane: A
- why: 現時 ask_memory 識別較少自然混合猶後，混合記憶確認後停低（例：你聽到未但等陣先停低認位再等等？）仍偏模板。加多些更自然的「先確認記憶再猶後停低」同義變體，讓 IntentEngine 聽到更似真人對話式確認後停低。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

### I-20261020-09: Natural mixed off_topic with soft enter hesitation for corridor
- status: approved
- lane: A
- why: 現時 off_topic 如天氣已能識別，但混合進門猶後（例：天氣嘅但等陣先停低認位再推開個門入去？）識別仍偏模板或分開。加多些更自然的「先離題再猶後進門」同義變體，讓 IntentEngine 聽到更似真人對話式變題後停低再行動。
- serve: 意圖體感更接近真 AI，柔軟過關仍主；推進跟意圖結果。
- not: 不改 Vera 鎖樣，不加 yes-words 對池，不催 OpenRouter，不 CDN pin。

## Approved
- **I-20261021-02** Natural mixed unclear with soft enter+wait — CEO approved 2026-10-22 (fake-AI pack)
- **I-20261021-01** Natural mixed ask_memory with soft wait — CEO approved 2026-10-22 (fake-AI pack)
- **I-20261020-09** Natural mixed off_topic with soft enter — CEO approved 2026-10-22 (fake-AI pack)
（其餘 proposed 仍等批）

## Rejected
（禁区：CDN pin/stub、yes-words/keys 對池、催 OpenRouter、改 Vera 鎖樣、範圍外大重構）

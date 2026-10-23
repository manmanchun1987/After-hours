# Audio assets（內容音效）

第一批：Pixabay BGM（場景 loop）＋ Kenney CC0 SFX。來源／牌照見 [`SOURCES.md`](./SOURCES.md)。

| 檔 | 用途 |
|---|---|
| `bgm-office.mp3` | Vera 會議室／走廊 |
| `bgm-call.mp3` | mode:call／燈關／評核 |
| `bgm-lounge.mp3` | Elise 酒廊 |
| `bgm-pantry.mp3` | Sammi 茶水間 |
| `bgm-loop.mp3` | fallback |
| `sfx-*.mp3` | UI／通知／來電／門／衣料（見 SOURCES） |

接線由「邏輯上線」改 `app.js`（讀 `manifest.json`）；本目錄唔改主邏輯。測法：硬 refresh `?v=audio4`。

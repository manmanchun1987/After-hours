# Audio sources（第一批）

策略：Pixabay Content License（BGM）／Kenney CC0（SFX）。唔用 CC-BY／NC。Sonniss GDC 留第二批。Web Audio soft synth 只留後備；對白繼續 `speechSynthesis`（今次唔做 TTS）。

規格 BGM：約 32s loop、128kbps mp3、無歌詞為主、peak ≈ −14 LUFS。檔名對齊 `BGM.md`（引擎認呢啲名）。

## BGM（[Pixabay Music](https://pixabay.com/music/) · Content License · 商用免署名）

| 檔 | 劇本場景 | 情緒 | 來源 URL | 曲／作者 |
|---|---|---|---|---|
| `bgm-office.mp3` | Vera 會議室／走廊 | 夜辦公室、低音誘惑／權力色氣 | https://pixabay.com/music/electronic-nocturnal-rampb-synth-dark-moody-sensual-cinematic-soundscapes-481787/ | haruudu — Nocturnal R&B Synth (Dark Moody Sensual) |
| `bgm-call.mp3` | mode:call／燈關／評核 | 近距離親密危險、呼吸／色氣 | https://pixabay.com/music/beats-erotic-fantasy-22046/ | Placidplace — erotic fantasy |
| `bgm-lounge.mp3` | Elise 酒廊 | 暖、爵士鄰近、杯／海港感 | https://pixabay.com/music/bossa-nova-lounge-jazz-elevator-music-348999/ | Tunetank — Lounge Jazz Elevator Music |
| `bgm-pantry.mp3` | Sammi 茶水間 | 雪櫃嗡、軟結他、夜深 | https://pixabay.com/music/acoustic-group-acoustic-guitar-ballad-romantic-and-ambient-background-music-292682/ | JuliusH — Acoustic Guitar Ballad |
| `bgm-loop.mp3` | fallback | 沿用既有細檔 | （既有 procedural） | — |

裁剪自原曲前段；loop 接縫未做 crossfade（引擎可淡入淡出）。

**v2 換曲（PR #65）：** `bgm-office`／`bgm-call` 由 thriller／investigative 改為誘惑／親密色氣（用戶聽完 batch1 後要求）。

## SFX（[Kenney](https://kenney.nl/assets?q=audio) · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)）

只收劇本會觸發嘅 UI／門／衣料／通知／來電。

| 檔 | 用途 | 來源包 | 原檔 |
|---|---|---|---|
| `sfx-click.mp3` | UI 點擊 | [UI Audio](https://kenney.nl/assets/ui-audio) | `Audio/click5.ogg` |
| `sfx-choice.mp3` | 選項 | UI Audio | `Audio/switch27.ogg` |
| `sfx-transition.mp3` | 節點轉場 | [Interface Sounds](https://kenney.nl/assets/interface-sounds) | `Audio/maximize_001.ogg` |
| `sfx-ping.mp3` | 通知叮 | Interface Sounds | `Audio/confirmation_001.ogg` |
| `sfx-call.mp3` | 來電／通話提示 | Interface Sounds | `Audio/question_001.ogg` |
| `sfx-notify.mp3` | 來訊／提示 | Interface Sounds | `Audio/select_001.ogg` |
| `sfx-door-open.mp3` | 開門 | [RPG Audio](https://kenney.nl/assets/rpg-audio) | `Audio/doorOpen_1.ogg` |
| `sfx-door-close.mp3` | 關門 | RPG Audio | `Audio/doorClose_1.ogg` |
| `sfx-cloth.mp3` | 衣料 | RPG Audio | `Audio/cloth1.ogg` |

Kenney zip（核對用，唔整包再分發）：
- https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip
- https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip
- https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip

## 第二批（未做）

- Sonniss GDC：環境／更細門聲（商用免署名；唔好整包再分發）
- Freesound／OpenGameArt：只收 CC0 補洞

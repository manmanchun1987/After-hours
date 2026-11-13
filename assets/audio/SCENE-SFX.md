# 場次聲效跟劇情（draft）

連戲：只喺節點進場播一次對應 one-shot；雨聲係場面環境，跟住節點唔好每句重觸。新節唔好指去未存在嘅音檔。呢份係內容層標註；要響一定要改 `app.js` 嘅 `AudioEngine`（而家只 load／播 `click` `choice` `transition` `ping` `call`）。**呢個 PR 唔改 app.js**，交邏輯上線接線。

## 新檔（manifest v5）

| key | 檔 | 用法 |
|---|---|---|
| `ding` | `sfx-ding.mp3` | 升降機叮。**唔用**喺 Sammi `s1` 微波爐叮。 |
| `vibrate` | `sfx-vibrate.mp3` | 電話震兩下（已預先叠兩下）。 |
| `rain` | `sfx-rain.mp3` | 天台／雨場面 loop。 |

已有、今次接到場次：`doorOpen` `doorClose` `cloth`。`notify` 仍留檔，今次唔新接（來訊沿用 `ping`）。

## 引擎接線（邏輯上線）

要改檔：`app.js`（`AudioEngine`）。建議：

1. `loadAssets` 除現有 5 個 SFX，一併 load manifest 入面所有 `sfx` key（至少加 `doorOpen` `doorClose` `cloth` `ding` `vibrate` `rain` `notify`）。
2. 加通用 `playSfx(key)`（或 `cue`）：跟 manifest volume 播 buffer；冇檔就安靜，唔好指去未存在嘅 key。
3. 節點進場（`renderNode`／轉場後一次）：讀 `node.sfx`。字串即播一個；陣列按順序播，後者延遲約 180–250ms（例如叮完再開門）。
4. 環境雨：若 `node.ambience === "rain"` **或** `node.scene === "roof"` **或** `node.look === "rain"`，loop `rain`；已經喺雨場就唔好重頭再觸。離開呢啲條件就淡出停。雨要壓喺 BGM 下面（建議 manifest volume 0.32–0.4）。
5. 電梯／天台 **唔改 BGM 檔**：繼續沿用該線夜間曲（office／lounge／pantry），呢次唔新增獨立 BGM、唔搶其他線嘅曲。
6. **唔改** `ending_a` 對白／Shot 1，**唔接** Shot 2，唔改 `styles.css`／portrait 外觀。
7. 公開站驗聽要硬刷；audio URL 已用 manifest `version` cache-bust。頁面 `?v=` 由邏輯上線接線時一併 bump。

## 節點 one-shot（只加 `sfx` 欄，唔改 text／portrait／choices）

### data/alex.json（Vera）

| id | sfx | 原因 |
|---|---|---|
| `n0c` | `vibrate` | 標籤「電話震」；袋裏電話震兩下。 |
| `n0b` | `doorClose` | 門喺你後面筆嚟一聲。 |
| `n0g` | `doorOpen` | 房門半掩，企喺門邊。 |
| `n5` | `cloth` | 解開領口第一、第二顆鈕。 |

`n0`／`n0f` 電梯已過去式，唔補叮。`ending_a` 完全唔動（包括唔加 sfx）。

### data/morgan.json（Elise）

| id | sfx | 原因 |
|---|---|---|
| `m3x5` | `["ding","doorOpen"]` | 「叮一聲。門開。」 |
| `m3x3` | `doorClose` | 「門合。」 |
| `m7` | `doorClose` | 電梯門合上。 |
| `m4c` | `doorOpen` | 「門開咗，我就唔返頭。」 |
| `m3x4` | `doorOpen` | 「門開。高層走廊…」 |
| `m4x` | `doorOpen` | 推門未入／踏過門檻。 |
| `m8` | `cloth` | 燈關，絲衫散開。 |

### data/sam.json（Sammi）

| id | sfx | 原因 |
|---|---|---|
| `s2ding` | `ding` | 「電梯一響」「走廊盡頭電梯響一聲，門未開。」只要叮，唔好開門聲。 |
| `s3back` | `doorOpen` | 「門開咗，冷氣湧出。」 |
| `s3r` | `doorOpen` | 推防火門一條縫（同時會因 roof／rain 起雨聲）。 |
| `s2x3` | `doorOpen` | 再拍卡後門開。 |
| `s7` | `doorClose` | 電梯門合上。 |
| `s3r3` | `cloth` | 解開襯衫一顆鈕。 |
| `s8` | `cloth` | 燈關，底褲撥到一邊。 |
| `s8r` | `cloth` | 天台雨中撥開底褲。 |

**禁止：** `s1`／`s1b` 微波爐「叮」唔好用 `ding`（升降機鈴）。

## 雨場（唔使逐節寫 ambience）

`scene === "roof"` 或 `look === "rain"` 即 loop `rain`。包括 `s3r` `s3r2` `s3r3` `s3down` `s4` `s4pre` `s4w` `s4w2` `s5` `s5w` `s5w2` `s8r` `ending_s2_r` `s4only` `s4only2` `s4wait` `s4wait2` `s5tom` `s5tom2` `s5tom3` `s5bnd` `s5bnd2` `s5bnd3` `s5pace` `s5pace2` `s4p` `s4p2` `s4y` `s4z` `s4y2` `s4z2` `s5q` `s5p` `s5p2` `s5y` `s5z` `s5y2` `s5z2`。

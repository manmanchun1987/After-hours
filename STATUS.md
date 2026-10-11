# STATUS — 2026-10-12 05:16 HKT

## CODE ticket t3-1012

CHAT-FIRST 保持：chat-guide.js 不改邏輯。
- story advance / goToNode / freechat:advance 後 #choices 保持 freechat-hidden + display:none
- 只有 freechat:miss 累計 >=2 先 show
- renderNode wrap 只隱藏，不強制 reveal buttons
- yes-words (好 係 得) heat intent 保留在 intent-engine
- Owner playtests (#pt / playtest / 特定句) 不計 miss

Stub 檔 audio-bed.js / fx-play.js / compete-boot.js stamp → t3-1012。
禁碰 app.js（file too big）。無 app_b64 stub。

Live gate 過。
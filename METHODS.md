# METHODS — pick by part

Read QUALITY.md · CAST.lock.md · TASTE.md · AUTOMATION.md.

## Engine (non-negotiable)
| Part | Use | Never |
|---|---|---|
| Game JS | Full repo `app.js` + `intent-engine.js` | CDN pin / 565B stub / jsDelivr `@oldsha` |
| Free chat | IntentEngine classify → act → pick materials | Sole path = whole-string key == pool |
| Optional LLM | `llm-bridge.js` only if key already present | Default path · nag for OpenRouter key |
| chat-guide | miss / hide choices only | Override IntentEngine advance |

## Pick table (dispatcher must use this)
| Game part | Use first | Then |
|---|---|---|
| Locked face Vera/Elise/Sammi | stills in repo only | never A–K faces |
| Room behind her (office lounge pantry review roof lift) | A reuse SVG | B new empty SVG |
| Door / lift ajar — peek room without new scene | M CSS mask-image slit | A full flat room |
| Light / rain / glass / night mood | C CSS | D FX |
| Rain / glass on existing room SVG | K SVG filter in bg | C CSS |
| Isolated light planes (CCTV red / monitor blue / review glare / amber side) | L mix-blend overlay | C whole-scene grade |
| Private chat / phone sheet over room + locked still | N CSS backdrop-filter frost | C whole wash / L blend |
| Close-up on locked still (lean-in / after-hours intimacy) | O CSS crop-zoom still | A full room / C whole-scene |
| Memory flash / 記憶閃回 (ask_memory polaroid) | P CSS rotate+shadow polaroid | O crop-zoom / C wash |
| CCTV / monitor watch (review cam, hall cam, live feed grain) | Q CSS scanline drift | L static light / C wash |
| Focus-pull / DoF on locked still (desk lean, one face plane sharp) | R CSS radial-mask sharp + outer blur | O crop-zoom / C whole wash |
| Success / fail beat | D + I cue | F if file exists |
| Story advance | **IntentEngine** + E chat-first | ≤2 buttons（行為選：推門／停低） |
| New dialogue tickets | intents · scene rules · reply materials | yes-words / key lists vs pools |
| BGM on enter | F loop | I synth bed |
| SFX tick / mute | I + J | F |
| Spoken line | H if mp4 already in repo | G zh-HK synth |
| Buttons / HUD chrome | CSS / SVG in repo | anime-style empty asset if scout adds letter |

New scout letters (K+) only join a row after DISPATCH writes which part they serve.

## Letters
A reuse `assets/bg/{scene}.svg`
B new empty-scene SVG
C CSS scene motion
D fx-play cinematic
E chat-first (under IntentEngine)
F local mp3
G speechSynthesis zh-HK
H existing mp4
I Web Audio bed + cues
J mute ducks file + synth
K SVG filter weather (`feTurbulence` / displacement) baked into `assets/bg/{scene}.svg` — Pages + Safari, no Imagine, no upload, no CF
L CSS `mix-blend-mode` light planes (repo SVG/CSS layers over locked still + room; no new face, no upload, no CF) — Pages + Safari; beats C whole-wash and K weather-filter for isolated CCTV/monitor/glare
M CSS `-webkit-mask-image` / `mask-image` doorway or lift slit (radial or rect gradient) over existing A room SVG — Pages + Safari; peek room through ajar door without B new empty SVG or Imagine faces; beats A full-bleed flat room for enter/wait beats
N CSS `-webkit-backdrop-filter` / `backdrop-filter` frost on private-chat / phone sheet (blur room+still under glass; no Imagine face, no upload, no CF) — Pages + Safari; beats C whole-scene grade and L mix-blend for HUD/chat glass
O CSS `object-fit` + `object-position` / `transform: scale` crop-zoom on locked repo still only — Pages + Safari; lean-in close-up without new face, no Imagine, no upload, no CF; beats A full-bleed room and C whole-scene wash for intimacy beats
P CSS `transform: rotate` + `box-shadow` polaroid of locked repo still (ask_memory flash; reuse same still, no new face) — Pages + Safari; no Imagine, no upload, no CF; beats O lean-in crop and C whole-scene wash for memory beats
Q CSS `repeating-linear-gradient` scanlines + `@keyframes` 1px drift overlay on locked still / review SVG (CCTV watch grain; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats L static mix-blend planes and C whole-scene wash for live-feed / hall-cam beats
R CSS `-webkit-mask-image` radial + dual-layer `filter: blur` DoF (sharp centre on locked repo still, outer plane soft) — Pages + Safari; no Imagine, no upload, no CF; beats O crop-zoom and C whole-scene wash for focus-pull / desk-lean beats

## Forbidden methods
Imagine faces · blocked CDN engine pin · stolen Live2D · user upload · Suno paid · stub `app.js`

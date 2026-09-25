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
| Fluorescent flicker / pantry-office unstable tube | S CSS brightness flicker | C whole motion / L static plane |
| Private chat / phone sheet over room + locked still | N CSS backdrop-filter frost | C whole wash / L blend |
| Close-up on locked still (lean-in / after-hours intimacy) | O CSS crop-zoom still | A full room / C whole-scene |
| Memory flash / 記憶閃回 (ask_memory polaroid) | P CSS rotate+shadow polaroid | O crop-zoom / C wash |
| CCTV / monitor watch (review cam, hall cam, live feed grain) | Q CSS scanline drift | L static light / C wash |
| Focus-pull / DoF on locked still (desk lean, one face plane sharp) | R CSS radial-mask sharp + outer blur | O crop-zoom / C whole wash |
| Refuse / fail shatter on review glass or lift pane | T CSS clip-path crack | C whole wash / K weather filter |
| Incoming after-hours call on existing HUD / phone chrome | U CSS box-shadow pulse | C whole motion / I audio-only |
| Late-night elapsed / time-pressure on existing HUD clock | V CSS conic-gradient sweep ring | C whole motion / I audio-only |
| Heat / tension meter on existing HUD chrome | W CSS scaleX fill bar | C whole wash / I audio-only |
| Lift arrive / floor change on existing lift chrome | X CSS tabular-nums LED | A full lift SVG / C whole motion |
| Cinematic / film-frame beat (enter night, review stare, roof cut) | Y CSS letterbox bars | C whole motion / D FX |
| Private chat typing / 對方輸入中 on existing phone sheet | Z CSS bounce dots | E text-only / I audio-only |
| Unread private ping / 未讀紅點 on existing phone HUD | AA CSS badge pulse | U call pulse / E text-only |
| Incoming private line lands / 氣泡滑入 on existing phone sheet | AB CSS bubble slide-up | Z typing dots / E text-only |
| Inner thought / 內心 overlay on locked still + room | AC CSS multiply veil | E text-only / C whole wash |
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
S CSS `filter: brightness` + irregular `@keyframes` flicker on existing A room / locked still (pantry-office fluorescent tube buzz; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene motion and L static mix-blend for unstable after-hours tube light
T CSS `clip-path: polygon` cracked-glass overlay on review monitor / lift pane (refuse / fail shatter; reuse locked still + A room; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene wash and K weather-filter for isolated glass break beats
U CSS `box-shadow` + irregular `@keyframes` pulse on existing HUD / phone chrome (incoming after-hours call; reuse repo HUD + `sfx-call`; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene motion and I audio-only cue for a visible ring beat
V CSS `conic-gradient` + `@keyframes` sweep ring on existing HUD clock chrome (late-night elapsed / time-pressure; reuse repo HUD only) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene motion and I audio-only cue for a visible time-drain beat
W CSS `transform: scaleX` + `linear-gradient` fill on existing HUD heat/tension meter (choice heat/tension deltas; reuse repo HUD chrome only) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene wash and I audio-only cue for a visible meter beat
X CSS `font-variant-numeric: tabular-nums` + amber `text-shadow` LED + `@keyframes` digit roll on existing lift chrome (floor arrive / floor change; reuse repo HUD + lift SVG only) — Pages + Safari; no Imagine, no upload, no CF; beats A full lift SVG and C whole-scene motion for an isolated floor-LED beat
Y CSS `::before`/`::after` 2.35:1 letterbox bars on existing stage (cinematic / film-frame cut; reuse A room + locked still; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene motion and D FX file for an isolated widescreen beat
Z CSS three-dot `@keyframes` bounce on existing private-chat / phone sheet (對方輸入中; reuse N frost sheet + HUD chrome; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats E text-only chat-first and I audio-only cue for a visible typing beat
AA CSS `::after` 6px unread badge + `@keyframes` scale pulse on existing phone HUD chrome (未讀私訊紅點; reuse N sheet + HUD only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats U whole-chrome call pulse and E text-only for an isolated unread-ping beat
AB CSS `transform: translateY` + opacity `@keyframes` slide-up on existing private-chat bubble (對方氣泡落地; reuse N frost sheet + Z dots; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats Z typing-only and E text-only for the landed-message beat
AC CSS `mix-blend-mode: multiply` + low-opacity indigo veil over locked repo still + A room (內心 / inner-thought dip; reuse still + room only) — Pages + Safari; no Imagine, no upload, no CF; beats E text-only thought line and C whole-scene wash for an isolated inner-monologue beat

## Forbidden methods
Imagine faces · blocked CDN engine pin · stolen Live2D · user upload · Suno paid · stub `app.js`

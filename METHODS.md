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
| Last lamp switch-off / dark cut (n4x office kill) | AP CSS cone collapse | C whole wash / L static plane / S flicker |
| Dawn window leak / 窗漏晨光 (ending_a/b pull-back) | AS CSS warm slit gradient | C whole wash / AO blinds-shut / L plane |
| Pantry kettle / mug steam (wait hold / late kitchen) | AM CSS steam wisps | C whole wash / K weather / L plane |
| Dust / ash / 塵埃慢飄 (wait hold office/pantry air) | AQ CSS offset-path mote | C whole motion / D FX / AM steam |
| Wet floor / 潮濕地反光 (enter / wait corridor lift office) | AR CSS -webkit-box-reflect | A flat room / AL long-shadow / L plane |
| Private chat / phone sheet over room + locked still | N CSS backdrop-filter frost | C whole wash / L blend |
| Close-up on locked still (lean-in / after-hours intimacy) | O CSS crop-zoom still | A full room / C whole-scene |
| Presence / 呼吸感 on locked still (wait hold / linger) | AJ CSS scale breathe | O crop-zoom / C whole wash |
| Lift/roof glass breath / 命氣霧 (wait hold on pane) | AK CSS fog-radial | N HUD frost / C whole wash / K weather |
| Corridor / office long floor shadow (enter / wait stretch) | AL CSS skew drop-shadow | A flat room / C whole wash / L static plane |
| Memory flash / 記憶閃回 (ask_memory polaroid) | P CSS rotate+shadow polaroid | O crop-zoom / C wash |
| CCTV / monitor watch (review cam, hall cam, live feed grain) | Q CSS scanline drift | L static light / C wash |
| Review / office blinds shut / 百葉影 | AO CSS slat stripes | C whole wash / L plane / Q scanline |
| Focus-pull / DoF on locked still (desk lean, one face plane sharp) | R CSS radial-mask sharp + outer blur | O crop-zoom / C whole wash |
| Refuse / fail shatter on review glass or lift pane | T CSS clip-path crack | C whole wash / K weather filter |
| Incoming after-hours call on existing HUD / phone chrome | U CSS box-shadow pulse | C whole motion / I audio-only |
| Incoming private vibrate on existing phone HUD | AH CSS translate3d micro-shake | U glow pulse / AA badge / I audio-only |
| Late-night elapsed / time-pressure on existing HUD clock | V CSS conic-gradient sweep ring | C whole motion / I audio-only |
| Heat / tension meter on existing HUD chrome | W CSS scaleX fill bar | C whole wash / I audio-only |
| Choice heat flash on existing #choices | AE CSS heat-rim pulse | C whole wash / W meter-only |
| Lift arrive / floor change on existing lift chrome | X CSS tabular-nums LED | A full lift SVG / C whole motion |
| Keycard / door-lock grant on existing door or lift chrome | AN CSS swipe LED bar | A flat room / X floor-digit / C whole wash |
| Cinematic / film-frame beat (enter night, review stare, roof cut) | Y CSS letterbox bars | C whole motion / D FX |
| Scene cut / room change wipe (office→lift, pantry→review) | AF CSS clip-path shutter | Y letterbox hold / C whole motion / D FX |
| Private chat typing / 對方輸入中 on existing phone sheet | Z CSS bounce dots | E text-only / I audio-only |
| Unread private ping / 未讀紅點 on existing phone HUD | AA CSS badge pulse | U call pulse / E text-only |
| Incoming private line lands / 氣泡滑入 on existing phone sheet | AB CSS bubble slide-up | Z typing dots / E text-only |
| Private line seen / 已讀雙剔 on existing phone sheet | AT CSS check-stroke fill | AB slide-only / E text-only / Z typing |
| Inner thought / 內心 overlay on locked still + room | AC CSS multiply veil | E text-only / C whole wash |
| Review dossier / 評核紙滑上柜 | AD CSS paper slide | A full room / C whole motion |
| Review write / 評核筆劃 (n7/n8 pen on form) | AU CSS stroke-dashoffset ink | AD paper slide / AG stamp / E text-only |
| Success / fail beat | AG CSS stamp slam | D + I cue / F if file exists |
| Type-now after hide choices / freechat 輸入提示 | AI CSS caret blink + underline | E text-only / C whole wash |
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
AD CSS `linear-gradient` paper grain + `transform: translateY` slide on existing review desk (評核檔案滑上柜; reuse A review SVG + locked still; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats A full-bleed room and C whole-scene motion for an isolated dossier-land beat
AE CSS `box-shadow` amber heat-rim + brief `transform: scale` `@keyframes` pulse on existing `#choices` buttons when heat delta (選擇熱度閃邊; reuse repo HUD chrome only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene wash and W meter-only for an isolated choice-heat beat
AF CSS `clip-path: inset` horizontal shutter + `@keyframes` close/open wipe on existing stage (office→lift / pantry→review scene-cut; reuse A room + locked still; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats Y static letterbox hold, C whole-scene motion and D FX file for an isolated room-change wipe
AG CSS `transform: scale` + `rotate` + `mix-blend-mode: multiply` rubber-stamp slam (`@keyframes` drop-hit) on existing AD review paper / HUD chrome (success / fail chop; reuse repo paper + HUD only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats D FX file, I audio-only cue and A full room for an isolated pass/fail stamp beat
AH CSS `transform: translate3d` 1–2px irregular `@keyframes` micro-shake on existing phone HUD chrome (incoming private vibrate; reuse repo HUD + `sfx-ping`; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats U box-shadow glow pulse, AA badge-only and I audio-only cue for a tactile vibrate beat
AI CSS `caret-color` + `::after` 1px underline `@keyframes` opacity blink on existing freechat input (type-now after `#choices` hide; reuse repo HUD input only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats E text-only chat-first and C whole-scene wash for an isolated type-now beat
AJ CSS `transform: scale` 1.000–1.012 slow `@keyframes` breathe on locked repo still (wait / linger presence; reuse still only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats O crop-zoom and C whole-scene wash for an isolated she’s-still-there beat
AK CSS `radial-gradient` white fog + slow `@keyframes` bloom on existing lift/roof glass pane (命氣霧; reuse A SVG only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats N phone-sheet frost, C whole-scene wash and K weather-filter for an isolated breath-on-glass beat
AL CSS `filter: drop-shadow` + `transform: skewX` elongated floor shadow under locked still on existing A corridor/office SVG (enter / wait stretch; reuse still + room only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats A flat full-bleed room, C whole-scene wash and L static light plane for an isolated late-night long-shadow beat
AM CSS `radial-gradient` + `translateY`/`opacity` `@keyframes` steam wisps over existing A pantry SVG (kettle/mug vapor; reuse room only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene wash, K weather-filter and L static light plane for an isolated after-hours pantry steam beat
AN CSS `linear-gradient` swipe bar + inset `box-shadow` green/amber LED `@keyframes` travel on existing door/lift chrome (房卡／門禁過閘; reuse A SVG + HUD only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats A flat room, X floor-digit-only and C whole-scene wash for an isolated access-grant beat
AO CSS `repeating-linear-gradient` horizontal slat shadows + slow `@keyframes` 1px drift on existing A review/office SVG (百葉闇上 / blinds-shut stripe; reuse room + locked still only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene wash, L static mix-blend plane and Q CCTV scanlines for an isolated review blinds-shadow beat
AP CSS `radial-gradient` lamp cone + `@keyframes` scale/opacity collapse on existing A office SVG (n4x last-lamp switch-off / dark cut; reuse room + locked still only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene wash, L static mix-blend plane and S tube-flicker for an isolated kill-the-last-light beat
AQ CSS `offset-path` + `offset-distance` 2–3px specks + slow `@keyframes` drift over existing A office/pantry SVG (塵埃/煙灰慢飄; reuse room only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene motion, D FX file and AM steam-wisps for an isolated wait-hold dust-air beat
AR CSS `-webkit-box-reflect: below` + fade mask on locked repo still over existing A corridor/lift/office SVG (潮濕地反光; reuse still + room only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats A flat room, AL long-shadow-only and L static mix-blend plane for an isolated wet-floor reflection beat
AS CSS `linear-gradient` warm gold slit + slow `@keyframes` opacity bloom on existing A office/review window (ending_a/b dawn leak / 窗漏晨光; reuse room + locked still only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats C whole-scene wash, AO blinds-shut stripes and L static mix-blend plane for an isolated dawn-leak beat
AT CSS `::before`/`::after` double-check strokes + `@keyframes` color/opacity fill on existing private-chat bubble (已讀雙剔; reuse N frost sheet + AB bubble; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats AB slide-only and E text-only for an isolated she-read-it beat
AU CSS inline SVG `stroke-dashoffset` `@keyframes` ink line on existing AD review paper (評核筆劃; n7/n8 pen on form; reuse review SVG + paper only; no new face) — Pages + Safari; no Imagine, no upload, no CF; beats A full room, D FX file and E text-only for an isolated she-writes-the-form beat

## Forbidden methods
Imagine faces · blocked CDN engine pin · stolen Live2D · user upload · Suno paid · stub `app.js`

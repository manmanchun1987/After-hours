# METHODS — pick by part

Read QUALITY.md CAST.lock.md TASTE.md.

## Pick table (dispatcher must use this)
| Game part | Use first | Then |
|---|---|---|
| Locked face Vera/Elise/Sammi | stills in repo only | never A–K faces |
| Room behind her (office lounge pantry review roof lift) | A reuse SVG | B new empty SVG |
| Light / rain / glass / night mood | C CSS | D FX |
| Success / fail beat | D + I cue | F if file exists |
| Story advance | E chat-first | ≤2 buttons |
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
E chat-first
F local mp3
G speechSynthesis zh-HK
H existing mp4
I Web Audio bed + cues
J mute ducks file + synth

## Do not use
Imagine faces, blocked CDN, stolen Live2D, user upload, Suno paid.

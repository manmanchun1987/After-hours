# QUALITY bar — chase this, free only

Target: phone 9:16 story app that feels closer to MiraiMind-class play, without paid APIs.

## Must
- Face lock (CAST.lock). Player always sees the right woman.
- Chat is the main verb; ≤2 fallback buttons.
- Each node has `scene` + can advance by typed intent.
- Success / fail has a visible beat (fx-play), not a silent jump.
- Scene layer matches route (office/lounge/pantry/review/roof/lift).
- No black screen, no 404 portraits, no Sam/Morgan labels.
- Safe for Safari / iPhone viewport.
- Cantonese copy. No English baked into spoken lines.

## Should
- Distinct lighting per scene (SVG + CSS motion, not face filters).
- Heat/tension readable.
- BGM loop exists; missing SFX fail silent, never 404-spam.
- Route length ≥30 playable nodes before it feels done.
- New rooms reuse a scene id; only mint a new empty SVG when id is new.

## Never
- Imagine new faces. Hotlink Pexels/Mixkit. Stolen Live2D. Ask user to upload.
- Treat hue-rotate / Ken Burns as the product.

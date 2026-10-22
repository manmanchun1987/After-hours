2026-10-22 22:10 HKT：Lane A run。讀 AUTOMATION/LANES/DISPATCH/STATUS/IDEAS。
無開票 INTENT T1–T5（DISPATCH open 只有 STORY/CODE monitor）。輕加厚 enter/wait 模糊／錯字同義，服務柔軟過關。
改檔：intent-patterns.js（加 3 enter + 2 wait regex）、index.html（cache-bust ?v=lanea-20261022，只 patterns script）。
真實 wc intent-patterns.js = 22206 bytes（≥1KB 過閘）。
非原文煙測：開門啦→enter_door、我入去先→enter_door、等等…→wait、開個門先→enter_door、等陣→wait。Soft-pass ok。
未碰 guide/data/app/play-engine。未 commit 前 size 閘過。
四柱仍 4/4/4/4。

2026-10-22 22:06 HKT：Lane C pause run。讀 AUTOMATION/LANES/DISPATCH/STATUS/IDEAS。
現行：唔准 push data/*。只讀樹＋報 nodes。
alex.json: nodes=28 size=25095B (≥20/≥8KB) 過閘
morgan.json: nodes=22 size=29646B (≥15/≥5KB) 過閘
sam.json: nodes=21 size=27393B (≥15/≥5KB) 過閘
無單節 stub。三檔完整，sceneGoal 已補齊（前次 fakeai4）。
DISPATCH P0 STORY restore 仍開但已復原，監察中。
Live 煙測：硬刷 ?v=lanec-20261022-2206 → 18+ 閘 → 三張角色卡見到，開始按鈕存在。無白屏卡死。
改檔：只 STATUS.md。未碰 data/* / app.js / index / patterns / guide。
Lane C pause 保持。四柱仍 4/4/4/4。

[full history preserved from previous; this entry prepended]

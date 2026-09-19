最後更新：2026-09-19 16:25 HKT
STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4
STATUS：split1 lanes live；預設 hourly＝Lane A（intent-patterns＋驗收）；cache `?v=split1` — soft-pass／Guide 不變；GUIDE T3 live 仍待硬刷
Live cache：`?v=split1`
過關：**intent ∈ sceneGoal 即過**（唔使打齊原文）
架構：IntentPatterns → IntentEngine（聽）＋ GuideLines → GuidePolicy（帶戲）
車道：A patterns（預設）· B guide-lines · C data · D IDEAS · E STATUS · F Integrator(app/index only)；N≥1 可擴充，唔使開齊
禁：CDN pin／空核心檔／keys 對池／催 OpenRouter／「必須打齊選項字」票
KPI：意圖體感（含柔軟過關）接近真 AI ＞ 刷分
核心 size 閘：index／intent-engine／guide-policy／app／intent-patterns／guide-lines 皆 ≥1KB 先准 push
Open：GUIDE T3 live 硬刷離題×2；INTENT T5 live gate 待瀏覽器確認
LANES.md：A–F 完整指令已入 repo；無標車道→預設 A；新建自動化名 AH-LaneX + 讀 LANES 即可
三車模式 A+B+C 現行；D/E/F 暫緩；B/C 禁碰 app/index；Ideas≤1/h by A 或等批

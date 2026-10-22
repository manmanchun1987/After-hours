2026-10-22 21:43 HKT：PUSHED fakeai4 → main 34350c0 (42b50c9..34350c0). Full-history skim CHAT_MEM_N/HISTORY_SKIM_CAP=50. patterns wc=21870. sceneGoals added alex+28 morgan+22 sam+21. Live cache ?v=fakeai4. Soft-pass OK. No CloudAgent.

wc:
 21870 intent-patterns.js
 13610 guide-policy.js
 25095 data/alex.json
 29646 data/morgan.json
 27393 data/sam.json
117614 total

2026-10-22 21:48 HKT：fakeai4 memory steer — scan FULL dialogue transcript in state (chatUserLines+chatBotLines), safety cap 50 (CHAT_MEM_N=50). GuidePolicy skim prefers latest player detail. No second brain.

2026-10-22 21:45 HKT：CEO fake-AI pack (local, no CloudAgent)。四項：
1) IDEAS I-20261021-02/01 + I-20261020-09 → approved；DISPATCH INTENT/GUIDE/STORY/FEEL 開票後落地。intent-patterns fakeai4 加厚 mixed unclear/ask_memory/off_topic + wait/enter；matchIntent 偏長匹配。真實 wc patterns 見下。Soft-pass：開門啦→enter、等等→wait、你聽到未…→ask_memory、天氣嘅但…推門→off_topic、呢…含糊→unclear。
2) GuidePolicy fakeai4：goalSteerPhrase 從 sceneGoal.hints/ask/successIntents 出薄提示；回覆對準當前 goal 行動（推門／停低等）；冷老闆白話，禁客服腔。
3) sceneGoal 補齊（只補、不刪節）：alex nodes=28 goal=28 size≥8KB；morgan 22/22；sam 21/21。start goals：alex 推門/停低；morgan 頂真/坐近；sam 問清楚/教/走。
4) 短記憶：唔建第二腦。GuidePolicy + IntentEngine 掃 state.chatUserLines（既有 pushChatMemory）；有等/推細節時偶發 MEM_NUDGE 反映。index ?v=fakeai4。
未碰 play-engine/life；patterns 非空；無 stub wipe。四柱 4/4/4/4。

wc:
 21870 intent-patterns.js
 12657 guide-policy.js
 16752 guide-lines.js
 30247 intent-engine.js
 25095 data/alex.json
 29646 data/morgan.json
 27393 data/sam.json
  7234 index.html
170894 total

2026-10-22 21:36 HKT：Lane B T-natural-1 hotfix (over e29 literary). guide-lines clear spoken Cantonese (推門入去／停低等等／講清楚你想點) + NONSENSE_HINT/PRESSURE/CALLOUT；GuidePolicy.looksNonsense + IntentEngine keep gibberish as unclear；version=laneB-clear1-20261022；index ?v=guide-clear1 (guide-lines/policy/engine)。Replaces immersive frost poetry pools. GuidePolicy API kept (+nonsense). No OpenRouter；no data stub；app.js play path untouched。

2026-10-22 ~21:32 HKT：Lane B 執行。讀 AUTOMATION/LANES/DISPATCH/STATUS/IDEAS。
無開 GUIDE 票。禁發明追票。
發現 guide-lines.js 有 placeholder 評論，PRESSURE_REPLIES 等未定義（runtime 會爆）。
修復：寫入完整實際 pools（HINT 60+ / PRESSURE 30 / CALLOUT 20 / THOUGHTS 各 15 / MEM 15 / AGREE 10）。
真實 wc=8586B (≥1KB) 過閘。version=laneB-e29-20261022。
軟性過關：門縫霜氣推定停；miss 升級仍導向推或停；anti-repeat 大池；禁客服腔。
Live 煙測保持：硬刷 ?v=laneB-e29 → 18+ 閘 → 三張角色卡存在。無白屏。
改檔：guide-lines.js + STATUS.md。未碰 app/index/patterns/data。
IDEAS proposed 未批唔改碼。四柱仍 4/4/4/4。Lane C pause。

2026-10-22 21:30 HKT：CODE hourly 追數。讀 AUTOMATION/LANES/DISPATCH/STATUS/QUALITY。
無開 INTENT T1-T5。禁發明追票。
LIVE GATE：app.js 122KB+ 完整引擎，無 app_b64 stub。index 有 chat-guide.js。
CHAT-FIRST intact：故事 advance 後 #choices freechat-hidden；2 missed chats 先 show；renderNode 只 hide 唔 always reveal；yes-words (好 係 得) non-miss heat intent 保留；owner playtest 非中斷。
四柱仍 4/4/4/4。Lane C pause。改檔：只 STATUS.md。未碰其他。No Imagine。

2026-10-22 21:27 HKT：LIVE GATE LIVE-OK. app.js full engine 122734B（非 b64 stub）. index 有 chat-guide.js script；chat-guide.js 存在。fx-play click＋AHAudio.cue 在。Live site 200／script tags 齊。未改碼、未 revert JSON。No Imagine。

2026-10-22 ~21:24 HKT：Lane A monitor-only。讀 AUTOMATION/LANES/DISPATCH/STATUS/IDEAS/QUALITY。
無開 INTENT T1-T5。禁發明追票。
intent-patterns.js intent42 真實 wc=17107B (≥1KB) 過閘。
Soft-pass 煙測：開門啦/我入去先→enter；等等→wait；你想我點？→ask_want；天氣→off_topic 仍導向。OK。
Live 煙測：硬刷 ?v=laneA-20261022-2124 → 18+ 閘 → 三張角色卡見到，開始按鈕存在。無白屏卡死。
改檔：只 STATUS.md。未碰 intent-patterns.js / index / app / data / guide。
IDEAS 有 proposed (I-20261021-02 等)，未批唔改碼。
四柱仍 4/4/4/4。Lane C pause。

2026-10-22 ~21:15 HKT：DISPATCH hourly。讀 AUTOMATION/LANES/DISPATCH/QUALITY/STATUS。
無開 INTENT T1-T5。禁發明追票。
Live：app.js + parts (intent-patterns/engine + guide + chat-guide) 載入，無 stub loader。CODE restore-engine 監察滿足。
CHAT-FIRST：成功 typed line 後無 dump choice buttons；推進以意圖為準。FEEL 保 4。
Owner playtest 期待中。CAST.lock / TASTE / METHODS 遵守。
四柱：STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4
改檔：只 STATUS.md。未碰其他。Lane C pause。

2026-10-22 ~21:10 HKT：Lane A monitor-only。讀 AUTOMATION/LANES/DISPATCH/STATUS/IDEAS。
無開 INTENT T1-T5。禁發明追票。
intent-patterns.js intent42 真實 wc=17107B (≥1KB) 過閘。
Soft-pass 煙測：開門啦/我入去先→enter；等等→wait；你想我點？→ask_want；天氣→off_topic 仍導向。OK。
Live 煙測：硬刷 ?v=laneA-20261022-21 → 18+ 閘 → 三張角色卡見到，開始按鈕存在。無白屏卡死。
改檔：只 STATUS.md。未碰 intent-patterns.js / index / app / data / guide。
IDEAS 有 proposed (I-20261021-02 等)，未批唔改碼。
四柱仍 4/4/4/4。

2026-10-22 ~21:07 HKT：Lane C pause run。讀 AUTOMATION/LANES/DISPATCH/STATUS。
現行：唔准 push data/*。只讀樹＋報 nodes。
alex.json: nodes=28 size=14692B (≥20/≥8KB) 過閘
morgan.json: nodes=22 size=18500B (≥15/≥5KB) 過閘
sam.json: nodes=21 size=16780B (≥15/≥5KB) 過閘
無單節 stub。三檔完整。sceneGoal=0。
Live 煙測：硬刷 ?v=lanec-20261022-21 → 18+ 閘 → 三張角色卡 (Vera/Elise/Sammi) 見到，開始按鈕存在。無白屏卡死。
改檔：只 STATUS.md。未碰 data/* / app.js / index。
Lane C pause 保持。無 IDEAS sceneGoal 待批。

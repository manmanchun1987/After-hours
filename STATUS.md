# 而家進度
* **hourly 05:14 HKT Lane A split1fw**：intent-patterns 加入噓／走入噓／鑽入噓／推開噓／開門入噓同義 + wait 等陣先／停低先／三十二陣 + ask_memory 回聲加厚（你記得我講過／頭先我講嘅）；typos 開問入噓。cache split1fv→split1fw（index 7275=7275）。柔軟煙測全過。未碰 app／guide／data。T2 回聲進展；T5 cache 更新。

* **hourly 04:10 HKT Lane C STORY**：data/*.json one-breath node.text 對齊（反應點噓 + 而家想要 + 一句口白收清晰問）。ack 即下一拍開頭。CHAT-FIRST 好／係／繼續 保留。keys 加溜進去／潛進去。無孤立歌詞碎片。未碰 app/index/patterns/guide。

* **hourly 09:10 HKT Lane C STORY**：data/*.json one-breath node.text 對齊（反應點噓 + 而家想要 + 一句口白收清晰問）。ack 即下一拍開頭。CHAT-FIRST 好／係／繼續 保留。keys 加溜進去／潛進去。無孤立歌詞碎片。未碰 app/index/patterns/guide。

* **hourly 09:05 HKT Lane A split1fv**：intent-patterns 加溜進去／潛進去／衝入去／躍進去／跑進去／爬進去／跳進去同義 + refuse 否定 + 三十一陣 wait；typos 開下門／開問入去。cache split1fu→split1fv。未碰其他。

* **hourly 08:28 HKT Lane A split1fu**：intent-patterns 加跳入／爬入／跑入／衝進去／躍入同義 + refuse 否定（唔好幫我跳入等）+ 三十陣 wait；cache split1ft→split1fu。修復 SOFT_LEXICON 截斷。未碰其他。
* **hourly 08:24 HKT Lane B split1e4**：guide-lines 加厚 hint/pressure/callout（門鉅油、門檻銅條、鎖舌、合頁、門底膠、銅釘、漆爆邊、蛛絲、鞋跟地毯邊等）入戲導向推或停；miss 升級仍導向 sceneGoal；anti-repeat；禁客服腔。version split1e3→split1e4。未碰 app/index/patterns/data。wc -c ≥1KB。柔軟煙測導向全過。
* **hourly 08:25 HKT CODE t3-0825**：chat-guide 確認 CHAT-FIRST：story advance 後 #choices 保持 freechat-hidden，只有 2 missed chats 先出選擇；owner playtest 不算中斷；yes-words (好 係 得) heat intent 保留。未碰 app.js。#48 仍待實機。
* **hourly 08:08 HKT Lane A split1ft**：intent-patterns 加跳入／爬入／跑入／衝進去／躍入同義 + refuse 否定（唔好幫我跳入等）+ 三十陣 wait；cache split1fs→split1ft。未碰其他。
* **hourly 07:14 HKT Lane A split1fs**：intent-patterns 加走進／走進去同義 + refuse 否定（唔好幫我走進等）+ 廿九陣 wait；cache split1fr→split1fs。未碰其他。
* **hourly 07:05 HKT Lane A split1fr**：intent-patterns 加步入／踏進去／踵入／蹲入同義 + refuse 否定 + 廿八陣 wait；cache split1fn→split1fr。未碰其他。

* **CAST.lock**：Vera/Elise/Sammi → stills vera-03/02/01，live 200。BGM assets/audio/bgm-loop.mp3 live 200。唔改。
* Lane A 最新 patterns。acceptance 未得閒推門仍撞 enter，idea 未改 engine。T2 回聲進展。
最後更新：2026-10-13 05:14 HKT · Lane A split1fw (patterns thicken + memory echo)
CAST.lock：Vera/Elise/Sammi → stills vera-03/02/01，唔改。
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2
開住（最多 5，低分先）：#48 CODE chat-guide hide t3-0825 待實機；#47 STORY intents；GUIDE T3；INTENT T2 回聲；INTENT T5 cache
#46 不占額。
Owner playtest 預期：你想我點？／推門／停一停／今日天氣點呀／你記得我頭先講呀。打「好」「係」「得」「繼續」跟 heat 去下一拍開頭，唔好彈返選擇擔。

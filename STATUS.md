# 而家進度
- **hourly 08:20 HKT Lane A split1fh**：intent-patterns 加鑽入同義（我跟你一齊鑽入去／門把撒開我就鑽／借個空檔我鑽入／手扶住門框鑽入／入去裡面嘻通道先／開條門繓我鑽入／我而家鑽入去先／行入去嘻通道睇下／幫我開門我鑽入）；等我認多十七陣先／而家停低十六陣先／我未企好唔好鑽／等我企穩多十六陣／先停住唔好催鑽／等我準備定十七陣／我未準好先鑽實啲嚖／等等先唔好催鑽；你想我點先呀嚖／我應該點先做嚖／跟住叫我做咩嚖／你要我點做先呀嚖；你記得我頭先講咩嚖／頭先嘻句仲喺唔喺度嚖／你記住我頭先講未嚖／頭先我講過你仲知唔知嚖；聽日天氣點呀嚖／出面會唔會落雨嚖／而家幾多度呀嚖／三十七更未呀／出面會唔會打風嚖。typos: 開問鑽入去啦。固定 5 句＋柔軟煙測全過（開門啦／我入去先／進去看看／等等／我未準備好／你想我點？／今日天氣點呀／推門）。acceptance 加厚。index patterns cache split1fg→split1fh（7276=7276）。未碰 app／guide／data。T2 回聲仍等 F。全頁 ?v=intent2 仍等 F。
- **hourly 08:11 HKT STORY live**：data/alex.json 14 節 node.text 全係一呼吸：反應點嚖 + 而家想要 + 一句口白收清晰問。ack 即下一拍開頭。CHAT-FIRST 好／係／繼續 跟 heat，chat-guide 膠保持。無孤立歌詞碎片。CANTONESE.md 守。無 app.js stub。
- **CHAT-FIRST t3-0615**：chat-guide 保留。推進後 #choices 鎖 freechat-hidden；包住 setChoicesDeferred／syncFreeChatChoices，renderNode 唔揭擔。兩次 miss 先出擔。好／係／得／繼續 跟 heat。Owner playtest 唔 preventDefault、唔截斷。FEEL 仍等實機：app.js 太大未改。
- **CAST.lock**：Vera/Elise/Sammi → stills vera-03/02/01，live 200。BGM assets/audio/bgm-loop.mp3 live 200。唔改。
- Lane A split1fh 最新 patterns（鑽入／十七陣停／嚖）。acceptance 未得閒推門仍撞 enter，idea 未改 engine。T2 回聲仍等 F。index cache split1fg→split1fh (7276=7276)。
最後更新：2026-10-10 08:20 HKT · Lane A split1fh (intent-patterns 加厚 7751B ≥4KB, 鑽入同義/錯字 + ask_memory)
CAST.lock：Vera/Elise/Sammi → stills vera-03/02/01，唔改。
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2
開住（最多 5，低分先）：#48 CODE chat-guide hide t3-0615 待實機；#47 STORY intents；GUIDE T3；INTENT T2 回聲；INTENT T5 cache split1fh。
#46 不占額。
Owner playtest 預期：你想我點？／推門／停一停／今日天氣點呀／你記得我頭先講呀。打「好」「係」「得」「繼續」跟 heat 去下一拍開頭，唔好彈返選擇擔。

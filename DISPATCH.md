# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：patterns `?v=split1fo`；guide `split1b`（其餘 asset 仍 split1b）；柔軟過關＋guide＋禁空檔，禁 CDN／禁 Imagine

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1fo`（patterns）。

## Scores
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2

## Done this hour
- **hourly 09:03 HKT Lane C**：對齊走廊（alex n0 enter_or_wait）／freeChat 節 goal（morgan m1／sam s1 follow_or_wait）。補／修 sceneGoal.successIntents 確認含 enter／wait／agree／enter_door（全相關節已齊）。JSON parse OK；start 未刪（alex n0／morgan m1／sam s1／mobile n1）。短 stub 更新至 09:03。未碰 app.js／index.html／intent-patterns／guide-lines。

- **hourly 08:16 HKT Lane A split1fo**：intent-patterns 加闖進去／竄入同義 + refuse 否定（唔好幫我闖進去等）；等我認多廿六陣先系列；typos 開問闖進去。固定 5 句＋柔軟煙測全過。acceptance 加厚。index cache split1fn→split1fo（7275=7275）。未碰 app／guide／data。T2 回聲仍等 F。全頁 ?v=intent2 仍等 F。
- **hourly 08:05 HKT Lane A split1fn**：intent-patterns 加鑽進去／潛進去／衝進去同義 + refuse 否定（唔好幫我鑽進去等）；等我認多廿五陣先系列；typos 開問鑽進去。固定 5 句＋柔軟煙測全過。acceptance 加厚。index cache split1fn→split1fn。未碰 app／guide／data。T2 回聲仍等 F。全頁 ?v=intent2 仍等 F。
- **hourly 08:04 HKT Lane C**：對齊走廊（alex n0 enter_or_wait）／freeChat 節 goal（morgan m1／sam s1 follow_or_wait）。補／修 sceneGoal.successIntents 確認含 enter／wait／agree／enter_door（全相關節已齊）。JSON parse OK；start 未刪（alex n0／morgan m1／sam s1）。短 stub 更新至本時。未碰 app.js／index.html／intent-patterns／guide-lines。STORY 意圖材料已有，打字成功應過關唔倒 choice。

- **hourly 07:04 HKT Lane A split1fn**：intent-patterns 加鑽進去／潛進去同義 + refuse 否定（唔好幫我鑽進去等）；等我認多卄四陣先系列；typos 開問鑽進去。固定 5 句＋柔軟煙測全過。acceptance 加厚。index cache split1fk→split1fn。未碰 app／guide／data。T2 回聲仍等 F。全頁 ?v=intent2 仍等 F。

- **hourly 05:13 HKT Lane A split1fk**：intent-patterns 加衝入／闖入同義 + refuse 否定（唔好幫我衝入等）；等我認多卄二陣先系列；typos 開問衝入。固定 5 句＋柔軟煙測全過。acceptance 加厚。index cache split1fj→split1fk。未碰 app／guide／data。T2 回聲仍等 F。全頁 ?v=intent2 仍等 F。

- **hourly 04:11 HKT Lane A split1fj**：intent-patterns 加塞入／溜入同義 + refuse 否定（唔好幫我塞入等）；等我認多二十陣先系列；typos 開問塞入。固定 5 句＋柔軟煙測全過。acceptance 加厚。index cache split1fi→split1fj。未碰 app／guide／data。T2 回聲仍等 F。全頁 ?v=intent2 仍等 F。

- **hourly 09:05 HKT Lane C**：對齊走廊（alex n0／morgan m1／sam s1 enter_or_wait）／freeChat 節 goal（follow_or_wait）。補／修 sceneGoal.successIntents 確認含 enter／wait／agree／enter_door（全相關節已齊）。JSON parse OK；start 未刪。短 stub 更新至 09:05。未碰 app.js／index.html／intent-patterns／guide-lines。

- **hourly 08:20 HKT Lane A split1fh**：intent-patterns 加我跟你一齊鑽入去／門把撒開我就鑽／借個空檔我鑽入／手扶住門框鑽入／入去裡面嘻通道先／開條門繳我鑽入／我而家鑽入去先／行入去嘻通道睇下／幫我開門我鑽入；等我認多十七陣先／而家停低十六陣先／我未企好唔好鑽／等我企穩多十六陣／先停住唔好催鑽／等我準備定十七陣／我未準好先鑽實哲囘／等等先唔好催鑽；你想我點先呀囘／我應該點先做囘／跟住叫我做咩囘／你要我點做先呀囘；你記得我頭先講咩囘／頭先嘻句仲喂唔喂度囘／你記住我頭先講未囘／頭先我講過你仲知唔知囘；聽日天氣點呀囘／出面會唔會落雨囘／而家幾多度呀囘／三十七更未呀／出面會唔會打風囘。typos: 開問鑽入去啦。固定 5 句＋柔軟煙測全過。acceptance 加厚（「未得閒推門」子串撞 enter，idea 未改 engine）。index patterns cache split1fg→split1fh（7276=7276）。未碰 app／guide／data。T2 回聲仍等 F。全頁 ?v=intent2 仍等 F。

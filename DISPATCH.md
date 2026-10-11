# DISPATCH

## 三車模式（現行唯一預設）
用戶極限＝**A＋B＋C**。每次 run 讀 `LANES.md` 對應車。
- **A** → `intent-patterns.js`（+ 可選 STATUS 一行／必要 cache-bust）
- **B** → 只 `guide-lines.*`
- **C** → 只 `data/*.json`
- **D／E／F 暫緩**；B／C **禁** app／index；F 僅 A 確認需要
- Ideas：A ≤1/h proposed 或等批
- Live 驗收：patterns `?v=split1fs`；guide `split1b`（其餘 asset 仍 split1b）；柔軟過關＋guide＋禁空檔，禁 CDN／禁 Imagine

## 過關標準
intent∈sceneGoal 即過；禁打齊原文票。驗收非原文：開門啦／我入去先／進去看看／等等／我未準備好。Cache `?v=split1fs`（patterns）。

## Scores
STORY 3 · PICTURE 4 · SOUND 3 · FEEL 2

## Done this hour
- **hourly 07:14 HKT Lane A split1fs**：intent-patterns 加走進／走進去同義 + refuse 否定（唔好幫我走進等）+ 等我認多廿九陣先；typos 開問走進去。柔軟煙測（開門啦／我入去先／進去看看／等等／我未準備好）全過。acceptance 加厚。index cache split1fr→split1fs。未碰 app／guide／data。T2 回聲仍等 F。
- **hourly 07:05 HKT Lane A split1fr**：intent-patterns 加步入／踏進去／踵入／蹲入同義 + refuse 否定（唔好幫我步入等）+ 等我認多廿八陣先；typos 開問步入去。柔軟煙測（開門啦／我入去先／進去看看／等等／我未準備好）全過。acceptance 加厚。index cache split1fn→split1fr（7275=7275）。未碰 app／guide／data。T2 回聲仍等 F。

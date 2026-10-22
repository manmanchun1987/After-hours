# Fake-AI auto-playtest

- When: **2026-10-23 03:54:19 HKT**
- Seed: `42`
- Engines: IntentEngine `colloq1` · GuidePolicy `human-step-20261022` · GuideLines `human-step-20261022`
- Result: **205 PASS** / **0 FAIL** / 205 turns · human-avg **100** · warn-turns 0

## Fail reasons

_none_

## Nodes with systematic fails

_none_

## Per-scene turns

### alex / `n0` — 走廊 23:44

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "開門啦" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "我入去先" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "推門入去" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "等等" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "等陣" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "停低先" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | unclear | "嗯" | `unclear` | hint | 100 | "你頭先似想停低。推門入去，定停低等等？" |
| PASS | unclear | "……" | `unclear` | pressure | 100 | "再亂打我當你未答。推門入去，定停低等等？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "無意義到此為止。推門入去，定停低等等？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "夠喇，亂碼收起。推門入去，定停低等等？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "而家就要答，砸字作廢。推門入去，定停低等等？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "離題啦，而家就要答。推門入去，定停低等等？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "天氣同飯到此為止。推門入去，定停低等等？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | hint | 100 | "問題我收到。推門入去，定停低等等？" |

### alex / `n1` — 週五 23:47

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "等等" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "等陣" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "停低先" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你話入去，我聽到。應承聽，定問清楚，定停低？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "你頭先似想停低。應承聽，定問清楚，定停低？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "無意義到此為止。應承聽，定問清楚，定停低？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "夠喇，亂碼收起。應承聽，定問清楚，定停低？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家就要答，砸字作廢。應承聽，定問清楚，定停低？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "唔再睇你砸鍵盤。應承聽，定問清楚，定停低？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "天氣同飯到此為止。應承聽，定問清楚，定停低？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "唔再聽閒話。應承聽，定問清楚，定停低？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### alex / `n2a` — 配合

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我企近啲" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | success | "俾我靠近" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | hint | 100 | "你想停，我聽到。應承繼續改，定問清楚，定坐近啲？" |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | pressure | 100 | "想行入去未算呢步答案。應承繼續改，定問清楚，定坐近啲？" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "而家就要一句實在。應承繼續改，定問清楚，定坐近啲？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "夠喇，亂碼收起。應承繼續改，定問清楚，定坐近啲？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "而家就要答，砸字作廢。應承繼續改，定問清楚，定坐近啲？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "唔再睇你砸鍵盤。應承繼續改，定問清楚，定坐近啲？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "聽唔明就當未講。應承繼續改，定問清楚，定坐近啲？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "唔再聽閒話。應承繼續改，定問清楚，定坐近啲？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "最後一次，閒話收起。應承繼續改，定問清楚，定坐近啲？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "最後，未準備好都要一句。應承繼續改，定問清楚，定坐近啲？" |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### morgan / `m1` — 酒廊 21:10

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "點解要我留" | `challenge` (want `challenge`) | close | 100 | _(advance)_ |
| PASS | success | "我頂真問" | `challenge` (want `challenge`) | close | 100 | _(advance)_ |
| PASS | success | "我企近啲" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | success | "俾我靠近" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | hint | 100 | "你想停，我聽到。應承傾，定再近，定問清楚？" |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | pressure | 100 | "想行入去未算呢步答案。應承傾，定再近，定問清楚？" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "而家就要一句實在。應承傾，定再近，定問清楚？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "夠喇，亂碼收起。應承傾，定再近，定問清楚？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "而家就要答，砸字作廢。應承傾，定再近，定問清楚？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "唔再睇你砸鍵盤。應承傾，定再近，定問清楚？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "聽唔明就當未講。應承傾，定再近，定問清楚？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "唔再聽閒話。應承傾，定再近，定問清楚？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "最後一次，閒話收起。應承傾，定再近，定問清楚？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "最後，未準備好都要一句。應承傾，定再近，定問清楚？" |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### morgan / `m3` — 房間卡

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "等等" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "等陣" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "停低先" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我企近啲" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | success | "俾我靠近" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你話入去，我聽到。應承睇卡，定問清楚，定再近？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "你頭先似想停低。應承睇卡，定問清楚，定再近？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "無意義到此為止。應承睇卡，定問清楚，定再近？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "夠喇，亂碼收起。應承睇卡，定問清楚，定再近？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家就要答，砸字作廢。應承睇卡，定問清楚，定再近？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "唔再睇你砸鍵盤。應承睇卡，定問清楚，定再近？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "天氣同飯到此為止。應承睇卡，定問清楚，定再近？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "唔再聽閒話。應承睇卡，定問清楚，定再近？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### sam / `s1` — 茶水間 22:40

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "等等" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "等陣" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "停低先" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你話入去，我聽到。接麵應承，定問清楚，定坐低？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "你頭先似想停低。接麵應承，定問清楚，定坐低？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "無意義到此為止。接麵應承，定問清楚，定坐低？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "夠喇，亂碼收起。接麵應承，定問清楚，定坐低？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家就要答，砸字作廢。接麵應承，定問清楚，定坐低？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "唔再睇你砸鍵盤。接麵應承，定問清楚，定坐低？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "天氣同飯到此為止。接麵應承，定問清楚，定坐低？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "唔再聽閒話。接麵應承，定問清楚，定坐低？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### sam / `s2x` — 影印機後

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "等等" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "等陣" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "停低先" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我走先" | `refuse` (want `refuse`) | close | 100 | _(advance)_ |
| PASS | success | "唔入喇" | `refuse` (want `refuse`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你話入去，我聽到。返工位當食完，定跟去，定問清楚？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "你頭先似想停低。返工位當食完，定跟去，定問清楚？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "無意義到此為止。返工位當食完，定跟去，定問清楚？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "夠喇，亂碼收起。返工位當食完，定跟去，定問清楚？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家就要答，砸字作廢。返工位當食完，定跟去，定問清楚？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "唔再睇你砸鍵盤。返工位當食完，定跟去，定問清楚？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "天氣同飯到此為止。返工位當食完，定跟去，定問清楚？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "唔再聽閒話。返工位當食完，定跟去，定問清楚？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### short / `n0` — short-phrases 走廊 23:44

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | short | "嗯" | `unclear` (want `unclear`) | hint | 100 | "嗯一聲未夠。推門入去，定停低等等？" |
| PASS | short | "係" | `agree` (want `agree`) | hint | 100 | "係，我聽到。推門入去，定停低等等？" |
| PASS | short | "做咩" | `ask_want` (want `ask_want`) | hint | 100 | "你問緊下一步。推門入去，定停低等等？" |
| PASS | short | "你好" | `greet` (want `greet`) | hint | 100 | "人到就得。推門入去，定停低等等？" |
| PASS | short | "hi" | `greet` (want `greet`) | hint | 100 | "哈囉我聽到。推門入去，定停低等等？" |
| PASS | short | "hello vera" | `greet` (want `greet`) | hint | 100 | "見到你喇。推門入去，定停低等等？" |
| PASS | short | "哈囉" | `greet` (want `greet`) | hint | 100 | "招呼我收下。推門入去，定停低等等？" |
| PASS | short | "ok lah" | `agree` (want `agree`) | hint | 100 | "應承我先記下。推門入去，定停低等等？" |
| PASS | short | "yes" | `agree` (want `agree`) | hint | 100 | "得，我聽到。推門入去，定停低等等？" |
| PASS | short | "no" | `refuse` (want `refuse`) | hint | 100 | "拒絕我收下。推門入去，定停低等等？" |
| PASS | short | "唔得" | `refuse` (want `refuse`) | hint | 100 | "走字我聽到。推門入去，定停低等等？" |
| PASS | short | "我走先" | `refuse` (want `refuse`) | hint | 100 | "你話算，我知。推門入去，定停低等等？" |
| PASS | short | "bye" | `refuse` (want `refuse`) | hint | 100 | "你想走我聽到。推門入去，定停低等等？" |
| PASS | short | "食咗飯未" | `off_topic` (want `off_topic`) | hint | 100 | "呢句離題。推門入去，定停低等等？" |
| PASS | short | "what's up" | `ask_want` (want `ask_want`) | hint | 100 | "你問我點。推門入去，定停低等等？" |
| PASS | short | "我鐘意你" | `flirt` (want `flirt`) | hint | 100 | "心急我知。推門入去，定停低等等？" |
| PASS | short | "come closer" | `flirt` (want `flirt`) | hint | 100 | "想近我聽到。推門入去，定停低等等？" |
| PASS | short | "你敢唔敢" | `challenge` (want `challenge`) | hint | 100 | "頂嘴我收到。推門入去，定停低等等？" |
| PASS | short | "快啲啦" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | short | "go" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | short | "推啦" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | short | "等等啦" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | short | "咩話" | `unclear` (want `unclear`) | hint | 100 | "你頭先似想停低。推門入去，定停低等等？" |
| PASS | short | "huh" | `unclear` (want `unclear`) | hint | 100 | "唔明就當未答。推門入去，定停低等等？" |
| PASS | nonsense | "asdfjk" | `unclear` (want `unclear`) | hint | 100 | "呢啲字無意義。推門入去，定停低等等？" |
| PASS | nonsense | "哈哈" | `unclear` (want `unclear`) | hint | 100 | "鍵盤噪音我唔收。推門入去，定停低等等？" |
| PASS | short | "繼續啦" | `agree` (want `agree`) | hint | 100 | "你話好，我收到。推門入去，定停低等等？" |
| PASS | short | "開門啦" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | short | "so what" | `ask_want` (want `ask_want`) | hint | 100 | "你頭先提過入去。推門入去，定停低等等？" |
| PASS | short | "唔明" | `unclear` (want `unclear`) | hint | 100 | "你再講白啲。推門入去，定停低等等？" |
| PASS | short | "好正" | `flirt` (want `flirt`) | hint | 100 | "呢句夠膽。推門入去，定停低等等？" |
| PASS | short | "wait" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | short | "let's go" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | short | "點解要我留" | `challenge` (want `challenge`) | hint | 100 | "你挑戰我。推門入去，定停低等等？" |
| PASS | short | "今日天氣好熱" | `off_topic` (want `off_topic`) | hint | 100 | "呢句離題。推門入去，定停低等等？" |

### short / `n1` — short-phrases 週五 23:47

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | short | "嗯" | `unclear` (want `unclear`) | hint | 100 | "嗯一聲未夠。應承聽，定問清楚，定停低？" |
| PASS | short | "係" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | short | "做咩" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | short | "你好" | `greet` (want `greet`) | hint | 100 | "見到你。應承聽，定問清楚，定停低？" |
| PASS | short | "hi" | `greet` (want `greet`) | hint | 100 | "招呼收到。應承聽，定問清楚，定停低？" |
| PASS | short | "hello vera" | `greet` (want `greet`) | hint | 100 | "人到就得。應承聽，定問清楚，定停低？" |
| PASS | short | "哈囉" | `greet` (want `greet`) | hint | 100 | "哈囉我聽到。應承聽，定問清楚，定停低？" |
| PASS | short | "ok lah" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | short | "yes" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | short | "no" | `refuse` (want `refuse`) | hint | 100 | "你話算，我知。應承聽，定問清楚，定停低？" |
| PASS | short | "唔得" | `refuse` (want `refuse`) | hint | 100 | "你想走我聽到。應承聽，定問清楚，定停低？" |
| PASS | short | "我走先" | `refuse` (want `refuse`) | hint | 100 | "唔得我收到。應承聽，定問清楚，定停低？" |
| PASS | short | "bye" | `refuse` (want `refuse`) | hint | 100 | "你話唔，我聽到。應承聽，定問清楚，定停低？" |
| PASS | short | "食咗飯未" | `off_topic` (want `off_topic`) | hint | 100 | "閒話收低。應承聽，定問清楚，定停低？" |
| PASS | short | "what's up" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | short | "我鐘意你" | `flirt` (want `flirt`) | hint | 100 | "近唔近，我聽到。應承聽，定問清楚，定停低？" |
| PASS | short | "come closer" | `flirt` (want `flirt`) | hint | 100 | "你想埋嚟，我知。應承聽，定問清楚，定停低？" |
| PASS | short | "你敢唔敢" | `challenge` (want `challenge`) | hint | 100 | "頂嘴我收到。應承聽，定問清楚，定停低？" |
| PASS | short | "快啲啦" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | short | "go" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | short | "推啦" | `enter_door` (want `enter_door`) | hint | 100 | "你話入去，我聽到。應承聽，定問清楚，定停低？" |
| PASS | short | "等等啦" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | short | "咩話" | `unclear` (want `unclear`) | hint | 100 | "你頭先似想停低。應承聽，定問清楚，定停低？" |
| PASS | short | "huh" | `unclear` (want `unclear`) | hint | 100 | "唔明就當未答。應承聽，定問清楚，定停低？" |
| PASS | nonsense | "asdfjk" | `unclear` (want `unclear`) | hint | 100 | "呢啲字無意義。應承聽，定問清楚，定停低？" |
| PASS | nonsense | "哈哈" | `unclear` (want `unclear`) | hint | 100 | "鍵盤噪音我唔收。應承聽，定問清楚，定停低？" |
| PASS | short | "繼續啦" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | short | "開門啦" | `enter_door` (want `enter_door`) | hint | 100 | "想行入去我知。應承聽，定問清楚，定停低？" |
| PASS | short | "so what" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | short | "唔明" | `unclear` (want `unclear`) | hint | 100 | "你頭先提過入去。應承聽，定問清楚，定停低？" |
| PASS | short | "好正" | `flirt` (want `flirt`) | hint | 100 | "心急我知。應承聽，定問清楚，定停低？" |
| PASS | short | "wait" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | short | "let's go" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | short | "點解要我留" | `challenge` (want `challenge`) | hint | 100 | "你挑戰我。應承聽，定問清楚，定停低？" |
| PASS | short | "今日天氣好熱" | `off_topic` (want `off_topic`) | hint | 100 | "呢句離題。應承聽，定問清楚，定停低？" |

## How to run

```bash
node tools/auto-playtest.js
node tools/auto-playtest.js --seed=7 --chars=alex
node tools/auto-playtest.js --strict   # exit 1 if any FAIL
```

Local heuristics only — no paid LLM judge. Does not touch live play path.

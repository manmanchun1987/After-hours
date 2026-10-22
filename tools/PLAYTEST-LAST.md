# Fake-AI auto-playtest

- When: **2026-10-22 23:45:06 HKT**
- Seed: `42`
- Engines: IntentEngine `split1` · GuidePolicy `split1-wrong-react-20261022` · GuideLines `laneB-p0-steer-20261022`
- Result: **135 PASS** / **0 FAIL** / 135 turns · human-avg **99.5** · warn-turns 10

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
| PASS | unclear | "嗯" | `unclear` | hint | 100 | "亂打停一停。推門，定停低？講清楚。" |
| PASS | unclear | "……" | `unclear` | pressure | 100 | "哈完未？講清楚你想點：推定停。" |
| WARN | nonsense | "哈哈" | `unclear` | callout | 85 | "最後通牒：推門入去，定停低等等？講清楚你想點。" · warn:nonsense_no_ack |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家決定。推門入去／停低等等。唔好再亂打。" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "唔再睇鍵盤垃圾。講清楚你想點：推定停。" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "夠喇。推門入去，定停低等等？" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "離題啦。推門入去，定停低等等？" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | hint | 100 | "頭先同門有關。推定停，答短啲。" |

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
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你頭先似想停低。應承聽，定問清楚，定停低？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "無內容。推門入去定停低——二揀一。" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "夠喇。聽唔明嗰啲——推門入去，定停低？而家講清楚。" |
| WARN | nonsense | "哈哈" | `unclear` | callout | 85 | "最後通牒：推門入去，定停低等等？講清楚你想點。" · warn:nonsense_no_ack |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家決定。推門入去／停低等等。唔好再亂打。" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "聽唔明就當未講。推門入去，定停低？講。" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "無重點。嗰句當未講。應承聽，定問清楚，定停低？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "推門入去就入。停低就等。你揀。" · ok |
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
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | hint | 100 | "你頭先想近啲。應承繼續改，定問清楚，定坐近啲？" |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | pressure | 100 | "再講一次。應承繼續改，定問清楚，定坐近啲？" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "最後通牒：推門入去，定停低等等？講清楚你想點。應承繼續改，定問清楚，定坐近啲？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "而家：推門入去，定停低。唔好再砸字。應承繼續改，定問清楚，定坐近啲？" |
| WARN | nonsense | "哈哈" | `unclear` | callout | 80 | "而家：推門入去，定停低。唔好再砸字。應承繼續改，定問清楚，定坐近啲？" · warn:exact_repeat |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "無意義到此。講清楚：推定停。應承繼續改，定問清楚，定坐近啲？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "推。定停。聽唔明嗰句當冇。應承繼續改，定問清楚，定坐近啲？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "無重點。嗰句當未講。應承繼續改，定問清楚，定坐近啲？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "講清楚。應承繼續改，定問清楚，定坐近啲？" · ok |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "二揀一。應承繼續改，定問清楚，定坐近啲？" |
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
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | hint | 100 | "你頭先想近啲。應承傾，定再近，定問清楚？" |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | pressure | 100 | "短句：應承傾，定再近，定問清楚？" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "唔好再哈。推門入去，定停低？。應承傾，定再近，定問清楚？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "停玩鍵盤。推門入去，定停低？而家。應承傾，定再近，定問清楚？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "而家：推門入去，定停低。唔好再砸字。應承傾，定再近，定問清楚？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "亂打唔再回。推定停。答。應承傾，定再近，定問清楚？" |
| WARN | nonsense | "kkkk" | `unclear` | callout | 85 | "最後通牒：推門入去，定停低等等？講清楚你想點。應承傾，定再近，定問清楚？" · warn:nonsense_no_ack |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "而家唔傾呢啲。應承傾，定再近，定問清楚？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "二揀一。應承傾，定再近，定問清楚？" · ok |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "講清楚。應承傾，定再近，定問清楚？" |
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
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "我要你揀：推門入去，定停低。唔好講廢話。" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "無內容再嚟一次我當迴避。推定停。應承睇卡，定問清楚，定再近？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "聽唔明就當未講。推門入去，定停低？講。" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "停玩鍵盤。推門入去，定停低？而家。" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "推。定停。聽唔明嗰句當冇。應承睇卡，定問清楚，定再近？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "哈完未？應承睇卡，定問清楚，定再近？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "無重點。嗰句當未講。應承睇卡，定問清楚，定再近？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "站喺門前夠耐。推門，定停低？" · ok |
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
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你頭先似想停低。接麵應承，定問清楚，定坐低？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "哈完未？講清楚你想點：推定停。接麵應承，定問清楚，定坐低？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "聽唔明。最後一次：推門，定停低。接麵應承，定問清楚，定坐低？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "推。定停。聽唔明嗰句當冇。接麵應承，定問清楚，定坐低？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "最後：聽唔明嘅當無效。推門定停低？。接麵應承，定問清楚，定坐低？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "聽唔明你講乜。接麵應承，定問清楚，定坐低？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "最後一次。接麵應承，定問清楚，定坐低？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "二揀一。接麵應承，定問清楚，定坐低？" · ok |
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
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "返工位當食完，定跟去，定問清楚？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "哈完未？返工位當食完，定跟去，定問清楚？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "亂打完。推定停。即刻答。返工位當食完，定跟去，定問清楚？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "亂打唔再回。推定停。答。返工位當食完，定跟去，定問清楚？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "無意義到此。講清楚：推定停。返工位當食完，定跟去，定問清楚？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "唔好再砸鍵盤。返工位當食完，定跟去，定問清楚？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "無重點。嗰句當未講。返工位當食完，定跟去，定問清楚？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "即刻。返工位當食完，定跟去，定問清楚？" · ok |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

## How to run

```bash
node tools/auto-playtest.js
node tools/auto-playtest.js --seed=7 --chars=alex
node tools/auto-playtest.js --strict   # exit 1 if any FAIL
```

Local heuristics only — no paid LLM judge. Does not touch live play path.

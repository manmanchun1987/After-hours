# Fake-AI auto-playtest

- When: **2026-10-22 23:31:40 HKT**
- Seed: `42`
- Engines: IntentEngine `split1` · GuidePolicy `split1-wrong-react-20261022` · GuideLines `laneB-p0-steer-20261022`
- Result: **130 PASS** / **0 FAIL** / 130 turns · human-avg **99.2** · warn-turns 11

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
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "點解要我留" | `challenge` (want `challenge`) | close | 100 | _(advance)_ |
| PASS | success | "我頂真問" | `challenge` (want `challenge`) | close | 100 | _(advance)_ |
| PASS | success | "我企近啲" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | success | "俾我靠近" | `flirt` (want `flirt`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | hint | 100 | "你頭先想近啲。應承改，定問清楚，定站近？" |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | pressure | 100 | "快啲。應承改，定問清楚，定站近？" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "亂打完。推定停。即刻答。應承改，定問清楚，定站近？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "聽唔明就當未講。推門入去，定停低？講。應承改，定問清楚，定站近？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "夠温吞。短答：推門入去，或者停低等等。應承改，定問清楚，定站近？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家決定。推門入去／停低等等。唔好再亂打。應承改，定問清楚，定站近？" |
| WARN | nonsense | "kkkk" | `unclear` | callout | 80 | "亂打完。推定停。即刻答。應承改，定問清楚，定站近？" · warn:exact_repeat |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "閒話收低。應承改，定問清楚，定站近？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "短答。應承改，定問清楚，定站近？" · ok |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "講清楚。應承改，定問清楚，定站近？" |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### alex / `n2a` — 配合

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "我應承" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | hint | 100 | "你頭先似應承。應承繼續。" |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | pressure | 100 | "短句：應承繼續。" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "無意義到此。講清楚：推定停。應承繼續。" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "推。定停。聽唔明嗰句當冇。應承繼續。" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "亂碼到此。門就喺度——推定停。應承繼續。" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "聽唔明。揀一個——推門定停低。應承繼續。" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "哈完未？應承繼續。" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "而家唔傾呢啲。應承繼續。" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "答我。應承繼續。" · ok |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "二揀一。應承繼續。" |
| WARN | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | callout | 80 | "答我。應承繼續。" · warn:exact_repeat |

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
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | hint | 100 | "你頭先想近啲。頂真講，定坐近——講清楚你想點？" |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | pressure | 100 | "唔好再兜。頂真講，定坐近——講清楚你想點？" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "夠温吞。短答：推門入去，或者停低等等。頂真講，定坐近——講清楚你想點？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "聽唔明。最後一次：推門，定停低。頂真講，定坐近——講清楚你想點？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "夠喇。聽唔明嗰啲——推門入去，定停低？而家講清楚。頂真講，定坐近——講清楚你想點？" |
| WARN | nonsense | "asdf" | `unclear` | callout | 85 | "最後一次。頂真講，定坐近——講清楚你想點？" · warn:nonsense_no_ack |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "聽唔明。二揀一。而家。頂真講，定坐近——講清楚你想點？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "而家唔傾呢啲。頂真講，定坐近——講清楚你想點？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "唔再拖。頂真講，定坐近——講清楚你想點？" · ok |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "短答。頂真講，定坐近——講清楚你想點？" |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### morgan / `m3` — 房間卡

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "開門啦" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "我入去先" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "推門入去" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "等等" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "等陣" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "停低先" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我走先" | `refuse` (want `refuse`) | close | 100 | _(advance)_ |
| PASS | success | "唔入喇" | `refuse` (want `refuse`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | unclear | "嗯" | `unclear` | hint | 100 | "亂打唔算。推門入去，定停低等等？" |
| PASS | unclear | "……" | `unclear` | pressure | 100 | "聽唔明。壓力嚟喇——推門入去，定停低？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "亂碼到此。門就喺度——推定停。" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "無內容結束。推門入去定停低等等。" |
| WARN | nonsense | "kkkk" | `unclear` | callout | 85 | "最後通牒：推門入去，定停低等等？講清楚你想點。" · warn:nonsense_no_ack |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "離題啦。推門入去，定停低等等？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "你要入就推門。你要等就講停低。而家。" · ok |
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
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你頭先似想停低。問清楚，定聽第二條，定走？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "無意義輸入。而家決定：推門定停低等等。問清楚，定聽第二條，定走？" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "聽唔明就推唔推、停唔停——講清楚。" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "無意義到此。講清楚：推定停。問清楚，定聽第二條，定走？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "聽唔明你講乜。問清楚，定聽第二條，定走？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "亂打唔算。問清楚，定聽第二條，定走？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "夠喇。問清楚，定聽第二條，定走？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 80 | "夠喇。問清楚，定聽第二條，定走？" · warn:exact_repeat |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### sam / `s2x` — 影印機後

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "開門啦" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "我入去先" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "推門入去" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | success | "等等" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "等陣" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "停低先" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | success | "我走先" | `refuse` (want `refuse`) | close | 100 | _(advance)_ |
| PASS | success | "唔入喇" | `refuse` (want `refuse`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | close | 100 | _(advance)_ |
| PASS | unclear | "嗯" | `unclear` | hint | 100 | "聽唔明你打乜。推門入去，定停低？" |
| PASS | unclear | "……" | `unclear` | pressure | 100 | "鍵盤噪音收起。推定停，答我。" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "亂碼到此。門就喺度——推定停。" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家：推門入去，定停低。唔好再砸字。" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "夠温吞。短答：推門入去，或者停低等等。" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "無重點。嗰句當未講。推門入去，定停低等等？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "二揀一。推門入去。停低等等。" · ok |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | hint | 100 | "你頭先提過門。而家推門入去，定停低？" |

## How to run

```bash
node tools/auto-playtest.js
node tools/auto-playtest.js --seed=7 --chars=alex
node tools/auto-playtest.js --strict   # exit 1 if any FAIL
```

Local heuristics only — no paid LLM judge. Does not touch live play path.

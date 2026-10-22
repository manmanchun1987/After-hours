# Fake-AI auto-playtest

- When: **2026-10-22 22:19:51 HKT**
- Seed: `42`
- Engines: IntentEngine `split1` · GuidePolicy `split1-fakeai4` · GuideLines `laneB-fakeai4-20261022`
- Result: **99 PASS** / **31 FAIL** / 130 turns · human-avg **90.7** · warn-turns 6

## Fail reasons

- `no_goal_steer`: 25
- `success_no_advance`: 12

## Nodes with systematic fails

- **morgan/m1**: 11 fails
- **alex/n1**: 10 fails
- **alex/n2a**: 9 fails
- **sam/s1**: 1 fails

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
| PASS | unclear | "嗯" | `unclear` | hint | 100 | "記低你講過門口。講清楚你想點：推定停。" |
| PASS | unclear | "……" | `unclear` | pressure | 100 | "頭先提門，而家要決定：推定停低。" |
| WARN | nonsense | "哈哈" | `unclear` | callout | 85 | "即答。推門入去／停低等等。" · warn:nonsense_no_ack |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "聽唔明就推唔推、停唔停——講清楚。推門入去，定停低等等？" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "唔再睇鍵盤垃圾。講清楚你想點：推定停。" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "而家：推開個門入去，定停低。" |
| PASS | off_topic | "食咗飯未" | `off_topic` (want `off_topic`) | callout | 100 | "二揀一。推門入去。停低等等。" |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | close | 100 | _(advance)_ |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | hint | 100 | "你頭先話想等等。咁停低等等，定改推門入去？" |

### alex / `n1` — 週五 23:47

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| FAIL | success | "我應承" | `unclear` (want `agree`) | hint | 50 | "而家可以推門。想入去就推；想等就話停低。" · no_goal_steer,success_no_advance |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| FAIL | success | "點解要我留" | `unclear` (want `challenge`) | hint | 50 | "頭先提門，而家要決定：推定停低。" · no_goal_steer,success_no_advance |
| FAIL | success | "我頂真問" | `unclear` (want `challenge`) | pressure | 90 | "記低你講過門口。講清楚你想點：推定停。" · success_no_advance |
| FAIL | success | "我企近啲" | `unclear` (want `flirt`) | callout | 50 | "答短：推門入去。或者停低。" · no_goal_steer,success_no_advance |
| FAIL | success | "俾我靠近" | `unclear` (want `flirt`) | callout | 50 | "夠温吞。推門入去，定停低等等。" · no_goal_steer,success_no_advance |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | callout | 100 | "唔再拖。推門，定停低。講清楚。" |
| FAIL | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | callout | 60 | "我等一句清楚。推門定停低。" · no_goal_steer |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "唔再睇鍵盤垃圾。講清楚你想點：推定停。" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "亂打完。推定停。即刻答。應承改，定問清楚，定站近？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "亂打唔再回。推定停。答。應承改，定問清楚，定站近？" |
| FAIL | nonsense | "asdf" | `unclear` | callout | 40 | "最後提醒：推門入去，定停低等等？" · no_goal_steer |
| FAIL | nonsense | "kkkk" | `unclear` | callout | 55 | "聽唔明。最後一次：推門，定停低。" · no_goal_steer |
| FAIL | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 60 | "你要入就推門。你要等就講停低。而家。" · no_goal_steer |
| FAIL | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 60 | "推門入去就入。停低就等。你揀。" · no_goal_steer |
| PASS | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 100 | "講清楚你想點。推門，定停低。" |
| PASS | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |

### alex / `n2a` — 配合

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| FAIL | success | "我應承" | `unclear` (want `agree`) | hint | 50 | "講清楚你想點先。推門定停低。" · no_goal_steer,success_no_advance |
| FAIL | wait_soft | "未準備好" | `wait` (want `wait`) | pressure | 60 | "我唔做客服。推門定停低——答我。" · no_goal_steer |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | callout | 100 | "我要聽到推定停。其他免問。應承繼續。" |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "推。定停。聽唔明嗰句當冇。應承繼續。" |
| FAIL | unclear | "……" | `unclear` | callout | 60 | "夠温吞。短答：推門入去，或者停低等等。" · no_goal_steer |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "聽唔明。二揀一。而家。應承繼續。" |
| FAIL | nonsense | "asdf" | `unclear` | callout | 55 | "停玩鍵盤。推門入去，定停低？而家。" · no_goal_steer |
| FAIL | nonsense | "kkkk" | `unclear` | callout | 55 | "無內容結束。推門入去定停低等等。" · no_goal_steer |
| FAIL | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 60 | "唔再拖。推門，定停低。講清楚。" · no_goal_steer |
| FAIL | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 60 | "推門入去就入。停低就等。你揀。" · no_goal_steer |
| FAIL | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 60 | "站夠喇。推門入去，定停低？講。" · no_goal_steer |
| FAIL | ask_want | "你想點啊" | `ask_want` (want `ask_want`) | callout | 60 | "而家決定。推門入去／停低等等。" · no_goal_steer |

### morgan / `m1` — 酒廊 21:10

| Result | Cat | Input | Intent | Strat | Human | Reply / note |
|---|---|---|---|---|---|---|
| PASS | success | "好呀" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| PASS | success | "得啦繼續" | `agree` (want `agree`) | close | 100 | _(advance)_ |
| FAIL | success | "我應承" | `unclear` (want `agree`) | hint | 90 | "門就喺眼前。推門入去，定繼續停？" · success_no_advance |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| FAIL | success | "點解要我留" | `unclear` (want `challenge`) | hint | 90 | "記你講過門口。推定停，講清楚。" · success_no_advance |
| FAIL | success | "我頂真問" | `unclear` (want `challenge`) | pressure | 90 | "你提過門口附近。推門入去定停低？" · success_no_advance |
| FAIL | success | "我企近啲" | `unclear` (want `flirt`) | callout | 50 | "我等一句清楚。推門定停低。" · no_goal_steer,success_no_advance |
| FAIL | success | "俾我靠近" | `unclear` (want `flirt`) | callout | 90 | "而家就答。推定停。唔好再問。頂真講，定坐近——講清楚你想點？" · success_no_advance |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | callout | 100 | "門未動。因為你未講。推定停？。頂真講，定坐近——講清楚你想點？" |
| FAIL | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | callout | 60 | "推門入去就入。停低就等。你揀。" · no_goal_steer |
| PASS | unclear | "嗯" | `unclear` | callout | 100 | "唔好再哈。推門入去，定停低？" |
| FAIL | unclear | "……" | `unclear` | callout | 60 | "聽唔明。揀一個——推門定停低。" · no_goal_steer |
| FAIL | nonsense | "哈哈" | `unclear` | callout | 55 | "夠温吞。短答：推門入去，或者停低等等。" · no_goal_steer |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家決定。推門入去／停低等等。唔好再亂打。" |
| FAIL | nonsense | "kkkk" | `unclear` | callout | 55 | "停玩鍵盤。推門入去，定停低？而家。" · no_goal_steer |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "決定喇。推門入去，定繼續停低？" |
| FAIL | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 60 | "門把喺度。推開入去。定放手停低。" · no_goal_steer |
| FAIL | mixed_hesitation | "想入又未敢停低認位先" | `wait` | callout | 60 | "你要入就推門。你要等就講停低。而家。" · no_goal_steer |
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
| PASS | unclear | "嗯" | `unclear` | hint | 100 | "你提過入去。推門，定繼續等？" |
| PASS | unclear | "……" | `unclear` | pressure | 100 | "你提過門口附近。推門入去定停低？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "夠温吞。短答：推門入去，或者停低等等。" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "而家決定。推門入去／停低等等。唔好再亂打。" |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "亂碼到此。門就喺度——推定停。推門入去，定停低等等？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "唔使再等。推門，定停低等等。揀一個。" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "決定喇。推門入去，定繼續停低？" · ok |
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
| FAIL | success | "我應承" | `unclear` (want `agree`) | hint | 90 | "你講過門。推開入去，定停低？" · success_no_advance |
| PASS | success | "你想我點" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | success | "我應該點做" | `ask_want` (want `ask_want`) | close | 100 | _(advance)_ |
| PASS | wait_soft | "未準備好" | `wait` (want `wait`) | close | 100 | _(advance)_ |
| PASS | enter_soft | "開個門先" | `enter_door` (want `enter_door`) | hint | 100 | "你提過入。推門入去，定停低等等？" |
| PASS | unclear | "嗯" | `unclear` | pressure | 100 | "你提過門位。而家推門入去，定停低等等。" |
| PASS | unclear | "……" | `unclear` | callout | 100 | "無意義到此。講清楚：推定停。問清楚，定聽第二條，定走？" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "推。定停。聽唔明嗰句當冇。問清楚，定聽第二條，定走？" |
| WARN | nonsense | "asdf" | `unclear` | callout | 85 | "即答。推門入去／停低等等。" · warn:nonsense_no_ack |
| PASS | nonsense | "kkkk" | `unclear` | callout | 100 | "亂打完。推定停。即刻答。問清楚，定聽第二條，定走？" |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "決定喇。推門入去，定繼續停低？" |
| WARN | off_topic | "食咗飯未" | `unclear` (want `off_topic`) | callout | 100 | "最後：推門入去，或者停低等等。" · ok |
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
| PASS | unclear | "嗯" | `unclear` | hint | 100 | "你提過入。推門入去，定停低等等？" |
| PASS | unclear | "……" | `unclear` | pressure | 100 | "你提過門位。而家推門入去，定停低等等。" |
| PASS | nonsense | "哈哈" | `unclear` | callout | 100 | "亂碼到此。門就喺度——推定停。推門入去，定停低等等？" |
| PASS | nonsense | "asdf" | `unclear` | callout | 100 | "夠温吞。短答：推門入去，或者停低等等。" |
| WARN | nonsense | "kkkk" | `unclear` | callout | 85 | "即刻。推門入去，定停低等等。講清楚。" · warn:nonsense_no_ack |
| PASS | off_topic | "今日天氣點" | `off_topic` (want `off_topic`) | callout | 100 | "揀邊樣？推門入去，定停低等等。" |
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

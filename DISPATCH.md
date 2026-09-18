# DISPATCH

現有空景：office lounge pantry review roof lift

Read AUTOMATION.md before opening tickets.

## Scores
STORY 4 · PICTURE 4 · SOUND 4 · FEEL 4

## Done this hour
- intent1：完整 `app.js` 還原、禁 CDN stub；本地 IntentEngine 骨架
- 憲法：禁 keys 對池／逼 OpenRouter；KPI＝意圖體感

## Open (lowest first) — P0 INTENT 加厚（主線；分數再高都要開住）
1. **INTENT · 覆蓋加厚** · method IntentEngine · 擴粵語變體意圖：`ask_want`／`enter`／`wait`／`refuse`／`apologize`／`flirt`／`challenge`／`memory`／`unclear`（可再加合理 intent）；禁止整句==key 做唯一路徑；cache `?v=intent2+`
2. **INTENT · 場景記憶** · method IntentEngine · 記住玩家先講過咩（短窗），回覆要接返，唔好當每句全新
3. **INTENT · anti-repeat** · method IntentEngine · 近 N 句 bot 回覆唔重複
4. **INTENT · 離題升級** · method IntentEngine · 離題一律入戲 Vera 擋，升級冷淡；**禁客服腔**
5. **INTENT · 固定驗收** · method live gate · 改完對住下列測句；硬刷 `?v=intent2`（或更新）

### 固定驗收測句（hourly 改完必測）
| # | 玩家輸入 | 預期意圖 | 期望行為（摘要） |
|---|---|---|---|
| 1 | 你想我點？ | ask_want | 內心／導向＋可亮推門／停低 |
| 2 | 我而家應該做咩 | ask_want | 同上，節點感知 |
| 3 | 推門 | enter | 推進（或等同推門行為） |
| 4 | 我入去啦 | enter | 推進 |
| 5 | 停一停 | wait | wait 意圖／停低線 |
| 6 | 唔想／我唔入 | refuse | 拒絕線，唔客服 |
| 7 | 對唔住呀 | apologize | 入戲收／冷接 |
| 8 | 今日天氣點呀 | off_topic | Vera 入戲擋＋升級冷淡 |
| 9 | 你係咪 AI／程式 | off_topic 或 unclear | 入戲否認系統感，唔認 bot |
| 10 | （可選）你記得我頭先講咩 | memory | 接返場景記憶 |

## Ticket policy
- INTENT 開住時：**禁止** yes-words／keys 對池票；**禁止**逼 OpenRouter／催 key
- PICTURE／SOUND：只回歸 bug；唔開刷分 chase
- 新票只准：意圖 · 場景規則 · 回覆材料 · 記憶 · anti-repeat · 真回歸

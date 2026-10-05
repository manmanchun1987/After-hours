# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

### I-20261006-03
- proposed_at: 2026-10-06
- status: proposed
- pain: 「出面十三更但我都想推開嗰道門」patterns split1dp 會同時中 off_topic（十三更）同 enter_door；非走廊節可能 off_topic 獨贏，唔會先接更次再問推門
- how: F／引擎：enter_door≥1 且有推開／入角房時唔准 off_topic 獨贏；回覆先接十三更再導向推門。未批唔改 engine
- acceptance: 「出面十三更但我都想推開嗰道門」→ enter_door，唔係 off_topic；「十三更未呀」仍 off_topic
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261006-02
- proposed_at: 2026-10-06
- status: proposed
- pain: 「出面十二更但我都想推開嗰道門」patterns split1dn 會同時中 off_topic（十二更）同 enter_door；非走廊節可能 off_topic 獨贏，唔會先接更次再問推門
- how: F／引擎：enter_door≥1 且有推開／入邊房時唔准 off_topic 獨贏；回覆先接十二更再導向推門。未批唔改 engine
- acceptance: 「出面十二更但我都想推開嗰道門」→ enter_door，唔係 off_topic；「十二更未呀」仍 off_topic
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261006-01
- proposed_at: 2026-10-06
- status: proposed
- pain: 「出面十一更但我都想推開嗰道門」patterns split1dm 會同時中 off_topic（十一更）同 enter_door；非走廊節可能 off_topic 獨贏，唔會先接更次再問推門
- how: F／引擎：enter_door≥1 且有推開／入度房時唔准 off_topic 獨贏；回覆先接十一更再導向推門。未批唔改 engine
- acceptance: 「出面十一更但我都想推開嗰道門」→ enter_door，唔係 off_topic；「十一更未呀」仍 off_topic
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261005-03
- proposed_at: 2026-10-05
- status: proposed
- pain: 「出面九更但我都想推開嗰道門」patterns split1dk 會同時中 off_topic（九更）同 enter_door；非走廊節可能 off_topic 獨贏，唔會先接更次再問推門
- how: F／引擎：enter_door≥1 且有推開／入間房時唔准 off_topic 獨贏；回覆先接九更再導向推門。未批唔改 engine
- acceptance: 「出面九更但我都想推開嗰道門」→ enter_door，唔係 off_topic；「九更未呀」仍 off_topic
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261005-02
- proposed_at: 2026-10-05
- status: proposed
- pain: 「出面七更但我都想推開嗰度門」patterns split1di 會同時中 off_topic（七更）同 enter_door；非走廊節可能 off_topic 獨贏，唔會先接更次再問推門
- how: F／引擎：enter_door≥1 且有推開／入房時唔准 off_topic 獨贏；回覆先接七更再導向推門。未批唔改 engine
- acceptance: 「出面七更但我都想推開嗰度門」→ enter_door，唔係 off_topic；「七更未呀」仍 off_topic
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261005-01
- proposed_at: 2026-10-05
- status: proposed
- pain: 「出面六更但我都想推開嗰扇門」patterns split1dh 會同時中 off_topic（六更）同 enter_door；非走廊節可能 off_topic 獨贏，唔會先接更次再問推門
- how: F／引擎：enter_door≥1 且有推開／入去時唔准 off_topic 獨贏；回覆先接六更再導向推門。未批唔改 engine
- acceptance: 「出面六更但我都想推開嗰扇門」→ enter_door，唔係 off_topic；「六更未呀」仍 off_topic
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261004-02
- proposed_at: 2026-10-04
- status: proposed
- pain: 「我準備好入」split1df 已當 enter_door，但若上一句係 wait（腳未定落），回覆唔會先接「頭先未定落、而家準備好」再推進
- how: F／引擎：recentUserLines 上一句係 wait 且本句 enter_door 時，回覆先承接轉念再推進。未批唔改 engine
- acceptance: 先「腳未定落」再「我準備好入」→ enter_door 且回覆提到頭先未定落；單獨「開個門囉」仍 enter_door
- rationale: 轉念接話更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261004-01
- proposed_at: 2026-10-04
- status: proposed
- pain: 「收肩貼框鑽入但腳未企穩」patterns split1dc 會同時中 enter_door 同 wait；最高分獨贏，唔會先接腳未企穩再問鑽入
- how: F／引擎：enter_door≥1 且 wait≥1 時唔當 unclear，回覆先接未企穩再導向入。未批唔改 engine
- acceptance: 「收肩貼框鑽入但腳未企穩」→ enter_door（或先 wait 再問入），唔係 refuse／unclear；「腳未企穩先」仍 wait
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261003-06
- proposed_at: 2026-10-03
- status: proposed
- pain: 「頭先你叫我停但而家我想入」會同時中 wait／ask_memory 同 enter；走廊 bias 可能先搶 wait，唔會當轉念入門
- how: F／引擎：enter_door≥1 且句有而家想入／入去時 enter 獨贏，唔被 wait 蓋。未批唔改 engine
- acceptance: 「頭先你叫我停但而家我想入」→ enter_door；「腳未企實先」仍 wait
- rationale: 轉念入門更似真 AI；禁 yes-word pool；未批唔開施工票


### I-20261003-05
- proposed_at: 2026-10-03
- status: proposed
- pain: 「你仲記唔記得實嘋句但腳未企實」patterns split1cy 會同時中 ask_memory 同 wait；最高分獨贏，唔會先答記得實再接腳未企實
- how: F／引擎：ask_memory≥1 且 wait≥1 時唔當 unclear，回覆先接記得實再重述未企實。未批唔改 engine
- acceptance: 「你仲記唔記得實嘋句但腳未企實」→ ask_memory（或先 memory 再接 wait），唔係 refuse／unclear；「腳未企實先」仍 wait
- rationale: 混合記憶接話更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261003-04
- proposed_at: 2026-10-03
- status: proposed
- pain: 「你記唔記得實我頭先話腳未踩實」patterns split1cx 會同時中 ask_memory 同 wait；最高分獨贏，唔會先答記得再接腳未踩實
- how: F／引擎：ask_memory≥1 且 wait≥1 時唔當 unclear，回覆先接記得再重述未踩實。未批唔改 engine
- acceptance: 「你記唔記得實我頭先話腳未踩實」→ ask_memory（或先 memory 再接 wait），唔係 refuse／unclear；「腳未踩實先」仍 wait
- rationale: 混合記憶接話更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261003-03
- proposed_at: 2026-10-03
- status: proposed
- pain: 「我弓腰想入但腳未站實」patterns split1cv 會同時中 wait（未站實）同可能 enter；最高分獨贏，唔會先接腳未站實再問入
- how: F／引擎：一句同時有 wait 體感同 enter_door≥1 時唔當 unclear，回覆先接未站實再導向入。未批唔改 engine
- acceptance: 「我弓腰想入但腳未站實」→ enter_door（或先 wait 再問入），唔係 refuse／unclear；「我腳未站實」仍 wait
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261003-02
- proposed_at: 2026-10-03
- status: proposed
- pain: 「我未企穩但門縫我想鑽」patterns split1ct 會同時中 wait（未企穩）同 enter（鑽入）；最高分獨贏，唔會先接企未穩再問鑽門縫
- how: F／引擎：一句同時有 wait 體感同 enter_door≥1 時唔當 unclear，回覆先接未企穩再導向入。未批唔改 engine
- acceptance: 「我未企穩但門縫我想鑽」→ enter_door（或先 wait 再問入），唔係 refuse／unclear；「等我定定神先唔好催」仍 wait
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261003-01
- proposed_at: 2026-10-03
- status: proposed
- pain: 「唔係話唔入我只係未企穩」patterns split1cs 已當 wait，但「出面落雪但我縮身擠入去」off_topic 同 enter 都中；非走廊節可能 off_topic 獨贏，唔會先接落雪再問推門
- how: F／引擎：enter_door≥1 且有入／推門時唔准 off_topic 獨贏；回覆先接落雪再導向推門。未批唔改 engine
- acceptance: 「出面落雪但我縮身擠入去」→ enter_door，唔係 off_topic；「唔係話唔入我只係未企穩」仍 wait
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261002-04
- proposed_at: 2026-10-02
- status: proposed
- pain: split1cr 已認「唔係唔入我想入去／記唔記到我頭先講」，但 F 未把 recentUserLines 回聲進 GuidePolicy；「等我喘返啖氣先但都想入」而家只取最高分
- how: F 把最後一句回聲進 MEM_NUDGE；混合句 wait+enter 先答喘氣再問 enter，唔當 unclear。未批唔改 engine
- acceptance: 先「等我喘返啖氣先」再「你記唔記到我頭先講」→ wait 後 ask_memory 回聲喘返啖氣；「等我喘返啖氣先但都想入」唔跌 unclear
- rationale: T2 場景記憶接話更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261002-03
- proposed_at: 2026-10-02
- status: proposed
- pain: 「開問入去先／入去先吲／等我喘返啖氣先」patterns split1cq 已認，F 未接 recentUserLines；混合句「等我喘返啖氣先但都想入」而家只會取最高分
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；混合句先答 wait 再問 enter，唔當 unclear。未批唔改 engine
- acceptance: 先「等我喘返啖氣先」再「頭先我話嘅句你仲記唔記到」→ wait 後 ask_memory 回聲喘返啖氣；「開問入去先」仍 enter_door
- rationale: T2 場景記憶接話更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261002-02
- proposed_at: 2026-10-02
- status: proposed
- pain: 「出面落雨但我都想入去」off_topic 食落雨、enter 食入去；非走廊節可能跌離題，唔會先認天氣再問推門
- how: 混合句 enter_door≥1 且有入／推門時唔准 off_topic 獨贏；回覆先接落雨再導向推門。未批唔改 engine
- acceptance: 「出面落雨但我都想入去」→ enter_door，唔係 off_topic
- rationale: 混合意圖更似真 AI；禁 yes-word pool；未批唔開施工票

### I-20261002-01
- proposed_at: 2026-10-02
- status: proposed
- pain: 「你仲知唔知我頭先講咩／頭先句說話你有冇印象」patterns split1cn 已認，F 未接 recentUserLines 做記憶回聲；玩家一句同時企定又想入（我企定先但門我都想入）而家只會取最高分
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；混合句先答 wait 再問 enter，唔當 unclear
- acceptance: 先「我唸多陣先」再「頭先句說話你有冇印象」→ wait 後 ask_memory 回聲唸多陣；「我企定先但門我都想入」唔跌 unclear
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F／唔開施工票

### I-20261001-08
- proposed_at: 2026-10-01
- status: proposed
- pain: 「我行埋前去擔把一推入／唔好催住我嘲先／頭先嘅句你重記唔記得住未呀」patterns split1cl 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 擔把一推入|催住我嘲先|記唔記得住未
- acceptance: 先「唔好催住我嘲先」再「頭先嘅句你重記唔記得住未呀」→ wait 後 ask_memory 回聲催住我嘲
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20261001-07
- proposed_at: 2026-10-01
- status: proposed
- pain: 「我行埋前去一推把入／唔好催住我住先／頭先嘅句你重記唔記得未呀」patterns split1ck 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 一推把入|催住我住先|嘅句重記唔記得未
- acceptance: 先「唔好催住我住先」再「頭先嘅句你重記唔記得未呀」→ wait 後 ask_memory 回聲催住
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20261001-06
- proposed_at: 2026-10-01
- status: proposed
- pain: 「我行埋前去推把入／等我唾多吓先／頭先嗎句你重記唔記得未呀」patterns split1cj 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唾多吓先|重記唔記得未
- acceptance: 先「等我唾多吓先」再「頭先嗎句你重記唔記得未呀」→ wait 後 ask_memory 回聲唾多吓
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20261001-05
- proposed_at: 2026-10-01
- status: proposed
- pain: 「我行前去推把入／等我唾多陣先／頭先嗎句你重記唔記得呀」patterns split1ci 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|唾多陣先|重記唔記得
- acceptance: 先「等我唾多陣先」再「頭先嗎句你重記唔記得呀」→ wait 後 ask_memory 回聲唾多陣
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

### I-20260930-07
- proposed_at: 2026-09-30
- status: proposed
- pain: 「我行埋去推把入／等我嘲多陣先／頭先嗎句你重記唔記得」patterns split1ch 已認，F 未接 recentUserLines 做記憶回聲
- how: F 把 recentUserLines 最後一句回聲進 GuidePolicy MEM_NUDGE；normalize 推把入|嘲多陣先|重記唔記得
- acceptance: 先「等我嘲多陣先」再「頭先嗎句你重記唔記得」→ wait 後 ask_memory 回聲嘲多陣
- rationale: T2 場景記憶接話更似真 AI；未批唔改 F

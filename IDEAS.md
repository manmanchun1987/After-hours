# IDEAS — 兩段式閘（proposed → approved → 施工）

Hourly **最多加 3 條** idea，**只寫本檔**，狀態一律 `proposed`。
**未批不准改碼、不准開施工 ticket。** 只有用戶或 CEO 把 `status` 改成 `approved` 後，先可搬去 `DISPATCH.md` Open 並動手。

## Proposed

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
- pain: 「開問入去先／入去先吚／等我喘返啖氣先」patterns split1cq 已認，F 未接 recentUserLines；混合句「等我喘返啖氣先但都想入」而家只會取最高分
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

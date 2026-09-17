# DISPATCH

調度每小時改呢張。劇本／程式只做有 OWNER 嘅 ticket。

現有空景：office lounge pantry（assets/bg/*.svg）
可加空景：review roof lift — 無人臉。

## Tickets

1. OWNER=CODE | method=空景 SVG | one commit: 加 `assets/bg/review.svg`（無人、夜、港式評核室暗光）
   why: STORYBOARD n7/review 用中；而家 scene 只映射 office，缺專用空景。

2. OWNER=CODE | method=覆用現有 SVG | one commit: fx-play `setScene` 對 n7/n8/ending 路徑用 review 若檔存在，否則 office
   why: 有 review.svg 先切；唔新開邏輯檔，覆用映射。

3. OWNER=STORY | method=禁改爛 index | one commit: data/*.json 清 portrait 路徑改指 stills（vera-0x），同 CAST.lock 一致
   why: 源檔仍寫 IMG_1412/morgan.jpg/sam.jpg（唔存在），雖 boot 覆寫，源同 lock 一致免日後 404。

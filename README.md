# 加班之後 After Hours（Phase 1 原型）

免費、無廣告、可玩 Vera 完整劇情樹嘅靜態網頁 MVP。

## 本地打開

唔好直接用瀏覽器 double-click `index.html`（`fetch` JSON 會被擋）。用任一本地伺服器：

```bash
cd web
python3 -m http.server 8080
```

然後打開 http://127.0.0.1:8080

## Phase 1 決策

- 全線免費可玩（含原計劃付費段）
- 無廣告
- 進度存 `localStorage`
- 節點保留 `locked` 欄位，方便之後加收費牆
- Morgan / Sam 鎖住預告

## 改劇情

編輯 `data/alex.json` 即可，唔使改 UI 邏輯。

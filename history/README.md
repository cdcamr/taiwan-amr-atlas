# AR Explorer 年報版型試作歷程（2026-10-27）

## 保留版本

- 回復檔：`history/ar-explorer-before-report-layout-20261027.html`
- 來源：試作前 `ar-explorer.html` 的完整 HTML，原始 Git blob SHA：`9096d3c2a2942a1b19f7dc5a4e5893eb56ed0eff`
- 建立回復檔的 Git commit：`8509b92ff0b122ba33e382fc10e9f657ccd866b6`

## 本次變更

僅調整 AR Explorer 預設視圖為年報表 2-1 六年比較表（菌種列 × 6 年欄）；保留菌種排行、折線／柱狀圖、多菌種比較、資料表、CSV 及既有 AR 資料檔。Antibiogram 與其資料不變。此為試作；尚需網頁／行動裝置測試。

## 如何回復

1. 至 GitHub 開啟 `history/ar-explorer-before-report-layout-20261027.html`。
2. 複製該檔完整內容，取代根目錄 `ar-explorer.html`，另行提交（建議 commit message：`revert: restore AR Explorer pre-report-layout view`）。
3. 無須更動 CSV、共用 JS／CSS 或其他頁面，因為本次新增邏輯均寫在 `ar-explorer.html`。

請勿將歷程檔本身當成網站首頁；它是供復原使用的完整程式碼快照。

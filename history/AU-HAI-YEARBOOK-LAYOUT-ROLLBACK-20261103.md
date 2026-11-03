# AU／HAI 年報式導覽及圖表樣式修改回復說明（2026-11-03）

## 變更
- 調整 `au-explorer.html` 及 `hai-explorer.html`，加入年報主題導覽與年報對象切換。
- 調整 `js/report-monitor.js` 及 `css/report-monitor.css`，加入來源對應、圖表樣式、缺值狀態與授權連結。
- 於 `data/au/au_report_verified_2013_2024.json` 及 `data/hai/hai_open_2008_2023.json` 加入 2024 年官方原報 PDF 參考路徑，原有數值不變。
- 新增 `data/AU_HAI_2024_REPORT_PRESENTATION_MAP.md` 及本回復說明。
- 保留 AR 模組、NEWS & EVENTS、其他系統數據、語言及佈景偏好邏輯不變。

## 回復
推薦至 GitHub 使用本次 PR merge commit 的 **Revert** 建立回復 PR。
也可在新分支上將 `history/au-hai-before-yearbook-layout-20261103/` 中修改前的 HTML、JS、CSS、JSON、README.md 復原至原路徑。切勿直接刪除使用者瀏覽器的站點儲存資料。

## 限制
本次以正式 2024 年報索引及公開年報公告所能核實的內容調整導覽；完整 PDF 頁面圖像未能逐頁取得，不能宣稱圖號、圖型及配色與原 PDF 一模一樣。尚未取得的 AU、HAI 精確資料不以推估值補齊。

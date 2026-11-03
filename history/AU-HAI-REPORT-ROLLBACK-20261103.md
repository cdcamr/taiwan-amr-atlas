# AU/HAI 年報式網站更新回復（2026-11-03）

## 影響的檔案
- 修改：`au-explorer.html`、`hai-explorer.html`、`README.md`
- 新增：`js/report-monitor.js`、`css/report-monitor.css`、`data/au/au_report_verified_2013_2024.json`、`data/hai/hai_open_2008_2023.json`、`data/AU_HAI_REPORT_INTEGRATION_README.md`
- 保留但**未改動**：`data/published/manifest.json`（原始版本備份已保存）
- 不影響 AR Explorer 與既有 AR 資料 CSV。

## 版本回復方式
推薦使用 GitHub PR 的 Revert 功能，以單一回復 PR 撤銷本次 merge commit。

若需手動還原：
1. 以 `history/au-hai-before-report-20261103/au-explorer.html` 還原 `au-explorer.html`。
2. 以 `history/au-hai-before-report-20261103/hai-explorer.html` 還原 `hai-explorer.html`。
3. 移除或停止引用新增的 `js/report-monitor.js`、`css/report-monitor.css`，並保留/移除新增的 AU、HAI JSON 依稽核紀錄所需。
4. 將 README.md 相關新章節復原，使用 GitHub PR 審核後再合併。

## 來源與限制
HAI 2008–2023 年公開彙總資料、AU 年報公告中可核對數值皆有來源紀錄；**不是完整 2024 年 AU/HAI 年報所有圖的原始資料**。後續取得精確年報資料後，可逐批擴充，且不得以示意值覆蓋正式來源。

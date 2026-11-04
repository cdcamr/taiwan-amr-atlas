# AU／HAI 年報示意估計值及圖表標示—回復說明（2026-11-04）

## 變更
- 前台 AU／HAI 增加「顯示示意估計值」切換，已核對值為實心點、模型估計為空心點／虛線。
- AU 新增含 2024 發布函錨點及中間年份情境示意的獨立 JSON。
- HAI 新增從 2022–2023 CDC 歷史資料推算的 2024 示意 JSON。
- CSV、懸浮提示、表格與分享網址增加資料性質及估計方法資訊。
- 原本 `data/au/au_report_verified_2013_2024.json` 及 `data/hai/hai_open_2008_2023.json` **均無修改**。

## 修改前完整檔案
- `history/au-hai-before-illustrative-20261104/au-explorer.html`
- `history/au-hai-before-illustrative-20261104/hai-explorer.html`
- `history/au-hai-before-illustrative-20261104/js/report-monitor.js`
- `history/au-hai-before-illustrative-20261104/css/report-monitor.css`
- `history/au-hai-before-illustrative-20261104/data/au/au_report_verified_2013_2024.json`
- `history/au-hai-before-illustrative-20261104/data/hai/hai_open_2008_2023.json`

## 回復步驟
建議在 GitHub Revert 本次 Pull Request 的 merge commit。
手動回復時，將上列 HTML／JS／CSS 的原檔還原至原路徑，並依版本管理移除/取消引用本次新增的兩個估計 JSON 及說明檔；原始 CDC 數值無須修改。

## 重要限制
官方 2024 年報 PDF 在此環境僅能確認文件索引及下載 URL，未能直接取得完整圖面；模型推估不是官方年報逐圖估讀，請勿以示意數據對外發表正式監測結果。完整估計方法另見 `data/AU_HAI_2024_ILLUSTRATIVE_METHOD.md`。

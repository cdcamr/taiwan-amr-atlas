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

## 年報圖 2-1 堆疊柱狀圖試作（2026-10-27）

- 調整前完整檔案：`history/ar-explorer-before-stacked-chart-20261027.html`。
- 本次新增檔案：`js/ar-report-figure21.js`，並於 `ar-explorer.html` 加入引用及圖表樣式。
- 回復步驟：將上述歷程檔完整內容複製覆蓋根目錄 `ar-explorer.html`，並停止載入新增腳本即可；原始 CSV 沒有修改。
- 此為依使用者提供的圖 2-1 試作之前十大菌種比例堆疊圖，色票為圖片近似取樣；待與年報可編輯原始圖表確認精確色碼。資料採各菌種數除以同年全部分離株數，因此十菌合計不到 100%，未將剩餘比例錯誤補值。

## 2026-10-28：堆疊圖檢體／感染來源控制與懸浮資訊

- 完整回復檔：`history/ar-explorer-before-specimen-origin-filters-20261028.html`、`history/ar-report-figure21-before-filters-20261028.js`。
- 本次調整：移除堆疊圖可見的「圖 2-1」字樣；新增檢體、感染來源篩選選單及滑鼠／鍵盤／點擊圖形數值詳情，原始 CSV 不變。
- 現有 `data/ar_isolates_by_edition_2017_2024.csv` 僅具 `national_all_specimens`，且無獨立 CO、HO 欄位；因此不得把總數作為特定檢體或感染來源值。新增下拉選單僅展示已核對的「全部檢體／合併感染來源」選項；待正式資料匯入才能擴充。
- 回復方式：分別將上述兩份歷程檔覆蓋根目錄 `ar-explorer.html` 及 `js/ar-report-figure21.js` 並提交；其他資料不需更動。

## 2026-10-28：正式年報檢體／感染來源六年數據實作

- 在原有備份上接入 `data/ar_2024_report_specimen_onset.csv`（2024 年版年報第二章表 2-2-1～2-2-5、表 2-3-1～2-3-2）。
- 包含 2019–2024 年血液、尿液、痰液、膿或傷口、糞便、CO、HO 七類，共 504 筆（含其他與總計）；42 組年度分層合計已與年報核對一致。
- 僅同一版年報同一分類計算菌株數占比；不產生年報沒有的檢體 × 感染來源交叉結果。2022/2023 年版仍提供全國全部檢體合併資料。
- 回復前一版：將 `history/ar-report-figure21-before-filters-20261028.js` 內容覆蓋 `js/ar-report-figure21.js`，並將 `history/ar-explorer-before-specimen-origin-filters-20261028.html` 覆蓋 `ar-explorer.html`；新 CSV 可留存，不需移除。

## 2026-10-29：重要菌種抗藥率與多重抗藥菌趨勢試作

- 調整前完整備份：`history/ar-explorer-before-key-pathogen-mdro-20261029.html`。
- 新增：`js/ar-report-resistance-panels.js`、`data/ar_2024_key_resistance_report_points.csv`（10 筆年報文字明載的精確數值）。
- 來源：2024 年版《臺灣抗生素抗藥性監視年報》頁 56（K. pneumoniae 血液及尿液之 ceftazidime、co-trimoxazole 抗藥率），頁 68（CRAB 108／113 年），頁 104（CRKP、CRPA 108／113 年）。
- MDRO 僅呈現 108 與 113 年已核對端點，沒有補造 109–112 年值、沒有在缺漏年份間連線。重要菌種部分目前限 K. pneumoniae 兩種抗生素，並非第三章所有菌藥組合。
- 回復方式：以歷程 HTML 覆蓋 `ar-explorer.html`；新增 JS/CSV 可保留但不會被頁面引用。原堆疊圖、Antibiogram 與原監測 CSV 未更改。

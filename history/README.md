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

## 2026-10-29：年報圖形樣式一致化試作（第三章與第四章）

- 調整前備份：`history/ar-explorer-before-report-style-figures-20261029.html` 及 `history/ar-report-resistance-panels-before-replacement-20261029.js`。
- 新增圖形程式：`js/ar-report-figures-fidelity.js`，替換原 `ar-explorer.html` 中引用的 `js/ar-report-resistance-panels.js`；既有報表、堆疊圖、Antibiogram 及原始 CSV 均不變。
- 新增資料：`data/ar_2024_report_style_chart_estimates.csv`，124 筆來源標註（28 筆 A. baumannii 四面板、24 筆 CRAB 年度抗藥率、72 筆醫院層級 CO／HO 與 I+R／S 堆疊組成）。
- 年報出處：2024 年報圖 3-2-1（列印頁 53）、圖 4-1-1-2、圖 4-1-1-1（列印頁 69）、圖 4-1-2-1（列印頁 70）。
- **品質限制**：大多數值由年報原圖像色塊／折線定位估讀，為 `chart_estimate`，不等於完整正式原始數據；以圖上百分比約 0.1% 和菌株數 50 株為顯示粒度，亦非誤差保證。少數年報文字明載值標記為 `narrative_exact`。原圖誤差線未重建，不能據估讀值計算 CI 或做顯著性推論。
- 前端支援年報式四分圖、四系列折線圖、兩種堆疊圖、懸浮／鍵盤數值提示、資料表、CSV 與逐圖 PNG。
- **回復方式**：將上述備份 HTML 還原至根目錄 `ar-explorer.html` 即可回到先前頁面（原程式 `js/ar-report-resistance-panels.js` 沒有刪除）；新 JS、CSV 可留存但不再被引用。
- GitHub 已確認檔案及語法；瀏覽器、RWD／AA、與原圖逐像素比對尚未完成。


## 2026-10-29：完整第三、四章選單與 HO 趨勢資料
- 本次修改前完整備份：`history/ar-report-figures-fidelity-before-complete-dropdowns-20261029.js`、`history/ar-explorer-before-complete-dropdowns-HO-20261029.html`。
- 本次新增：`data/ar_2024_report_full_chart_catalog.csv`（12 類重要菌種與 9 類 MDRO×3 感染來源的 39 筆原圖索引）。
- 本次新增：`data/ar_2024_mdro_HO_report_estimates.csv`，涵蓋 9 類 MDRO 的 108–113 年 HO 醫院層級抗藥性百分比（216 筆）及 I+R/S 菌株數估讀（302 筆）。總共 518 筆，每筆明列年報圖號與 `chart_estimate`。
- 完整的 12 類重要菌種與 9 類 MDRO 已可由下拉選單切換。重要菌種中 A. baumannii 有 4 格估讀圖；K. pneumoniae 有 4 筆正式文字精確值；其餘菌種提供年報圖號及待核對提示，尚非完整數值重製。
- MDRO HO 的折線圖及 I+R/S 堆疊圖均開放切換；VR E. faecalis 個別 I+R 柱體低於可靠圖像擷取解析度，該筆資料留白、**不可解讀為零**。CO／CO+HO 仍限既有 CRAB 完成數位化的部分，其餘提供來源圖號索引。
- 新增內容不改變原有分離菌株數圖、2024 Antibiogram 熱圖或原始年報 CSV。
- **回復方式**：用上述歷程檔分別覆蓋 `js/ar-report-figures-fidelity.js` 與 `ar-explorer.html` 再提交即可，新增 CSV 可以繼續保留不被舊版引用。
- 來源圖形估讀值不可當成可核對的官方精確值、不得以此推算 Wilson 95% CI、不得用於正式政策比較。需用原始分析數表替換後才能宣稱完整精確互動年報。


## 2026-10-29：年報式完整示意版（12 類重要菌種／9 類 MDRO）

- **修改前完整頁面**：`history/ar-explorer-before-full-demo-20261029.html`。
- **修改前完整圖表程式**：`history/ar-report-figures-before-full-demo-20261029.js`。
- **目前上線引用程式**：`js/ar-report-complete-preview.js`（原程式 `js/ar-report-figures-fidelity.js` 仍留存，不刪除）。
- **新增示意資料**：`data/ar_2024_full_demo_preview.csv`，2016 筆，完整涵蓋 12 類重要菌種及 9 類 MDRO × CO＋HO／CO／HO，部分菌藥組合依年報保持未發表（＊）。
- **示意值性質**：凡註記 `illustrative_estimate` 都是模擬示意值，並不是從年報原圖精確擷取之數據；僅 16 筆 `narrative_exact` 為年報文字明列值。原來源 `data/ar_2024_mdro_HO_report_estimates.csv` 仍保留，未被改寫。
- **逐步換正式資料**：將完成數值與來源核對的紀錄填入 `data/ar_2024_full_official_import.csv`，以相同主鍵及 `official_verified`、`verified_by` 覆蓋示意值。
- **回復步驟**：將 `history/ar-explorer-before-full-demo-20261029.html` 完整內容還原覆蓋根目錄 `ar-explorer.html` 並提交；其他新增資料與腳本留存也不會影響舊版執行。
- **測試**：已驗證 12 類菌種 4–5 張分圖，以及 9 類 MDRO × 3 感染來源（27 組）各 2 張圖均可被程式產製，並通過 CSV 結構、MDRO 各年度比率與組成一致性、JavaScript 語法檢核。公開網頁真實瀏覽器、行動版與 AA 測試仍待進行。

## 2026-10-29：全菌種抗生素與 SA 圖表一致性修正

- 本輪修改前已備份：`history/ar_2024_full_demo_preview_before-antibiotic-audit-20261029.csv`、`history/ar-report-complete-preview_before-antibiotic-audit-20261029.js`、`history/ar-explorer_before-antibiotic-audit-20261029.html`。
- 核對 2024 年報第三章圖 3-2-1～圖 3-2-12，12 菌種合計 88 個菌藥組合，修正 `data/ar_2024_full_demo_preview.csv` 現為 2,004 筆（重要菌種 384 筆、MDRO 1,620 筆）。
- SA 圖 3-2-7 僅 Cefoxitin、Oxacillin；四面板固定亮藍，保留 Oxacillin 47.4% 年報內文明載值。移除誤列品項。
- 修正 P. aeruginosa、S. pneumoniae、Shigella、NTS 抗生素名稱順序與其他菌種配色；對原圖未發布者保留 ＊。
- 修正 3 檢體 A 分圖位置及檢體選單 `all` 重複值；CRAB 趨勢圖及 CO＋HO／CO／HO 堆疊縱軸尺度更接近原年報。MDRO 切換測試曾發現 `ReferenceError: i is not defined`，已修正。
- 回復：將上述歷程 HTML、JS 及 CSV 各覆蓋原始檔名即可。請參閱 `data/AR_REPORT_PREVIEW_README.md`。
- 示意值仍為模擬資料；未進行正式公網瀏覽器與 AA 驗收。


## 2026-10-29：AR Explorer 三區塊與 ICON 延伸圖表布局

- 改版前備份：`history/ar-explorer-before-3-section-icon-layout-20261029.html` 與 `history/ar-report-complete-preview-before-3-section-icon-layout-20261029.js`。
- 主區塊 01「分離菌株排名與組成」：沿用原本 `js/ar-report-figure21.js` 的年報式堆疊柱狀圖，常態顯示；原有年份／檢體／感染來源下拉篩選、圖例、懸浮資訊及 CSV／PNG 功能均保留。
- 分離菌株原本的單年排行柱狀圖、六年折線圖、多菌種比較折線／分組柱狀圖及年報表格，改為 4 個有文字標籤、鍵盤可操作的圖示入口；預設隱藏，展開後沿用原有 `chartType`、`data-view` 與 `compareSection` 既有程式，不再佔用主要頁面。
- 主區塊 02「重要菌種抗藥性百分比」及主區塊 03「多重抗藥菌（MDRO）歷年趨勢」已分離；`js/ar-report-complete-preview.js` 以 `data-domain="important"`、`data-domain="mdro"` 各自掛載一個獨立實例，擁有各自的下拉篩選及 `imp...`／`mdro...` 網址參數。不再共用切換頁籤、DOM id 或圖表狀態。
- 新增 `js/ar-explorer-three-section-layout.js` 控制分離菌株分析圖示及三區塊導覽，原有 `js/ar-multiseries-comparison.js`、`js/ar-report-figure21.js`、原始資料及 Antibiogram 均未改動。
- 回復方式：以上兩份備份分別覆蓋 `ar-explorer.html` 及 `js/ar-report-complete-preview.js`，新布局程式留存但舊版 HTML 不再引用。
- QA：兩份 JavaScript 與所有 inline scripts 語法通過；模擬 DOM 驗證雙區塊各有 12／9 選項且選單狀態互不干擾；原排名延伸 ICON 的柱狀、折線、比較、表格及收合路徑測試通過。**實際公網 Chromium／手機、下載及 AA 無障礙驗收仍待完成**。

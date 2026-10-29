# 2024 年報式 AR 圖表：完整互動示意資料與正式匯入說明

## 示意版狀態

- 網站頁面：`ar-explorer.html`
- 圖表程式：`js/ar-report-complete-preview.js`
- 完整示意資料：`data/ar_2024_full_demo_preview.csv`（共 **2,004 筆**）。
- 來源組成：**12 類重要菌種、384 筆**（含 34 筆「原年報未發布／檢測株數不足」標記）；**9 類 MDRO、1,620 筆**（各 6 年 × CO＋HO／CO／HO × 醫院層級與計數／抗藥率）。
- 16 筆 `narrative_exact` 來自年報內文明確寫出的單一數值；其餘 `illustrative_estimate` 為用來示範互動、年報圖型與顏色的模型數值，**不是從年報圖像精確擷取的結果**。
- `not_reported_lt20` 是原年報未列示或檢測數量不足的項目；在圖上顯示 ＊，不當作 0%。
- 年報圖號／印刷頁碼與圖型參考 2024 年報第三、四章。模擬數值**不可**用於臨床判斷、醫院比較、正式報告、政策評估、Wilson CI 或顯著性分析。

## 如何以正式資料替換

正式數據逐步完成核對後，請將經過來源確認的紀錄填入：

`data/ar_2024_full_official_import.csv`

欄位對應示意 CSV，另附 `verified_by`：

- `domain`: `important` 或 `mdro`
- `indicator`: 與現有示意 CSV 一致的菌種／MDRO 代碼
- `organism`、`year`、`onset`、`specimen`、`hospital_level`、`antibiotic`、`component`: 與要替換的示意資料主鍵一致
- `isolates`: 若 `component` 是 `CO`、`HO`、`I+R` 或 `S`，填入正式菌株數；此時 `resistance_pct` 留空
- `resistance_pct`: 若 `component` 是 `R`，填入正式抗藥性百分比（0–100）；此時 `isolates` 留空
- `precision`: 固定 `official_verified`
- `source_figure`、`printed_page`: 對應正式來源圖號與印刷頁碼
- `notes`: 監測範圍、歸人／件邏輯或其他適用限制
- `verified_by`: 核對人員、核定資料檔版本或可信的驗證識別碼（不得空白）

網站載入時，只有來源資訊完整、主鍵與示意資料相符，且數值符合基本檢核的正式紀錄才會覆寫該筆資料。其餘仍維持示意資料並顯示品質標示。

**請注意**：目前覆寫機制為逐筆替換，並不會依個別改動自動重算其他原始指標。例如將醫院分層 I+R／S 菌株數換成正式值後，仍需同步匯入對應的 R% 與全國 R%，以維持圖表間統計一致性。正式上線前應完成醫院層級加總及百分比一致性驗證。

## 色彩與互動

- 重要菌種：各菌種固定色票，保留（A）CO＋HO（依年報分檢體）、（B）CO、（C）HO 水平長條圖。
- MDRO：折線圖依序為醫學中心藍、區域醫院橘、地區醫院灰、全國黃色；CO＋HO 的柱體堆疊 CO／HO，CO 與 HO 分別堆疊 I+R／S。
- 點選或鍵盤聚焦圖形可查看數值、來源及資料品質；可下載目前篩選 CSV 或各張 PNG。
- 頁面另提供選用的本機 PDF 原圖對照，使用者選擇的 PDF 不會上傳。

## 回復

調整前的完整網站頁面備份：`history/ar-explorer-before-full-demo-20261029.html`。將此檔案內容還原覆蓋根目錄 `ar-explorer.html`，即可回到本次修改前的版型；原 `js/ar-report-figures-fidelity.js` 未刪除，其備份亦見 `history/ar-report-figures-before-full-demo-20261029.js`。

## 驗收狀態

程式已完成靜態語法與 12 類菌種、9 類 MDRO × 3 感染來源的選項切換模擬測試。示意資料已通過唯一鍵、百分比範圍、菌株數非負、MDRO 組成加總及率分母一致性檢查。實際公網部署、RWD、圖像下載及輔助科技驗收仍需進行。

## 2026-10-29 圖 3-2 抗生素項目與色票核對修正

依據 2024 年報原圖逐一核對 12 類菌種的 88 個菌種－抗生素組合，並新增 `data/ar_2024_organism_antibiotic_catalog.csv` 作為圖表項目順序及配色的對照表。SA（Staphylococcus aureus，圖 3-2-7）只應有 Cefoxitin、Oxacillin，已移除其他錯列品項；其版型維持 CO＋HO 全部檢體／血液、CO、HO 四格，使用年報藍色 `#1CA4DC`（依 PDF 圖像取色）。亦已修正 P. aeruginosa、S. pneumoniae、Shigella、NTS 等菌種的抗生素名單與順序；三檢體分圖改回年報的上方全部檢體、下方血液／尿液並排方式。

CRAB 圖 4-1 的示意菌株數已校正至年報圖形量級，CO＋HO、CO、HO 堆疊圖的縱軸分別以 14,000、6,000、8,000 為上限；抗藥率折線圖縱軸上限 100%。示意數值依然 **不是正式年報數值**。

本次完成 JS 靜態語法、12 類菌種與 27 組 MDRO 選單切換及組成數值一致性模擬測試。真實 Chromium／手機截圖與輔助科技測試尚未完成，不能宣稱 AA 全面合格或圖表像素完全一致。

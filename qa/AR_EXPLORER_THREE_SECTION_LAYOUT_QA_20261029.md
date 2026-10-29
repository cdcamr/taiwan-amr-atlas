# AR Explorer 三區塊與 ICON 延伸圖表驗收紀錄
日期：2026-10-29

## 驗收範圍

- `ar-explorer.html`
- `js/ar-report-figure21.js`（原堆疊柱狀圖，內容未修改）
- `js/ar-multiseries-comparison.js`（原多菌種圖，內容未修改）
- `js/ar-report-complete-preview.js`（將單一切換頁籤改為可同時掛載兩個獨立區塊）
- `js/ar-explorer-three-section-layout.js`（新增排名主畫面與 ICON 開啟的其他圖表）

## 版面與交互測試

| 核對項目 | 模擬測試結果 | 備註 |
|---|---|---|
| 三個主要區塊 | 通過 | 01 分離菌株排名、02 重要菌種抗藥性、03 MDRO 趨勢 |
| 分離菌株主畫面 | 通過 | 原年報式堆疊柱狀圖常駐；報表／其他圖型預設收起 |
| 排行柱狀圖 ICON | 通過 | 點選開啟原柱狀圖，並將 chartType 設為 bar |
| 六年折線圖 ICON | 通過 | 點選開啟原趨勢圖，並將 chartType 設為 line |
| 多菌種比較 ICON | 通過 | 展開既有折線／分組柱狀圖，比較面板具原有篩選及下載控制 |
| 年報表格 ICON | 通過 | 原表 2-1 顯示於延伸分析，不佔主要版面 |
| 收合／焦點返回 | 通過 | 點選收合後回到主畫面，並還原觸發按鈕焦點 |
| 重要菌種及 MDRO 分離 | 通過 | 分別為永久顯示的主區塊，不再共用切換頁籤 |
| 兩區塊下拉選單 | 通過 | 模擬檢查重要菌種 12 選項、MDRO 9 選項 |
| 切換 SA 不影響 MDRO | 通過 | 單獨切換重要菌種，MDRO 目前圖表保持不變 |
| 切換 CRKP/HO 不影響重要菌種 | 通過 | MDRO HO 可繪製兩圖，重要菌種保持不變 |
| DOM id 重複 | 通過 | 使用 imp-、mdr- 前綴隔離兩份圖表引擎 |
| 來源資料與圖型 | 沿用既有 | 原有年報式堆疊、重要菌種水平長條與 MDRO 堆疊／折線圖 |
| CSV、PNG、檔案來源 | 保留原功能 | 控制與事件處理程式未刪除，**未做真實瀏覽器下載驗收** |

## 仍需正式環境確認

1. 目前執行 JavaScript 語法檢查與模擬 DOM/交互測試，未完成 GitHub Pages 公開站的 Chrome、Safari、Firefox 真實視覺截圖測試；可能仍有瀏覽器特有的 CSS/事件問題。
2. 手機／平板 375px、768px 版面及鍵盤／讀屏軟體的 WCAG AA 完整測試尚未完成。
3. PNG 圖片匯出及分享網址剪貼簿流程仍需實際瀏覽器測試。
4. 年報式重要菌種／MDRO 圖中的 `illustrative_estimate` 仍是示意值，尚未替換為正式精確監測資料。

## 回復

修改前兩份版本完整備份於：

- `history/ar-explorer-before-3-section-icon-layout-20261029.html`
- `history/ar-report-complete-preview-before-3-section-icon-layout-20261029.js`

還原至原檔路徑後，舊版不會引用新 `js/ar-explorer-three-section-layout.js`。


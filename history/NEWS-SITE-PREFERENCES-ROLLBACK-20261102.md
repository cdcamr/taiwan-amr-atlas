# 語言及背景主題跨頁保留：修改與回復說明（2026-11-02）

## 修改內容
- 全站 10 個頁面於 body 開始立即載入 js/site-preferences.js，以儲存及還原語言、淺色／深色主題。
- 使用既有語系偏好鍵 taiwan-amr-platform-language；新增共用主題偏好鍵 taiwan-amr-platform-theme。
- 若尚未使用共用主題偏好，會讀取 NEWS & EVENTS 舊版 amr-news-theme 並遷移一次。
- js/site-branding.js 統一提供各頁的語言及背景主題控制，缺少主題按鈕的頁面會自動補上。
- 首頁的動態文案會依已儲存語言初始化，不必等到切換操作後再更新。
- js/news.js 移除獨立主題設定，避免切回 NEWS & EVENTS 時覆蓋全站選擇。
- 不修改新聞文章資料、圖片、AR/AU/HAI 資料、圖表指標或其他業務邏輯。

## 修改前完整版本
原始 HTML、js/news.js、js/site-branding.js 與 README.md 均以原 Git Blob 保存在：
history/preferences-before-20261102/

## 回復方式
建議 Revert 本次 PR 合併提交；亦可從備份路徑還原原始頁面及程式，並刪除新增的 js/site-preferences.js。

注意：Git 還原不會自動刪除使用者瀏覽器 localStorage。若有需要可由使用者自行清除網站資料；但這也會清除同網域的其他本機儲存資料，包括 NEWS & EVENTS 尚未同步的草稿。未經確認不建議清除網站資料。

## 使用限制
同一瀏覽器、同一網站來源範圍內保留偏好。若使用其他手機或瀏覽器，需個別設定一次。部分子頁面原本沒有完整翻譯全部內文，本次修改以保留語言選擇及標題一致為主，不會自動翻譯所有資料內容。

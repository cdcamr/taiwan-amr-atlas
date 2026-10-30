# 2026-10-30 一鍵示意發布與多語標題：回復說明

## 本次修改範圍
- 首頁和 9 個子頁面：網站顯示名稱、瀏覽器標題及共同語言切換。
- NEWS & EVENTS：一鍵發布（僅同一瀏覽器可見）、文章重新編輯／下架／刪除。
- 新增 js/site-branding.js 和 js/news-preview-store.js。
- 既有需 GitHub 授權的跨裝置同步發布功能保留；沒有更新 data/news/manifest.json。

## 備份檔
- history/before-one-click-and-title-20261030/index.html
- history/before-one-click-and-title-20261030/news.html
- history/before-one-click-and-title-20261030/news-editor.html
- history/before-one-click-and-title-20261030/js/news.js
- history/before-one-click-and-title-20261030/js/news-editor.js

## 回復方式
建議使用 GitHub Revert 回復此次合併 PR（可連同 9 個子頁面的更動一起回復）。
亦可將以上備份復原至原位置，再移除新增的共用 JS 與引用，經 Pull Request 合併。
瀏覽器本機示意資料可在開發者工具清除本網站 localStorage 鍵值 taiwan-amr-news-local-preview-v1；Git 回復不會自動清除此個別瀏覽器的資料。

## 重要界線
示意文章「一鍵發布」寫入瀏覽器 localStorage，並非寫入 GitHub Pages 的公開檔案。
其他瀏覽器或裝置無法看到。未來正式共用發布須由已登入且具授權的伺服器端 API 寫入資料庫或受管儲存庫。

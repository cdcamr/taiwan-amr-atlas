# NEWS & EVENTS 圖片與圖說：回復說明（2026-10-30）

## 修改內容
- NEWS & EVENTS 文章可選擇 JPEG、PNG、WebP 圖片，最多四張。
- 新增每張圖片的圖說與無障礙替代文字欄位、上傳後壓縮處理及文章預覽。
- 消息列表顯示第一張圖片封面；文章詳細頁顯示全部圖片與圖說。
- 示意一鍵發布：圖片以 data URL 形式儲存於**同一瀏覽器的 localStorage**，不會同步給其他裝置。
- GitHub 同步發布：先將壓縮圖檔寫入 assets/news/images/<article-id>/<hash>.<webp|jpg|png>，再將只有圖片**相對路徑**的文章資料寫入 data/news/manifest.json。仍須具寫入權限的 GitHub Token。
- 既有純文字消息、分類、語言標題切換等功能保留。

## 回復檔
以下檔案均為本次修改前原始版本：
- history/before-news-photo-caption-20261030/news-editor.html
- history/before-news-photo-caption-20261030/news.html
- history/before-news-photo-caption-20261030/js/news-editor.js
- history/before-news-photo-caption-20261030/js/news.js
- history/before-news-photo-caption-20261030/js/news-preview-store.js
- history/before-news-photo-caption-20261030/css/news.css

## 回復方式
建議在 GitHub 對此功能 PR 的 merge commit 執行 Revert，較能完整回復所有檔案與新增 js/news-media.js。
也可在新 PR 將上述備份還原至原位置，再移除 js/news-media.js，並一併移除前台及後台對該檔的引用。
Git 回復不會移除已寫入其他瀏覽器的示意 localStorage；可於開發者工具清除 taiwan-amr-news-local-preview-v1。

## 注意
1. 目前無獨立 CMS 伺服器，非正式機關帳號權限控管。
2. 圖片不得包含敏感個資、未公開資訊或未獲授權的素材。
3. 瀏覽器 localStorage 容量有限；上傳前會壓縮圖片，累積過多仍可能超過容量。
4. GitHub 同步發布會將圖片與消息對外公開；需要確認內容與授權。

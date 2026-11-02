# NEWS & EVENTS 手機同步及舊消息批次移轉 — 回復說明（2026-11-02）

## 本次更新
1. 後台將「發布到共用網站（手機可查看）」作為主要發布入口，仍須 GitHub 授權。
2. 新增「一次同步既有已發布消息」按鈕，讀取當時發布所使用的**同一瀏覽器**的 localStorage，將原先只存在本機的文章、圖片、圖說、發布日期等上傳至 GitHub Pages 共用清單。
3. 網站上已有相同文章代碼時跳過，不覆蓋共用網站現有內容。
4. 成功同步的本機文章增加 public_synced_at 狀態，前台在 Pages 部署後優先使用公開版本；部署前顯示等待狀態。
5. 加入複製手機查看網址的功能，並明確區分「本機預覽」與「共用發布」。
6. **本次程式部署不會自動取得您的瀏覽器資料，也不會自動發布任何現有消息**；首次轉移需在原電腦、原瀏覽器執行批次同步一次。

## 已備份的原始檔案
- history/before-news-shared-publish-20261102/news-editor.html
- history/before-news-shared-publish-20261102/news.html
- history/before-news-shared-publish-20261102/js/news-editor.js
- history/before-news-shared-publish-20261102/js/news.js
- history/before-news-shared-publish-20261102/js/news-preview-store.js
- history/before-news-shared-publish-20261102/css/news.css

## 回復方法
建議在 GitHub 對本次 Pull Request 的 merge commit 執行 Revert；亦可經新 PR 將備份檔案還原至原路徑。

## 資料回復注意
Git 回復不會清除瀏覽器本機的舊示意消息，也不會自動撤回在批次同步後已提交的公開新聞與圖片。已同步的正式公開文章如需下架，必須另行修改 GitHub 的公開文章清單，不能只使用「本機下架」按鈕。

## 安全限制
本網站與 GitHub 儲存庫目前為公開狀態，對外檢視不限於「知道網址的人」。後台寫入需要 GitHub Token，不應將 Token 貼在對話或文件中，也不應發布含有識別個資或未經核定的圖片、資料。

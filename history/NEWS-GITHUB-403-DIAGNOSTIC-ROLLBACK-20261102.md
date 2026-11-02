# NEWS & EVENTS GitHub 403 發布錯誤診斷修正（2026-11-02）

## 問題
2026-11-02 目前收到「批次同步未完成：圖片上傳失敗（HTTP 403）」。
已確認倉庫 cdcamr/taiwan-amr-atlas 為公開倉庫、擁有者是 cdcamr（GitHub User 帳號）、main 分支無保護、rulesets 清單為空；GitHub Pages 上次部署成功。
此資訊不足以確定使用者輸入的 Personal Access Token 是否具 Contents: Read and write 權限。403 亦可能源自 API 速率限制等其他原因。

## 修改
- 後台加入「檢查 GitHub 授權」按鈕：使用現有 Token 呼叫 GitHub /user 和指定儲存庫唯讀 API，顯示帳號及 API 回傳的推送權限；不寫入檔案，不儲存 Token；仍無法取代實際的 Contents 寫入授權驗證。
- GitHub PUT/GET 失敗時保留 GitHub 原始訊息（例如 Resource not accessible by personal access token）及 X-Accepted-GitHub-Permissions（若瀏覽器可讀取），針對 403 權限不足、401 無效憑證、403/429 速率限制提供相應提醒。
- 加入「下載本機消息及圖片備份」按鈕，將原瀏覽器已有的全部消息與附圖資料存為 JSON，避免修正權限期間遺失資料。備份檔**不含 GitHub Token**。
- 未變更原有批次同步的消息、圖片、圖說及清單歸併邏輯；未新增或更動任何正式消息或圖片檔案。

## 修改前完整檔案
- history/news-github-403-before-fix-20261102/news-editor.html
- history/news-github-403-before-fix-20261102/js/news-editor.js
- history/news-github-403-before-fix-20261102/css/news.css

## 回復
可 Revert 此 PR merge commit 或將上述備份檔還原至原位置。既有本機文章及圖片仍保存在原瀏覽器 localStorage；本次變更不修改 data/news/manifest.json。

## 操作步驟
1. 在原本發布舊消息的電腦、同一瀏覽器開啟 news-editor.html。
2. 先點「下載本機消息及圖片備份」，確認檔案已保存。
3. 在 GitHub 帳號 cdcamr 的 Personal access tokens 設定中檢查 Resource owner、Selected repositories（taiwan-amr-atlas）及 Contents: Read and write。
4. 將 Token 輸入後台，點「檢查 GitHub 授權」；這是唯讀檢查，不能保證最終寫入成功。
5. 再點「一次同步既有已發布消息」。如仍失敗，記錄「GitHub 原因」的文字，但不可複製或傳送 Token。
6. GitHub Pages 是公開網站，非只有知道網址的人才能看見；請勿使用未核定或敏感資料測試。

## 注意
下載的 JSON 可能包含完整文章及嵌入圖片，應妥善保存。瀏覽器本機資料清除後無法自動回復。

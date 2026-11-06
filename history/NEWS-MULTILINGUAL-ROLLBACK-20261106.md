# NEWS & EVENTS 已發布文章中／英／日文內容切換（2026-11-06）

## 目標
讓已發布 NEWS & EVENTS 文章的標題、摘要、內文及圖片替代文字／圖說，依平台既有的「繁體中文／English／日本語」選單呈現；換頁或重新載入後仍保留同一瀏覽器的語言設定。

## 修改
- 新增 `js/news-i18n.js`：標準化各語言內容；若譯文不存在，以繁體中文原文回退並顯示提示；不在頁面上執行 HTML。
- `js/news.js`：列表、搜尋、單篇詳細頁、圖片 gallery 及分類標籤切換語言。切換語言時保留目前文章的 `#article=...` 連結；同一瀏覽器的不同分頁更新語言時也能重新繪製。
- `news-editor.html`／`js/news-editor.js`：英文與日文標題、摘要、內文及最多四張圖的替代文字、圖說編輯；按語言預覽；JSON 草稿匯入、匯出及既有本機消息同步時保留譯文。
- 後台增加「讀取共用網站已發布文章」，可在不同瀏覽器直接讀取現有 GitHub Pages 文章，載入編輯而不用重新上傳原圖片；更新公開版本仍需 GitHub Token。
- `data/news/manifest.json`：既有三篇消息補上英文、日文譯文。WHO 清單原始英文標題與摘要保留於 `translations.en`，主欄位改為中文譯文；其餘兩篇既有中文內容、文章代碼、日期、連結、圖片路徑都維持不變。三篇文章仍為公開已發布狀態。
- `css/news.css`：多語編輯表單及回退提示樣式，卡片摘要節錄不更動文章詳細內容。

## 資料格式
原本的 `title`、`summary`、`body`、`images` 均為 **繁體中文來源版本**。

```json
{
  "title": "繁體中文標題",
  "summary": "繁體中文摘要",
  "body": "",
  "images": [{"src": "./assets/news/images/...", "alt": "中文替代文字", "caption": "中文圖說"}],
  "translations": {
    "en": {
      "title": "English title",
      "summary": "English summary",
      "body": "",
      "images": [{"alt": "English alt", "caption": "English caption"}]
    },
    "ja": {
      "title": "日本語タイトル",
      "summary": "日本語の概要",
      "body": "",
      "images": [{"alt": "日本語の代替テキスト", "caption": "日本語キャプション"}]
    }
  }
}
```

圖片的二進位檔案和 `src` **不依語言複製**，只有替代文字與圖說依同一索引切換。翻譯缺值時顯示原文，不臆造內容。

## 舊消息清單
1. 世界衛生組織2024年細菌優先病原體清單
2. 2024年臺灣抗生素抗藥性監視年報
3. 2025世界抗生素周

英文、日文譯文為本次輔助草擬，**正式機關對外發布前應經業務單位確認**；此 GitHub Pages 仍是研究原型，公開可由任何知道或找到網址的人瀏覽。

## 使用限制
GitHub Pages 是靜態網站，**不會在讀者開啟文章時呼叫 AI 即時翻譯**。日後文章如需三語全文切換，編輯者應在後台填寫譯文後再發佈。若只填寫部分語系內容，未翻譯欄位會顯示原文並提示。未來若要提供自動翻譯及審稿流程，需另建安全的翻譯後端與內容審核機制。

## 測試
- 三篇公開文章 ID、狀態、圖片 `src`、日期、外部連結與修改前一致。
- 英、日列表／詳細頁切換與圖片替代文字切換，保留單篇 `#article` 連結及語言相關搜尋；模擬測試通過。
- 後台可載入三篇共用已發布文章，於日文預覽，修改英文標題後匯出 JSON；原圖片 URL 不變。
- JavaScript 語法及前後台 HTML 資源載入順序檢查通過。
- 尚未透過實機手機瀏覽器執行人工目視測試；正式部署後建議檢查三語排版和圖說。

## 回復
可直接在 GitHub **Revert** 本次合併 PR；或將以下 8 個修改前檔案原樣還原：
- `history/news-before-multilingual-20261106/news.html`
- `history/news-before-multilingual-20261106/news-editor.html`
- `history/news-before-multilingual-20261106/js/news.js`
- `history/news-before-multilingual-20261106/js/news-editor.js`
- `history/news-before-multilingual-20261106/js/news-media.js`
- `history/news-before-multilingual-20261106/css/news.css`
- `history/news-before-multilingual-20261106/data/news/manifest.json`
- `history/news-before-multilingual-20261106/README.md`

刪除新增的 `js/news-i18n.js` 即可回到原本單一語言版本。所有既有圖片檔案保持不變。回復程式**不會刪除瀏覽器內的草稿或網站偏好設定**。

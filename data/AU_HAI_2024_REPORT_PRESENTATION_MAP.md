# AU、HAI 2024 年報圖表呈現對照表（2026-11-03）

## 實際官方年報來源
1. [2024 年臺灣抗生素使用量監視年報](https://www.cdc.gov.tw/Category/Page/tx7G1t-G3lyodZ8m8uoYMA)（2024 年報索引與 PDF 連結）
2. [2024 年區域級以上醫院醫療照護相關感染監視年報](https://www.cdc.gov.tw/Category/MPage/4G8HuDdUN1k4xaBJhbPzKQ)
3. [2024 年地區醫院醫療照護相關感染監視年報](https://www.cdc.gov.tw/Category/MPage/4G8HuDdUN1k4xaBJhbPzKQ)
4. [疾管署 2024 年 AU 年報發布重點摘要（含 2024 DID、AWaRe、ATC 排名及相關性描述）](https://www.ntcma.org.tw/portal_b1_page.php?button_num=b1&cnt_id=10933&owner_num=b1_57275)

上述 PDF 原件的完整路徑已存入網站兩份資料 JSON 的 `report_style_reference` 或 `report_style_references` 欄位，並於各專區來源區塊提供連結。

## AU 網站主題與資料對應

| 主題鍵 | 參考年報分析面向 | 網站呈現 | 資料與限制 |
|---|---|---|---|
| national | 全國門住診抗生素使用量 | 跨年度 DID 折線圖 | 2013、2014、2023、2024 公告精確值；中間缺值不連線 |
| inpatient | 住院抗生素使用量 | 跨年度 DID 折線圖 | 2013、2014、2021、2023、2024 公告精確值；與全國門住診 DID 分母不同 |
| aware | 全國門住診 AWaRe Access | 折線圖＋70%參考線 | 2021、2023、2024 公告值 |
| aware-ward | 住院 AWaRe Access | 折線圖 | 2013、2014、2023、2024 公告值 |
| atc | 使用量密度排名 | 2024 年 ATC 順位清單 | 保留公告各對象排名；不將名次模擬成 DID |
| facility | 院所層級分析 | 年報主題說明及缺值提示 | 未取得完整逐院層精確表格 |
| correlation | 使用量與抗藥性相關性 | 年報主題說明及缺值提示 | 未取得每年度 AU–AMR 配對觀察值，不擬製散布圖 |

## HAI 兩份年報與資料對應

- 分別提供「2024 年區域級以上醫院年報」與「2024 年地區醫院年報」入口，前者可勾選醫學中心／區域醫院，後者僅顯示地區醫院。跨報告醫院層級不合併。
- 可選主題：感染部位別感染密度、ICU 類型別感染密度、導管相關感染密度、導管使用比率、裝置相關感染占比。
- 圖表採白色科學報表式畫布、明確軸線與單位、不同醫院層級固定顏色、年度折線圖／分組柱圖／詳細數值表；數值點可看分子、分母。
- 歷史來源僅為 2008–2023 年 CDC ICU 開放資料，2024 年兩份 HAI 年報的精確逐圖原始資料均**尚未匯入**。這些圖是「參照年報主題重新繪製的歷史資料圖」，不應宣稱為年報原圖。
- HAI 公式、來源 CSV 的去重紀錄、4 組資料 Git Blob SHA 及資料品質檢核，詳見 `data/AU_HAI_REPORT_INTEGRATION_README.md`。

## 視覺核對限制
2024 年三份官方 PDF 網址及其發布頁已核實，但目前來源 PDF 在圖像擷取時出現網頁快取／連線限制，無法逐頁核對全部原圖之圖號、色票、標記、字體及精確布局。因此**未宣稱像素等級完全一致**，也沒有為所有網站主題自行編造對應年報圖號。本版先對齊可確認的年報主題、醫院報告分類、指標定義及年度趨勢版型；日後取得可直接讀取的正式 PDF 與原始 CSV，可逐圖再校正。

## 修改前備份
`history/au-hai-before-yearbook-layout-20261103/` 保存 AU／HAI 頁面、共用 JS、CSS、兩個原數據 JSON 及 README 原檔。回復方式見 `history/AU-HAI-YEARBOOK-LAYOUT-ROLLBACK-20261103.md`。

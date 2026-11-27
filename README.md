# 公仔小舖 Figurestall 官網

用 [local-service-site-template](https://github.com/tracychuen-wq/local-service-site-template) 建立。技術：Astro ＋ Decap CMS（後台 /admin/）＋ Cloudflare Pages。

## 這個網站的設定
- 預覽網址：`https://figurestall-site.pages.dev`（Cloudflare Pages 專案名稱請用 `figurestall-site`）
- 購買方式：主按鈕是 LINE（@267xshxa）；「線上下單」按鈕連到舊站購物車 `figurestall.com/products.php`（後台「公司基本資料 → 線上商店網址」可改）
- 款式頁（`src/content/services/`）每頁有自己的線上購買連結，連到舊站對應分類
- 作品照片目前直接引用舊站 `figurestall.com/photos/...`；情境照放在 `public/uploads/scenes/`
- 價格、尺寸、製作時間、相似度都取自舊站商品頁（2026-11-27）

## 上線前要跟老闆確認
- 軍警公仔：舊站列表顯示 NT$2,380，但「個人獎盃公仔」商品頁寫 NT$2,830（獎盃公仔是 NT$2,880），請確認
- 頁尾「負責人」目前寫吳吉安師傅，請確認實際負責人
- 營業時間、Facebook／IG、Google 商家網址、GA4 ID
- 情境照裡的公仔是否都是實際作品

---

# 在地服務業官網範本（Astro ＋ Decap CMS ＋ Cloudflare Pages）

適合：室內設計、裝修、搬家、清潔、驗屋、車行、攝影、旅遊等「在地服務＋案例展示」型的客戶。

內建功能：
- 首頁、關於、服務項目（含 Q&A）、成功案例（照片燈箱）、專欄文章、常見問題、聯絡（表單送 LINE）
- 後台（/admin/）：GitHub 登入、手機可用
- 批次工具：多張照片上架、CSV 匯入多個案例（照片依檔名自動配對）、批次修改／發布
- SEO／GEO 小幫手（編輯畫面右下角）＋ 全站網站健檢（總分、SEO、GEO）
- 帳號權限管理、網站擁有者轉移（自動偵測）
- 結構化資料（在地商家、服務、FAQ、文章、麵包屑）、sitemap、robots、llms.txt
- 社群連結、分享按鈕、GA4／GTM／Search Console／Bing 欄位

---

# 新客戶建站清單

預估時間：技術設定約 30 分鐘；內容整理依客戶資料量而定。
**全程不需要改程式碼。**

## 0. 事前向客戶收集
- [ ] 品牌名稱、簡稱、負責人姓名／暱稱、一句話背景
- [ ] 電話、LINE 官方帳號 ID、地址、服務地區、營業時間
- [ ] 服務項目清單（每項的說明、常見問題、價格或工期區間）
- [ ] 案例照片（依「案例名稱-編號」命名最快，例如 `北屯透天-01.jpg`）
- [ ] Logo（橫式＋方形）、品牌色碼（沒有的話用範本預設色）
- [ ] 社群網址（FB、IG、Google 商家…）
- [ ] 網域（建議用客戶名義購買）

## 1. 建立客戶的 repo（2 分鐘）
1. 打開這個範本 repo，按右上角綠色 **Use this template → Create a new repository**
2. Owner 選你的帳號（或客戶的組織），名稱例如 `client-name-site`，選 **Private**

## 2. GitHub OAuth App（後台登入，3 分鐘）
GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
- Application name：`客戶名 網站後台`
- Homepage URL：`https://專案名稱.pages.dev`
- Authorization callback URL：`https://專案名稱.pages.dev/api/callback`
- 建好後記下 **Client ID**，按 **Generate a new client secret** 並複製（只顯示一次）

## 3. Cloudflare Pages（10 分鐘）
1. Workers & Pages → 建立 → Pages → **連接 Git** → 選剛建立的 repo
2. 專案名稱：與步驟 2 的網址一致
3. 組建命令：`npm run build`；輸出目錄：`dist`
4. 設定 → **變數與機密**（生產環境）新增：

| 變數名稱 | 類型 | 值 |
|---|---|---|
| `GITHUB_REPO` | 文字 | `你的帳號/repo 名稱` |
| `GITHUB_CLIENT_ID` | 文字 | 步驟 2 的 Client ID |
| `GITHUB_CLIENT_SECRET` | **祕密** | 步驟 2 的 Client secret |
| `SITE_URL` | 文字 | `https://專案名稱.pages.dev`（綁網域後改成正式網址） |
| `CANONICAL_HOST` | 文字 | 綁網域後才加，例如 `www.客戶網域`（見第 7 步） |

5. 部署 → 最新部署 → **重試部署**（讓變數生效）

## 4. 後台填資料（客戶或你都可以做）
打開 `https://專案名稱.pages.dev/admin/` → 用 GitHub 登入
1. **公司基本資料**：名稱、電話、LINE、地址、服務地區、社群、配色、**案例分類**、商家類型
2. **網站文案**：各頁標題、首頁文字、表單選項（文字中可用 `{brand}` `{areas}` `{phone}` `{lineId}` `{owner}` `{address}` 自動帶入）
3. **服務項目**：刪除範例服務，新增客戶的服務
4. **成功案例**：用「批次工具 → ② 匯入多個案例」一次匯入，照片一起選
5. **專欄文章**：刪除範例文章，開始寫
6. 打開 **網站健檢**，把紅色項目改掉

> 後台選單的「成功案例」「專欄文章」名稱可在 `public/admin/config.yml` 的 `label` 修改（選填）。
> 網站前台的區塊名稱則在「網站文案 → 選單與區塊名稱」修改。

## 5. 加入客戶帳號
後台 → **帳號權限** → 輸入客戶的 GitHub 帳號 → 送出邀請

## 6. 上線前檢查
- [ ] 刪除所有範例內容（服務 A／B、範例案例、範例文章）
- [ ] 網站健檢 80 分以上
- [ ] 手機版看過首頁、案例頁、聯絡頁
- [ ] 聯絡表單送出會開啟正確的 LINE 官方帳號
- [ ] Logo 已換成客戶的（橫式＝頁首、直式＝頁尾可留白、方形＝分頁圖示與 Google），社群分享預覽圖也換好

## 7. 綁網域與搜尋設定
1. **網域商改名稱伺服器**（以 PChome 買網址為例）：Cloudflare 首頁 → 新增網域（免費方案）→ 記下兩組 `xxx.ns.cloudflare.com`
   → PChome「管理我的網址 → 進入」→ 寄送驗證碼（客戶本人輸入）→ 選「**自管DNS**」→ Name Server 填這兩組、IP 留白 → 送出
   → 回 Cloudflare 按「我已更新我的名稱伺服器」（通常幾分鐘～數小時生效）
2. Cloudflare Pages → **自訂網域** → 依序新增 `www.客戶網域` 與 `客戶網域`（DNS 記錄會自動建立）
3. Cloudflare 變數：`SITE_URL` = `https://www.客戶網域`，新增 `CANONICAL_HOST` = `www.客戶網域` → 重新部署
   （`CANONICAL_HOST` 會把 pages.dev 與不含 www 的網址 301 轉到正式網址，集中 SEO 權重）
4. GitHub OAuth App → **Add redirect URI** 新增 `https://www.客戶網域/api/callback`（舊的可保留），Homepage URL 改成正式網址
5. 測試：開 `https://www.客戶網域/admin/` 登入後台
6. 後台「公司基本資料 → 搜尋與流量追蹤」：填 Search Console、Bing、GA4 或 GTM
   - GA4 新串流顯示「尚未收到資料」最多要 24～48 小時；要立即確認請看 GA4「報表 → 即時」（用沒裝廣告阻擋的瀏覽器）
   - 隔天到 GA4「管理 → 事件」把 `line_click`、`phone_click` 標成**主要事件**
7. Search Console 提交 `sitemap-index.xml`；Bing Webmaster Tools 可直接「從 Search Console 匯入」
   **IndexNow（通知 Bing 等搜尋引擎）**：終端機執行
   `K=$(openssl rand -hex 16); printf $K > public/indexnow-key.txt; printf $K > public/$K.txt` 後推送。
   之後每次後台上架、改內容，GitHub Actions 會在部署約 4 分鐘後自動送出有變動的網址（Actions 分頁可看紀錄）。
   沒有這個檔案時自動略過，不會報錯。
8. Google 商家檔案的網站連結改成新網域

## 8. 交接給客戶（選用）
後台 → 帳號權限 → **網站擁有者** → 依 3 步驟轉移
（若有設定 `GITHUB_REPO`，轉移後同步把 Cloudflare 變數改成新的 `owner/repo`）

---

## 本機開發

```
npm install
npm run dev          # http://localhost:4321
npx decap-server     # 另開終端機，本機測試後台
```

## 檔案位置
| 內容 | 位置 |
|---|---|
| 公司資料、配色、分類 | `src/data/site.json` |
| 各頁文案 | `src/data/pages.json` |
| 服務／案例／文章 | `src/content/services`、`cases`、`blog` |
| 上傳的照片 | `public/uploads/` |
| 後台設定 | `public/admin/config.yml` |
| 後台登入程式 | `functions/api/` |

---

## GA4 事件（後台填好 GA4 或 GTM 就自動生效）

建站後在 GA4 做兩件事：① 管理 → 自訂定義 → 建立事件範圍維度：click_location、page_type、link_text、service_type、budget_range、house_condition、service_area、faq_question、filter_category。② 上線 24 小時後到 管理 → 事件 → 近期事件，把 generate_lead、line_click、phone_click（及 map_click）打星號設為重要事件。


| 事件 | 何時觸發 | 參數 | GA4 建議 |
|---|---|---|---|
| `generate_lead` | 聯絡表單按「用 LINE 送出」 | service_type、house_condition、budget_range、service_area（不含姓名電話） | ★ 主要事件 |
| `line_click` | 任何 LINE 按鈕 | click_location、link_text | ★ 主要事件 |
| `phone_click` | 任何電話按鈕 | click_location、link_text | ★ 主要事件 |
| `map_click` | 地圖浮標／地圖連結 | click_location | 主要事件（選用） |
| `fb_click` | Facebook 浮標／連結 | click_location | |
| `cta_click` | 站內按鈕（看案例、看服務…） | click_location、link_url、link_text | |
| `faq_open` | 展開常見問題 | faq_question | |
| `filter_cases` | 案例頁點分類 | filter_category | |
| `view_case_photo` | 案例照片放大 | item_id（頁面路徑） | |
| `share` | 分享按鈕 | method（facebook／line／threads／copy_link）、item_id | |

所有事件都帶 `page_type`（home、cases、services、blog、contact…）。
`click_location` 值：float（右下浮標）、header、footer、hero、cta_band、sidebar、contact_page、content。
GTM 使用者：同名事件也會推到 dataLayer，可直接當自訂事件觸發條件。
捲動、外連、站內搜尋由 GA4「加強型評估」自動記錄。

# Thai & Thai LIFF App - Setup & Deployment Guide

# Thai & Thai LIFF App 設定與部署指南

This guide walks you through deploying your LIFF menu ordering app and connecting it to your LINE Official Account. Your existing LINE OA message-sending web app will NOT be affected.

本指南將引導你部署 LIFF 點餐 App 並連結到你的 LINE 官方帳號。你現有的 LINE OA 訊息發送 Web App 不會受到影響。

---

## Table of Contents

1. [Deploy to GitHub Pages（部署到 GitHub Pages）](#1-deploy-to-github-pages)
2. [Register LIFF App in LINE Developer Console（在 LINE 開發者後台註冊 LIFF App）](#2-register-liff-app-in-line-developer-console)
3. [Update LIFF ID in Code（更新程式碼中的 LIFF ID）](#3-update-liff-id-in-code)
4. [Set Up Rich Menu（設定圖文選單）](#4-set-up-rich-menu)
5. [Rich Menu Image（圖文選單圖片）](#5-rich-menu-image)
6. [Important Notes（重要說明）](#6-important-notes)
7. [Quick Start Checklist（快速啟動檢查清單）](#7-quick-start-checklist)

---

## 1. Deploy to GitHub Pages

### 1.1 Create a GitHub Repository（建立 GitHub 儲存庫）

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `thaifood`
3. Set to **Public** (GitHub Pages requires Public for free accounts)
4. Do NOT initialize with README (we already have files locally)
5. Click **Create repository**

### 1.2 Push Code to GitHub（推送程式碼到 GitHub）

Open a terminal in the `C:\Users\tommy.yeh\Code\thaifood` folder and run:

```bash
git init
git add index.html
git commit -m "Initial commit: Thai & Thai LIFF menu app"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/thaifood.git
git push -u origin main
```

> Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.
> 將 `YOUR_GITHUB_USERNAME` 替換為你的 GitHub 使用者名稱。

### 1.3 Enable GitHub Pages（啟用 GitHub Pages）

1. Go to your repository on GitHub: `https://github.com/YOUR_GITHUB_USERNAME/thaifood`
2. Click **Settings** (齒輪圖示)
3. In the left sidebar, click **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Under **Branch**, select `main` and folder `/ (root)`
6. Click **Save**
7. Wait 1-2 minutes, then refresh the page

Your deployed URL will be:
```
https://YOUR_GITHUB_USERNAME.github.io/thaifood/
```

> This URL will be displayed at the top of the GitHub Pages settings page once deployment is complete.
> 部署完成後，此 URL 會顯示在 GitHub Pages 設定頁面的頂部。

---

## 2. Register LIFF App in LINE Developer Console

### 2.1 Access LINE Developer Console（進入 LINE 開發者後台）

1. Go to [https://developers.line.biz/](https://developers.line.biz/)
2. Log in with your LINE account (the one that manages your LINE OA)

### 2.2 Find Your Provider（找到你的 Provider）

1. After logging in, you'll see your **Providers** list on the dashboard
2. Click the provider that is associated with your existing LINE OA
   - You should already see a **Messaging API** channel here (this is your existing app -- do NOT modify it)
   - 你應該已經看到一個 Messaging API 頻道（這是你現有的 App -- 不要修改它）

### 2.3 Create a LINE Login Channel（建立 LINE Login 頻道）

> **Why a new channel?** LIFF apps are registered under **LINE Login** channels, not Messaging API channels. Creating a new LINE Login channel keeps your LIFF app completely separate from your existing Messaging API setup.
>
> **為什麼要新頻道？** LIFF App 是註冊在 LINE Login 頻道下，不是 Messaging API 頻道。建立新的 LINE Login 頻道可以讓 LIFF App 與你現有的 Messaging API 設定完全分離。

1. Inside your provider, click **Create a new channel**
2. Select **LINE Login** as the channel type
3. Fill in the required fields:
   - **Channel name**: `Thai & Thai Menu` (or any name you like)
   - **Channel description**: `LIFF menu ordering app for Thai & Thai restaurant`
   - **App types**: Check **Web app**
   - **Email address**: Your email
4. Agree to the terms and click **Create**

### 2.4 Add a LIFF App（新增 LIFF App）

1. In your newly created LINE Login channel, click the **LIFF** tab
2. Click **Add**
3. Fill in:

| Field | Value |
|-------|-------|
| **LIFF app name** | `Thai & Thai 菜單` |
| **Size** | `Full` (全螢幕) |
| **Endpoint URL** | `https://YOUR_GITHUB_USERNAME.github.io/thaifood/` |
| **Scopes** | Check `profile` only (只勾選 profile) |
| **Bot link feature** | `Off` |
| **Scan QR** | `Off` |
| **Module mode** | `Off` |

4. Click **Add**

### 2.5 Copy the LIFF ID（複製 LIFF ID）

After creating the LIFF app, you'll see it listed with a **LIFF ID** (a string of numbers like `1234567890-aBcDeFgH`).

Copy this LIFF ID -- you'll need it in the next step.

Your LIFF URL will be:
```
https://liff.line.me/{YOUR_LIFF_ID}
```

For example: `https://liff.line.me/1234567890-aBcDeFgH`

---

## 3. Update LIFF ID in Code

### 3.1 Edit index.html（編輯 index.html）

Open `index.html` and find this line (around line 820):

```javascript
await liff.init({ liffId: 'YOUR_LIFF_ID' }); // Replace with your LIFF ID
```

Replace `YOUR_LIFF_ID` with your actual LIFF ID:

```javascript
await liff.init({ liffId: '1234567890-aBcDeFgH' }); // Replace with your LIFF ID
```

### 3.2 Redeploy（重新部署）

Push the updated code to GitHub:

```bash
git add index.html
git commit -m "Add LIFF ID"
git push
```

GitHub Pages will automatically redeploy within 1-2 minutes.

---

## 4. Set Up Rich Menu

The Rich Menu (圖文選單) is the button bar at the bottom of the LINE chat. Setting it up lets the boss tap a button to open the ordering app instantly.

### Method A: LINE Official Account Manager (Recommended -- No Coding)

#### 推薦方式：透過 LINE 官方帳號管理後台設定（不需寫程式）

1. Go to [LINE Official Account Manager](https://manager.line.biz/)
2. Select your LINE OA account
3. In the left sidebar, navigate to: **Home** > **Rich menus** (首頁 > 圖文選單)
   - In Chinese interface: 首頁 > 圖文選單 (リッチメニュー)
4. Click **Create new** (建立)

#### Configure the Rich Menu:

**Title (管理用標題):**
- Enter a title for internal reference, e.g., `點餐菜單`

**Display period (顯示期間):**
- Set a date range, or set the end date far in the future to keep it always active
- 設定一個日期範圍，或將結束日期設在很久之後讓它永遠顯示

**Template (版型):**
- Click **Choose template** (選擇版型)
- For simplest setup: choose the template with **1 large button** (one area covering the whole menu)
- If you want multiple buttons (e.g., "Order" + "Contact Us"), choose a 2-3 area template
- 最簡單的設定：選擇只有 1 個大按鈕的版型

**Background image (背景圖片):**
- Upload your Rich Menu image (see [Section 5](#5-rich-menu-image) for specs)
- Image specs: **2500 x 1686 px** (large) or **2500 x 843 px** (compact), JPEG or PNG, max 1 MB

**Action settings (動作設定):**
- Click on the button area (Area A)
- Type: **Link** (連結)
- URL: `https://liff.line.me/{YOUR_LIFF_ID}` (replace with your actual LIFF ID)
- Action label (動作標籤): `開啟點餐菜單`

**Menu bar text (選單列文字):**
- Set to `點餐菜單` or `開啟菜單` -- this is the text shown on the collapsed menu bar at the bottom of the chat
- 這是聊天室底部收合的選單列上顯示的文字

5. Click **Save** (儲存)
6. The Rich Menu will be published and visible to anyone who opens your LINE OA chat
   - 圖文選單會發布，任何開啟你 LINE OA 聊天室的人都會看到

> **Note about existing Rich Menu:** If your LINE OA already has a Rich Menu for the existing message-sending app, you have two options:
> - **Replace it** with a new multi-area Rich Menu that includes both the existing function and the new LIFF ordering button
> - **Keep both** by using the Rich Menu API to assign different menus to different users (more advanced)
>
> 如果你的 LINE OA 已經有圖文選單，可以替換成包含多個按鈕的新版，或用 API 分配不同選單給不同用戶。

### Method B: Messaging API (Programmatic)

For more control (e.g., showing different menus to different users), you can use the [Rich Menu API](https://developers.line.biz/en/docs/messaging-api/using-rich-menus/). This involves:

- Creating a Rich Menu object via `POST https://api.line.me/v2/bot/richmenu`
- Uploading the image via `POST https://api-data.line.me/v2/bot/richmenu/{richMenuId}/content`
- Setting it as default via `POST https://api.line.me/v2/bot/user/all/richmenu/{richMenuId}`

This requires your Messaging API channel access token. **Recommended only if you need advanced features.** For most cases, Method A is simpler and sufficient.

---

## 5. Rich Menu Image

### Specifications（規格）

| Property | Value |
|----------|-------|
| **Dimensions** | 2500 x 1686 px (large) or 2500 x 843 px (compact) |
| **Format** | JPEG or PNG |
| **File size** | Max 1 MB |

### Design Suggestion（設計建議）

To match the Thai & Thai restaurant branding used in the app:

- **Background**: Solid dark brown (`#3d2b1f`) or a subtle gradient from `#3d2b1f` to `#2a1f15`
- **Primary text**: Gold color (`#c4a87a`), large and centered
  - Main text: **點餐 Order**
  - Subtitle (optional): **Thai & Thai 泰式料理**
- **Decorative elements**: A thin gold (`#c4a87a`) border or corner accents
- **Optional icon**: A simple plate/utensil icon in gold

### How to Create（如何製作）

1. Go to [Canva](https://www.canva.com/) (free account works)
2. Create a custom design: **2500 x 1686 px**
3. Set background color to `#3d2b1f`
4. Add text "點餐 Order" in gold (`#c4a87a`) color, centered, large font (try "Playfair Display" or similar serif font)
5. Optionally add "Thai & Thai" above in smaller text
6. Download as PNG (make sure file is under 1 MB)

---

## 6. Important Notes

### Your Existing App Is Safe（你現有的 App 是安全的）

- The LIFF app is registered under a **LINE Login** channel, which is separate from your **Messaging API** channel
- LIFF apps and the Messaging API channel are independent -- adding a LIFF app will NOT affect your existing message-sending web app
- LIFF App 註冊在 LINE Login 頻道下，與你的 Messaging API 頻道分開，不會互相影響

### No Server Required（不需要伺服器）

- This LIFF app runs entirely client-side (HTML + JavaScript on GitHub Pages)
- There are no webhooks, no server endpoints, no backend -- so there's zero conflict with your existing setup
- 此 LIFF App 完全在客戶端運行，沒有 webhook 或後端伺服器，不會與你現有設定衝突

### How Message Sending Works（訊息發送方式）

- When the boss opens the LIFF app inside LINE and submits an order, `liff.sendMessages()` sends a message **from the boss to the current chat**
- This means the order summary appears as a message in the LINE OA 1:1 chat
- You (Tommy) can see these orders in the LINE Official Account Manager chat, or in the LINE OA app
- 老闆在 LINE 內開啟 LIFF App 並送出訂單時，`liff.sendMessages()` 會在當前聊天中發送訊息

### Testing（測試）

- The LIFF URL (`https://liff.line.me/{LIFF_ID}`) works in a regular browser for previewing the UI
- However, `liff.sendMessages()` **only works inside the LINE app** -- in a browser, the app will use a clipboard fallback instead
- For full testing, open the LIFF URL within a LINE chat
- LIFF URL 在一般瀏覽器也能開啟預覽 UI，但 `liff.sendMessages()` 只在 LINE App 內有效

### Linking LIFF to Your LINE OA Chat（在 LINE OA 聊天中開啟 LIFF）

The LIFF app opens in whatever chat context it's launched from. To use it in your LINE OA chat:
1. The boss adds your LINE OA as a friend (if not already)
2. Opens the 1:1 chat with the LINE OA
3. Taps the Rich Menu button -> LIFF app opens
4. Submits the order -> message appears in the chat

---

## 7. Quick Start Checklist

Follow these steps in order:

- [ ] **1. Deploy to GitHub Pages**
  - Create GitHub repo, push `index.html`, enable GitHub Pages
  - Confirm the page loads at `https://YOUR_GITHUB_USERNAME.github.io/thaifood/`

- [ ] **2. Create LINE Login Channel**
  - Go to LINE Developer Console -> your provider
  - Create a new LINE Login channel (NOT Messaging API)
  - 在 LINE 開發者後台建立新的 LINE Login 頻道

- [ ] **3. Register LIFF App and Get LIFF ID**
  - Add LIFF app under the LINE Login channel
  - Set Endpoint URL to your GitHub Pages URL
  - Copy the LIFF ID
  - 新增 LIFF App，複製 LIFF ID

- [ ] **4. Update LIFF ID in Code and Redeploy**
  - Replace `YOUR_LIFF_ID` in `index.html` (line ~820)
  - Push changes to GitHub -> wait for redeploy
  - 更新程式碼中的 LIFF ID 並重新部署

- [ ] **5. Set Up Rich Menu**
  - Go to LINE Official Account Manager -> Rich Menu
  - Create menu with LIFF URL: `https://liff.line.me/{LIFF_ID}`
  - 在 LINE 官方帳號管理後台設定圖文選單

- [ ] **6. Test End-to-End**
  - Open your LINE OA chat on your phone
  - Tap the Rich Menu button
  - The LIFF ordering app should open full-screen
  - Select items and submit -> order message appears in chat
  - 在手機 LINE 中開啟 OA 聊天 -> 點選圖文選單 -> 測試點餐

---

**Congratulations!** Once all steps are complete, the boss can open the LINE OA chat, tap the menu button, select dishes, and send the order -- all within LINE.

**恭喜！** 完成所有步驟後，老闆可以在 LINE OA 聊天中點選選單按鈕，選擇菜色並送出訂單 -- 全部在 LINE 內完成。

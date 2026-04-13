# Thai & Thai LIFF Menu Ordering App

## Overview

A LIFF (LINE Front-end Framework) web app that lets users browse the Thai & Thai restaurant menu, select items, and submit orders directly into a LINE group chat as a rich Flex Message from the LINE OA.

### Architecture

```
Group Chat                    GitHub Pages              AWS Lambda
──────────                    ────────────              ──────────
User types /showmenu
        │
        ▼
LINE Webhook ──────────────────────────────────────► api/webhook.mjs
        │                                            - Replies with Flex Message card
        │                                            - Forwards events to existing
        │                                              Slack-to-LINE Forwarder
        │
User taps "開啟菜單"
        │
        ▼
LIFF opens ────────────────► index.html
                              (menu UI, item selection)
                                      │
User taps "確認餐點"                   │
                                      ▼
                              POST /order ──────────► api/order.mjs
                              (structured order data)   - Builds Flex Message
                                                        - Pushes via LINE API
                                                        - Order appears in group chat
                                                          from LINE OA
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `index.html` | GitHub Pages | LIFF menu UI — bilingual (ZH+EN), category nav, item selection, qty controls |
| `api/order.mjs` | AWS Lambda | Receives order data, builds Flex Message, pushes to group via LINE Messaging API |
| `api/webhook.mjs` | AWS Lambda | Handles `/showmenu` command, forwards all events to existing Slack-to-LINE Forwarder |
| `serverless.yml` | Deployment | Serverless Framework config for Lambda + API Gateway |

### Live URLs

| Resource | URL |
|----------|-----|
| LIFF App | https://tommyyeh-presco.github.io/thaifood/ |
| LIFF ID | `2009781079-2Xq4KZ5N` |
| LIFF URL | https://liff.line.me/2009781079-2Xq4KZ5N |
| API Gateway | https://8peh4lj1k6.execute-api.us-east-1.amazonaws.com |
| Order endpoint | POST /order |
| Webhook endpoint | POST /webhook |

---

## How It Works

### Triggering the Menu

In any group chat where the LINE OA is a member, type one of:
- `/showmenu`
- `菜單`
- `menu`

The LINE OA replies with a Flex Message card containing an "開啟菜單 Open Menu" button. The button URL includes the group's Messaging API group ID as a query parameter (`?gid=Cxxx...`), which is needed for the Push API.

### Ordering Flow

1. User taps the button → LIFF app opens full-screen inside LINE
2. User browses categories, selects items, adjusts quantities and options
3. User taps "確認餐點" → LIFF sends structured order data to the Lambda
4. Lambda builds a rich Flex Message and pushes it to the group chat via LINE Messaging API
5. LIFF window closes automatically

### Order Flex Message

The order appears as a styled card in the group chat:
- Dark brown header with "Thai & Thai", "以點選菜品", dinner date/time
- Categorized item list with prices
- Subtotal and service charge note

### Fallback

When opened outside of LINE (browser testing), the app copies the order summary to clipboard instead.

---

## Webhook Proxy

The LINE Messaging API only allows **one webhook URL per channel**. The existing Slack-to-LINE Forwarder already uses the webhook. To avoid conflict:

- The thaifood webhook (`api/webhook.mjs`) is registered as the LINE webhook URL
- It handles `/showmenu` commands
- It **forwards all events** (with original signature) to the existing Slack-to-LINE Forwarder at `https://9krlz1zfl7.execute-api.us-east-1.amazonaws.com/api/line/webhook`
- The existing app's code is completely untouched

To revert: change the LINE webhook URL back to the Slack-to-LINE Forwarder's URL in LINE Developer Console.

---

## Secrets

The Lambda reads the LINE Channel Access Token from AWS SSM Parameter Store:
- Path: `/slack-line/line-channel-access-token`
- Region: `us-east-1`
- Shared with the existing Slack-to-LINE Forwarder (no duplication)

---

## Deployment

### Frontend (GitHub Pages)

```bash
git add index.html
git commit -m "Update menu"
git push
```

GitHub Pages auto-deploys from the `main` branch within ~1-2 minutes.

### Backend (AWS Lambda)

Deploy all functions:
```bash
npx serverless deploy
```

Deploy a single function (faster):
```bash
npx serverless deploy function -f order
npx serverless deploy function -f webhook
```

---

## Configuration

### LIFF Settings (LINE Developer Console)

- Channel: LINE Login → "Thai & Thai Menu"
- LIFF size: Full
- Endpoint URL: `https://tommyyeh-presco.github.io/thaifood/`
- Scopes: `openid` only
- Scan QR / Module mode: Off

### LINE Webhook (LINE Developer Console → Messaging API channel)

- Webhook URL: `https://8peh4lj1k6.execute-api.us-east-1.amazonaws.com/webhook`

---

## Updating the Menu

Edit the `MENU_DATA` array in `index.html`. Each category has:

```javascript
{
  id: "appetizers",       // unique ID
  zh: "開胃菜",            // Chinese category name
  en: "Appetizers",       // English category name
  note: "optional note",  // shown below category header
  items: [
    {
      zh: "瀑布牛",                                    // Chinese dish name
      en: "Tossed Rib-eye with Spice and Sour Sauce", // English dish name
      price: 980,                                      // price in NTD
      preorder: true,                                  // optional: shows 預訂 badge
      marketPrice: true,                               // optional: shows 時價 instead of price
      hasSize: true,                                   // optional: adds 小份/大份 toggle
      options: {                                       // optional: selectable pills
        protein: ["雞 Chicken", "牛 Beef"],
        cooking: ["清蒸 Steamed", "烤 Grilled"],
      },
    },
  ]
}
```

After editing, push to GitHub to redeploy.

### Updating the Dinner Date

The dinner date "4/16 (四) 18:30" is set in two places:
- `api/order.mjs` — in the `buildFlexMessage` function header
- Update and redeploy the Lambda: `npx serverless deploy function -f order`

// LINE webhook proxy: handles /showmenu command and forwards all events
// to the existing Slack-to-LINE Forwarder so both apps coexist on one webhook URL.
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
const EXISTING_WEBHOOK_URL = 'https://9krlz1zfl7.execute-api.us-east-1.amazonaws.com/api/line/webhook';
const LINE_REPLY_API = 'https://api.line.me/v2/bot/message/reply';
const LIFF_URL = 'https://liff.line.me/2009781079-2Xq4KZ5N';

let cachedToken = null;
let cachedSecret = null;

async function getSecret(name) {
  const paramName = `/slack-line/${name.toLowerCase().replace(/_/g, '-')}`;
  const res = await ssm.send(new GetParameterCommand({
    Name: paramName,
    WithDecryption: true,
  }));
  return res.Parameter?.Value;
}

async function getLineToken() {
  if (!cachedToken) cachedToken = await getSecret('LINE_CHANNEL_ACCESS_TOKEN');
  return cachedToken;
}

async function getLineSecret() {
  if (!cachedSecret) cachedSecret = await getSecret('LINE_CHANNEL_SECRET');
  return cachedSecret;
}

export async function handler(event) {
  const rawBody = event.body || '';

  // Always return 200 to LINE immediately
  const ok = { statusCode: 200, body: 'OK' };

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return ok;
  }

  const events = payload.events || [];

  // Forward ALL events to existing Slack-to-LINE Forwarder (fire-and-forget)
  forwardToExisting(event.headers, rawBody).catch(err =>
    console.error('Forward to existing app failed:', err.message)
  );

  // Handle /showmenu command
  for (const evt of events) {
    if (evt.type === 'message' && evt.message?.type === 'text') {
      const text = evt.message.text.trim().toLowerCase();
      if (text === '/showmenu' || text === '菜單' || text === 'menu') {
        const sourceGroupId = evt.source?.groupId || evt.source?.roomId || '';
        await replyWithMenu(evt.replyToken, sourceGroupId);
      }
    }
  }

  return ok;
}

async function replyWithMenu(replyToken, groupId) {
  const token = await getLineToken();
  const liffUrlWithGroup = groupId ? `${LIFF_URL}?gid=${groupId}` : LIFF_URL;

  // Send a Flex Message with a button to open the menu
  const flexMessage = {
    type: 'flex',
    altText: 'Thai & Thai 點餐菜單',
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#3d2b1f',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'Thai & Thai',
            color: '#c4a87a',
            size: 'xl',
            weight: 'bold',
            align: 'center',
          },
          {
            type: 'text',
            text: '單點菜單 A La Carte Menu',
            color: '#a08c72',
            size: 'xs',
            align: 'center',
            margin: 'sm',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#faf6f0',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '點擊下方按鈕開啟菜單，\n選擇餐點後直接送出訂單',
            size: 'sm',
            color: '#555555',
            align: 'center',
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#faf6f0',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '開啟菜單 Open Menu',
              uri: liffUrlWithGroup,
            },
            style: 'primary',
            color: '#9b7b4f',
            height: 'md',
          },
        ],
      },
    },
  };

  const res = await fetch(LINE_REPLY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [flexMessage],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('LINE Reply API error:', res.status, errBody);
  }
}

async function forwardToExisting(headers, rawBody) {
  const res = await fetch(EXISTING_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-line-signature': headers['x-line-signature'] || '',
    },
    body: rawBody,
  });

  if (!res.ok) {
    console.error('Forward failed:', res.status, await res.text());
  }
}

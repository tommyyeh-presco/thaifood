// Order handler: receives structured order data from the LIFF app,
// builds a rich Flex Message, and pushes it to the group chat via LINE Messaging API.
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
const LINE_PUSH_API = 'https://api.line.me/v2/bot/message/push';

let cachedToken = null;

async function getLineToken() {
  if (cachedToken) return cachedToken;
  const res = await ssm.send(new GetParameterCommand({
    Name: '/slack-line/line-channel-access-token',
    WithDecryption: true,
  }));
  cachedToken = res.Parameter?.Value;
  if (!cachedToken) throw new Error('LINE token not found in SSM');
  return cachedToken;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function buildFlexMessage(orderData, userName) {
  const { categories, total, hasMarketPrice } = orderData;

  // Header
  const headerContents = [
    { type: 'text', text: 'Thai & Thai', color: '#c4a87a', size: 'xxl', weight: 'bold', align: 'center' },
    { type: 'text', text: '以點選菜品', color: '#a08c72', size: 'md', align: 'center', margin: 'sm' },
    { type: 'text', text: '4/16 (四) 18:30', color: '#a08c72', size: 'sm', align: 'center', margin: 'sm' },
  ];

  if (userName) {
    headerContents.push({
      type: 'text', text: userName, color: '#d4c5a9', size: 'sm', align: 'center', margin: 'md',
    });
  }

  // Body: build category sections with items
  const bodyContents = [];

  categories.forEach((cat, catIdx) => {
    if (catIdx > 0) {
      bodyContents.push({ type: 'separator', margin: 'lg', color: '#e8e0d4' });
    }

    // Category header
    bodyContents.push({
      type: 'text',
      text: `${cat.zh} ${cat.en}`,
      weight: 'bold',
      size: 'md',
      color: '#9b7b4f',
      margin: catIdx > 0 ? 'lg' : 'none',
    });

    // Items
    cat.items.forEach(item => {
      let label = item.zh;
      if (item.options) label += ` (${item.options})`;
      if (item.qty > 1) label += ` x${item.qty}`;

      const priceText = item.marketPrice ? '時價' : `$${item.subtotal.toLocaleString()}`;

      bodyContents.push({
        type: 'box',
        layout: 'horizontal',
        margin: 'sm',
        contents: [
          { type: 'text', text: label, size: 'md', color: '#333333', flex: 5, wrap: true },
          { type: 'text', text: priceText, size: 'md', color: '#7a5f3a', align: 'end', flex: 2 },
        ],
      });
    });
  });

  // Total section
  bodyContents.push({ type: 'separator', margin: 'xl', color: '#9b7b4f' });

  bodyContents.push({
    type: 'box',
    layout: 'horizontal',
    margin: 'lg',
    contents: [
      { type: 'text', text: '小計', weight: 'bold', size: 'lg', color: '#2d2820' },
      { type: 'text', text: `$${total.toLocaleString()}`, weight: 'bold', size: 'lg', color: '#7a5f3a', align: 'end' },
    ],
  });

  if (hasMarketPrice) {
    bodyContents.push({
      type: 'text', text: '(時價品項另計)', size: 'sm', color: '#999999', margin: 'sm',
    });
  }

  bodyContents.push({
    type: 'text', text: '(另加10%服務費)', size: 'sm', color: '#999999', margin: 'sm',
  });

  return {
    type: 'flex',
    altText: 'Thai & Thai 以點選菜品',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#3d2b1f',
        paddingAll: '20px',
        contents: headerContents,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#faf6f0',
        paddingAll: '20px',
        contents: bodyContents,
      },
    },
  };
}

export async function handler(event) {
  const origin = event.headers?.origin || '';

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { groupId, orderData, orderText, userName } = body;

    console.log('Order request:', JSON.stringify({ groupId, userName, hasOrderData: !!orderData, hasOrderText: !!orderText }));

    if (!groupId || (!orderData && !orderText)) {
      return {
        statusCode: 400,
        headers: corsHeaders(origin),
        body: JSON.stringify({ error: 'Missing groupId or order data' }),
      };
    }

    const token = await getLineToken();

    // Build Flex Message if structured data available, otherwise fallback to text
    const message = orderData
      ? buildFlexMessage(orderData, userName)
      : { type: 'text', text: userName ? `${userName} 的訂單：\n\n${orderText}` : orderText };

    const res = await fetch(LINE_PUSH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [message],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('LINE Push API error:', res.status, errBody);
      return {
        statusCode: 502,
        headers: corsHeaders(origin),
        body: JSON.stringify({ error: 'Failed to send LINE message' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders(origin),
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Order handler error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(origin),
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

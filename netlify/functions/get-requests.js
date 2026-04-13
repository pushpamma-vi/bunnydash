/* ─────────────────────────────────────────────────────────────
   get-requests.js
   GET /.netlify/functions/get-requests
   Admin-only: returns all access requests.
   Requires header: X-Admin-Key: <ADMIN_SECRET env var>
───────────────────────────────────────────────────────────── */
const { getStore } = require('@netlify/blobs');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Content-Type':                 'application/json',
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  // Authenticate
  const key = event.headers['x-admin-key'];
  if (!key || !process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const store    = getStore({ name: 'bunnybrave', context });
    const requests = await store.get('requests', { type: 'json' }).catch(() => []);
    // Sort: pending first, then by date desc
    const list = (Array.isArray(requests) ? requests : [])
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });
    return { statusCode: 200, headers: CORS, body: JSON.stringify(list) };
  } catch (err) {
    console.error('[get-requests] Error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Storage unavailable' }) };
  }
};

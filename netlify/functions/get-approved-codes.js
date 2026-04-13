/* ─────────────────────────────────────────────────────────────
   get-approved-codes.js
   GET /.netlify/functions/get-approved-codes
   Admin-only: returns full approved-codes list (org names, hashes, dates).
   Requires header: X-Admin-Key: <ADMIN_SECRET env var>
───────────────────────────────────────────────────────────── */
const { getStore } = require('@netlify/blobs');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Content-Type':                 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  // Authenticate
  const key = event.headers['x-admin-key'];
  if (!key || !process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const store = getStore({ name: 'bunnybrave', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
    const codes = await store.get('approved-codes', { type: 'json' }).catch(() => []);
    const list  = Array.isArray(codes) ? codes : [];
    return { statusCode: 200, headers: CORS, body: JSON.stringify(list) };
  } catch (err) {
    console.error('[get-approved-codes] Error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Storage unavailable' }) };
  }
};

/* ─────────────────────────────────────────────────────────────
   revoke-code.js
   POST /.netlify/functions/revoke-code
   Admin-only: removes an approved org code from the blob store.
   The org's code stops working immediately at the gate page
   (no redeploy needed) because get-codes is fetched live.
   Requires header: X-Admin-Key: <ADMIN_SECRET env var>
   Body: { hash: "<sha256-hash-to-revoke>" }
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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Authenticate
  const key = event.headers['x-admin-key'];
  if (!key || !process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { hash } = body;
  if (!hash) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'hash is required' }) };
  }

  const store = getStore({ name: 'bunnybrave', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });

  // Remove from approved-codes
  try {
    const codes  = await store.get('approved-codes', { type: 'json' }).catch(() => []);
    const list   = Array.isArray(codes) ? codes : [];
    const before = list.length;
    const updated = list.filter(c => c.hash !== hash);
    if (updated.length === before) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Code not found' }) };
    }
    await store.setJSON('approved-codes', updated);
  } catch (err) {
    console.error('[revoke-code] Blob error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Storage unavailable' }) };
  }

  // Also mark the matching request as 'revoked' so history is visible
  try {
    const requests = await store.get('requests', { type: 'json' }).catch(() => []);
    if (Array.isArray(requests)) {
      const idx = requests.findIndex(r => r.approvedCode && r.status === 'approved');
      // Find by hash match (re-hash approvedCode to compare)
      const crypto = require('crypto');
      const matchIdx = requests.findIndex(r =>
        r.approvedCode &&
        crypto.createHash('sha256').update(r.approvedCode.trim().toUpperCase(), 'utf8').digest('hex') === hash
      );
      if (matchIdx !== -1) {
        requests[matchIdx] = { ...requests[matchIdx], status: 'revoked', revokedAt: new Date().toISOString() };
        await store.setJSON('requests', requests);
      }
    }
  } catch (err) {
    console.error('[revoke-code] Request update error (non-fatal):', err);
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true }),
  };
};

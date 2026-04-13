/* ═══════════════════════════════════════════════════════════════
   ADD-CODE  (Admin-only)
   POST /.netlify/functions/add-code
   Headers: X-Admin-Key: <ADMIN_SECRET>
   Body (JSON): { orgName: string, code: string }

   Hashes the plain-text code with SHA-256, appends it to the
   "approved-codes" blob store entry, and returns the hash so
   the admin dashboard can display it immediately.
   Does NOT touch the git repo — access is live instantly.
═══════════════════════════════════════════════════════════════ */

const { getStore } = require('@netlify/blobs');
const crypto       = require('crypto');

exports.handler = async (event) => {
  /* ── Method guard ── */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  /* ── Auth guard ── */
  const adminKey = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  /* ── Parse body ── */
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { orgName, code } = body;

  if (!orgName || typeof orgName !== 'string' || !orgName.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'orgName is required' }) };
  }
  if (!code || typeof code !== 'string' || !code.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'code is required' }) };
  }
  if (code.trim().length < 4) {
    return { statusCode: 400, body: JSON.stringify({ error: 'code must be at least 4 characters' }) };
  }

  const normalizedCode = code.trim().toUpperCase();
  const hash = crypto.createHash('sha256').update(normalizedCode).digest('hex');

  /* ── Blob store ── */
  const store = getStore({
    name:   'bunnybrave',
    siteID: process.env.NETLIFY_SITE_ID,
    token:  process.env.NETLIFY_API_TOKEN,
  });

  /* ── Load existing codes ── */
  let existing = [];
  try {
    const raw = await store.get('approved-codes');
    if (raw) existing = JSON.parse(raw);
  } catch {
    existing = [];
  }

  /* ── Duplicate check ── */
  if (existing.some(e => e.hash === hash)) {
    return {
      statusCode: 409,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'This code is already activated', hash }),
    };
  }

  /* ── Append new entry ── */
  existing.push({
    hash,
    orgName:      orgName.trim(),
    code:         normalizedCode,
    approvedAt:   new Date().toISOString(),
    requestId:    null,
    addedByAdmin: true,
  });

  await store.set('approved-codes', JSON.stringify(existing));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      hash,
      orgName: orgName.trim(),
      code:    normalizedCode,
    }),
  };
};

/* ─────────────────────────────────────────────────────────────
   submit-request.js
   POST /.netlify/functions/submit-request
   Public endpoint — receives an org access request, stores it
   in Netlify Blobs, and emails the admin a notification.
───────────────────────────────────────────────────────────── */
const { getStore }  = require('@netlify/blobs');
const crypto        = require('crypto');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

function esc(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { orgName, contactName, email, role, message } = body;

  // Validate required fields
  if (!orgName?.trim() || !contactName?.trim() || !email?.trim()) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'orgName, contactName and email are required' }) };
  }
  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  const newRequest = {
    id:          crypto.randomBytes(8).toString('hex'),
    orgName:     orgName.trim().slice(0, 200),
    contactName: contactName.trim().slice(0, 100),
    email:       email.trim().toLowerCase().slice(0, 200),
    role:        (role  ?? '').trim().slice(0, 100),
    message:     (message ?? '').trim().slice(0, 1000),
    status:      'pending',
    submittedAt: new Date().toISOString(),
  };

  // Persist request in Blobs
  try {
    const store    = getStore({ name: 'bunnybrave', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
    const existing = await store.get('requests', { type: 'json' }).catch(() => []);
    const list     = Array.isArray(existing) ? existing : [];
    list.push(newRequest);
    await store.setJSON('requests', list);
  } catch (err) {
    console.error('[submit-request] Blob error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Storage unavailable — please try again.' }) };
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true, id: newRequest.id }),
  };
};

/* ─────────────────────────────────────────────────────────────
   approve-request.js
   POST /.netlify/functions/approve-request
   Admin-only: generates a unique access code for an org,
   stores its SHA-256 hash in approved-codes blob,
   updates the request status, and emails the code to the org.
   Requires header: X-Admin-Key: <ADMIN_SECRET env var>
───────────────────────────────────────────────────────────── */
const { getStore } = require('@netlify/blobs');
const nodemailer   = require('nodemailer');
const crypto       = require('crypto');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Content-Type':                 'application/json',
};

function sha256(text) {
  return crypto.createHash('sha256').update(text.trim().toUpperCase(), 'utf8').digest('hex');
}

// Generate a code like "STMARY2026" from org name + year
function generateCode(orgName) {
  const clean = orgName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const year  = new Date().getFullYear();
  const rand  = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${clean}${year}${rand}`;
}

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

  // Authenticate
  const key = event.headers['x-admin-key'];
  if (!key || !process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { requestId } = body;
  if (!requestId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'requestId required' }) };
  }

  const store = getStore({ name: 'bunnybrave', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });

  // Load requests
  let requests;
  try {
    requests = await store.get('requests', { type: 'json' }).catch(() => []);
    if (!Array.isArray(requests)) requests = [];
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Storage unavailable' }) };
  }

  const idx = requests.findIndex(r => r.id === requestId);
  if (idx === -1) {
    return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Request not found' }) };
  }

  const req = requests[idx];
  if (req.status === 'approved') {
    return { statusCode: 409, headers: CORS, body: JSON.stringify({ error: 'Already approved', code: req.approvedCode }) };
  }

  // Generate unique code
  const code = generateCode(req.orgName);
  const hash = sha256(code);

  // Update approved-codes blob
  let codes;
  try {
    codes = await store.get('approved-codes', { type: 'json' }).catch(() => []);
    if (!Array.isArray(codes)) codes = [];
    codes.push({
      hash,
      orgName:     req.orgName,
      requestId:   req.id,
      approvedAt:  new Date().toISOString(),
    });
    await store.setJSON('approved-codes', codes);
  } catch (err) {
    console.error('[approve-request] Blob write error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Failed to save code' }) };
  }

  // Update request status
  requests[idx] = {
    ...req,
    status:       'approved',
    approvedAt:   new Date().toISOString(),
    approvedCode: code,
  };
  try {
    await store.setJSON('requests', requests);
  } catch (err) {
    console.error('[approve-request] Request update error:', err);
  }

  // Email the code to the organization
  const siteUrl = process.env.URL || 'https://your-site.netlify.app';
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });
    await transporter.sendMail({
      from:    `"Bunny Brave" <${process.env.GMAIL_USER}>`,
      replyTo: process.env.GMAIL_USER,
      to:      req.email,
      subject: '🐰 Your Bunny Brave Access Code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;padding:32px;background:#f5f3ff;border-radius:16px;">
          <div style="text-align:center;font-size:64px;">🐰</div>
          <h1 style="text-align:center;color:#7c3aed;margin:12px 0 4px;">Welcome to Bunny Brave!</h1>
          <p style="text-align:center;color:#6b7280;margin-bottom:28px;">
            Hi ${esc(req.contactName)}, your organization <strong>${esc(req.orgName)}</strong> has been approved.
          </p>
          <div style="background:#fff;border-radius:12px;padding:20px;text-align:center;border:2px dashed #a78bfa;margin-bottom:24px;">
            <div style="color:#6b7280;font-size:0.85rem;margin-bottom:8px;">YOUR ACCESS CODE</div>
            <div style="font-size:2rem;font-weight:900;letter-spacing:0.12em;color:#7c3aed;">${esc(code)}</div>
          </div>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${siteUrl}" style="display:inline-block;padding:14px 32px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:12px;font-weight:900;font-size:1.1rem;">
              🐾 Start Playing →
            </a>
          </div>
          <p style="color:#6b7280;font-size:0.85rem;text-align:center;line-height:1.6;">
            Enter this code on the Bunny Brave gate page.<br>
            Your device will be remembered — you won't need to re-enter the code on the same browser.<br><br>
            <em>Built for warriors. Full of hope. 💛</em>
          </p>
        </div>`,
    });
  } catch (err) {
    console.error('[approve-request] Email error:', err);
    // Don't fail — code is saved, admin can share manually
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true, code, hash }),
  };
};

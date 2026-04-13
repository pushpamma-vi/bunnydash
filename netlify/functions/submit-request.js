/* ─────────────────────────────────────────────────────────────
   submit-request.js
   POST /.netlify/functions/submit-request
   Public endpoint — receives an org access request, stores it
   in Netlify Blobs, and emails the admin a notification.
───────────────────────────────────────────────────────────── */
const { getStore }  = require('@netlify/blobs');
const nodemailer    = require('nodemailer');
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
    const store    = getStore('bunnydash');
    const existing = await store.get('requests', { type: 'json' }).catch(() => []);
    const list     = Array.isArray(existing) ? existing : [];
    list.push(newRequest);
    await store.setJSON('requests', list);
  } catch (err) {
    console.error('[submit-request] Blob error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Storage unavailable — please try again.' }) };
  }

  // Email notification to admin (best-effort, don't fail request if email errors)
  try {
    const siteUrl = process.env.URL || 'https://your-site.netlify.app';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });
    await transporter.sendMail({
      from:    `"Bunny Dash" <${process.env.GMAIL_USER}>`,
      to:      process.env.GMAIL_USER,
      subject: `[Bunny Dash] New Access Request — ${esc(newRequest.orgName)}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;padding:24px;background:#f5f3ff;border-radius:12px;">
          <h2 style="color:#7c3aed;">📬 New Access Request</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
            <tr><td style="padding:6px 0;color:#6b7280;width:130px;">Organization</td><td><strong>${esc(newRequest.orgName)}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Contact</td><td>${esc(newRequest.contactName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td>${esc(newRequest.email)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Role</td><td>${esc(newRequest.role) || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Message</td><td>${esc(newRequest.message) || '—'}</td></tr>
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="${siteUrl}/admin.html" style="padding:12px 28px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">
              🔧 Review in Admin Dashboard →
            </a>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error('[submit-request] Email error:', err);
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true, id: newRequest.id }),
  };
};

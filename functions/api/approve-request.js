/* ─────────────────────────────────────────────────────────────
   POST /api/approve-request
   Admin-only — approves a pending request, generates a unique
   access code, stores its SHA-256 hash in KV, and optionally
   emails the code via Resend (set RESEND_API_KEY env var).
   Requires header: X-Admin-Key: <ADMIN_SECRET>
───────────────────────────────────────────────────────────── */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Content-Type':                 'application/json',
};

function resp(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function checkAdmin(request, env) {
  if (!env.ADMIN_SECRET) return { ok: false, msg: 'ADMIN_SECRET not configured in Cloudflare env vars' };
  const key = request.headers.get('x-admin-key');
  if (!key || key !== env.ADMIN_SECRET) return { ok: false, msg: 'Wrong admin key' };
  return { ok: true };
}

async function sha256(text) {
  const data = new TextEncoder().encode(text.trim().toUpperCase());
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateCode(orgName) {
  const clean = orgName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const year  = new Date().getFullYear();
  const rand  = randomHex(2).toUpperCase();
  return `${clean}${year}${rand}`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendEmail(env, to, contactName, orgName, code, siteUrl) {
  if (!env.RESEND_API_KEY) return; // Email optional — code shown in admin dashboard
  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    env.RESEND_FROM || 'Bunny Brave <onboarding@resend.dev>',
        to,
        subject: '🐰 Your Bunny Brave Access Code',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;padding:32px;background:#f5f3ff;border-radius:16px;">
            <div style="text-align:center;font-size:64px;">🐰</div>
            <h1 style="text-align:center;color:#7c3aed;margin:12px 0 4px;">Welcome to Bunny Brave!</h1>
            <p style="text-align:center;color:#6b7280;margin-bottom:28px;">
              Hi ${esc(contactName)}, your organization <strong>${esc(orgName)}</strong> has been approved.
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
      }),
    });
  } catch { /* Email failure is non-fatal — code is visible in admin dashboard */ }
}

export async function onRequestPost({ request, env }) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return resp({ error: auth.msg }, 401);

  let body;
  try { body = await request.json(); }
  catch { return resp({ error: 'Invalid JSON' }, 400); }

  const { requestId } = body;
  if (!requestId) return resp({ error: 'requestId required' }, 400);

  // Load requests
  let requests;
  try {
    const raw = await env.BUNNYBRAVE_KV.get('requests');
    requests  = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(requests)) requests = [];
  } catch {
    return resp({ error: 'Storage unavailable' }, 500);
  }

  const idx = requests.findIndex(r => r.id === requestId);
  if (idx === -1) return resp({ error: 'Request not found' }, 404);

  const req = requests[idx];
  if (req.status === 'approved') {
    return resp({ error: 'Already approved', code: req.approvedCode }, 409);
  }

  const code = generateCode(req.orgName);
  const hash = await sha256(code);

  // Store hash in approved-codes
  try {
    const raw2  = await env.BUNNYBRAVE_KV.get('approved-codes');
    const codes = raw2 ? JSON.parse(raw2) : [];
    const list  = Array.isArray(codes) ? codes : [];
    list.push({ hash, orgName: req.orgName, requestId: req.id, approvedAt: new Date().toISOString() });
    await env.BUNNYBRAVE_KV.put('approved-codes', JSON.stringify(list));
  } catch {
    return resp({ error: 'Failed to save code' }, 500);
  }

  // Update request status
  requests[idx] = { ...req, status: 'approved', approvedAt: new Date().toISOString(), approvedCode: code };
  try { await env.BUNNYBRAVE_KV.put('requests', JSON.stringify(requests)); }
  catch { /* non-fatal */ }

  const siteUrl = env.SITE_URL || 'https://bunnybrave.pages.dev';
  await sendEmail(env, req.email, req.contactName, req.orgName, code, siteUrl);

  return resp({ success: true, code, hash });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

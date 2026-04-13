/* ─────────────────────────────────────────────────────────────
   POST /api/add-code
   Admin-only — adds an org code directly (bypasses request flow).
   Hashes the code with SHA-256 before storing.
   Requires header: X-Admin-Key: <ADMIN_SECRET>
   Body: { orgName: string, code: string }
───────────────────────────────────────────────────────────── */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Content-Type':                 'application/json',
};

function resp(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function isAdmin(request, env) {
  const key = request.headers.get('x-admin-key');
  return key && env.ADMIN_SECRET && key === env.ADMIN_SECRET;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text.trim().toUpperCase());
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return resp({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); }
  catch { return resp({ error: 'Invalid JSON body' }, 400); }

  const { orgName, code } = body;

  if (!orgName?.trim()) return resp({ error: 'orgName is required' }, 400);
  if (!code?.trim())    return resp({ error: 'code is required' }, 400);
  if (code.trim().length < 4) return resp({ error: 'code must be at least 4 characters' }, 400);

  const normalizedCode = code.trim().toUpperCase();
  const hash = await sha256(normalizedCode);

  try {
    const raw  = await env.BUNNYBRAVE_KV.get('approved-codes');
    const list = raw ? JSON.parse(raw) : [];
    const safe = Array.isArray(list) ? list : [];

    if (safe.some(c => c.hash === hash)) {
      return resp({ error: 'This code already exists', hash }, 409);
    }

    safe.push({
      hash,
      orgName:      orgName.trim().slice(0, 200),
      code:         normalizedCode,
      approvedAt:   new Date().toISOString(),
      addedByAdmin: true,
    });
    await env.BUNNYBRAVE_KV.put('approved-codes', JSON.stringify(safe));
  } catch {
    return resp({ error: 'Storage unavailable' }, 500);
  }

  return resp({ success: true, hash });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

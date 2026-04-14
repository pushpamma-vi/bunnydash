/* ─────────────────────────────────────────────────────────────
   POST /api/revoke-code
   Admin-only — removes an approved org code and immediately
   invalidates it at the gate (no redeploy needed).
   Requires header: X-Admin-Key: <ADMIN_SECRET>
   Body: { hash: "<sha256-to-revoke>" }
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

export async function onRequestPost({ request, env }) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return resp({ error: auth.msg }, 401);

  let body;
  try { body = await request.json(); }
  catch { return resp({ error: 'Invalid JSON' }, 400); }

  const { hash } = body;
  if (!hash) return resp({ error: 'hash is required' }, 400);

  // Remove from approved-codes
  try {
    const raw     = await env.BUNNYBRAVE_KV.get('approved-codes');
    const list    = raw ? JSON.parse(raw) : [];
    const before  = Array.isArray(list) ? list.length : 0;
    const updated = Array.isArray(list) ? list.filter(c => c.hash !== hash) : [];
    if (updated.length === before) return resp({ error: 'Code not found' }, 404);
    await env.BUNNYBRAVE_KV.put('approved-codes', JSON.stringify(updated));
  } catch {
    return resp({ error: 'Storage unavailable' }, 500);
  }

  // Mark matching request as revoked (non-fatal)
  try {
    const raw      = await env.BUNNYBRAVE_KV.get('requests');
    const requests = raw ? JSON.parse(raw) : [];
    if (Array.isArray(requests)) {
      const matchIdx = await (async () => {
        for (let i = 0; i < requests.length; i++) {
          const r = requests[i];
          if (r.approvedCode) {
            const h = await sha256(r.approvedCode);
            if (h === hash) return i;
          }
        }
        return -1;
      })();
      if (matchIdx !== -1) {
        requests[matchIdx] = { ...requests[matchIdx], status: 'revoked', revokedAt: new Date().toISOString() };
        await env.BUNNYBRAVE_KV.put('requests', JSON.stringify(requests));
      }
    }
  } catch { /* non-fatal */ }

  return resp({ success: true });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

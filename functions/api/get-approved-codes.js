/* ─────────────────────────────────────────────────────────────
   GET /api/get-approved-codes
   Admin-only — returns full approved-codes list (org names,
   hashes, dates). Plain-text codes are never stored.
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

export async function onRequestGet({ request, env }) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return resp({ error: auth.msg }, 401);

  try {
    const raw   = await env.BUNNYBRAVE_KV.get('approved-codes');
    const codes = raw ? JSON.parse(raw) : [];
    return resp(Array.isArray(codes) ? codes : []);
  } catch {
    return resp({ error: 'Storage unavailable' }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

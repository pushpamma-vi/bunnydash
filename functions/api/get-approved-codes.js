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

function isAdmin(request, env) {
  const key = request.headers.get('x-admin-key');
  return key && env.ADMIN_SECRET && key === env.ADMIN_SECRET;
}

export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return resp({ error: 'Unauthorized' }, 401);

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

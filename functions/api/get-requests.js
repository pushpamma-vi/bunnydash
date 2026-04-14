/* ─────────────────────────────────────────────────────────────
   GET /api/get-requests
   Admin-only — returns all org access requests.
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
    const raw      = await env.BUNNYBRAVE_KV.get('requests');
    const requests = raw ? JSON.parse(raw) : [];
    const list = (Array.isArray(requests) ? requests : [])
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });
    return resp(list);
  } catch {
    return resp({ error: 'Storage unavailable' }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

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

function isAdmin(request, env) {
  const key = request.headers.get('x-admin-key');
  return key && env.ADMIN_SECRET && key === env.ADMIN_SECRET;
}

export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return resp({ error: 'Unauthorized' }, 401);

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

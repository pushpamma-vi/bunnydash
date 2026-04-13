/* ─────────────────────────────────────────────────────────────
   POST /api/submit-request
   Public — receives a new org access request and stores it in KV.
───────────────────────────────────────────────────────────── */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

function resp(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function randomHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return resp({ error: 'Invalid JSON' }, 400); }

  const { orgName, contactName, email, role, message } = body;

  if (!orgName?.trim() || !contactName?.trim() || !email?.trim()) {
    return resp({ error: 'orgName, contactName and email are required' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return resp({ error: 'Invalid email address' }, 400);
  }

  const newRequest = {
    id:          randomHex(8),
    orgName:     orgName.trim().slice(0, 200),
    contactName: contactName.trim().slice(0, 100),
    email:       email.trim().toLowerCase().slice(0, 200),
    role:        (role    ?? '').trim().slice(0, 100),
    message:     (message ?? '').trim().slice(0, 1000),
    status:      'pending',
    submittedAt: new Date().toISOString(),
  };

  try {
    const raw  = await env.BUNNYBRAVE_KV.get('requests');
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list)) list.push(newRequest);
    await env.BUNNYBRAVE_KV.put('requests', JSON.stringify(Array.isArray(list) ? list : [newRequest]));
  } catch {
    return resp({ error: 'Storage unavailable — please try again.' }, 500);
  }

  return resp({ success: true, id: newRequest.id });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

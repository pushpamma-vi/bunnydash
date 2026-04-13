/* ─────────────────────────────────────────────────────────────
   GET /api/get-codes
   Public — returns only the SHA-256 hash array of approved codes.
   The gate page validates access codes against this list without
   ever receiving plain-text codes or org names.
───────────────────────────────────────────────────────────── */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type':                'application/json',
  'Cache-Control':               'no-cache',
};

export async function onRequestGet({ env }) {
  try {
    const raw   = await env.BUNNYBRAVE_KV.get('approved-codes');
    const codes = raw ? JSON.parse(raw) : [];
    const list  = Array.isArray(codes) ? codes : [];
    return new Response(JSON.stringify({ hashes: list.map(c => c.hash) }), { status: 200, headers: CORS });
  } catch {
    // Fallback to empty — gate falls back to hardcoded seed hashes
    return new Response(JSON.stringify({ hashes: [] }), { status: 200, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

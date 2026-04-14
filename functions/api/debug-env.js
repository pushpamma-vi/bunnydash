/* Temporary debug endpoint — REMOVE after diagnosis */
export async function onRequestGet({ env }) {
  return new Response(JSON.stringify({
    hasAdminSecret: !!env.ADMIN_SECRET,
    hasKV:          !!env.BUNNYBRAVE_KV,
    adminSecretLen: env.ADMIN_SECRET ? env.ADMIN_SECRET.length : 0,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

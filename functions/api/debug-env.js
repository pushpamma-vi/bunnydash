/* Temporary debug endpoint — REMOVE after diagnosis */
export async function onRequestGet(context) {
  const { env, request } = context;
  const envKeys = Object.keys(env || {});
  return new Response(JSON.stringify({
    hasAdminSecret: !!env.ADMIN_SECRET,
    hasKV:          !!env.BUNNYBRAVE_KV,
    adminSecretLen: env.ADMIN_SECRET ? env.ADMIN_SECRET.length : 0,
    envKeys:        envKeys,
    contextKeys:    Object.keys(context || {}),
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

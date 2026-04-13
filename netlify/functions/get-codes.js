/* ─────────────────────────────────────────────────────────────
   get-codes.js
   GET /.netlify/functions/get-codes
   Public endpoint — returns only the array of approved SHA-256
   hashes (no org names, no plain codes) so the gate page can
   validate access codes dynamically without hardcoding them.
───────────────────────────────────────────────────────────── */
const { getStore } = require('@netlify/blobs');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type':                'application/json',
  'Cache-Control':               'no-cache',
};

exports.handler = async () => {
  try {
    const store = getStore('bunnybrave');
    const codes = await store.get('approved-codes', { type: 'json' }).catch(() => []);
    const list  = Array.isArray(codes) ? codes : [];

    // Return only hashes — never expose plain codes or org names publicly
    const hashes = list.map(c => c.hash);

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ hashes }) };
  } catch (err) {
    console.error('[get-codes] Error:', err);
    // Fall back to empty — gate will fall back to hardcoded seed hashes
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ hashes: [] }) };
  }
};

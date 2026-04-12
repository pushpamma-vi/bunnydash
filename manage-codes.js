#!/usr/bin/env node
/**
 * Bunny Dash — Access Code Manager
 * ─────────────────────────────────
 * Usage:
 *   node manage-codes.js hash HOPEHERO          # get the hash for a code
 *   node manage-codes.js verify HOPEHERO        # test if a code matches index.html
 *   node manage-codes.js generate NEWCODE       # hash + paste-ready line for index.html
 *
 * Run this whenever you need to:
 *   • Add a new hospital / organization
 *   • Rotate the annual code
 *   • Verify a code before sharing it
 */

const crypto = require('crypto');

const args = process.argv.slice(2);
const cmd  = args[0];
const code = args[1];

// ── Current hashes registered in index.html ──────────────────
// Keep this in sync with the VALID_HASHES set in index.html
const REGISTERED = {
  'HOPEHERO':    '49e9777255a096003c5d876e99ac2dd764e31985ee7cfc4f900c01c24466c51b',
  'BUNNYDASH':   'a3755082c8076ec83225f7059af93ab8d4e40afd397e58e7fa7b5138937f023f',
  'WARRIOR2026': '083a57c4e00dac894dd6b85425c89c7310b45529afaa532932b01bb5f3bffcb7',
};

function sha256(text) {
  return crypto.createHash('sha256').update(text.trim().toUpperCase(), 'utf8').digest('hex');
}

function printHelp() {
  console.log(`
  Bunny Dash — Access Code Manager
  ─────────────────────────────────
  Commands:
    hash     <CODE>    Print the SHA-256 hash of a code
    generate <CODE>    Generate a code + ready-to-paste hash line for index.html
    verify   <CODE>    Check if a code matches a registered hash
    list               List all currently registered codes and their hashes

  Examples:
    node manage-codes.js hash HOPEHERO
    node manage-codes.js generate CHILDRENS2027
    node manage-codes.js list
  `);
}

switch (cmd) {
  case 'hash': {
    if (!code) { console.error('ERROR: provide a code.  e.g.  node manage-codes.js hash HOPEHERO'); process.exit(1); }
    const h = sha256(code);
    console.log(`\nCode:  ${code.toUpperCase()}\nHash:  ${h}\n`);
    break;
  }

  case 'generate': {
    if (!code) { console.error('ERROR: provide a code.  e.g.  node manage-codes.js generate NEWORG2027'); process.exit(1); }
    const upper = code.trim().toUpperCase();
    const h = sha256(upper);
    console.log(`
  New code: ${upper}
  Hash:     ${h}

  Paste this line into the VALID_HASHES set in index.html:
  ─────────────────────────────────────────────────────
      // ${upper}
      '${h}',
  ─────────────────────────────────────────────────────

  Also add it to the REGISTERED object in manage-codes.js:
      '${upper}': '${h}',
    `);
    break;
  }

  case 'verify': {
    if (!code) { console.error('ERROR: provide a code.'); process.exit(1); }
    const upper = code.trim().toUpperCase();
    const h = sha256(upper);
    const match = Object.entries(REGISTERED).find(([, v]) => v === h);
    if (match) {
      console.log(`\n✅  "${upper}" is VALID — registered as "${match[0]}"\n    Hash: ${h}\n`);
    } else {
      console.log(`\n❌  "${upper}" does NOT match any registered code.\n    Computed hash: ${h}\n`);
    }
    break;
  }

  case 'list': {
    console.log('\n  Registered access codes:\n');
    for (const [name, hash] of Object.entries(REGISTERED)) {
      console.log(`  ${name.padEnd(18)}  ${hash}`);
    }
    console.log('');
    break;
  }

  default:
    printHelp();
}

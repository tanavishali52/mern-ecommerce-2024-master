/* eslint-disable no-console */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'buffer-equal-constant-time',
  'index.js'
);

try {
  if (!fs.existsSync(targetPath)) process.exit(0);

  const original = fs.readFileSync(targetPath, 'utf8');
  if (original.includes("require('buffer').SlowBuffer || Buffer")) process.exit(0);

  const patched = original.replace(
    /var SlowBuffer = require\('buffer'\)\.SlowBuffer;\s*/g,
    "var SlowBuffer = require('buffer').SlowBuffer || Buffer;\n"
  );

  if (patched === original) {
    console.warn(`[postinstall] No patch applied (unexpected file contents): ${targetPath}`);
    process.exit(0);
  }

  fs.writeFileSync(targetPath, patched, 'utf8');
  console.log('[postinstall] Patched buffer-equal-constant-time for Node >= 25 (SlowBuffer removed).');
} catch (err) {
  console.warn('[postinstall] Failed to patch buffer-equal-constant-time:', err?.message || err);
  process.exit(0);
}

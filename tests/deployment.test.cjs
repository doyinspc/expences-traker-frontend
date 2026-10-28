const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = process.env.PROKURE_ROOT || path.resolve(__dirname, '..');
const valid = { VITE_API_URL: 'https://api.example.test/api/index.php', VITE_API_FOLDER: 'https://api.example.test/api/', VITE_APP_TENANT_DB: 'tenant_test' };
async function validator() { return (await import(pathToFileURL(path.join(root, 'scripts/check-production-env.mjs')))).validateProductionEnvironment; }
test('Vercel production accepts a public HTTPS backend and valid tenant', async () => {
  assert.deepEqual((await validator())(valid), []);
});
test('Production rejects insecure HTTP and local development endpoints', async () => {
  const validate = await validator();
  assert.ok(validate({ ...valid, VITE_API_URL: 'http://api.example.test/index.php' }).length);
  assert.ok(validate({ ...valid, VITE_API_URL: 'https://localhost/index.php' }).length);
});
test('Production rejects embedded credentials and invalid tenant identifiers', async () => {
  const validate = await validator();
  assert.ok(validate({ ...valid, VITE_API_URL: 'https://user:password@api.example.test/' }).length);
  assert.ok(validate({ ...valid, VITE_APP_TENANT_DB: '../other' }).length);
});
test('Vercel routes deep links to the app and uses the Vite build directory', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.framework, 'vite'); assert.equal(config.outputDirectory, 'dist');
  assert.ok(config.rewrites.some(rule => rule.source === '/(.*)' && rule.destination === '/index.html'));
});
test('Local environment files and build dependencies are excluded from deployment uploads', () => {
  const ignore = fs.readFileSync(path.join(root, '.vercelignore'), 'utf8');
  assert.match(ignore, /^\.env$/m); assert.match(ignore, /^\.env\.\*$/m); assert.match(ignore, /^node_modules$/m);
});

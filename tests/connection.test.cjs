const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = process.env.PROKURE_ROOT || path.resolve(__dirname, '..');
const { transformSync } = require(path.join(root, 'node_modules/esbuild'));
function setup() {
  let query, mutation, request;
  const selected = { location_id: 1, role_id: 10 };
  const storage = new Map([['tenantDb', 'tenant_a']]);
  const sessionStorage = { getItem: k => storage.get(k) || null };
  let response = { data: { status: 'success', data: { id: 1 } } };
  const common = { API_PATH_SETTING: '/api', axiosConfig: { headers: { Authorization: 'Bearer current' } }, axiosConfig1: {}, tokenHelpers: { getToken: () => 'current-token' } };
  const bodyModule={exports:{}};
  vm.runInNewContext(transformSync(fs.readFileSync(path.join(root,'src/utils/functions/mutationBody.js'),'utf8'),{format:'cjs'}).code,{module:bodyModule,exports:bodyModule.exports,FormData,Blob});
  const mocks = {
    'react-redux': { useSelector: select => select({ auth: selected }) },
    react: { useState: v => [v, () => {}] },
    '@tanstack/react-query': {
      useQuery: opts => { query = opts; return {}; },
      useMutation: opts => { mutation = opts; return { isPending: true }; },
      useQueryClient: () => ({ invalidateQueries() {} })
    },
    '../actions/common': common,
    '../utils/functions/mutationBody':bodyModule.exports,
    axios: { get: async (...args) => { request = args; return response; }, post: async (...args) => { request = args; return response; } },
    'react-hot-toast': () => {}
  };
  const source = fs.readFileSync(path.join(root, 'src/hooks/useTanstackQuery.js'), 'utf8');
  const code = transformSync(source, { format: 'cjs', define: { 'import.meta.env': '{}' } }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: id => mocks[id], sessionStorage, FormData, console: { error() {} } });
  const hook = props => module.exports.default({ table: 'requisitions', uniqueKey: 'req', queryType: 'gets', mainParam: { location_id: 1 }, ...props });
  return { hook, storage, selected, get query() { return query; }, get mutation() { return mutation; }, get request() { return request; }, fail() { response = { data: { status: 'error', message: 'Save rejected' } }; } };
}
test('read requests carry authentication and current token', async () => {
  const s = setup(); s.hook(); await s.query.queryFn();
  assert.equal(s.request.length, 2);
  assert.equal(s.request[1].headers.Authorization, 'Bearer current');
  assert.equal(s.request[1].params.token, undefined); // Session tokens belong in headers, never URLs.
});
test('update preserves caller action and fields', async () => {
  const s = setup(); s.hook(); const input = Object.freeze({ cat: 'update', id: 7, title: 'New title' });
  await s.mutation.mutationFn(input);
  assert.equal(input.cat, 'update');
  assert.equal(s.request[1].cat, 'update');
  assert.equal(s.request[1].title, 'New title');
  assert.equal(s.request[2].headers.Authorization,'Bearer current');
});
test('API-level save failures reject instead of reporting success', async () => {
  const s = setup(); s.hook(); s.fail();
  await assert.rejects(s.mutation.mutationFn({ cat: 'update', id: 7 }), /Save rejected/);
});
test('cache separates locations and tenants', () => {
  const s = setup(); s.hook(); const a = JSON.stringify(s.query.queryKey);
  s.hook({ mainParam: { location_id: 2 } }); const b = JSON.stringify(s.query.queryKey);
  s.storage.set('tenantDb', 'tenant_b'); s.hook();
  assert.notEqual(a, b); assert.notEqual(a, JSON.stringify(s.query.queryKey));
});
test('manual loading and pending save indicator remain supported', () => {
  const s = setup(); const result = s.hook({ autoLoad: false });
  assert.equal(s.query.enabled, false); assert.equal(result.isProcessing, true);
});
test('tenant login can restore its session and does not store a null JWT as a token', async () => {
  const storage = new Map();
  const sessionStorage = { setItem: (k, v) => storage.set(k, String(v)), getItem: k => storage.get(k) || null };
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(root, 'src/actions/auth.js'), 'utf8');
  const code = transformSync(source, { format: 'cjs', define: { 'import.meta.env': '{}' } }).code;
  vm.runInNewContext(code, { module, exports: module.exports, sessionStorage, console,
    require: () => ({ AUTH_TYPES: {}, USER_TYPES: { TENANT: 'tenant' } }),
    fetch: async () => ({ json: async () => ({ status: 'success', data: { token: 'session-token', user: { id: 1 } } }) })
  });
  const form = new FormData(); form.set('tenant_db', 'tenant_a');
  assert.equal((await module.exports.tenantLogin(form)(() => {})).success, true);
  assert.equal(module.exports.checkAuth()(() => {}).success, true);
  assert.equal(storage.get('jwt'), '');
});

test('Changing selected location or role separates operational caches even without explicit filters',()=>{const s=setup();s.hook({mainParam:{}});const a=JSON.stringify(s.query.queryKey);s.selected.location_id=2;s.hook({mainParam:{}});const b=JSON.stringify(s.query.queryKey);s.selected.role_id=11;s.hook({mainParam:{}});assert.notEqual(a,b);assert.notEqual(b,JSON.stringify(s.query.queryKey));});
test('Shared Settings queries keep the same cache when the working location changes',()=>{const s=setup();s.hook({table:'commons',mainParam:{grp:7}});const a=JSON.stringify(s.query.queryKey);s.selected.location_id=2;s.selected.role_id=11;s.hook({table:'commons',mainParam:{grp:7}});assert.equal(a,JSON.stringify(s.query.queryKey));});

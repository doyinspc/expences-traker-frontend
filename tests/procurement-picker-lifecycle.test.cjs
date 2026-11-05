const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');

// Exercise the real picker and shared query hook together. The adapter preserves
// each mounted component's hook state across renders and discards it on unmount.
// HTTP and query scheduling are captured; no business server or DOM is required.
function compile(entry, external = []) {
  return esbuild.buildSync({
    entryPoints: [path.join(root, entry)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    jsx: 'automatic',
    external,
    define: { 'import.meta.env': '{}' },
    write: false,
    logLevel: 'silent',
  }).outputFiles[0].text;
}
const pickerCode = compile(
  'src/components/procurement/AddRequisitionItemsModal.tsx',
  ['*useTanstackQuery.js'],
);
const queryCode = compile('src/hooks/useTanstackQuery.js', ['*actions/common']);

function harness() {
  const states = new Map();
  const requests = [];
  const pending = [];
  let current, cursor, seen;
  const hooks = {
    useState(initial) {
      const state = states.get(current);
      const slot = cursor++;
      if (!(slot in state))
        state[slot] = typeof initial === 'function' ? initial() : initial;
      return [
        state[slot],
        (value) => {
          state[slot] =
            typeof value === 'function' ? value(state[slot]) : value;
        },
      ];
    },
    useEffect() {},
    useMemo(fn) {
      return fn();
    },
  };
  function load(code, isPicker) {
    const moduleConfig = { exports: {} };
    vm.runInNewContext(code, {
      module: moduleConfig,
      exports: moduleConfig.exports,
      sessionStorage: { getItem: () => null },
      console,
      require(id) {
        if (id === 'react') return hooks;
        if (id === 'react-redux')
          return {
            useSelector: (fn) =>
              fn({ auth: { location_id: 41, role_id: 110 } }),
          };
        if (id === '@tanstack/react-query')
          return {
            useQueryClient: () => ({}),
            useQuery(options) {
              if (options.enabled) pending.push(options.queryFn());
              return {
                data: { data: [] },
                isLoading: false,
                isFetching: false,
                refetch() {},
              };
            },
            useMutation: () => ({ mutateAsync: async () => ({}) }),
          };
        if (id === 'axios')
          return {
            get: async (_url, config) => {
              requests.push(JSON.parse(config.params.data));
              return { data: { status: 'success', data: [] } };
            },
          };
        if (id === 'react-hot-toast') return () => {};
        if (id.endsWith('actions/common'))
          return {
            API_PATH_SETTING: '/test-api',
            axiosConfig: {},
            axiosConfig1: {},
            tokenHelpers: { getToken: () => 'synthetic-token' },
          };
        if (isPicker && id.includes('useTanstackQuery')) return query;
        return require(require.resolve(id, { paths: [root] }));
      },
    });
    return moduleConfig.exports.default;
  }
  const query = load(queryCode, false);
  const Picker = load(pickerCode, true);
  function visit(element, key) {
    if (!element || typeof element !== 'object') return;
    if (typeof element.type === 'function') {
      current = key;
      cursor = 0;
      seen.add(key);
      if (!states.has(key)) states.set(key, []);
      visit(element.type(element.props), key + '/child');
    }
  }
  return {
    requests,
    async render(isOpen, purchaseOrderId = 302) {
      seen = new Set();
      visit(
        {
          type: Picker,
          props: { isOpen, purchaseOrderId, onClose() {}, onItemsAdded() {} },
        },
        'picker',
      );
      for (const key of states.keys()) if (!seen.has(key)) states.delete(key);
      await Promise.all(pending.splice(0));
    },
  };
}

test('opening the initially closed picker actually starts its outstanding-demand GET', async () => {
  const view = harness();
  await view.render(false);
  assert.equal(view.requests.length, 0);
  await view.render(true);
  assert.equal(
    view.requests.length,
    1,
    'Opening the picker left its real query disabled',
  );
  assert.deepEqual(JSON.parse(JSON.stringify(view.requests[0])), {
    procurement_candidates_for: 302,
  });
});

test('closing and reopening the picker starts a fresh read for the new purchase order', async () => {
  const view = harness();
  await view.render(false);
  await view.render(true, 302);
  await view.render(false, 302);
  const count = view.requests.length;
  await view.render(true, 303);
  assert.equal(view.requests.length, count + 1);
  assert.equal(view.requests.at(-1).procurement_candidates_for, 303);
});

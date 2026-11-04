/** Lint the changed approval JSX, which is outside the legacy TypeScript-only config. */
import { ESLint } from 'eslint';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import { fileURLToPath } from 'node:url';

const lint = new ESLint({
  cwd: fileURLToPath(new URL('../', import.meta.url)),
  overrideConfigFile: true,
  overrideConfig: [{
    files: ['**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Capitalised JSX names are component references. No extra React plugin is needed.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]', argsIgnorePattern: '^_' }],
    },
  }],
});

const results = await lint.lintFiles([
  'src/components/approvals/ItemRevisionPanel.jsx',
  'src/pages/Procurement/ApprovalCenterDetails.jsx',
]);
const output = (await lint.loadFormatter('stylish')).format(results);
if (output) process.stdout.write(output);
if (results.some(result => result.errorCount > 0)) process.exitCode = 1;

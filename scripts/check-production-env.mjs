import { loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';

export function validateProductionEnvironment(env) {
  const errors = [];
  for (const key of ['VITE_API_URL', 'VITE_API_FOLDER']) {
    try {
      const url = new URL(env[key]);
      if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) errors.push(`${key} must be a public HTTPS address for Vercel.`);
      if (url.username || url.password) errors.push(`${key} must not include credentials.`);
    } catch { errors.push(`${key} must be set to your hosted backend HTTPS address.`); }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(env.VITE_APP_TENANT_DB || '')) errors.push('VITE_APP_TENANT_DB must identify your hosted tenant database.');
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = validateProductionEnvironment({ ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env });
  if (errors.length) {
    console.error('Production configuration needs attention:\n' + errors.map(error => `- ${error}`).join('\n'));
    process.exitCode = 1;
  } else console.log('Production environment is ready for a hosted frontend.');
}

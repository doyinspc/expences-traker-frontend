# Prokure

React 19 and TypeScript business operations frontend using Vite and Tailwind CSS. The PHP API is maintained separately.

Features include location-based role assignments and menu access, requisitions, purchase orders, cash advances and transfers, income, stock, budgets, approval workflows, bookings and financial reports. Some finance and inventory destinations are still placeholder pages.

## Development

Install dependencies with `npm ci`, configure `.env.development`, start local XAMPP services, then run `npm run dev`.

Local API: `http://127.0.0.1/expense/expense-api/api/index.php`.

## Validation

- `npm test`: connection, session, form, table, notification, CSV and deployment scenarios.
- `npm run build`: validates public production API settings and builds `dist`.
- `npm run lint`: existing TypeScript lint checks. The repository still contains legacy lint issues, and its current ESLint configuration does not cover JavaScript/JSX files.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel frontend, hosted PHP API, local/production environment settings, email configuration and testing instructions.

The original UI foundation was TailAdmin. Its licence remains in `LICENSE.md`.

# Prokure release guide

28 October 2026

Release the frontend and backend together. Frontend main triggers the existing Vercel deployment. The backend ZIP is an update for the existing expense-api installation; it is not an installer or a database dump.

## Preserve the existing system

Back up hosted source and database before upload. Extract the update into the existing expense-api directory, keeping relative paths and hidden .htaccess files. Preserve the hosting .env, vendor dependencies, shared users/commons tables, IDs and existing uploaded business files. Do not run setup, database recreation or seed scripts.

The separate authorised local snapshot replacement retained 505 records. The old offline SQL backup remains under Documents/Codex/prokure-backups/2026-10-27-before-online-import. Hosted business records were not replaced or modified by these tests.

## Vercel public build settings

| Variable | Value |
| --- | --- |
| VITE_API_URL | https://skoolq.com/expense/expense-api/api/index.php |
| VITE_API_FOLDER | https://skoolq.com/expense/expense-api/api/ |
| VITE_APP_TENANT_DB | stresert_expences1 |

Database and SMTP secrets belong on the PHP host. Local development retains loopback URLs and tenant expences1 in ignored local environment files. Real environment files have been removed from Git tracking; the example contains public configuration only.

## Backend environment

Keep the actual database credentials and mail transport. Confirm the following values in the existing private .env:

```dotenv
ALLOWED_TENANT_DATABASES=stresert_expences1
DEFAULT_TENANT_DB=stresert_expences1
APP_URL=https://your-actual-prokure-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-actual-prokure-app.vercel.app
MAIL_FROM_ADDRESS=your-authorised-sender@example.com
MAIL_FROM_NAME=Prokure
APPROVAL_LINK_BASE_URL=https://skoolq.com/expense/expense-api/approval-link.php
```

Replace the example frontend address and sender. Use exact allowed browser origins, separated by commas. MAILER_DSN and legacy MAILER_DNS are supported. Local allowlist/default values use expences1.

APP_URL supplies regular sign-in/tracking links. APPROVAL_LINK_BASE_URL points to the PHP approval page on the backend, independently of the Vercel frontend. Secure links are issued only when a valid HTTPS backend URL is configured; HTTP is accepted only for loopback testing. Without this setting, approval emails use the usual sign-in link.

## Private email approvals

The current eligible approver receives a unique link allowing review and one approve/return decision without a normal login. Links expire after 24 hours and are bound to tenant, recipient, workflow, current step and version. Each decision rechecks the user's active role, location and permission. Workflow changes, password/email changes and completed decisions invalidate outstanding links. No general login session is created. Escalation resolution and cancellation use signed-in Prokure.

Links use a URL fragment, then submit the token in a POST body; opening an email or GET page never records a decision. The review page has no external scripts, assets or analytics and sends no referrer. It includes line items, account classifications and decision history. Recipients must not forward these private links: possession of a valid link authorises its recipient's scoped action.

The submitter or a previous recorded approver can select a currently eligible manager in Send approval reminder. The server restricts recipients to the current role at the request location. Resending does not reassign the workflow, is audited and is limited to one request every five minutes.

Keep var/approval-links and var/account-notifications writable by PHP and inaccessible over HTTP. Apache deny rules are included. Configure equivalent deny rules on other web servers and verify a 403/404 response before enabling secure links. Token files contain digests/bound metadata, not the raw token; account-notification files contain no passwords. Retain expired token records only for your organisation's chosen retention period, then remove expired .json files from this dedicated private directory during maintenance.

## Workflow, company and reports setup

Select Escalation Role on each applicable workflow step. Assign active staff with manage permission for My Approvals at the location. The configured escalation role must differ from the normal approver role. Escalation returns to the original approver after resolution; it does not approve the request.

In Settings > Company Profile, set Accounting Year Start. Its month/day defines annual report windows; existing fiscal_year_start is reused. This does not lock accounting periods, close budgets or roll balances forward. Budget dates and allocation approvals remain separate.

Approval Centre defaults to the last three calendar months by submission date and can be expanded. My Approvals keeps all current tasks, including older pending work. Expense Analysis includes resolved expense lines once, Cash Movements shows cash debits/credits, and Budget Performance compares approved allocations with completed cash advance/procurement charges. These reports are not a full general-ledger closing system.

## Email worker

After checking SMTP with a controlled test mailbox, configure a scheduler about every 15 minutes:

```text
php /absolute/path/to/expense-api/bin/workflow-worker.php stresert_expences1
```

The CLI-only worker retries workflow and account messages (up to five attempts) and queues one overdue reminder per assignment per day. No hosting schedule was installed here. Running the worker can send real email. Password-change messages contain the login name and sign-in link; passwords are not emailed. An administrator should communicate a replacement password privately.

## Deployment checks and rollback

1. Back up hosting; deploy the backend update and frontend together. Staff sign in again for the enforced session contract.
2. Verify requester, approver, escalation and oversight accounts at their assigned locations; include a user with no Settings permission.
3. Test a controlled submission, return, reapproval, escalation and resolution, and verify shared item/account links survive procurement or stock fulfilment.
4. Use a test mailbox to verify normal email, password confirmation, secure review, expiry, used links, selected-manager resend and queued retries. Avoid real purchasing/payment actions during the check.
5. Set company accounting year and check current/previous fiscal periods, date boundaries and budget selection. Verify uploads with the existing receipt paths.
6. Confirm the private directories/config/logs cannot be downloaded. If a release fails, restore the saved source versions and Vercel deployment together; keep any recorded business decisions and investigate before restoring database data.

Local verification: 197 automated checks (72 frontend, 85 temporary-table workflow/account/report/email-link scenarios and 40 supporting API/mail/schema/origin/receipt checks), plus synthetic browser checks. The exact staged frontend is separately built before push. Business-write tests use temporary tables and captured messages. Read-only checks confirmed all 505 records and three existing workflow documents remain readable.

Hosted signed-in write journeys, live SMTP, actual Vercel deployment success and a real multi-connection race still require deployment verification. Existing static receipt delivery remains; an authenticated attachment-download service and accounting-period lock/year-end closing are future work. Social login and master onboarding were not exercised. Existing vendor bundle-size/eval/CSS warnings remain.

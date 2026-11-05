import { parentDocumentSummary } from '../../utils/functions/parentDocumentContext.js';

/** Show current parent identity above its items without replacing the existing page UI. */
export default function ParentDocumentContext({ context }) {
  const { route, document, isPending, error, refetch, canRead } = context;
  if (!route) return null;
  const frame =
    'mb-4 min-w-0 rounded-lg border border-gray-200 bg-white p-4 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300';
  if (!route.id)
    return (
      <section className={frame} role="alert">
        The document reference in this link is invalid.
      </section>
    );
  if (!canRead)
    return (
      <section className={frame} role="status">
        Select your location to load this {route.label.toLowerCase()}.
      </section>
    );
  if (isPending)
    return (
      <section
        className={`${frame} min-h-24`}
        role="status"
        aria-label="Loading document details"
      >
        <div className="h-3 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <p className="sr-only">Loading {route.label.toLowerCase()} details…</p>
      </section>
    );
  if (error || !document)
    return (
      <section className={frame} role="alert">
        <p className="text-sm text-red-700 dark:text-red-300">
          {error?.response?.data?.message ||
            error?.message ||
            'Document details are unavailable.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 min-h-9 text-sm text-brand-600 underline dark:text-brand-400"
        >
          Retry document details
        </button>
      </section>
    );
  const { title, reference, details } = parentDocumentSummary(route, document);
  return (
    <section aria-label="Current document" className={frame}>
      <p className="break-words text-xs font-medium text-brand-600 dark:text-brand-400">
        {route.label} · {reference}
      </p>
      <h2 className="mt-1 break-words text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      {details.length > 0 && (
        <dl className="mt-3 grid min-w-0 grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:flex lg:flex-wrap">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
              <dd className="mt-0.5 break-words font-medium text-gray-800 dark:text-gray-200">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { tokenHelpers } from '../../actions/common';
import { purchasingRequest } from '../../utils/functions/purchasingApi';

/** Run additive schema preparation explicitly; opening a page never modifies storage. */
export default function PurchasingSetupNotice() {
  const auth = useSelector((state) => state.authReducer || state.auth || {});
  const client = useQueryClient();
  const [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const query = useQuery({
    queryKey: [
      'purchasing-setup',
      tokenHelpers.getTenantDb(),
      tokenHelpers.getToken(),
      auth.location_id,
      auth.role_id,
    ],
    queryFn: () => purchasingRequest('status'),
    retry: false,
  });
  if (!query.data || query.data.schema_ready) return null;
  return (
    <section className="mb-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
      <h2 className="font-semibold">Prepare separate purchasing stages</h2>
      <p>
        This update adds separate requisition, Purchase Order and Procurement
        stages with item evidence. Existing records keep their earlier
        treatment. No stock opening quantities or new permissions are assumed.
      </p>
      {query.data.can_prepare ? (
        <>
          <label className="flex min-h-11 items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            I have a current database backup. Add the new structures while
            keeping existing records.
          </label>
          <button
            type="button"
            disabled={!confirmed || busy}
            className="min-h-11 rounded-lg bg-brand-600 px-4 font-medium text-white disabled:opacity-50"
            onClick={async () => {
              if (busy) return;
              setBusy(true);
              setError('');
              try {
                await purchasingRequest(
                  'prepare',
                  { confirmation: 'PREPARE_PURCHASING' },
                  true,
                );
                await client.invalidateQueries();
              } catch (failure) {
                setError(failure.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Preparing…' : 'Prepare purchasing update'}
          </button>
        </>
      ) : (
        <p>
          A Super Admin must prepare the update before the new stages can be
          used.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

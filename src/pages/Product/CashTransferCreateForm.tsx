import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { transferAccountLabel } from '../../utils/functions/transferAccountLabel.js';

type Account = {
  id: number | string;
  name: string;
  abbrv?: string;
  text_1?: string;
  location_id?: number | string | null;
  location_name?: string;
  location?: { name?: string };
};

type NamedOption = {
  id: number | string;
  name: string;
  code?: string;
};

type Props = {
  onSave: (data: Record<string, unknown>) => Promise<unknown>;
  onCancel: () => void;
  user?: { id?: number | string; department_id?: number | string };
  locationId: number | string;
};

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

function insertedId(response: unknown): number | string | null {
  let candidate = response;
  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof candidate !== "object" || candidate === null) return null;
    if ("id" in candidate) {
      const id = (candidate as { id?: unknown }).id;
      if (typeof id === "number" || typeof id === "string") return id;
    }
    candidate = "data" in candidate
      ? (candidate as { data?: unknown }).data
      : null;
  }
  return null;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error !== "object" || error === null || !("response" in error)) return "";
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === "string" ? response.data.message : "";
}

/**
 * Creates one cash-transfer document and its balanced account entries from a
 * single user submission. The parent remains the approval unit; the paired
 * requisitionitems rows record the source and destination account movements.
 */
export default function CashTransferCreateForm({
  onSave,
  onCancel,
  user,
  locationId,
}: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    department_id: Number(user?.department_id) > 0 ? String(user?.department_id) : "",
    currency_id: "",
    from_account_id: "",
    to_account_id: "",
    amount: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedDocumentId, setSavedDocumentId] = useState<number | string | null>(null);
  const [transferGroupId, setTransferGroupId] = useState("");
  const [sourceEntrySaved, setSourceEntrySaved] = useState(false);

  const { data: accountData, isLoading: accountsLoading } = useReduxApiData({
    table: "commons",
    uniqueKey: "cash-transfer-create-accounts",
    queryType: "gets",
    mainParam: { is_active: 1, grp: 7 },
    narration: "get active accounts for cash transfer",
  });
  const { data: locationData } = useReduxApiData({
    table: "locations",
    uniqueKey: "cash-transfer-create-locations",
    queryType: "gets",
    mainParam: { is_active: 1, grp: 4 },
    narration: "get locations for cash transfer accounts",
  });
  const { data: departmentData } = useReduxApiData({
    table: "commons",
    uniqueKey: "cash-transfer-create-departments",
    queryType: "gets",
    mainParam: { is_active: 1, grp: 2 },
    narration: "get departments for cash transfer record",
  });
  const { data: currencyData } = useReduxApiData({
    table: "commons",
    uniqueKey: "cash-transfer-create-currencies",
    queryType: "gets",
    mainParam: { is_active: 1, grp: 6 },
    narration: "get currencies for cash transfer record",
  });
  const { loadUpdate: saveItem } = useReduxApiData({
    table: "requisitionitems",
    uniqueKey: "cash-transfer-create-items",
    queryType: "insert",
    autoLoad: false,
    narration: "save cash transfer account entry",
  });

  const accounts = useMemo(
    () => (Array.isArray(accountData) ? (accountData as Account[]) : []),
    [accountData],
  );
  const locations = useMemo(
    () => (Array.isArray(locationData) ? (locationData as NamedOption[]) : []),
    [locationData],
  );
  const departments = useMemo(
    () => (Array.isArray(departmentData) ? (departmentData as NamedOption[]) : []),
    [departmentData],
  );
  const currencies = useMemo(
    () => (Array.isArray(currencyData) ? (currencyData as NamedOption[]) : []),
    [currencyData],
  );
  const locationNames = useMemo(
    () => new Map<string, string>(locations.map((location) => [String(location.id), location.name])),
    [locations],
  );
  const sourceAccounts = useMemo(
    () => accounts.filter((account) => String(account.location_id) === String(locationId)),
    [accounts, locationId],
  );
  const destinationAccounts = useMemo(
    () => accounts.filter((account) => String(account.id) !== form.from_account_id),
    [accounts, form.from_account_id],
  );

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const accountLabel = (account: Account) => {
    const locationName =
      account.location_name ||
      account.location?.name ||
      locationNames.get(String(account.location_id)) ||
      (account.location_id ? `Location ${account.location_id}` : "Company-wide");
    return transferAccountLabel(account, locationName);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    if (!locationId) {
      setError("Choose an active location before creating a cash transfer.");
      return;
    }
    if (!form.from_account_id || !form.to_account_id || !form.amount) {
      setError("Select the sending and receiving accounts, then enter the amount.");
      return;
    }
    if (form.from_account_id === form.to_account_id) {
      setError("The sending and receiving accounts must be different.");
      return;
    }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.department_id) {
      setError("Select the department responsible for this transfer.");
      return;
    }

    setIsSaving(true);
    setError("");
    let documentId = savedDocumentId;
    try {
      if (!documentId) {
        const parentResponse = await onSave({
          title: form.title.trim() || "Cash transfer",
          description: form.description.trim(),
          department_id: Number(form.department_id),
          currency_id: form.currency_id ? Number(form.currency_id) : null,
          total_amount: amount,
        });
        documentId = insertedId(parentResponse);
        if (!documentId) {
          throw new Error("The transfer details were saved, but its reference was not returned. Refresh the transfer list before trying again.");
        }
        setSavedDocumentId(documentId);
      }

      const transferId = transferGroupId || `CT-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      if (!transferGroupId) setTransferGroupId(transferId);
      const shared = {
        item_id: 0,
        requisition_id: documentId,
        created_by_id: user?.id || null,
        quantity: 0,
        special_instructions: transferId,
      };
      if (!sourceEntrySaved) {
        await saveItem({
          ...shared,
          item_id: Number(form.from_account_id),
          account_id: Number(form.from_account_id),
          category_id: 0,
          total_price: amount,
          credit_price: 0,
        });
        setSourceEntrySaved(true);
      }
      await saveItem({
        ...shared,
        item_id: Number(form.to_account_id),
        account_id: Number(form.to_account_id),
        category_id: 1,
        total_price: 0,
        credit_price: amount,
      });
      navigate("/procurement/cashtransfer", {
        state: { openApprovalId: documentId },
      });
    } catch (saveError: unknown) {
      setError(
        documentId
          ? `Transfer ${documentId} was created, but its account entries did not finish saving. The draft is preserved; use “Finish saving entries” to retry. ${errorMessage(saveError)}`
          : errorMessage(saveError) || "The transfer could not be saved. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-4xl space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">New cash transfer</h1>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Enter the transfer and both account entries once. The transfer will be saved as a draft for its own approval workflow.
        </p>
        <p className="mt-2 text-xs font-medium text-brand-700 dark:text-brand-300">
          Location: {locations.find((location) => String(location.id) === String(locationId))?.name || `Location ${locationId}`}
        </p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Transfer details">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 sm:col-span-2">
          Transfer purpose / title
          <input name="title" value={form.title} onChange={update} maxLength={200} placeholder="e.g. Move operating funds to the branch" disabled={Boolean(savedDocumentId)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 sm:col-span-2">
          Notes
          <textarea name="description" value={form.description} onChange={update} rows={3} maxLength={3000} placeholder="Reason, instructions, or reference for this transfer" disabled={Boolean(savedDocumentId)} className={`${fieldClass} py-3`} />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Department <span className="text-red-600">*</span>
          <select name="department_id" required value={form.department_id} onChange={update} disabled={Number(user?.department_id) > 0 || Boolean(savedDocumentId)} className={fieldClass}>
            <option value="">Choose department</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Currency
          <select name="currency_id" value={form.currency_id} onChange={update} disabled={Boolean(savedDocumentId)} className={fieldClass}>
            <option value="">Use organisation default</option>
            {currencies.map((currency) => <option key={currency.id} value={currency.id}>{currency.code ? `${currency.code} — ${currency.name}` : currency.name}</option>)}
          </select>
        </label>
      </section>

      <section className="grid gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-950/60 sm:grid-cols-2" aria-label="Accounts and amount">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          From account <span className="text-red-600">*</span>
          <select name="from_account_id" required value={form.from_account_id} onChange={(event) => {
            update(event);
            if (event.target.value === form.to_account_id) setForm((previous) => ({ ...previous, to_account_id: "" }));
          }} disabled={accountsLoading || Boolean(savedDocumentId)} className={fieldClass}>
            <option value="">{accountsLoading ? "Loading accounts…" : "Choose a location account"}</option>
            {sourceAccounts.map((account) => <option key={account.id} value={account.id}>{accountLabel(account)}</option>)}
          </select>
          <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">Only accounts assigned to this location are listed.</span>
          {!accountsLoading && !sourceAccounts.length && <span role="status" className="mt-1 block text-xs text-amber-700 dark:text-amber-300">No accounts are assigned to this location. Set the account location in Settings → Accounts &amp; Banks first.</span>}
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          To account <span className="text-red-600">*</span>
          <select name="to_account_id" required value={form.to_account_id} onChange={update} disabled={accountsLoading || Boolean(savedDocumentId)} className={fieldClass}>
            <option value="">Choose receiving account</option>
            {destinationAccounts.map((account) => <option key={account.id} value={account.id}>{accountLabel(account)}</option>)}
          </select>
          <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">Account names include their location.</span>
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 sm:col-span-2">
          Amount <span className="text-red-600">*</span>
          <input name="amount" type="number" min="0.01" step="0.01" required inputMode="decimal" value={form.amount} onChange={update} placeholder="0.00" disabled={Boolean(savedDocumentId)} className={fieldClass} />
        </label>
      </section>

      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
        <button type="button" onClick={onCancel} disabled={isSaving || Boolean(savedDocumentId)} className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancel</button>
        <button type="submit" disabled={isSaving || accountsLoading} className="min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSaving ? "Saving transfer…" : savedDocumentId ? "Finish saving entries" : "Save transfer draft"}
        </button>
      </div>
    </form>
  );
}

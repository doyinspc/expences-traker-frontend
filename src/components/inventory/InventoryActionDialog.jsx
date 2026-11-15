import { useRef, useState } from "react";
import ApprovalItemDialog from "../approvals/ApprovalItemDialog";
import { inventoryRequest } from "../../hooks/useInventory";

const control =
  "mt-1 min-h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900";
const titles = {
  policy: "Stock limits",
  dispatch: "Dispatch to another location",
  receive_transfer: "Receive transfer",
  adjust: "Stock adjustment",
  cost: "Record missing cost",
  batch: "Correct batch details",
  spec: "Procurement batch details",
  schedule: "Email stock summaries",
};

/** One confirmed action per modal. The server owns quantity, location and role validation. */
export default function InventoryActionDialog({
  action,
  row = {},
  report,
  onClose,
  onSaved,
}) {
  const [values, setValues] = useState({
    item_id: row.item_id || row.id || "",
    lot_id: row.id || "",
    item_line_id: row.item_line_id || "",
    transfer_id: row.id || "",
    minimum_quantity: row.minimum_quantity || 0,
    safety_quantity: row.safety_quantity || 0,
    maximum_quantity: row.maximum_quantity ?? "",
    movement_date: report.today,
    batch_reference: row.batch_reference || "",
    expiry_date: row.expiry_date || "",
    frequency: report.schedule?.is_active ? report.schedule.frequency : "off",
    reason_code: "damage",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestKey = useRef(crypto.randomUUID().replaceAll("-", ""));
  const field = (name, label, type = "text", options) => (
    <label className="text-sm" key={name}>
      {label}
      {options ? (
        <select
          className={control}
          value={values[name] ?? ""}
          required={name !== "maximum_quantity"}
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              [name]: event.target.value,
              ...(name === "item_id" ? { lot_id: "" } : {}),
            }))
          }
        >
          <option value="">Choose…</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={control}
          type={type}
          value={values[name] ?? ""}
          maxLength={name === "reason" ? 2000 : 100}
          required={name !== "maximum_quantity"}
          min={type === "number" ? 0 : undefined}
          step={
            type === "number"
              ? name === "unit_cost"
                ? "0.01"
                : "1"
              : undefined
          }
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              [name]: event.target.value,
              ...(name === "item_id" ? { lot_id: "" } : {}),
            }))
          }
        />
      )}
    </label>
  );
  const needsQuantity = ["dispatch", "receive_transfer", "adjust"].includes(
    action,
  );
  const increased =
    action === "adjust" &&
    ["customer_return", "count_increase"].includes(values.reason_code);
  const needsCost = action === "cost" || increased;
  const needsBatch = ["batch", "spec"].includes(action) || increased;
  return (
    <ApprovalItemDialog
      title={titles[action]}
      itemName={
        row.name || row.item_name || report.location?.name || "Inventory"
      }
      busy={busy}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            await inventoryRequest(
              action,
              {
                ...values,
                request_key: requestKey.current,
                confirmation: "CONFIRM_INVENTORY",
              },
              true,
            );
            await onSaved();
            onClose();
          } catch (failure) {
            setError(failure.response?.data?.message || failure.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
          {["dispatch", "adjust"].includes(action) &&
            field(
              "item_id",
              "Goods item",
              "select",
              (report.catalogue || []).map((item) => ({
                value: item.id,
                label: item.name + " · " + item.unit,
              })),
            )}
          {action === "dispatch" &&
            field(
              "to_location_id",
              "Destination location",
              "select",
              (report.locations || [])
                .filter(
                  (location) =>
                    Number(location.id) !== Number(report.location.id),
                )
                .map((location) => ({
                  value: location.id,
                  label: location.name,
                })),
            )}
          {action === "dispatch" && field("reference", "Dispatch reference")}
          {action === "policy" && (
            <>
              {field("minimum_quantity", "Minimum quantity", "number")}
              {field("safety_quantity", "Safety quantity", "number")}
              {field(
                "maximum_quantity",
                "Maximum quantity (optional)",
                "number",
              )}
            </>
          )}
          {action === "adjust" &&
            field(
              "reason_code",
              "Adjustment type",
              "select",
              [
                ["damage", "Damaged Goods"],
                ["expiry", "Expired Goods disposal"],
                ["loss", "Loss / shrinkage"],
                ["supplier_return", "Return to supplier"],
                ["customer_return", "Goods returned by customer"],
                ["count_increase", "Count correction — increase"],
                ["count_decrease", "Count correction — decrease"],
              ].map(([value, label]) => ({ value, label })),
            )}
          {action === "adjust" &&
            !increased &&
            field(
              "lot_id",
              "Affected batch",
              "select",
              (report.lots || [])
                .filter((lot) => String(lot.item_id) === String(values.item_id))
                .map((lot) => ({
                  value: lot.id,
                  label:
                    (lot.batch_reference || "Batch #" + lot.id) +
                    " · " +
                    lot.balance_at_date +
                    " " +
                    lot.unit +
                    (lot.expiry_date ? " · " + lot.expiry_date : ""),
                })),
            )}
          {needsQuantity &&
            field("quantity", "Actual quantity in saved unit", "number")}
          {needsQuantity && field("movement_date", "Movement date", "date")}
          {needsCost && (
            <>
              {field("unit_cost", "Unit cost", "number")}
              {field(
                "currency_id",
                "Currency",
                "select",
                (report.currencies || []).map((currency) => ({
                  value: currency.id,
                  label: currency.name,
                })),
              )}
            </>
          )}
          {needsBatch && (
            <>
              {field("batch_reference", "Batch reference")}
              {field("expiry_date", "Expiry date", "date")}
            </>
          )}
          {action === "schedule" &&
            field("frequency", "Email my stock summary", "select", [
              { value: "off", label: "Off" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
            ])}
          <div className="sm:col-span-2">
            {field("reason", "Reason / supporting reference")}
          </div>
        </fieldset>
        {action === "dispatch" && (
          <p className="text-xs">
            Dispatch deducts available stock. The destination confirms its
            actual receipt. Batch value and expiry follow the Goods.
          </p>
        )}
        {action === "adjust" && (
          <p className="text-xs">
            This records a quantity correction with your name, reason and date.
            Any refund or payment must also follow the financial process.
          </p>
        )}
        {action === "schedule" && (
          <p className="text-xs">
            Summaries go to your profile email while you retain Stock access
            here. Hosting must run the summary scheduler.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <button
          className="min-h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "Saving…" : "Confirm " + titles[action].toLowerCase()}
        </button>
      </form>
    </ApprovalItemDialog>
  );
}

import { useState } from "react";
import useInventory from "../../hooks/useInventory";
import InventoryActionDialog from "./InventoryActionDialog";

/** Procurement owns batch declarations; Stock later confirms the physical receipt. */
export default function ProcurementBatchPanel({ documentId, canEdit = false }) {
  const query = useInventory(
    { document_id: documentId },
    "procurement",
    Boolean(documentId),
  );
  const [row, setRow] = useState(null);
  const data = query.data;
  if (!data?.ready || !data.items?.length) return null;
  const missing = data.items.filter(
    (item) => !item.expiry_date || !item.batch_reference,
  ).length;
  return (
    <details className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
        Perishable Goods · Batch and expiry{" "}
        {missing > 0 ? `(${missing} need details)` : "(recorded)"}
      </summary>
      <div className="overflow-x-auto px-4 pb-4">
        <p className="mb-2 text-xs">
          Required before Procurement closes. Stock will confirm the delivered
          quantity against these details.
        </p>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {["Item", "Batch", "Expiry", "Action"].map((label) => (
                <th key={label} className="p-2">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr
                key={item.item_line_id}
                className="border-t dark:border-gray-700"
              >
                <td className="p-2">{item.item_name}</td>
                <td className="p-2">{item.batch_reference || "Required"}</td>
                <td className="p-2">{item.expiry_date || "Required"}</td>
                <td className="p-2">
                  {canEdit && (
                    <button
                      className="min-h-10 text-blue-600 dark:text-blue-300"
                      onClick={() => setRow(item)}
                    >
                      Set details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {row && (
        <InventoryActionDialog
          action="spec"
          row={row}
          report={data}
          onClose={() => setRow(null)}
          onSaved={query.refetch}
        />
      )}
    </details>
  );
}

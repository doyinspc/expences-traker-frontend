import { Link } from "react-router";
import { Flag } from "lucide-react";
import useInventory from "../../hooks/useInventory";

/** Live Stock notifications share the report query and follow the selected location. */
export default function InventoryAlert({ compact = false, onOpen }) {
  const query = useInventory({}, "alerts");
  const data = query.data;
  if (!data?.ready) return null;
  const low = data.low_count || 0;
  const expiring = data.expiry_count || 0;
  const incoming = data.incoming_count || 0;
  if (!low && !expiring && !incoming) return null;
  return (
    <div
      role="status"
      className={
        "rounded-lg border border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200 " +
        (compact ? "my-2 p-3 text-xs" : "p-4 text-sm")
      }
    >
      <p className="flex items-center gap-2 font-semibold">
        <Flag size={16} aria-hidden="true" />
        Stock attention · {data.location.name}
      </p>
      {low > 0 && (
        <Link
          to="/reports/stock?view=replenishment"
          onClick={onOpen}
          className="mt-2 block underline"
        >
          {low} item(s) below stock limits · View restock list
        </Link>
      )}
      {incoming > 0 && (
        <Link
          to="/reports/stock?view=transfers"
          onClick={onOpen}
          className="mt-2 block underline"
        >
          {incoming} transfer(s) waiting for receipt
        </Link>
      )}
      {expiring > 0 && (
        <Link
          to="/reports/stock?view=expiry"
          onClick={onOpen}
          className="mt-2 block underline"
        >
          {expiring} batch(es) expired, expiring within 30 days, or missing
          expiry · Review
        </Link>
      )}
    </div>
  );
}

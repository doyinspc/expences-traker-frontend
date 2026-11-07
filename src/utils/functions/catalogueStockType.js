/**
 * Use the child item's saved Good/Service choice to decide its requisition form.
 * Older Both or unset records can use the Stock Type setting or a saved unit.
 * A missing unit by itself never makes an item a service.
 */
export const CATALOGUE_STOCK_TYPE = Object.freeze({ SERVICE: 0, GOOD: 1 });

export function catalogueStockType(item) {
  if (!item) return null;
  const kind = Number(item.text_4);
  if (kind === 1) return CATALOGUE_STOCK_TYPE.SERVICE;
  if (kind === 2) return CATALOGUE_STOCK_TYPE.GOOD;
  const selected = item.stockable;
  if ([0, 1, '0', '1'].includes(selected)) return Number(selected);
  return String(item.text_1 || '').trim() ? CATALOGUE_STOCK_TYPE.GOOD : null;
}

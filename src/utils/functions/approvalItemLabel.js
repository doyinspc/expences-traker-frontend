/** Resolve the readable catalogue projection; database row IDs are never item names. */
export function approvalItemLabel(item = {}) {
  return (
    [
      item.item_name,
      item.name,
      item.item_description,
      item.description,
      item.special_instructions,
    ]
      .find(
        (value) =>
          typeof value === "string" &&
          value.trim() &&
          !/^Item\s*#?\s*\d+$/i.test(value.trim()),
      )
      ?.trim() || "Description unavailable"
  );
}

import type { SelectOption } from '@/types';

/**
 * Convert an array of items to SelectOption format
 */
export function toSelectOptions<T extends { id: number | string; name: string }>(
  items: T[]
): SelectOption[] {
  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }));
}

/**
 * Convert an array of strings to SelectOption format
 */
export function toSelectOptionsFromStrings(items: string[]): SelectOption[] {
  return items.map((item) => ({
    value: item,
    label: item,
  }));
}

/**
 * Find the selected option from a list of options
 */
export function findSelectedOption(
  options: SelectOption[],
  value: number | string | null
): SelectOption | null {
  if (!value) return null;
  return options.find((opt) => opt.value === value) || null;
}

/**
 * Filter items by IDs
 */
export function filterByIds<T extends { id: number | string }>(
  items: T[],
  ids: (number | string)[]
): T[] {
  return items.filter((item) => ids.includes(item.id));
}

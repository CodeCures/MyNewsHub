import type { SelectOption, Source, Category } from '@/types';

/**
 * Convert sources array to react-select options
 */
export function sourcesToOptions(sources: Source[]): SelectOption[] {
  return sources.map(source => ({
    value: source.id,
    label: source.name,
  }));
}

/**
 * Convert categories array to react-select options
 */
export function categoriesToOptions(categories: Category[]): SelectOption[] {
  return categories.map(category => ({
    value: category.id,
    label: category.name,
  }));
}

/**
 * Convert string array to react-select options
 */
export function stringsToOptions(items: string[]): SelectOption[] {
  return items.map(item => ({
    value: item,
    label: item,
  }));
}

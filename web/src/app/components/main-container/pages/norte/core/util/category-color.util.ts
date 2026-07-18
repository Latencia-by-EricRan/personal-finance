import { ICategory } from '../../../../../../core/reference';

/**
 * Deterministic fallback palette of category identity swatches. Kept
 * separate from the semantic `--income`/`--gold`/`--expense` tokens, which
 * are reserved for budget-progress bands.
 */
const CATEGORY_SWATCHES = [
  'var(--cat-1)',
  'var(--cat-2)',
  'var(--cat-3)',
  'var(--cat-4)',
  'var(--cat-5)',
  'var(--cat-6)',
  'var(--cat-7)',
  'var(--cat-8)',
] as const;

/**
 * Resolves the display color for a category. Returns the user-assigned
 * `Color` verbatim when present, otherwise derives a deterministic swatch
 * from `Tag`/`Name` so the same category always renders the same color.
 */
export function categoryColor(category: Pick<ICategory, 'Color' | 'Tag' | 'Name'>): string {
  const color = category.Color?.trim();

  if (color) {
    return color;
  }

  const key = category.Tag?.trim() || category.Name;
  const sum = [...key].reduce((total, char) => total + char.charCodeAt(0), 0);
  const index = sum % CATEGORY_SWATCHES.length;

  return CATEGORY_SWATCHES[index];
}

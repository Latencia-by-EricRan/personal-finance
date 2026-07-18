import { ICategory } from '../../../../../../core/reference';

import { categoryColor } from './category-color.util';

describe('categoryColor', () => {
  it('returns the category Color verbatim when non-empty', () => {
    const category: Pick<ICategory, 'Color' | 'Tag' | 'Name'> = {
      Color: '#FF0000',
      Tag: 'rent',
      Name: 'Renta',
    };

    expect(categoryColor(category)).toBe('#FF0000');
  });

  it('falls back to a deterministic token swatch when Color is an empty string', () => {
    const category: Pick<ICategory, 'Color' | 'Tag' | 'Name'> = {
      Color: '',
      Tag: 'rent',
      Name: 'Renta',
    };

    expect(categoryColor(category)).toMatch(/^var\(--cat-[1-8]\)$/);
  });

  it('falls back to a deterministic token swatch when Color is missing', () => {
    const category: Pick<ICategory, 'Tag' | 'Name'> = {
      Tag: 'rent',
      Name: 'Renta',
    };

    expect(categoryColor(category)).toMatch(/^var\(--cat-[1-8]\)$/);
  });

  it('falls back to a deterministic token swatch when Color is whitespace-only', () => {
    const category: Pick<ICategory, 'Color' | 'Tag' | 'Name'> = {
      Color: '   ',
      Tag: 'rent',
      Name: 'Renta',
    };

    expect(categoryColor(category)).toMatch(/^var\(--cat-[1-8]\)$/);
  });

  it('returns the same fallback swatch for the same Tag/Name across calls', () => {
    const first = categoryColor({ Color: '', Tag: 'rent', Name: 'Renta' });
    const second = categoryColor({ Color: '', Tag: 'rent', Name: 'Renta' });

    expect(first).toBe(second);
  });

  it('returns a different fallback swatch when Tag/Name differ', () => {
    const rent = categoryColor({ Color: '', Tag: 'rent', Name: 'Renta' });
    const food = categoryColor({ Color: '', Tag: 'food', Name: 'Comida' });

    expect(rent).not.toBe(food);
  });

  it('falls back to Name when Tag is missing', () => {
    const first = categoryColor({ Color: '', Name: 'Renta' });
    const second = categoryColor({ Color: '', Name: 'Renta' });

    expect(first).toBe(second);
    expect(first).toMatch(/^var\(--cat-[1-8]\)$/);
  });
});

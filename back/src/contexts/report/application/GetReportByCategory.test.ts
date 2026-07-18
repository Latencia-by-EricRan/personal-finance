import { describe, expect, it, vi } from 'vitest';
import { InMemoryMovementGateway } from '../infrastructure/InMemoryMovementGateway';
import { InMemoryCategoryGateway } from '../infrastructure/InMemoryCategoryGateway';
import { GetReportByCategory } from './GetReportByCategory';

describe('GetReportByCategory', () => {
    it('groups and sums Amount by Category across multiple movements, keeping distinct categories separate', async () => {
        const movementGateway = new InMemoryMovementGateway();
        const categoryGateway = new InMemoryCategoryGateway();
        const catFood = { _id: 'cat-food', Description: 'Food desc', Name: 'Food', Tag: '', Type: 'variable' as const };
        const catRent = { _id: 'cat-rent', Description: 'Rent desc', Name: 'Rent', Tag: '', Type: 'fijo' as const };
        categoryGateway.seed(catFood);
        categoryGateway.seed(catRent);
        movementGateway.seed({ Type: 'egreso', Category: 'cat-food', Amount: 100, Date: new Date(2026, 6, 10) });
        movementGateway.seed({ Type: 'egreso', Category: 'cat-food', Amount: 50, Date: new Date(2026, 6, 12) });
        movementGateway.seed({ Type: 'egreso', Category: 'cat-rent', Amount: 900, Date: new Date(2026, 6, 15) });

        const result = await new GetReportByCategory(movementGateway, categoryGateway).execute(7, 2026);

        expect(result).toEqual([
            { Category: catFood, Total: 150 },
            { Category: catRent, Total: 900 },
        ]);
    });

    it('returns an empty array when there are no expenses in the month', async () => {
        const movementGateway = new InMemoryMovementGateway();
        const categoryGateway = new InMemoryCategoryGateway();

        const result = await new GetReportByCategory(movementGateway, categoryGateway).execute(1, 2026);

        expect(result).toEqual([]);
    });

    it('skips movements whose Category ref does not resolve (dangling ref, e.g. a deleted category), instead of throwing', async () => {
        const movementGateway = new InMemoryMovementGateway();
        const categoryGateway = new InMemoryCategoryGateway();
        const catFood = { _id: 'cat-food', Description: 'Food desc', Name: 'Food', Tag: '', Type: 'variable' as const };
        categoryGateway.seed(catFood);
        movementGateway.seed({ Type: 'egreso', Category: 'cat-food', Amount: 100, Date: new Date(2026, 6, 10) });
        movementGateway.seed({ Type: 'egreso', Category: 'cat-deleted', Amount: 999, Date: new Date(2026, 6, 12) });

        const result = await new GetReportByCategory(movementGateway, categoryGateway).execute(7, 2026);

        expect(result).toEqual([{ Category: catFood, Total: 100 }]);
    });

    it('excludes ingreso movements from the by-category grouping', async () => {
        const movementGateway = new InMemoryMovementGateway();
        const categoryGateway = new InMemoryCategoryGateway();
        const catFood = { _id: 'cat-food', Description: 'Food desc', Name: 'Food', Tag: '', Type: 'variable' as const };
        categoryGateway.seed(catFood);
        movementGateway.seed({ Type: 'ingreso', Category: 'cat-food', Amount: 9000, Date: new Date(2026, 6, 5) });

        const result = await new GetReportByCategory(movementGateway, categoryGateway).execute(7, 2026);

        expect(result).toEqual([]);
    });

    it('queries the movement gateway using the same month date-window construction as the legacy service', async () => {
        const movementGateway = new InMemoryMovementGateway();
        const categoryGateway = new InMemoryCategoryGateway();
        const findEgresoWithRefsSpy = vi.spyOn(movementGateway, 'findEgresoWithRefs');

        await new GetReportByCategory(movementGateway, categoryGateway).execute(7, 2026);

        expect(findEgresoWithRefsSpy).toHaveBeenCalledWith(new Date(2026, 6, 0), new Date(2026, 7, 0));
    });

    it('does not call the category gateway when there are no egreso movements in the window', async () => {
        const movementGateway = new InMemoryMovementGateway();
        const categoryGateway = new InMemoryCategoryGateway();
        const findByIdsSpy = vi.spyOn(categoryGateway, 'findByIds');

        await new GetReportByCategory(movementGateway, categoryGateway).execute(7, 2026);

        expect(findByIdsSpy).not.toHaveBeenCalled();
    });
});

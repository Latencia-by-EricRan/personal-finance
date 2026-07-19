import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import { CategoryModel } from '../contexts/category';
import { AccountModel } from '../contexts/account';
import { BudgetModel } from '../contexts/budget';
import { MovementModel } from '../contexts/movement';

describe('Budget status e2e', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;
    let accountId: string;

    let underCategoryId: string;
    let zeroCategoryId: string;
    let overCategoryId: string;

    const MONTH = 6;
    const YEAR = 2000;

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();

        const account = await AccountModel.create({ Name: 'Budget Account', Type: 'banco' });
        accountId = account._id.toString();

        const underCategory = await CategoryModel.create({
            Description: 'Groceries budget category',
            Name: 'Groceries Budget',
            Type: 'variable',
        });
        underCategoryId = underCategory._id.toString();

        const zeroCategory = await CategoryModel.create({
            Description: 'Unused budget category',
            Name: 'Entertainment Budget',
            Type: 'variable',
        });
        zeroCategoryId = zeroCategory._id.toString();

        const overCategory = await CategoryModel.create({
            Description: 'Overspent budget category',
            Name: 'Dining Budget',
            Type: 'variable',
        });
        overCategoryId = overCategory._id.toString();

        await BudgetModel.create({ Category: underCategoryId, Month: MONTH, Year: YEAR, Limit: 1000 });
        await BudgetModel.create({ Category: zeroCategoryId, Month: MONTH, Year: YEAR, Limit: 500 });
        await BudgetModel.create({ Category: overCategoryId, Month: MONTH, Year: YEAR, Limit: 100 });

        await MovementModel.insertMany([
            // egreso movements for the "under budget" category: 100 + 200 = 300 spent
            { Type: 'egreso', Amount: 100, Date: new Date(YEAR, MONTH - 1, 10), Category: underCategoryId, Account: accountId },
            { Type: 'egreso', Amount: 200, Date: new Date(YEAR, MONTH - 1, 15), Category: underCategoryId, Account: accountId },
            // ingreso movement in the same category/month/year — MUST be excluded from Spent
            { Type: 'ingreso', Amount: 5000, Date: new Date(YEAR, MONTH - 1, 5), Category: underCategoryId, Account: accountId },
            // egreso movement for the "over budget" category: 150 spent against a Limit of 100
            { Type: 'egreso', Amount: 150, Date: new Date(YEAR, MONTH - 1, 20), Category: overCategoryId, Account: accountId },
        ]);
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    it('reflects Limit/Spent/Remaining/Percent for a category under budget, ignoring ingreso movements', async () => {
        const response = await testApp.request
            .get(`/budget/status/${MONTH}/${YEAR}`)
            .set('Authorization', authHeader());

        expect(response.status).toBe(200);

        const entries = response.body as Array<Record<string, unknown>>;
        const underEntry = entries.find(
            (entry) => (entry.Category as { _id: string })._id === underCategoryId,
        );

        expect(underEntry).toBeDefined();
        expect((underEntry?.Category as { Name: string }).Name).toBe('Groceries Budget');
        expect(underEntry?.Limit).toBe(1000);
        expect(underEntry?.Spent).toBe(300);
        expect(underEntry?.Remaining).toBe(700);
        expect(underEntry?.Percent).toBe(30);
    });

    it('reports zero Spent and full Remaining when no movements exist for the category', async () => {
        const response = await testApp.request
            .get(`/budget/status/${MONTH}/${YEAR}`)
            .set('Authorization', authHeader());

        const entries = response.body as Array<Record<string, unknown>>;
        const zeroEntry = entries.find(
            (entry) => (entry.Category as { _id: string })._id === zeroCategoryId,
        );

        expect(zeroEntry).toBeDefined();
        expect(zeroEntry?.Limit).toBe(500);
        expect(zeroEntry?.Spent).toBe(0);
        expect(zeroEntry?.Remaining).toBe(500);
        expect(zeroEntry?.Percent).toBe(0);
    });

    it('reports a negative Remaining and Percent over 100 when spend exceeds the limit', async () => {
        const response = await testApp.request
            .get(`/budget/status/${MONTH}/${YEAR}`)
            .set('Authorization', authHeader());

        const entries = response.body as Array<Record<string, unknown>>;
        const overEntry = entries.find(
            (entry) => (entry.Category as { _id: string })._id === overCategoryId,
        );

        expect(overEntry).toBeDefined();
        expect(overEntry?.Limit).toBe(100);
        expect(overEntry?.Spent).toBe(150);
        expect(overEntry?.Remaining).toBe(-50);
        expect(overEntry?.Percent).toBe(150);
    });
});

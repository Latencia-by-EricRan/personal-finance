import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import { AccountModel } from '../contexts/account';
import { CategoryModel } from '../contexts/category';
import { MovementModel } from '../contexts/movement';

describe('Report e2e', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;
    let accountId: string;

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();

        const account = await AccountModel.create({ Name: 'Report Account', Type: 'banco' });
        accountId = account._id.toString();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    describe('by-category report', () => {
        const MONTH = 6;
        const YEAR = 2050;
        let categoryAId: string;
        let categoryBId: string;

        beforeAll(async () => {
            const categoryA = await CategoryModel.create({
                Color: '#C2410C',
                Description: 'Report category A',
                Name: 'Report Category A',
                Type: 'variable',
            });
            categoryAId = categoryA._id.toString();

            const categoryB = await CategoryModel.create({
                Description: 'Report category B',
                Name: 'Report Category B',
                Type: 'variable',
            });
            categoryBId = categoryB._id.toString();

            await MovementModel.insertMany([
                {
                    Type: 'egreso',
                    Amount: 100,
                    Date: new Date(YEAR, MONTH - 1, 10),
                    Category: categoryAId,
                    Account: accountId,
                },
                {
                    Type: 'egreso',
                    Amount: 50,
                    Date: new Date(YEAR, MONTH - 1, 12),
                    Category: categoryAId,
                    Account: accountId,
                },
                {
                    Type: 'egreso',
                    Amount: 300,
                    Date: new Date(YEAR, MONTH - 1, 15),
                    Category: categoryBId,
                    Account: accountId,
                },
                // ingreso in category A, same month/year — MUST be excluded (service filters Type: EGRESO only)
                {
                    Type: 'ingreso',
                    Amount: 9000,
                    Date: new Date(YEAR, MONTH - 1, 5),
                    Category: categoryAId,
                    Account: accountId,
                },
            ]);
        });

        it('groups egreso spend by category, excluding ingreso movements', async () => {
            const response = await testApp.request
                .get(`/report/by-category/${MONTH}/${YEAR}`)
                .set('Authorization', authHeader());

            expect(response.status).toBe(200);

            const entries = response.body as Array<Record<string, unknown>>;
            const entryA = entries.find((entry) => (entry.Category as { _id: string })._id === categoryAId);
            const entryB = entries.find((entry) => (entry.Category as { _id: string })._id === categoryBId);

            expect(entryA).toBeDefined();
            expect((entryA?.Category as { Name: string }).Name).toBe('Report Category A');
            expect((entryA?.Category as { Color: string }).Color).toBe('#C2410C');
            expect(entryA?.Total).toBe(150);

            expect(entryB).toBeDefined();
            expect((entryB?.Category as { Name: string }).Name).toBe('Report Category B');
            expect(entryB?.Total).toBe(300);
        });
    });

    describe('monthly report', () => {
        const YEAR = 2051;
        let categoryId: string;

        beforeAll(async () => {
            const category = await CategoryModel.create({
                Description: 'Monthly report category',
                Name: 'Monthly Report Category',
                Type: 'variable',
            });
            categoryId = category._id.toString();

            await MovementModel.insertMany([
                { Type: 'ingreso', Amount: 500, Date: new Date(YEAR, 2, 10), Category: categoryId, Account: accountId }, // March
                { Type: 'egreso', Amount: 200, Date: new Date(YEAR, 2, 15), Category: categoryId, Account: accountId }, // March
                { Type: 'ingreso', Amount: 100, Date: new Date(YEAR, 6, 5), Category: categoryId, Account: accountId }, // July
                { Type: 'egreso', Amount: 400, Date: new Date(YEAR, 6, 20), Category: categoryId, Account: accountId }, // July
            ]);
        });

        it('returns a 12-entry breakdown with Income/Expense/Net per month', async () => {
            const response = await testApp.request.get(`/report/monthly/${YEAR}`).set('Authorization', authHeader());

            expect(response.status).toBe(200);

            const months = response.body as Array<Record<string, unknown>>;
            expect(months).toHaveLength(12);

            const march = months.find((entry) => entry.Month === 3);
            expect(march).toEqual({ Month: 3, Income: 500, Expense: 200, Net: 300 });

            const july = months.find((entry) => entry.Month === 7);
            expect(july).toEqual({ Month: 7, Income: 100, Expense: 400, Net: -300 });

            const january = months.find((entry) => entry.Month === 1);
            expect(january).toEqual({ Month: 1, Income: 0, Expense: 0, Net: 0 });
        });
    });

    describe('cashflow report', () => {
        const MONTH = 9;
        const YEAR = 2052;
        let categoryId: string;

        beforeAll(async () => {
            const category = await CategoryModel.create({
                Description: 'Cashflow report category',
                Name: 'Cashflow Report Category',
                Type: 'variable',
            });
            categoryId = category._id.toString();

            await MovementModel.insertMany([
                {
                    Type: 'ingreso',
                    Amount: 800,
                    Date: new Date(YEAR, MONTH - 1, 8),
                    Category: categoryId,
                    Account: accountId,
                },
                {
                    Type: 'egreso',
                    Amount: 350,
                    Date: new Date(YEAR, MONTH - 1, 22),
                    Category: categoryId,
                    Account: accountId,
                },
            ]);
        });

        it('returns the single-month Income/Expense/Net for mixed movements', async () => {
            const response = await testApp.request
                .get(`/report/cashflow/${MONTH}/${YEAR}`)
                .set('Authorization', authHeader());

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ Month: MONTH, Year: YEAR, Income: 800, Expense: 350, Net: 450 });
        });
    });
});

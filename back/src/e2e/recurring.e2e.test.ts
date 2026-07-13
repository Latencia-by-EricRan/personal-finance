import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import CategoryModel from '../modules/models/Category.model';
import AccountModel from '../modules/models/Account.model';
import RecurringModel from '../modules/models/Recurring.model';
import MovementModel from '../modules/models/Movement.model';

describe('Recurring run e2e', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;
    let accountId: string;
    let categoryId: string;
    let recurringId: string;

    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();

        const account = await AccountModel.create({ Name: 'Recurring Account', Type: 'banco' });
        accountId = account._id.toString();

        const category = await CategoryModel.create({
            Description: 'Recurring subscription category',
            Name: 'Subscriptions',
            Type: 'fijo',
        });
        categoryId = category._id.toString();

        const recurring = await RecurringModel.create({
            Type: 'egreso',
            Amount: 350,
            Category: categoryId,
            Account: accountId,
            Description: 'Streaming subscription',
            Frequency: 'mensual',
            DayOfMonth: 15,
            Active: true,
            LastRunYearMonth: null,
        });
        recurringId = recurring._id.toString();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    it('materializes a due recurring into a Movement and stamps LastRunYearMonth on first run', async () => {
        const response = await testApp.request
            .post('/recurring/run')
            .set('Authorization', authHeader());

        expect(response.status).toBe(200);

        const createdMovements = response.body as Array<Record<string, unknown>>;
        expect(createdMovements).toHaveLength(1);
        expect(createdMovements[0].Type).toBe('egreso');
        expect(createdMovements[0].Amount).toBe(350);
        expect(createdMovements[0].Account).toBe(accountId);
        expect(createdMovements[0].Category).toBe(categoryId);

        const persistedMovements = await MovementModel.find({ Account: accountId, Category: categoryId });
        expect(persistedMovements).toHaveLength(1);
        expect(persistedMovements[0].Amount).toBe(350);

        const updatedRecurring = await RecurringModel.findById(recurringId);
        expect(updatedRecurring?.LastRunYearMonth).toBe(currentYearMonth);
    });

    it('does not duplicate the Movement on an immediate second run', async () => {
        const response = await testApp.request
            .post('/recurring/run')
            .set('Authorization', authHeader());

        expect(response.status).toBe(200);

        const createdMovements = response.body as Array<Record<string, unknown>>;
        expect(createdMovements).toHaveLength(0);

        const persistedMovements = await MovementModel.find({ Account: accountId, Category: categoryId });
        expect(persistedMovements).toHaveLength(1);
    });
});

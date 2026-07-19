import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import { AccountModel } from '../contexts/account';
import { CategoryModel } from '../contexts/category';

describe('Movement e2e', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;
    let accountId: string;
    let categoryId: string;

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();

        const account = await AccountModel.create({ Name: 'Checking', Type: 'banco' });
        accountId = account._id.toString();

        const category = await CategoryModel.create({
            Description: 'Groceries category',
            Name: 'Groceries',
            Type: 'variable',
        });
        categoryId = category._id.toString();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    describe('create then fetch current month', () => {
        it('creates a movement and returns it with a populated Category via GET /movement/month', async () => {
            const today = new Date().toISOString().slice(0, 10);

            const createResponse = await testApp.request
                .post('/movement/')
                .set('Authorization', authHeader())
                .send({
                    Type: 'egreso',
                    Amount: 500,
                    Category: categoryId,
                    Account: accountId,
                    Date: today,
                    Description: 'Weekly groceries',
                });

            expect(createResponse.status).toBe(201);
            const createdId = createResponse.body._id as string;

            const fetchResponse = await testApp.request
                .get('/movement/month')
                .set('Authorization', authHeader());

            expect(fetchResponse.status).toBe(200);
            const found = (fetchResponse.body as Array<Record<string, unknown>>).find(
                (movement) => movement._id === createdId,
            );

            expect(found).toBeDefined();
            // Characterization note (deviation from the assumed spec premise): Category
            // schema field is `Schema.Types.ObjectId` with `ref: 'Category'` (not String),
            // and `MovementService.find()` already chains `.populate('Category')` at the
            // query level, so the array resolved by `await MovementService.find(...)` is
            // already populated before the controller's own (redundant, unawaited,
            // effectively dead-code) `movement.populate('Category')` forEach call runs.
            // The real, current, as-is behavior is a POPULATED Category object here, not
            // a raw id string — verified empirically via a first RED run of this test.
            expect(typeof found?.Category).toBe('object');
            expect((found?.Category as { _id: string })._id).toBe(categoryId);
            expect((found?.Category as { Name: string }).Name).toBe('Groceries');
        });
    });

    describe('summary by month/year', () => {
        it('reflects item count and income/expense sums for seeded movements', async () => {
            await AccountModel.create({ Name: 'Summary Account', Type: 'banco' }).then(async (summaryAccount) => {
                await CategoryModel.create({
                    Description: 'Summary category',
                    Name: 'Summary',
                    Type: 'variable',
                }).then(async (summaryCategory) => {
                    const seed = [
                        { Type: 'ingreso', Amount: 1000, Date: new Date(2000, 5, 10) },
                        { Type: 'egreso', Amount: 200, Date: new Date(2000, 5, 15) },
                        { Type: 'egreso', Amount: 100, Date: new Date(2000, 5, 20) },
                    ];

                    const { MovementModel } = await import('../contexts/movement');
                    await MovementModel.insertMany(
                        seed.map((movement) => ({
                            ...movement,
                            Account: summaryAccount._id,
                            Category: summaryCategory._id,
                        })),
                    );
                });
            });

            const summaryResponse = await testApp.request
                .get('/movement/summary/6/2000')
                .set('Authorization', authHeader());

            expect(summaryResponse.status).toBe(200);
            expect(summaryResponse.body.month).toBe(6);
            expect(summaryResponse.body.year).toBe(2000);
            expect(summaryResponse.body.summary).toEqual({
                items: 3,
                amount: { income: 1000, expense: 300 },
            });
        });
    });

    describe('update and delete', () => {
        it('updates the movement then deletes it, and a second delete returns 404', async () => {
            const createResponse = await testApp.request
                .post('/movement/')
                .set('Authorization', authHeader())
                .send({
                    Type: 'egreso',
                    Amount: 50,
                    Category: categoryId,
                    Account: accountId,
                    Date: '2010-03-15',
                });

            expect(createResponse.status).toBe(201);
            const id = createResponse.body._id as string;

            const updateResponse = await testApp.request
                .put(`/movement/${id}`)
                .set('Authorization', authHeader())
                .send({ Amount: 750 });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.Amount).toBe(750);
            expect(updateResponse.body._id).toBe(id);

            const deleteResponse = await testApp.request
                .delete(`/movement/${id}`)
                .set('Authorization', authHeader());

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toEqual({ deleted: true, id });

            const secondDeleteResponse = await testApp.request
                .delete(`/movement/${id}`)
                .set('Authorization', authHeader());

            expect(secondDeleteResponse.status).toBe(404);
            expect(secondDeleteResponse.body.message).toBe('Movement not found');
        });
    });

    describe('bulk save', () => {
        it('persists every movement from a single POST /movement/save call', async () => {
            const payload = [
                {
                    Type: 'egreso',
                    Amount: 30,
                    Category: categoryId,
                    Account: accountId,
                    Date: '2010-01-15',
                    Description: 'Bulk item 1',
                },
                {
                    Type: 'ingreso',
                    Amount: 400,
                    Category: categoryId,
                    Account: accountId,
                    Date: '2010-02-20',
                    Description: 'Bulk item 2',
                },
            ];

            const bulkResponse = await testApp.request
                .post('/movement/save')
                .set('Authorization', authHeader())
                .send(payload);

            expect(bulkResponse.status).toBe(201);
            expect(bulkResponse.body).toHaveLength(2);
            expect(bulkResponse.body.map((movement: Record<string, unknown>) => movement.Amount)).toEqual([30, 400]);
            expect(bulkResponse.body.every((movement: Record<string, unknown>) => typeof movement._id === 'string')).toBe(true);
        });
    });
});

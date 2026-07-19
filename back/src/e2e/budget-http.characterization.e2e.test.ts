import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import { CategoryModel } from '../contexts/category';

/**
 * Characterization baseline for PR3 (back-hexagonal-budget, task 3.1, design
 * D2). Captured against the still-live layer-first `budget.route.ts` BEFORE
 * any `http/` adapter file in `contexts/budget` was created (PR3, task 3.1),
 * then reran unmodified after `_routes.ts` flipped to
 * `createBudgetRouter(getContainer().budget)` to prove the new hex path
 * (`createBudgetController`/`BudgetRepository`/`MovementGateway`) is
 * byte-identical.
 *
 * This is the ONLY safety net for design D2's populated-vs-bare-id `Category`
 * divergence: `find`/`findById` echo the FULL populated `Category`
 * sub-document (`.populate('Category')`), while `create`/`update` echo the
 * BARE Category id string — `InMemoryBudgetRepository` cannot express
 * `.populate()`, so no unit/contract test catches a regression here.
 *
 * Why these exact keys: `successResponse(res, data)` serializes whatever
 * `BudgetService`/raw Mongoose resolves. `BudgetModel` has `timestamps:true`/
 * `versionKey:false` — CRUD responses carry
 * `_id, Category, Month, Year, Limit, createdAt, updatedAt` (no `__v`).
 * `CategoryModel` has `versionKey:false`/`timestamps:false` — a populated
 * `Category` sub-document carries `_id, Description, Name, Tag, Type, Icon, Color`
 * (no `createdAt`/`updatedAt`/`__v`). `budget.e2e.test.ts` already covers the
 * `GetStatus` Spent/Remaining/Percent computation in depth; this suite adds
 * only a shape check for status's populated `Category` and focuses on the 5
 * CRUD endpoints (list, get-by-id, create, update, delete) plus the 11000
 * duplicate-key message and the hard-delete semantics.
 */
describe('budget HTTP characterization (current, unwired, pre-refactor baseline)', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;
    let categoryId: string;
    let otherCategoryId: string;

    const expectedCreateUpdateKeys = [
        '_id',
        'Category',
        'Month',
        'Year',
        'Limit',
        'createdAt',
        'updatedAt',
    ].sort();

    const expectedPopulatedCategoryKeys = [
        '_id',
        'Description',
        'Name',
        'Tag',
        'Type',
        'Icon',
        'Color',
    ].sort();

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();

        const category = await CategoryModel.create({
            Description: 'Groceries budget category',
            Name: 'Groceries Budget',
            Type: 'variable',
        });
        categoryId = category._id.toString();

        const otherCategory = await CategoryModel.create({
            Description: 'Entertainment budget category',
            Name: 'Entertainment Budget',
            Type: 'variable',
        });
        otherCategoryId = otherCategory._id.toString();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    describe('POST /budget (create)', () => {
        it('returns 201 with the persisted budget, echoing Category as a BARE id string (not populated)', async () => {
            const response = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 3, Year: 2021, Limit: 500 });

            expect(response.status).toBe(201);
            expect(Object.keys(response.body).sort()).toEqual(expectedCreateUpdateKeys);
            expect(response.body.Category).toBe(categoryId);
            expect(response.body.Month).toBe(3);
            expect(response.body.Year).toBe(2021);
            expect(response.body.Limit).toBe(500);
            expect(typeof response.body._id).toBe('string');
            expect(typeof response.body.createdAt).toBe('string');
            expect(typeof response.body.updatedAt).toBe('string');
        });

        it('rejects an unexpected key with 400 (mass-assignment guard, checkKeys)', async () => {
            const response = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 4, Year: 2021, Limit: 100, Evil: 'x' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('rejects a missing Category with 400', async () => {
            const response = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Month: 4, Year: 2021, Limit: 100 });

            expect(response.status).toBe(400);
        });

        it('rejects a missing Month with 400', async () => {
            const response = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Year: 2021, Limit: 100 });

            expect(response.status).toBe(400);
        });

        it('rejects a missing Year with 400', async () => {
            const response = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 4, Limit: 100 });

            expect(response.status).toBe(400);
        });

        it('rejects a missing Limit with 400', async () => {
            const response = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 4, Year: 2021 });

            expect(response.status).toBe(400);
        });

        it('rejects an out-of-range Month with 400', async () => {
            const response = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 13, Year: 2021, Limit: 100 });

            expect(response.status).toBe(400);
        });

        it('reproduces the duplicate-key (11000) error verbatim for the same Category/Month/Year', async () => {
            await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 5, Year: 2021, Limit: 200 });

            const duplicate = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 5, Year: 2021, Limit: 300 });

            expect(duplicate.status).toBe(400);
            expect(duplicate.body).toEqual({
                message: 'A budget already exists for this category in this month/year',
            });
        });
    });

    describe('GET /budget (list) and GET /budget/:id', () => {
        it('echoes Category as a POPULATED sub-document on both list and get-by-id, and 404s a missing id', async () => {
            const created = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 6, Year: 2022, Limit: 750 });
            const id = created.body._id as string;

            const list = await testApp.request.get('/budget').set('Authorization', authHeader());
            expect(list.status).toBe(200);
            const listEntry = (list.body as Array<Record<string, unknown>>).find((b) => b._id === id);
            expect(listEntry).toBeDefined();
            expect(Object.keys(listEntry as object).sort()).toEqual(expectedCreateUpdateKeys);
            const listCategory = listEntry?.Category as Record<string, unknown>;
            expect(Object.keys(listCategory).sort()).toEqual(expectedPopulatedCategoryKeys);
            expect(listCategory._id).toBe(categoryId);
            expect(listCategory.Name).toBe('Groceries Budget');

            const fetched = await testApp.request.get(`/budget/${id}`).set('Authorization', authHeader());
            expect(fetched.status).toBe(200);
            expect(Object.keys(fetched.body).sort()).toEqual(expectedCreateUpdateKeys);
            const fetchedCategory = fetched.body.Category as Record<string, unknown>;
            expect(Object.keys(fetchedCategory).sort()).toEqual(expectedPopulatedCategoryKeys);
            expect(fetchedCategory._id).toBe(categoryId);

            const missing = await testApp.request
                .get('/budget/507f1f77bcf86cd799439011')
                .set('Authorization', authHeader());
            expect(missing.status).toBe(404);
            expect(missing.body).toEqual({ message: 'Budget not found' });
        });
    });

    describe('PUT /budget/:id (partial update)', () => {
        it('applies a partial update, echoes Category as a BARE id string (not populated), and 404s a missing id', async () => {
            const created = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 7, Year: 2022, Limit: 400 });
            const id = created.body._id as string;

            const updated = await testApp.request
                .put(`/budget/${id}`)
                .set('Authorization', authHeader())
                .send({ Limit: 900 });

            expect(updated.status).toBe(200);
            expect(Object.keys(updated.body).sort()).toEqual(expectedCreateUpdateKeys);
            expect(updated.body.Limit).toBe(900);
            expect(updated.body.Month).toBe(7);
            expect(updated.body.Category).toBe(categoryId);

            const invalidMonth = await testApp.request
                .put(`/budget/${id}`)
                .set('Authorization', authHeader())
                .send({ Month: 13 });
            expect(invalidMonth.status).toBe(400);

            const missing = await testApp.request
                .put('/budget/507f1f77bcf86cd799439011')
                .set('Authorization', authHeader())
                .send({ Limit: 1 });
            expect(missing.status).toBe(404);
            expect(missing.body).toEqual({ message: 'Budget not found' });
        });

        it('reproduces the duplicate-key (11000) error verbatim when an update collides with another budget', async () => {
            const first = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 8, Year: 2022, Limit: 100 });
            const second = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: otherCategoryId, Month: 8, Year: 2022, Limit: 200 });

            const collision = await testApp.request
                .put(`/budget/${second.body._id}`)
                .set('Authorization', authHeader())
                .send({ Category: categoryId });

            expect(collision.status).toBe(400);
            expect(collision.body).toEqual({
                message: 'A budget already exists for this category in this month/year',
            });
            void first;
        });
    });

    describe('DELETE /budget/:id (hard delete)', () => {
        it('permanently removes the document (200, then a subsequent GET 404s), and 404s a missing id', async () => {
            const created = await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 9, Year: 2023, Limit: 250 });
            const id = created.body._id as string;

            const deleted = await testApp.request.delete(`/budget/${id}`).set('Authorization', authHeader());
            expect(deleted.status).toBe(200);
            expect(deleted.body).toEqual({ deleted: true, id });

            const goneNow = await testApp.request.get(`/budget/${id}`).set('Authorization', authHeader());
            expect(goneNow.status).toBe(404);
            expect(goneNow.body).toEqual({ message: 'Budget not found' });

            const missing = await testApp.request
                .delete('/budget/507f1f77bcf86cd799439011')
                .set('Authorization', authHeader());
            expect(missing.status).toBe(404);
            expect(missing.body).toEqual({ message: 'Budget not found' });
        });
    });

    describe('GET /budget/status/:month/:year', () => {
        it('echoes Category as a POPULATED sub-document within each status entry', async () => {
            await testApp.request
                .post('/budget')
                .set('Authorization', authHeader())
                .send({ Category: categoryId, Month: 10, Year: 2024, Limit: 300 });

            const response = await testApp.request
                .get('/budget/status/10/2024')
                .set('Authorization', authHeader());

            expect(response.status).toBe(200);
            const entries = response.body as Array<Record<string, unknown>>;
            const entry = entries.find((e) => (e.Category as { _id: string })._id === categoryId);
            expect(entry).toBeDefined();
            const entryCategory = entry?.Category as Record<string, unknown>;
            expect(Object.keys(entryCategory).sort()).toEqual(expectedPopulatedCategoryKeys);
            expect(Object.keys(entry as object).sort()).toEqual(
                ['Category', 'Limit', 'Spent', 'Remaining', 'Percent'].sort(),
            );
        });

        it('rejects an invalid month param with 400', async () => {
            const response = await testApp.request
                .get('/budget/status/13/2024')
                .set('Authorization', authHeader());

            expect(response.status).toBe(400);
        });
    });
});

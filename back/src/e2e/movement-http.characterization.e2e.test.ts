import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import { AccountModel } from '../contexts/account';
import { CategoryModel } from '../contexts/category';

/**
 * Characterization baseline for PR3 (back-hexagonal-movement, task 3.1, design D1).
 *
 * Captures the BYTE-EXACT response shape `GET /movement/month`,
 * `POST /movement`, and `GET /movement/summary/:month/:year` return TODAY,
 * against the still-live layer-first `movement.route.ts`, BEFORE any `http/`
 * adapter file in `contexts/movement` is created. `movement.e2e.test.ts`
 * already asserts a subset of these fields (populated Category object); this
 * suite locks down every key so `MovementMapper.toView`'s wire body is
 * provably identical once `_routes.ts` flips to
 * `createMovementRouter(getContainer().movement)`.
 *
 * Why these exact keys: the legacy controller's `successResponse(res, movements)`
 * serializes whatever `MovementService.find(...)` resolves — Mongoose
 * documents with `timestamps:true`/`versionKey:false`
 * (`_id, Type, Amount, Date, Category, Account, Description, Card, createdAt,
 * updatedAt`, no `__v`, no `TransferId` when unset since it's
 * `required:false` with no default). The populated `Category` sub-document
 * carries the `contexts/category` `CategoryModel` shape (`timestamps:false`,
 * `versionKey:false`): `_id, Description, Name, Tag, Type, Icon`.
 */
describe('movement HTTP characterization (current, unwired, pre-refactor baseline)', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;
    let accountId: string;
    let categoryId: string;

    const expectedMovementKeys = [
        '_id',
        'Account',
        'Amount',
        'Card',
        'Category',
        'Date',
        'Description',
        'Type',
        'createdAt',
        'updatedAt',
    ].sort();

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();

        const account = await AccountModel.create({ Name: 'Characterization Checking', Type: 'banco' });
        accountId = account._id.toString();

        const category = await CategoryModel.create({
            Description: 'Characterization category',
            Name: 'Characterization',
            Type: 'variable',
            Tag: 'char-tag',
        });
        categoryId = category._id.toString();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    it('GET /movement/month returns the exact byte-shape with a populated Category sub-document', async () => {
        const today = new Date().toISOString().slice(0, 10);

        const createResponse = await testApp.request
            .post('/movement/')
            .set('Authorization', authHeader())
            .send({
                Type: 'egreso',
                Amount: 321,
                Category: categoryId,
                Account: accountId,
                Date: today,
                Description: 'Characterization groceries',
                Card: 'char-card',
            });

        expect(createResponse.status).toBe(201);
        expect(Object.keys(createResponse.body).sort()).toEqual(expectedMovementKeys);
        // write echo: Category is an UNPOPULATED id string (create/findByIdAndUpdate are not populated)
        expect(createResponse.body.Category).toBe(categoryId);
        expect(createResponse.body.Account).toBe(accountId);

        const createdId = createResponse.body._id as string;

        const fetchResponse = await testApp.request
            .get('/movement/month')
            .set('Authorization', authHeader());

        expect(fetchResponse.status).toBe(200);
        const found = (fetchResponse.body as Array<Record<string, unknown>>).find(
            (movement) => movement._id === createdId,
        );

        expect(found).toBeDefined();
        expect(Object.keys(found as object).sort()).toEqual(expectedMovementKeys);

        expect(found?.Type).toBe('egreso');
        expect(found?.Amount).toBe(321);
        expect(found?.Account).toBe(accountId);
        expect(found?.Card).toBe('char-card');
        expect(found?.Description).toBe('Characterization groceries');

        const category = found?.Category as Record<string, unknown>;
        expect(typeof category).toBe('object');
        expect(Object.keys(category).sort()).toEqual(['Description', 'Icon', 'Name', 'Tag', 'Type', '_id'].sort());
        expect(category._id).toBe(categoryId);
        expect(category.Name).toBe('Characterization');
        expect(category.Description).toBe('Characterization category');
        expect(category.Tag).toBe('char-tag');
        expect(category.Type).toBe('variable');
    });

    it('POST /movement/ defaults Card/Description to empty strings and omits TransferId when not provided', async () => {
        const createResponse = await testApp.request
            .post('/movement/')
            .set('Authorization', authHeader())
            .send({
                Type: 'ingreso',
                Amount: 15,
                Category: categoryId,
                Account: accountId,
                Date: '2015-05-05',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.Card).toBe('');
        expect(createResponse.body.Description).toBe('');
        expect(Object.keys(createResponse.body)).not.toContain('TransferId');
        expect(Object.keys(createResponse.body)).not.toContain('__v');
    });

    it('GET /movement/summary/:month/:year returns the exact byte-shape with income/expense split', async () => {
        const summaryAccount = await AccountModel.create({ Name: 'Characterization Summary Account', Type: 'banco' });
        const summaryCategory = await CategoryModel.create({
            Description: 'Characterization summary category',
            Name: 'Characterization summary',
            Type: 'variable',
        });

        const { MovementModel } = await import('../contexts/movement');
        await MovementModel.insertMany([
            { Type: 'ingreso', Amount: 500, Date: new Date(1999, 2, 10), Account: summaryAccount._id, Category: summaryCategory._id },
            { Type: 'egreso', Amount: 125, Date: new Date(1999, 2, 15), Account: summaryAccount._id, Category: summaryCategory._id },
        ]);

        const summaryResponse = await testApp.request
            .get('/movement/summary/3/1999')
            .set('Authorization', authHeader());

        expect(summaryResponse.status).toBe(200);
        expect(Object.keys(summaryResponse.body).sort()).toEqual(['month', 'movements', 'summary', 'year'].sort());
        expect(summaryResponse.body.month).toBe(3);
        expect(summaryResponse.body.year).toBe(1999);
        expect(Object.keys(summaryResponse.body.summary).sort()).toEqual(['amount', 'items']);
        expect(summaryResponse.body.summary.items).toBe(2);
        expect(summaryResponse.body.summary.amount).toEqual({ income: 500, expense: 125 });
        expect(summaryResponse.body.movements).toHaveLength(2);
        expect(Object.keys(summaryResponse.body.movements[0]).sort()).toEqual(expectedMovementKeys);
    });
});

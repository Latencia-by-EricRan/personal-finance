import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import CategoryModel from '../modules/models/Category.model';

describe('Category e2e', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    describe('create upserts by Tag when Tag is present', () => {
        const TAG = 'category-e2e-rent-tag';

        it('updates the existing document instead of creating a duplicate', async () => {
            const first = await testApp.request
                .post('/category/')
                .set('Authorization', authHeader())
                .send({ Name: 'Rent (first name)', Description: 'Monthly rent', Type: 'fijo', Tag: TAG });

            expect(first.status).toBe(201);
            expect(first.body.Tag).toBe(TAG);
            expect(first.body.Name).toBe('Rent (first name)');

            const second = await testApp.request
                .post('/category/')
                .set('Authorization', authHeader())
                .send({ Name: 'Rent (renamed)', Description: 'Monthly rent renamed', Type: 'fijo', Tag: TAG });

            expect(second.status).toBe(201);
            expect(second.body._id).toBe(first.body._id);
            expect(second.body.Name).toBe('Rent (renamed)');

            const matching = await CategoryModel.find({ Tag: TAG });
            expect(matching).toHaveLength(1);
            expect(matching[0].Name).toBe('Rent (renamed)');
        });
    });

    describe('create upserts by Name when Tag is absent', () => {
        const NAME = 'category-e2e-utilities-name';

        it('updates the existing document instead of creating a duplicate', async () => {
            const first = await testApp.request
                .post('/category/')
                .set('Authorization', authHeader())
                .send({ Name: NAME, Description: 'Utilities (first)', Type: 'variable' });

            expect(first.status).toBe(201);
            expect(first.body.Name).toBe(NAME);

            const second = await testApp.request
                .post('/category/')
                .set('Authorization', authHeader())
                .send({ Name: NAME, Description: 'Utilities (updated)', Type: 'variable' });

            expect(second.status).toBe(201);
            expect(second.body._id).toBe(first.body._id);
            expect(second.body.Description).toBe('Utilities (updated)');

            const matching = await CategoryModel.find({ Name: NAME });
            expect(matching).toHaveLength(1);
            expect(matching[0].Description).toBe('Utilities (updated)');
        });
    });

    describe('bulk save', () => {
        const TAG_A = 'category-e2e-bulk-a';
        const TAG_B = 'category-e2e-bulk-b';

        it('creates multiple categories in one call and persists all of them', async () => {
            const response = await testApp.request
                .post('/category/save')
                .set('Authorization', authHeader())
                .send([
                    { Name: 'Bulk A', Description: 'Bulk category A', Type: 'variable', Tag: TAG_A },
                    { Name: 'Bulk B', Description: 'Bulk category B', Type: 'fijo', Tag: TAG_B },
                ]);

            expect(response.status).toBe(201);
            expect(response.body.upsertedCount).toBe(2);

            const persistedA = await CategoryModel.findOne({ Tag: TAG_A });
            const persistedB = await CategoryModel.findOne({ Tag: TAG_B });

            expect(persistedA?.Name).toBe('Bulk A');
            expect(persistedB?.Name).toBe('Bulk B');
        });
    });

    describe('delete', () => {
        it('removes the category so it is no longer returned by the list endpoint', async () => {
            const created = await testApp.request
                .post('/category/')
                .set('Authorization', authHeader())
                .send({ Name: 'category-e2e-to-delete', Description: 'Will be deleted', Type: 'variable' });

            expect(created.status).toBe(201);
            const id = created.body._id as string;

            const deleteResponse = await testApp.request
                .delete(`/category/${id}`)
                .set('Authorization', authHeader());

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toEqual({ deleted: true, id });

            const list = await testApp.request
                .get('/category/')
                .set('Authorization', authHeader());

            expect(list.status).toBe(200);
            const ids = (list.body as Array<{ _id: string }>).map((category) => category._id);
            expect(ids).not.toContain(id);
        });
    });
});

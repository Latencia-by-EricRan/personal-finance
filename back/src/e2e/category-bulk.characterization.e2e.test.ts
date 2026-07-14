import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';

/**
 * Characterization baseline for PR2 (back-hexagonal-category, task 2.1).
 *
 * Captures the BYTE-EXACT shape `POST /category/save` returns TODAY, against
 * the still-live layer-first route, BEFORE any `BulkUpsertResult` DTO/mapper
 * is introduced in `contexts/category`. `CategoryMapper.toBulkResponse` (added
 * later in this PR, unwired to HTTP) is unit-tested against this exact shape
 * so its wire body is provably identical once PR3 flips `_routes.ts` to the
 * new context.
 *
 * Why exactly these 7 keys: `category.controller.ts#manySaveCategory` calls
 * `successResponse(res, await CategoryService.manySave(req.body), 201)`,
 * which is `res.json(bulkWriteResult)` under the hood. The mongodb driver's
 * `BulkWriteResult` class (`node_modules/mongodb/lib/bulk/common.js`) assigns
 * exactly `insertedCount, matchedCount, modifiedCount, deletedCount,
 * upsertedCount, upsertedIds, insertedIds` as own-enumerable instance
 * properties and marks `result` non-enumerable via `Object.defineProperty`,
 * so `JSON.stringify`/`res.json` only ever serializes those 7 fields, with
 * ObjectIds serialized to their hex string via `ObjectId#toJSON`.
 */
describe('POST /category/save characterization (current, unwired, pre-refactor baseline)', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    it('returns the exact 7-field BulkWriteResult shape for a batch of new categories', async () => {
        const response = await testApp.request
            .post('/category/save')
            .set('Authorization', `Bearer ${token}`)
            .send([
                { Name: 'Characterization A', Description: 'A', Type: 'variable', Tag: 'char-a' },
                { Name: 'Characterization B', Description: 'B', Type: 'fijo', Tag: 'char-b' },
            ]);

        expect(response.status).toBe(201);
        expect(Object.keys(response.body).sort()).toEqual([
            'deletedCount',
            'insertedCount',
            'insertedIds',
            'matchedCount',
            'modifiedCount',
            'upsertedCount',
            'upsertedIds',
        ]);

        expect(response.body.insertedCount).toBe(0);
        expect(response.body.matchedCount).toBe(0);
        expect(response.body.modifiedCount).toBe(0);
        expect(response.body.deletedCount).toBe(0);
        expect(response.body.upsertedCount).toBe(2);
        expect(response.body.insertedIds).toEqual({});
        expect(Object.keys(response.body.upsertedIds).sort()).toEqual(['0', '1']);
        expect(response.body.upsertedIds[0]).toMatch(/^[a-f0-9]{24}$/i);
        expect(response.body.upsertedIds[1]).toMatch(/^[a-f0-9]{24}$/i);
    });

    it('returns matchedCount/modifiedCount (not upsertedCount) when re-saving an existing key, with both id maps empty', async () => {
        const first = await testApp.request
            .post('/category/save')
            .set('Authorization', `Bearer ${token}`)
            .send([{ Name: 'Characterization Repeat', Description: 'first', Type: 'variable', Tag: 'char-repeat' }]);
        expect(first.status).toBe(201);

        const second = await testApp.request
            .post('/category/save')
            .set('Authorization', `Bearer ${token}`)
            .send([{ Name: 'Characterization Repeat', Description: 'updated', Type: 'variable', Tag: 'char-repeat' }]);

        expect(second.status).toBe(201);
        expect(second.body.upsertedCount).toBe(0);
        expect(second.body.matchedCount).toBe(1);
        expect(second.body.modifiedCount).toBe(1);
        expect(second.body.upsertedIds).toEqual({});
        expect(second.body.insertedIds).toEqual({});
    });
});

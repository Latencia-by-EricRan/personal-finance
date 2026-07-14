import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import AccountModel from '../modules/models/Account.model';

/**
 * Characterization baseline for PR3 (back-hexagonal-account, task 3.1, design D2).
 *
 * Captured against the still-live layer-first `account.route.ts` BEFORE any
 * `http/` adapter file in `contexts/account` was created (PR3, task 3.1),
 * then reran unmodified after `_routes.ts` flipped to
 * `createAccountRouter(getContainer().account)` to prove the new hex path
 * (`createAccountController`/`AccountRepository`/`MovementGateway`) is
 * byte-identical. The legacy `account.route.ts` was deleted in PR4;
 * `AccountModel` is still imported through the retained
 * `modules/models/Account.model.ts` shim. `account.e2e.test.ts` already
 * covers `/account/transfer`'s TransferId-sharing behavior; this suite locks
 * down every key across ALL 7 endpoints (list, get-by-id, create, update,
 * archive-delete, balance, transfer).
 *
 * Why these exact keys: `successResponse(res, data)` serializes whatever
 * `AccountService`/raw Mongoose resolves. `AccountModel` has
 * `timestamps:true`/`versionKey:false` — CRUD responses carry
 * `_id, Name, Type, Currency, Icon, Archived, createdAt, updatedAt` (no
 * `__v`). Transfer writes raw `MovementModel` documents bypassing the
 * `Movement` aggregate — `Category` is optional/unset on transfer-generated
 * movements, so it is ABSENT from the response (mirrors
 * `movement-http.characterization.e2e.test.ts`'s no-Category assertion
 * style), while `Description`/`Card` schema-default to `''` and `TransferId`
 * is present as a shared string on both legs.
 */
describe('account HTTP characterization (current, unwired, pre-refactor baseline)', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;

    const expectedAccountKeys = [
        '_id',
        'Name',
        'Type',
        'Currency',
        'Icon',
        'Archived',
        'createdAt',
        'updatedAt',
    ].sort();

    const expectedTransferMovementKeys = [
        '_id',
        'Type',
        'Amount',
        'Date',
        'Account',
        'Description',
        'Card',
        'TransferId',
        'createdAt',
        'updatedAt',
    ].sort();

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    describe('POST /account (create)', () => {
        it('returns 201 with the persisted account, defaulting Currency to ARS and Icon to empty string', async () => {
            const response = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Characterization Checking', Type: 'banco' });

            expect(response.status).toBe(201);
            expect(Object.keys(response.body).sort()).toEqual(expectedAccountKeys);
            expect(response.body.Name).toBe('Characterization Checking');
            expect(response.body.Type).toBe('banco');
            expect(response.body.Currency).toBe('ARS');
            expect(response.body.Icon).toBe('');
            expect(response.body.Archived).toBe(false);
            expect(typeof response.body._id).toBe('string');
            expect(typeof response.body.createdAt).toBe('string');
            expect(typeof response.body.updatedAt).toBe('string');
        });

        it('accepts explicit Currency/Icon/Archived and echoes them back', async () => {
            const response = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({
                    Name: 'Characterization Savings',
                    Type: 'efectivo',
                    Currency: 'USD',
                    Icon: '💵',
                    Archived: false,
                });

            expect(response.status).toBe(201);
            expect(response.body.Currency).toBe('USD');
            expect(response.body.Icon).toBe('💵');
        });

        it('rejects an unexpected key with 400 (mass-assignment guard, checkKeys)', async () => {
            const response = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Bad', Type: 'banco', Evil: 'x' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('rejects a missing Name with 400', async () => {
            const response = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Type: 'banco' });

            expect(response.status).toBe(400);
        });

        it('rejects a missing Type with 400', async () => {
            const response = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'No Type' });

            expect(response.status).toBe(400);
        });

        it('rejects an invalid Type enum value with 400', async () => {
            const response = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Invalid Type', Type: 'invalid-type' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /account (list) and GET /account/:id', () => {
        it('excludes archived accounts by default, honors includeArchived=true, and 404s a missing id', async () => {
            const active = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'List Active', Type: 'banco' });
            const activeId = active.body._id as string;

            const toArchive = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'List To Archive', Type: 'banco' });
            const archivedId = toArchive.body._id as string;
            await testApp.request.delete(`/account/${archivedId}`).set('Authorization', authHeader());

            const defaultList = await testApp.request.get('/account').set('Authorization', authHeader());
            expect(defaultList.status).toBe(200);
            const defaultIds = (defaultList.body as Array<Record<string, unknown>>).map((a) => a._id);
            expect(defaultIds).toContain(activeId);
            expect(defaultIds).not.toContain(archivedId);
            expect(Object.keys(defaultList.body[0]).sort()).toEqual(expectedAccountKeys);

            const includeArchivedList = await testApp.request
                .get('/account?includeArchived=true')
                .set('Authorization', authHeader());
            expect(includeArchivedList.status).toBe(200);
            const includeArchivedIds = (includeArchivedList.body as Array<Record<string, unknown>>).map((a) => a._id);
            expect(includeArchivedIds).toContain(activeId);
            expect(includeArchivedIds).toContain(archivedId);

            const fetched = await testApp.request.get(`/account/${activeId}`).set('Authorization', authHeader());
            expect(fetched.status).toBe(200);
            expect(fetched.body._id).toBe(activeId);
            expect(Object.keys(fetched.body).sort()).toEqual(expectedAccountKeys);

            const missing = await testApp.request
                .get('/account/507f1f77bcf86cd799439011')
                .set('Authorization', authHeader());
            expect(missing.status).toBe(404);
            expect(missing.body).toEqual({ message: 'Account not found' });
        });
    });

    describe('PUT /account/:id (partial update)', () => {
        it('applies a partial update leaving Name/Type unchanged, 400s an invalid Type, and 404s a missing id', async () => {
            const created = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Update Target', Type: 'banco' });
            const id = created.body._id as string;

            const updated = await testApp.request
                .put(`/account/${id}`)
                .set('Authorization', authHeader())
                .send({ Icon: '💰' });

            expect(updated.status).toBe(200);
            expect(updated.body.Icon).toBe('💰');
            expect(updated.body.Name).toBe('Update Target');
            expect(updated.body.Type).toBe('banco');
            expect(Object.keys(updated.body).sort()).toEqual(expectedAccountKeys);

            const invalidType = await testApp.request
                .put(`/account/${id}`)
                .set('Authorization', authHeader())
                .send({ Type: 'invalid-type' });
            expect(invalidType.status).toBe(400);

            const missing = await testApp.request
                .put('/account/507f1f77bcf86cd799439011')
                .set('Authorization', authHeader())
                .send({ Icon: '🏦' });
            expect(missing.status).toBe(404);
            expect(missing.body).toEqual({ message: 'Account not found' });
        });
    });

    describe('DELETE /account/:id (soft archive)', () => {
        it('sets Archived:true without removing the document, and 404s a missing id', async () => {
            const created = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Archive Target', Type: 'banco' });
            const id = created.body._id as string;

            const archived = await testApp.request.delete(`/account/${id}`).set('Authorization', authHeader());
            expect(archived.status).toBe(200);
            expect(archived.body.Archived).toBe(true);
            expect(Object.keys(archived.body).sort()).toEqual(expectedAccountKeys);

            const stillThere = await testApp.request.get(`/account/${id}`).set('Authorization', authHeader());
            expect(stillThere.status).toBe(200);
            expect(stillThere.body.Archived).toBe(true);

            const missing = await testApp.request
                .delete('/account/507f1f77bcf86cd799439011')
                .set('Authorization', authHeader());
            expect(missing.status).toBe(404);
            expect(missing.body).toEqual({ message: 'Account not found' });
        });
    });

    describe('GET /account/:id/balance', () => {
        it('404s before computing when the account is missing, and sums ingreso minus egreso otherwise', async () => {
            const missing = await testApp.request
                .get('/account/507f1f77bcf86cd799439011/balance')
                .set('Authorization', authHeader());
            expect(missing.status).toBe(404);
            expect(missing.body).toEqual({ message: 'Account not found' });

            const account = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Balance Account', Type: 'banco' });
            const accountId = account.body._id as string;

            const zeroBalance = await testApp.request
                .get(`/account/${accountId}/balance`)
                .set('Authorization', authHeader());
            expect(zeroBalance.status).toBe(200);
            expect(zeroBalance.body).toEqual({ Account: accountId, Balance: 0 });

            const { default: MovementModel } = await import('../modules/models/Movement.model');
            await MovementModel.insertMany([
                { Type: 'ingreso', Amount: 100, Date: new Date(2020, 0, 1), Account: accountId },
                { Type: 'egreso', Amount: 40, Date: new Date(2020, 0, 2), Account: accountId },
            ]);

            const balance = await testApp.request
                .get(`/account/${accountId}/balance`)
                .set('Authorization', authHeader());
            expect(balance.status).toBe(200);
            expect(Object.keys(balance.body).sort()).toEqual(['Account', 'Balance'].sort());
            expect(balance.body).toEqual({ Account: accountId, Balance: 60 });
        });
    });

    describe('POST /account/transfer', () => {
        it('creates a shared-TransferId egreso/ingreso pair with the byte-exact movement shape', async () => {
            const fromAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Transfer From', Type: 'banco' });
            const fromId = fromAccount.body._id as string;

            const toAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Transfer To', Type: 'banco' });
            const toId = toAccount.body._id as string;

            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: fromId,
                    To: toId,
                    Amount: 175,
                    Date: '2020-06-15',
                    Description: 'Characterization transfer',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveLength(2);

            const [egreso, ingreso] = response.body as Array<Record<string, unknown>>;

            expect(Object.keys(egreso).sort()).toEqual(expectedTransferMovementKeys);
            expect(Object.keys(ingreso).sort()).toEqual(expectedTransferMovementKeys);

            expect(egreso.Type).toBe('egreso');
            expect(egreso.Account).toBe(fromId);
            expect(egreso.Amount).toBe(175);
            expect(egreso.Description).toBe('Characterization transfer');
            expect(egreso.Card).toBe('');

            expect(ingreso.Type).toBe('ingreso');
            expect(ingreso.Account).toBe(toId);
            expect(ingreso.Amount).toBe(175);

            expect(egreso.TransferId).toBe(ingreso.TransferId);
            expect(typeof egreso.TransferId).toBe('string');
        });

        it('coerces a string Date before validation runs and still succeeds', async () => {
            const fromAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Coerce From', Type: 'banco' });
            const toAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Coerce To', Type: 'banco' });

            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: fromAccount.body._id,
                    To: toAccount.body._id,
                    Amount: 10,
                    Date: '2020-01-01',
                });

            expect(response.status).toBe(201);
        });

        it('rejects From === To with 400', async () => {
            const account = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Same Account', Type: 'banco' });
            const id = account.body._id as string;

            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({ From: id, To: id, Amount: 10, Date: '2020-01-01' });

            expect(response.status).toBe(400);
        });

        it('rejects a non-positive Amount with 400', async () => {
            const fromAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Zero From', Type: 'banco' });
            const toAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Zero To', Type: 'banco' });

            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: fromAccount.body._id,
                    To: toAccount.body._id,
                    Amount: 0,
                    Date: '2020-01-01',
                });

            expect(response.status).toBe(400);
        });

        it('rejects a non-existent From account with 404', async () => {
            const toAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Missing From Target', Type: 'banco' });

            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: '507f1f77bcf86cd799439011',
                    To: toAccount.body._id,
                    Amount: 10,
                    Date: '2020-01-01',
                });

            expect(response.status).toBe(404);
        });

        it('rejects a transfer from an archived account with 400', async () => {
            const archivedAccount = await AccountModel.create({
                Name: 'Archived Transfer Source',
                Type: 'banco',
                Archived: true,
            });
            const toAccount = await testApp.request
                .post('/account')
                .set('Authorization', authHeader())
                .send({ Name: 'Archived Transfer Target', Type: 'banco' });

            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: archivedAccount._id.toString(),
                    To: toAccount.body._id,
                    Amount: 10,
                    Date: '2020-01-01',
                });

            expect(response.status).toBe(400);
        });
    });
});

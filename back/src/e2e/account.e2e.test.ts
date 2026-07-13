import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp, stopTestApp } from '../test-utils/start-test-app';
import AccountModel from '../modules/models/Account.model';

describe('Account transfer e2e', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;
    let token: string;
    let fromAccountId: string;
    let toAccountId: string;
    let archivedAccountId: string;

    beforeAll(async () => {
        testApp = await startTestApp();
        token = await testApp.tokenFor();

        const fromAccount = await AccountModel.create({ Name: 'From Checking', Type: 'banco' });
        fromAccountId = fromAccount._id.toString();

        const toAccount = await AccountModel.create({ Name: 'To Savings', Type: 'banco' });
        toAccountId = toAccount._id.toString();

        const archivedAccount = await AccountModel.create({
            Name: 'Archived Account',
            Type: 'banco',
            Archived: true,
        });
        archivedAccountId = archivedAccount._id.toString();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    const authHeader = () => `Bearer ${token}`;

    describe('successful transfer', () => {
        it('creates two linked movements sharing a TransferId with matching amounts', async () => {
            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: fromAccountId,
                    To: toAccountId,
                    Amount: 250,
                    Date: '2010-04-01',
                    Description: 'Move to savings',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveLength(2);

            const [egresoMovement, ingresoMovement] = response.body as Array<Record<string, unknown>>;

            expect(egresoMovement.Type).toBe('egreso');
            expect(egresoMovement.Account).toBe(fromAccountId);
            expect(egresoMovement.Amount).toBe(250);

            expect(ingresoMovement.Type).toBe('ingreso');
            expect(ingresoMovement.Account).toBe(toAccountId);
            expect(ingresoMovement.Amount).toBe(250);

            expect(egresoMovement.TransferId).toBe(ingresoMovement.TransferId);
            expect(typeof egresoMovement.TransferId).toBe('string');
        });
    });

    describe('same account rejected', () => {
        it('rejects a transfer where From equals To with 400', async () => {
            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: fromAccountId,
                    To: fromAccountId,
                    Amount: 50,
                    Date: '2010-04-01',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('non-existent account rejected', () => {
        it('rejects a transfer whose From account does not exist with 404', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';

            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: nonExistentId,
                    To: toAccountId,
                    Amount: 50,
                    Date: '2010-04-01',
                });

            expect(response.status).toBe(404);
        });
    });

    describe('archived account rejected', () => {
        it('rejects a transfer whose From account is archived with 400', async () => {
            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: archivedAccountId,
                    To: toAccountId,
                    Amount: 50,
                    Date: '2010-04-01',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('non-positive amount rejected', () => {
        it('rejects a transfer with a zero amount with 400', async () => {
            const response = await testApp.request
                .post('/account/transfer')
                .set('Authorization', authHeader())
                .send({
                    From: fromAccountId,
                    To: toAccountId,
                    Amount: 0,
                    Date: '2010-04-01',
                });

            expect(response.status).toBe(400);
        });
    });
});

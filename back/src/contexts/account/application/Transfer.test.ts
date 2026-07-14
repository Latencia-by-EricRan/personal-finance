import { describe, expect, it, vi } from 'vitest';
import { InMemoryAccountRepository } from '../infrastructure/InMemoryAccountRepository';
import { InMemoryMovementGateway } from '../infrastructure/InMemoryMovementGateway';
import { CreateAccount } from './CreateAccount';
import { ArchiveAccount } from './ArchiveAccount';
import { Transfer } from './Transfer';

const buildAccount = async (repository: InMemoryAccountRepository, name: string) => new CreateAccount(repository)
    .execute({ Name: name, Type: 'efectivo' });

describe('Transfer', () => {
    it('rejects when From and To are the same account (400)', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const account = await buildAccount(accountRepository, 'A');

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: account._id, To: account._id, Amount: 10, Date: new Date(),
            }),
        ).rejects.toMatchObject({ message: 'From and To accounts must be different', statusCode: 400 });
    });

    it('rejects when Amount is not greater than 0 (400)', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const from = await buildAccount(accountRepository, 'A');
        const to = await buildAccount(accountRepository, 'B');

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: from._id, To: to._id, Amount: 0, Date: new Date(),
            }),
        ).rejects.toMatchObject({ message: 'Amount must be greater than 0', statusCode: 400 });
    });

    it('rejects when the From account does not exist (404)', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const to = await buildAccount(accountRepository, 'B');

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: '507f1f77bcf86cd799439099', To: to._id, Amount: 10, Date: new Date(),
            }),
        ).rejects.toMatchObject({ message: 'From account not found', statusCode: 404 });
    });

    it('rejects when the To account does not exist (404)', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const from = await buildAccount(accountRepository, 'A');

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: from._id, To: '507f1f77bcf86cd799439099', Amount: 10, Date: new Date(),
            }),
        ).rejects.toMatchObject({ message: 'To account not found', statusCode: 404 });
    });

    it('rejects when the From account is archived (400)', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const from = await buildAccount(accountRepository, 'A');
        const to = await buildAccount(accountRepository, 'B');
        await new ArchiveAccount(accountRepository).execute(from._id);

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: from._id, To: to._id, Amount: 10, Date: new Date(),
            }),
        ).rejects.toMatchObject({ message: 'From account is archived', statusCode: 400 });
    });

    it('rejects when the To account is archived (400)', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const from = await buildAccount(accountRepository, 'A');
        const to = await buildAccount(accountRepository, 'B');
        await new ArchiveAccount(accountRepository).execute(to._id);

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: from._id, To: to._id, Amount: 10, Date: new Date(),
            }),
        ).rejects.toMatchObject({ message: 'To account is archived', statusCode: 400 });
    });

    it('creates two movements (egreso on From, ingreso on To) sharing one TransferId', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const from = await buildAccount(accountRepository, 'A');
        const to = await buildAccount(accountRepository, 'B');

        const [egreso, ingreso] = await new Transfer(accountRepository, movementGateway).execute({
            From: from._id, To: to._id, Amount: 75, Date: new Date(2026, 6, 1), Description: 'rent',
        });

        expect(egreso.Type).toBe('egreso');
        expect(egreso.Account).toBe(from._id);
        expect(egreso.Amount).toBe(75);
        expect(ingreso.Type).toBe('ingreso');
        expect(ingreso.Account).toBe(to._id);
        expect(ingreso.Amount).toBe(75);
        expect(egreso.TransferId).toBe(ingreso.TransferId);
        expect(typeof egreso.TransferId).toBe('string');
    });

    it('rolls back the first leg and re-throws the ORIGINAL error when the second leg fails', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const from = await buildAccount(accountRepository, 'A');
        const to = await buildAccount(accountRepository, 'B');
        const originalError = new Error('ingreso creation failed');
        const deleteSpy = vi.spyOn(movementGateway, 'deleteMovement');
        vi.spyOn(movementGateway, 'createTransferMovement')
            .mockImplementationOnce((input) => InMemoryMovementGateway.prototype.createTransferMovement.call(movementGateway, input))
            .mockImplementationOnce(() => { throw originalError; });

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: from._id, To: to._id, Amount: 20, Date: new Date(),
            }),
        ).rejects.toBe(originalError);

        expect(deleteSpy).toHaveBeenCalledTimes(1);
    });

    it('logs (not throws) when the rollback delete itself fails, and still re-throws the ORIGINAL error', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const from = await buildAccount(accountRepository, 'A');
        const to = await buildAccount(accountRepository, 'B');
        const originalError = new Error('ingreso creation failed');
        const rollbackError = new Error('delete also failed');
        vi.spyOn(movementGateway, 'createTransferMovement')
            .mockImplementationOnce((input) => InMemoryMovementGateway.prototype.createTransferMovement.call(movementGateway, input))
            .mockImplementationOnce(() => { throw originalError; });
        vi.spyOn(movementGateway, 'deleteMovement').mockImplementationOnce(() => { throw rollbackError; });
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(
            new Transfer(accountRepository, movementGateway).execute({
                From: from._id, To: to._id, Amount: 20, Date: new Date(),
            }),
        ).rejects.toBe(originalError);

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});

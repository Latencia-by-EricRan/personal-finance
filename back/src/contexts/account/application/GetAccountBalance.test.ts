import { describe, expect, it, vi } from 'vitest';
import { InMemoryAccountRepository } from '../infrastructure/InMemoryAccountRepository';
import { InMemoryMovementGateway } from '../infrastructure/InMemoryMovementGateway';
import { CreateAccount } from './CreateAccount';
import { GetAccountBalance } from './GetAccountBalance';

describe('GetAccountBalance', () => {
    it('throws 404 before computing when the account does not exist (gateway is never called)', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const findByAccountSpy = vi.spyOn(movementGateway, 'findByAccount');

        await expect(
            new GetAccountBalance(accountRepository, movementGateway).execute('507f1f77bcf86cd799439099'),
        ).rejects.toMatchObject({ message: 'Account not found', statusCode: 404 });

        expect(findByAccountSpy).not.toHaveBeenCalled();
    });

    it('computes balance as income minus expense, starting from 0', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const account = await new CreateAccount(accountRepository).execute({ Name: 'Efectivo', Type: 'efectivo' });
        await movementGateway.createTransferMovement({
            Type: 'ingreso', Account: account._id, Amount: 100, Date: new Date(), TransferId: 't1',
        });
        await movementGateway.createTransferMovement({
            Type: 'egreso', Account: account._id, Amount: 40, Date: new Date(), TransferId: 't2',
        });

        const result = await new GetAccountBalance(accountRepository, movementGateway).execute(account._id);

        expect(result).toEqual({ Account: account._id, Balance: 60 });
    });

    it('returns Balance 0 when the account has no movements', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const movementGateway = new InMemoryMovementGateway();
        const account = await new CreateAccount(accountRepository).execute({ Name: 'Banco', Type: 'banco' });

        const result = await new GetAccountBalance(accountRepository, movementGateway).execute(account._id);

        expect(result).toEqual({ Account: account._id, Balance: 0 });
    });
});

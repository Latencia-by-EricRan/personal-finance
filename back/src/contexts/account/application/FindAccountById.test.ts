import { describe, expect, it } from 'vitest';
import { InMemoryAccountRepository } from '../infrastructure/InMemoryAccountRepository';
import { CreateAccount } from './CreateAccount';
import { FindAccountById } from './FindAccountById';

describe('FindAccountById', () => {
    it('returns the view when the account exists', async () => {
        const repository = new InMemoryAccountRepository();
        const created = await new CreateAccount(repository).execute({ Name: 'Efectivo', Type: 'efectivo' });

        const found = await new FindAccountById(repository).execute(created._id);

        expect(found?.Name).toBe('Efectivo');
    });

    it('returns null when the account does not exist', async () => {
        const repository = new InMemoryAccountRepository();

        const found = await new FindAccountById(repository).execute('507f1f77bcf86cd799439099');

        expect(found).toBeNull();
    });
});

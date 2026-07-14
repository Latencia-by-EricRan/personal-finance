import { describe, expect, it } from 'vitest';
import { InMemoryAccountRepository } from '../infrastructure/InMemoryAccountRepository';
import { CreateAccount } from './CreateAccount';
import { UpdateAccount } from './UpdateAccount';

describe('UpdateAccount', () => {
    it('applies a partial patch without requiring the other fields', async () => {
        const repository = new InMemoryAccountRepository();
        const created = await new CreateAccount(repository).execute({ Name: 'Efectivo', Type: 'efectivo' });

        const updated = await new UpdateAccount(repository).execute(created._id, { Icon: '💰' });

        expect(updated?.Icon).toBe('💰');
        expect(updated?.Name).toBe('Efectivo');
        expect(updated?.Type).toBe('efectivo');
    });

    it('returns null when the account does not exist', async () => {
        const repository = new InMemoryAccountRepository();

        const updated = await new UpdateAccount(repository).execute('507f1f77bcf86cd799439099', { Icon: 'x' });

        expect(updated).toBeNull();
    });
});

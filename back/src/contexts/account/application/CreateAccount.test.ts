import { describe, expect, it } from 'vitest';
import { InMemoryAccountRepository } from '../infrastructure/InMemoryAccountRepository';
import { CreateAccount } from './CreateAccount';

describe('CreateAccount', () => {
    it('creates an account and returns the persisted view', async () => {
        const useCase = new CreateAccount(new InMemoryAccountRepository());

        const created = await useCase.execute({ Name: 'Efectivo', Type: 'efectivo' });

        expect(created._id).toBeTruthy();
        expect(created.Name).toBe('Efectivo');
        expect(created.Type).toBe('efectivo');
    });

    it('applies domain defaults (Currency, Icon, Archived) when omitted', async () => {
        const useCase = new CreateAccount(new InMemoryAccountRepository());

        const created = await useCase.execute({ Name: 'Banco', Type: 'banco' });

        expect(created.Currency).toBe('ARS');
        expect(created.Icon).toBe('');
        expect(created.Archived).toBe(false);
    });

    it('rejects an invalid Type', async () => {
        const useCase = new CreateAccount(new InMemoryAccountRepository());

        await expect(useCase.execute({ Name: 'X', Type: 'invalid-type' as never })).rejects.toThrow();
    });
});

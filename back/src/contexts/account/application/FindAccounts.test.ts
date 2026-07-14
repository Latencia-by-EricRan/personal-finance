import { describe, expect, it } from 'vitest';
import { InMemoryAccountRepository } from '../infrastructure/InMemoryAccountRepository';
import { CreateAccount } from './CreateAccount';
import { FindAccounts } from './FindAccounts';

describe('FindAccounts', () => {
    it('passes the filter and pagination through to the repository', async () => {
        const repository = new InMemoryAccountRepository();
        await new CreateAccount(repository).execute({ Name: 'Efectivo', Type: 'efectivo' });
        await new CreateAccount(repository).execute({ Name: 'Banco', Type: 'banco', Archived: true });

        const useCase = new FindAccounts(repository);

        const active = await useCase.execute({ Archived: false });
        expect(active).toHaveLength(1);
        expect(active[0].Name).toBe('Efectivo');

        const all = await useCase.execute({});
        expect(all).toHaveLength(2);
    });
});

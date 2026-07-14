import { describe, expect, it } from 'vitest';
import { InMemoryAccountRepository } from '../infrastructure/InMemoryAccountRepository';
import { CreateAccount } from './CreateAccount';
import { ArchiveAccount } from './ArchiveAccount';

describe('ArchiveAccount', () => {
    it('soft-archives the account (Archived:true) without deleting it', async () => {
        const repository = new InMemoryAccountRepository();
        const created = await new CreateAccount(repository).execute({ Name: 'Efectivo', Type: 'efectivo' });

        const archived = await new ArchiveAccount(repository).execute(created._id);

        expect(archived?.Archived).toBe(true);
        expect(archived?.Name).toBe('Efectivo');
    });

    it('returns null when the account does not exist', async () => {
        const repository = new InMemoryAccountRepository();

        const archived = await new ArchiveAccount(repository).execute('507f1f77bcf86cd799439099');

        expect(archived).toBeNull();
    });
});

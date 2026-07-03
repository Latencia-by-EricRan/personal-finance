import { describe, expect, it, vi } from 'vitest';
import { seedData } from './seed';

const createMemoryModel = () => {
    const records: Array<Record<string, unknown>> = [];
    const updateOne = vi.fn(
        async (
            filter: Record<string, unknown>,
            update: { $set?: Record<string, unknown>; $setOnInsert?: Record<string, unknown> },
            options?: { upsert: boolean },
        ) => {
            const record = records.find((candidate) =>
                Object.entries(filter).every(([key, value]) => String(candidate[key]) === String(value)),
            );
            if (record) {
                Object.assign(record, update.$set);
                return { matchedCount: 1 };
            }
            if (options?.upsert && update.$setOnInsert) records.push({ ...update.$setOnInsert });
            return { matchedCount: 0 };
        },
    );
    return { records, updateOne };
};

describe('seedData', () => {
    it('produces identical records across sequential runs using reserved IDs', async () => {
        const accounts = createMemoryModel();
        const categories = createMemoryModel();
        const models = {
            accountModel: { updateOne: accounts.updateOne },
            categoryModel: { updateOne: categories.updateOne },
        } as never;

        await seedData(models);
        const firstSnapshot = JSON.stringify({ accounts: accounts.records, categories: categories.records });
        await seedData(models);

        expect(JSON.stringify({ accounts: accounts.records, categories: categories.records })).toBe(firstSnapshot);
        expect(accounts.records).toHaveLength(2);
        expect(categories.records).toHaveLength(3);
        expect(accounts.records.map(({ _id }) => String(_id))).toEqual([
            '000000000000000000000101',
            '000000000000000000000102',
        ]);
    });

    it('updates a compatible existing natural identity without replacing its ID', async () => {
        const accounts = createMemoryModel();
        accounts.records.push({ _id: 'user-owned-id', Name: 'Cash', Icon: 'old' });
        const categories = createMemoryModel();

        await seedData({
            accountModel: { updateOne: accounts.updateOne },
            categoryModel: { updateOne: categories.updateOne },
        } as never);

        expect(accounts.records.find(({ Name }) => Name === 'Cash')).toMatchObject({
            _id: 'user-owned-id',
            Icon: 'wallet',
        });
        expect(accounts.records.filter(({ Name }) => Name === 'Cash')).toHaveLength(1);
    });

    it('recovers when a concurrent seed wins the reserved-ID insert race', async () => {
        const duplicate = Object.assign(new Error('duplicate key'), { code: 11000 });
        let insertAttempted = false;
        let cashNaturalUpdates = 0;
        const accountUpdate = vi.fn(async (filter: Record<string, unknown>, update: Record<string, unknown>) => {
            if (filter.Name === 'Cash') {
                cashNaturalUpdates += 1;
                return { matchedCount: cashNaturalUpdates > 1 ? 1 : 0 };
            }
            if (filter.Name === 'Bank') return { matchedCount: 1 };
            if ('$setOnInsert' in update && !insertAttempted) {
                insertAttempted = true;
                throw duplicate;
            }
            return { matchedCount: 1 };
        });
        const categoryUpdate = vi.fn().mockResolvedValue({ matchedCount: 1 });

        await expect(
            seedData({
                accountModel: { updateOne: accountUpdate },
                categoryModel: { updateOne: categoryUpdate },
            } as never),
        ).resolves.toBeUndefined();
        expect(
            accountUpdate.mock.calls.filter(([filter, update]) => filter.Name === 'Cash' && '$set' in update),
        ).toHaveLength(2);
    });
});

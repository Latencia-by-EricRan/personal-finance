import mongoose, { Types } from 'mongoose';
import connectDB from '../src/config/database';
import AccountModel from '../src/modules/models/Account.model';
import CategoryModel from '../src/modules/models/Category.model';

const accounts = [
    {
        _id: new Types.ObjectId('000000000000000000000101'),
        Name: 'Cash',
        Type: 'efectivo',
        Currency: 'ARS',
        Icon: 'wallet',
        Archived: false,
    },
    {
        _id: new Types.ObjectId('000000000000000000000102'),
        Name: 'Bank',
        Type: 'banco',
        Currency: 'ARS',
        Icon: 'bank',
        Archived: false,
    },
] as const;

const categories = [
    {
        _id: new Types.ObjectId('000000000000000000000201'),
        Name: 'Salary',
        Description: 'Employment income',
        Type: 'fijo',
        Tag: 'income',
        Icon: 'cash',
    },
    {
        _id: new Types.ObjectId('000000000000000000000202'),
        Name: 'Food',
        Description: 'Food and groceries',
        Type: 'variable',
        Tag: 'expense',
        Icon: 'food',
    },
    {
        _id: new Types.ObjectId('000000000000000000000203'),
        Name: 'Housing',
        Description: 'Housing costs',
        Type: 'fijo',
        Tag: 'expense',
        Icon: 'home',
    },
] as const;

interface SeedWriteResult {
    matchedCount?: number;
}

interface SeedModel {
    updateOne(
        filter: Record<string, unknown>,
        update: Record<string, unknown>,
        options?: { upsert: boolean },
    ): Promise<SeedWriteResult>;
}

export interface SeedModels {
    accountModel: SeedModel;
    categoryModel: SeedModel;
}

const upsertSeed = async (
    model: SeedModel,
    identity: Record<string, unknown>,
    data: Record<string, unknown> & { _id: Types.ObjectId },
): Promise<void> => {
    const { _id, ...fields } = data;
    const existing = await model.updateOne(identity, { $set: fields });
    if ((existing.matchedCount ?? 0) > 0) return;

    try {
        await model.updateOne({ _id }, { $setOnInsert: data }, { upsert: true });
    } catch (error: unknown) {
        if (!(error instanceof Error && 'code' in error && error.code === 11000)) throw error;
        const concurrentRecord = await model.updateOne(identity, { $set: fields });
        if ((concurrentRecord.matchedCount ?? 0) === 0) throw error;
    }
};

export const seedData = async ({ accountModel, categoryModel }: SeedModels): Promise<void> => {
    await Promise.all(accounts.map((account) => upsertSeed(accountModel, { Name: account.Name }, account)));
    await Promise.all(
        categories.map((category) => upsertSeed(categoryModel, { Name: category.Name, Type: category.Type }, category)),
    );
};

const seed = async (): Promise<void> => {
    await connectDB();
    await seedData({
        accountModel: AccountModel as unknown as SeedModel,
        categoryModel: CategoryModel as unknown as SeedModel,
    });
    console.info(`[Seed] Ready: ${accounts.length} accounts and ${categories.length} categories.`);
};

if (require.main === module) {
    seed()
        .catch((error: unknown) => {
            console.error('[Seed] Failed:', error instanceof Error ? error.message : error);
            process.exitCode = 1;
        })
        .finally(async () => mongoose.connection.close());
}

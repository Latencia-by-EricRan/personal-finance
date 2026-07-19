import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CategoryGateway, CategoryRefView } from '../application/ports/CategoryGateway';
import { InMemoryCategoryGateway } from './InMemoryCategoryGateway';
import { MongooseCategoryGateway } from './MongooseCategoryGateway';
import { CategoryModel } from '../../category';

/**
 * Shared port contract for report's `CategoryGateway` (task 3.2), run
 * against BOTH `InMemoryCategoryGateway` and the real
 * `MongooseCategoryGateway` (via `mongodb-memory-server`, no `vi.mock`,
 * `CategoryModel` reached only via the category barrel) — same principle
 * `budget`'s `MovementGateway.contract.test.ts` established.
 *
 * The dangling-ref case (an id with no matching category) asserts the
 * gateway silently omits it rather than throwing — this is the seam
 * `GetReportByCategory` relies on to reproduce legacy's populate-null skip
 * (design D13).
 */
interface GatewayLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const objectId = (): string => new Types.ObjectId().toString();

const runCategoryGatewayContract = (
    suiteName: string,
    makeGateway: () => CategoryGateway,
    insertCategory: (gateway: CategoryGateway, category: CategoryRefView) => Promise<void>,
    lifecycle: GatewayLifecycle = {},
): void => {
    describe(suiteName, () => {
        if (lifecycle.beforeAll) {
            beforeAll(lifecycle.beforeAll);
        }
        if (lifecycle.afterAll) {
            afterAll(lifecycle.afterAll);
        }
        if (lifecycle.beforeEach) {
            beforeEach(lifecycle.beforeEach);
        }

        it('returns categories matching the requested ids', async () => {
            const gateway = makeGateway();
            const idA = objectId();
            const idB = objectId();

            await insertCategory(gateway, {
                _id: idA,
                Color: '#C2410C',
                Description: 'Food desc',
                Name: 'Food',
                Tag: '',
                Type: 'variable',
            });
            await insertCategory(gateway, {
                _id: idB,
                Color: '#2563EB',
                Description: 'Rent desc',
                Name: 'Rent',
                Tag: '',
                Type: 'fijo',
            });

            const result = await gateway.findByIds([idA, idB]);

            expect(result).toHaveLength(2);
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ _id: idA, Color: '#C2410C', Name: 'Food' }),
                    expect.objectContaining({ _id: idB, Color: '#2563EB', Name: 'Rent' }),
                ]),
            );
        });

        it('omits ids that do not resolve to a category (dangling ref), without throwing', async () => {
            const gateway = makeGateway();
            const idA = objectId();
            const missingId = objectId();

            await insertCategory(gateway, {
                _id: idA,
                Description: 'Food desc',
                Name: 'Food',
                Tag: '',
                Type: 'variable',
            });

            const result = await gateway.findByIds([idA, missingId]);

            expect(result).toHaveLength(1);
            expect(result[0].Name).toBe('Food');
        });

        it('returns an empty array when given an empty id list', async () => {
            const gateway = makeGateway();

            const result = await gateway.findByIds([]);

            expect(result).toEqual([]);
        });
    });
};

runCategoryGatewayContract(
    'InMemoryCategoryGateway',
    () => new InMemoryCategoryGateway(),
    async (gateway, category) => {
        (gateway as InMemoryCategoryGateway).seed(category);
    },
);

let mongod: MongoMemoryServer;

runCategoryGatewayContract(
    'MongooseCategoryGateway',
    () => new MongooseCategoryGateway(),
    async (_gateway, category) => {
        await CategoryModel.create({
            _id: category._id,
            Description: category.Description,
            Name: category.Name,
            Tag: category.Tag,
            Type: category.Type,
            Icon: category.Icon,
            Color: category.Color,
        });
    },
    {
        beforeAll: async () => {
            mongod = await MongoMemoryServer.create();
            await mongoose.connect(mongod.getUri(), { dbName: 'report-category-gateway-contract' });
        },
        afterAll: async () => {
            await mongoose.disconnect();
            await mongod.stop();
        },
        beforeEach: async () => {
            await CategoryModel.deleteMany({});
        },
    },
);

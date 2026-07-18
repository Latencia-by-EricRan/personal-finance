import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Category } from '../domain/Category';
import { BulkUpsertResult } from '../application/ports/CategoryRepository';
import { CategoryMapper } from './CategoryMapper';

describe('CategoryMapper', () => {
    describe('domain <-> document', () => {
        it('maps a persisted document to a domain Category, carrying its identity', () => {
            const mapper = new CategoryMapper();
            const objectId = new Types.ObjectId('507f1f77bcf86cd799439011');

            const category = mapper.toDomain({
                _id: objectId,
                Description: 'Monthly rent',
                Name: 'Rent',
                Tag: 'rent-tag',
                Type: 'fijo',
                Icon: 'home',
                Color: 'red',
            });

            expect(category.id?.equals(Identity.fromObjectId(objectId))).toBe(true);
            expect(category.description).toBe('Monthly rent');
            expect(category.name).toBe('Rent');
            expect(category.tag).toBe('rent-tag');
            expect(category.type).toBe('fijo');
            expect(category.icon).toBe('home');
            expect(category.color).toBe('red');
        });

        it('coalesces a legacy document with no Color key to an empty string', () => {
            const mapper = new CategoryMapper();
            const objectId = new Types.ObjectId('507f1f77bcf86cd799439011');

            const category = mapper.toDomain({
                _id: objectId,
                Description: 'Legacy',
                Name: 'Legacy',
                Tag: '',
                Type: 'variable',
                Icon: '',
            });

            expect(category.color).toBe('');
        });

        it('maps a domain Category to its persistence document, whitelisting only the domain fields', () => {
            const mapper = new CategoryMapper();
            const category = Category.create({ Description: 'Utilities', Name: 'Utilities', Type: 'variable', Tag: 'utils-tag' });

            const document = mapper.toPersistence(category);

            expect(document).toEqual({
                Description: 'Utilities',
                Name: 'Utilities',
                Tag: 'utils-tag',
                Type: 'variable',
                Icon: '',
                Color: '',
            });
        });

        it('maps a domain Category with a set Color to its persistence document', () => {
            const mapper = new CategoryMapper();
            const category = Category.create({
                Description: 'Utilities',
                Name: 'Utilities',
                Type: 'variable',
                Tag: 'utils-tag',
                Color: 'blue',
            });

            const document = mapper.toPersistence(category);

            expect(document.Color).toBe('blue');
        });
    });

    describe('toBulkResponse', () => {
        it('reconstructs the exact 7-field wire shape captured by the bulk characterization baseline for a batch of new categories', () => {
            const mapper = new CategoryMapper();
            const dto: BulkUpsertResult = {
                insertedCount: 0,
                matchedCount: 0,
                modifiedCount: 0,
                deletedCount: 0,
                upsertedCount: 2,
                upsertedIds: { 0: '507f1f77bcf86cd799439011', 1: '507f1f77bcf86cd799439012' },
                insertedIds: {},
            };

            const response = mapper.toBulkResponse(dto);

            expect(Object.keys(response).sort()).toEqual([
                'deletedCount',
                'insertedCount',
                'insertedIds',
                'matchedCount',
                'modifiedCount',
                'upsertedCount',
                'upsertedIds',
            ]);
            expect(response).toEqual(dto);
        });

        it('reconstructs the matched/modified shape for a batch that hit existing keys, with both id maps empty', () => {
            const mapper = new CategoryMapper();
            const dto: BulkUpsertResult = {
                insertedCount: 0,
                matchedCount: 1,
                modifiedCount: 1,
                deletedCount: 0,
                upsertedCount: 0,
                upsertedIds: {},
                insertedIds: {},
            };

            expect(mapper.toBulkResponse(dto)).toEqual(dto);
        });
    });
});

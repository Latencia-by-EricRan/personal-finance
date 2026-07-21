import { Types } from 'mongoose';
import { CategoryModel } from '../../category';
import { CategoryGateway, CategoryRefView } from '../application/ports/CategoryGateway';

/**
 * Real adapter and the SOLE report-side file importing category persistence
 * (design D13's "gateways read via each context's public barrel" rule) —
 * `CategoryModel` imported ONLY from category's public barrel
 * (`contexts/category/index.ts`), never from `contexts/category/infrastructure/*`
 * directly. Missing ids are silently omitted from the result (Mongo's `$in`
 * naturally only returns matches) — this is the seam that reproduces
 * legacy's populate-null skip for a dangling Category ref.
 *
 * The public `CategoryView` includes every persisted field returned by the
 * legacy populated document, including `Color`, preserving report payload
 * parity without exposing category infrastructure types.
 */
export class MongooseCategoryGateway implements CategoryGateway {
    async findByIds(ids: string[]): Promise<CategoryRefView[]> {
        if (ids.length === 0) {
            return [];
        }

        // Mongoose's generated FilterQuery type for `_id.$in` on this schema
        // expects `readonly (ObjectId | ObjectId[] | null)[]` — a nested-array
        // shape that a real `Types.ObjectId[]` structurally never satisfies
        // (confirmed by trying string[], Types.ObjectId[], and a narrower
        // `(Types.ObjectId | null)[]` cast in turn — each fails with the same
        // "not assignable" error, an internal inconsistency in Mongoose's own
        // typed-query generics for this Mongoose version, not something a
        // precise local type can route around). `filter` is still typed and
        // reviewable up to this boundary; the query executed against Mongo is
        // a plain `{ _id: { $in: ObjectId[] } }`, unaffected by the cast.
        const filter: { _id: { $in: Types.ObjectId[] } } = { _id: { $in: ids.map((id) => new Types.ObjectId(id)) } };
        const rows = await CategoryModel.find(filter as never).lean();

        return rows.map((row) => ({
            _id: String(row._id),
            Color: row.Color,
            Description: row.Description,
            Name: row.Name,
            Tag: row.Tag,
            Type: row.Type,
            Icon: row.Icon,
        }));
    }
}

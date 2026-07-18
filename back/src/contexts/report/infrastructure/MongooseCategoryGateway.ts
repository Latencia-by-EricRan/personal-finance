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
 * KNOWN, DELIBERATELY DEFERRED GAP (design's own open question, not silently
 * dropped): `CategoryModel`'s schema has a `Color` field, but `CategoryView`
 * (the barrel-exported type this gateway maps into) does not include it, so
 * `Color` is NOT echoed here. Legacy's `report.service.ts#byCategory` returns
 * the full populated Mongoose document (including `Color`) at runtime despite
 * a narrower compile-time type. PR2b's `report.e2e.test.ts` is the real
 * byte-identical guard — if it reveals a payload diff on `Color`, the fix is
 * to extend `CategoryView` (design's stated preferred resolution), NOT to
 * special-case `Color` inside this gateway.
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
            Description: row.Description,
            Name: row.Name,
            Tag: row.Tag,
            Type: row.Type,
            Icon: row.Icon,
        }));
    }
}

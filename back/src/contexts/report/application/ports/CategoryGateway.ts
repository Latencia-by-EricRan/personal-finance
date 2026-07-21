import { CategoryView } from '../../../category';

/**
 * report-local, READ-ONLY outbound port confining report's `category`
 * cross-context coupling (design D13, mirrors budget/account's own
 * `MovementGateway` "one gateway per foreign context per consumer"
 * convention). `CategoryView` is the exact read-model the category context
 * already purpose-built for this consumer (see `contexts/category/index.ts`
 * doc comment: "for report.service's `.populate('Category')` result").
 */
export type CategoryRefView = CategoryView & { _id: string };

export interface CategoryGateway {
    findByIds(ids: string[]): Promise<CategoryRefView[]>;
}

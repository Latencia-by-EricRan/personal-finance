import { ICategory } from '../../../../../../core/reference';

export interface IBudgetView {
  _id: string;
  Category: ICategory | string;
  Month: number;
  Year: number;
  Limit: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateBudget {
  Category: string;
  Month: number;
  Year: number;
  Limit: number;
}

export type IBudgetPatch = Partial<ICreateBudget>;

export interface IBudgetStatus {
  Category: ICategory;
  Limit: number;
  Spent: number;
  Remaining: number;
  Percent: number;
}

export interface IBudgetDeleted {
  deleted: boolean;
  id: string;
}

/** Narrows a read-endpoint `Category` (populated doc vs. bare id string) to the populated shape. */
export function isPopulatedCategory(category: ICategory | string): category is ICategory {
  return typeof category !== 'string';
}

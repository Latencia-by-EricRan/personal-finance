import { ICategory } from './category.model';

export enum TypeMovement {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

export interface IMovement {
  Amount: number;
  Category: ICategory;
  Date: Date;
  Type: TypeMovement;
  Card?: string;
  Description?: string;
  _id?: string;
}

export interface ISummary {
  items: number;
  amount: {
    income: number;
    expense: number;
  };
}

export interface IMovementResponse {
  month: number;
  year: number;
  summary: ISummary;
  movements: IMovement[];
}

export interface IMovementFilter {
  Type?: TypeMovement;
  Category?: string;
  Account?: string;
}

export interface ICreateMovement {
  Type: TypeMovement;
  Amount: number;
  Category: string;
  Account: string;
  Date: string;
  Description?: string;
  Card?: string;
}

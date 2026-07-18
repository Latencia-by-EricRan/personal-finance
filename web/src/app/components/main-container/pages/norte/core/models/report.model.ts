import { ICategory } from '../../../../../../core/reference';

export interface IReportByCategory {
  Category: ICategory;
  Total: number;
}

export interface IReportMonthly {
  Month: number;
  Income: number;
  Expense: number;
  Net: number;
}

export interface IReportCashflow {
  Month: number;
  Year: number;
  Income: number;
  Expense: number;
  Net: number;
}

export interface IBarDatum {
  Label: string;
  Value: number;
  Color?: string;
}

export interface ITrendPoint {
  Label: string;
  Value: number;
}

export interface IDonutSegment {
  Label: string;
  Value: number;
  Color: string;
}

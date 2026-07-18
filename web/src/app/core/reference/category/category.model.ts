export enum TypeCategory {
  FIJO = 'fijo',
  VARIABLE = 'variable',
}

export interface ICategory {
  Name: string;
  Description?: string;
  Type: TypeCategory;
  Tag?: string;
  Icon?: string;
  Color?: string;
  _id?: string;
}

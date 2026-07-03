export const AccountType = {
  EFECTIVO: 'efectivo',
  BANCO: 'banco',
  TARJETA: 'tarjeta',
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export interface IAccount {
  Name: string;
  Type: AccountType;
  Currency: string;
  Icon?: string;
  _id?: string;
}

export interface ITransfer {
  From: string;
  To: string;
  Amount: number;
  Date?: string;
  Description?: string;
}

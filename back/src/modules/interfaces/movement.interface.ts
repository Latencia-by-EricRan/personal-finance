import { Types } from 'mongoose';

export enum TypeMovement {
    INGRESO = 'ingreso', // EN: Income
    EGRESO = 'egreso' // EN: Expense
}

export interface MovementI {
    Amount: number;
    // Optional: transfer-generated movements (AccountService.transfer) have no Category.
    // API-level movement creation still requires it (movement.validator.ts's isPost rule).
    Category?: Types.ObjectId;
    Date: Date;
    Type: TypeMovement;
    Account: Types.ObjectId;
    TransferId?: string;
    Card?: string;
    Description?: string;
}

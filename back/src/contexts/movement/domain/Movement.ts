import { Identity } from '../../../shared/domain/Identity';

export enum MovementType {
    INGRESO = 'ingreso', // EN: Income
    EGRESO = 'egreso', // EN: Expense
}

const VALID_TYPES: MovementType[] = [MovementType.INGRESO, MovementType.EGRESO];

/**
 * Named-property input for `Movement.create`/`Movement.rehydrate`. Mirrors
 * the mass-assignment whitelist enforced today by
 * `movement.validator.ts`'s `checkKeys(['Type','Amount','Category','Account','Date','Description','Card'])`
 * (design D2) — `TransferId` is deliberately NOT a member of this interface,
 * so it is structurally unsettable by any caller: the constructor never
 * spreads its input, it destructures these named props only.
 */
export interface MovementProps {
    Type: MovementType;
    Amount: number;
    Date: Date;
    Account: string;
    Category?: string;
    Description?: string;
    Card?: string;
}

export class Movement {
    private constructor(
        private readonly _id: Identity | undefined,
        private readonly _type: MovementType,
        private readonly _amount: number,
        private readonly _date: Date,
        private readonly _account: string,
        private readonly _category: string | undefined,
        private readonly _description: string,
        private readonly _card: string,
    ) {}

    static create(props: MovementProps): Movement {
        Movement.assertInvariants(props);

        return new Movement(
            undefined,
            props.Type,
            props.Amount,
            props.Date,
            props.Account,
            props.Category,
            props.Description ?? '',
            props.Card ?? '',
        );
    }

    static rehydrate(id: Identity, props: MovementProps): Movement {
        Movement.assertInvariants(props);

        return new Movement(
            id,
            props.Type,
            props.Amount,
            props.Date,
            props.Account,
            props.Category,
            props.Description ?? '',
            props.Card ?? '',
        );
    }

    private static assertInvariants(props: MovementProps): void {
        if (!VALID_TYPES.includes(props.Type)) {
            throw new Error(`Movement.Type must be one of ${VALID_TYPES.join(', ')}, got "${String(props.Type)}"`);
        }
        if (typeof props.Amount !== 'number' || Number.isNaN(props.Amount)) {
            throw new Error('Movement.Amount must be a number');
        }
        if (!props.Account || !props.Account.trim()) {
            throw new Error('Movement.Account must be a non-empty string');
        }
        if (!(props.Date instanceof Date) || Number.isNaN(props.Date.getTime())) {
            throw new Error('Movement.Date must be a valid Date');
        }
    }

    get id(): Identity | undefined {
        return this._id;
    }

    get type(): MovementType {
        return this._type;
    }

    get amount(): number {
        return this._amount;
    }

    get date(): Date {
        return this._date;
    }

    get account(): string {
        return this._account;
    }

    get category(): string | undefined {
        return this._category;
    }

    get description(): string {
        return this._description;
    }

    get card(): string {
        return this._card;
    }

    equals(other: Movement): boolean {
        return (
            other instanceof Movement &&
            this._type === other._type &&
            this._amount === other._amount &&
            this._date.getTime() === other._date.getTime() &&
            this._account === other._account &&
            this._category === other._category &&
            this._description === other._description &&
            this._card === other._card &&
            (this._id === undefined
                ? other._id === undefined
                : other._id !== undefined && this._id.equals(other._id))
        );
    }
}

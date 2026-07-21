import { Identity } from '../../../shared/domain/Identity';

export const RECURRING_TYPES = ['ingreso', 'egreso'] as const;
export type RecurringType = (typeof RECURRING_TYPES)[number];

export const RECURRING_FREQUENCIES = ['mensual'] as const;
export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number];

/**
 * Named-property input for `Recurring.create`/`Recurring.rehydrate`. Mirrors
 * the mass-assignment whitelist the legacy `recurring.interface.ts`/schema
 * enforces — the constructor never spreads its input, it destructures these
 * named props only. `Category`/`Account` are plain id strings here (the
 * domain aggregate guards WRITE invariants only); legacy `recurring.service.ts`
 * never `.populate()`s either field, so there is no dual populated/bare shape
 * to preserve (unlike `budget`).
 */
export interface RecurringProps {
    Type: RecurringType;
    Amount: number;
    Category: string;
    Account: string;
    Description?: string;
    Card?: string;
    Frequency: RecurringFrequency;
    DayOfMonth: number;
    Active?: boolean;
    LastRunYearMonth?: string | null;
}

export class Recurring {
    private constructor(
        private readonly _id: Identity | undefined,
        private readonly _type: RecurringType,
        private readonly _amount: number,
        private readonly _category: string,
        private readonly _account: string,
        private readonly _description: string,
        private readonly _card: string,
        private readonly _frequency: RecurringFrequency,
        private readonly _dayOfMonth: number,
        private readonly _active: boolean,
        private readonly _lastRunYearMonth: string | null,
    ) {}

    static create(props: RecurringProps): Recurring {
        Recurring.assertInvariants(props);

        return new Recurring(
            undefined,
            props.Type,
            props.Amount,
            props.Category,
            props.Account,
            props.Description ?? '',
            props.Card ?? '',
            props.Frequency,
            props.DayOfMonth,
            props.Active ?? true,
            props.LastRunYearMonth ?? null,
        );
    }

    static rehydrate(id: Identity, props: RecurringProps): Recurring {
        Recurring.assertInvariants(props);

        return new Recurring(
            id,
            props.Type,
            props.Amount,
            props.Category,
            props.Account,
            props.Description ?? '',
            props.Card ?? '',
            props.Frequency,
            props.DayOfMonth,
            props.Active ?? true,
            props.LastRunYearMonth ?? null,
        );
    }

    private static assertInvariants(props: RecurringProps): void {
        if (!RECURRING_TYPES.includes(props.Type)) {
            throw new Error(`Recurring.Type must be one of ${RECURRING_TYPES.join(', ')}, got "${String(props.Type)}"`);
        }
        if (typeof props.Amount !== 'number' || Number.isNaN(props.Amount)) {
            throw new Error('Recurring.Amount must be a number');
        }
        if (typeof props.Category !== 'string' || !props.Category.trim()) {
            throw new Error('Recurring.Category must be a non-empty string');
        }
        if (typeof props.Account !== 'string' || !props.Account.trim()) {
            throw new Error('Recurring.Account must be a non-empty string');
        }
        if (!RECURRING_FREQUENCIES.includes(props.Frequency)) {
            throw new Error(
                `Recurring.Frequency must be one of ${RECURRING_FREQUENCIES.join(', ')}, got "${String(props.Frequency)}"`,
            );
        }
        if (!Number.isInteger(props.DayOfMonth) || props.DayOfMonth < 1 || props.DayOfMonth > 31) {
            throw new Error(`Recurring.DayOfMonth must be an integer between 1 and 31, got "${String(props.DayOfMonth)}"`);
        }
    }

    get id(): Identity | undefined {
        return this._id;
    }

    get type(): RecurringType {
        return this._type;
    }

    get amount(): number {
        return this._amount;
    }

    get category(): string {
        return this._category;
    }

    get account(): string {
        return this._account;
    }

    get description(): string {
        return this._description;
    }

    get card(): string {
        return this._card;
    }

    get frequency(): RecurringFrequency {
        return this._frequency;
    }

    get dayOfMonth(): number {
        return this._dayOfMonth;
    }

    get active(): boolean {
        return this._active;
    }

    get lastRunYearMonth(): string | null {
        return this._lastRunYearMonth;
    }

    equals(other: Recurring): boolean {
        return (
            other instanceof Recurring &&
            this._type === other._type &&
            this._amount === other._amount &&
            this._category === other._category &&
            this._account === other._account &&
            this._description === other._description &&
            this._card === other._card &&
            this._frequency === other._frequency &&
            this._dayOfMonth === other._dayOfMonth &&
            this._active === other._active &&
            this._lastRunYearMonth === other._lastRunYearMonth &&
            (this._id === undefined
                ? other._id === undefined
                : other._id !== undefined && this._id.equals(other._id))
        );
    }
}

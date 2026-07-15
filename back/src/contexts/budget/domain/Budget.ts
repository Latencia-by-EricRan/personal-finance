import { Identity } from '../../../shared/domain/Identity';

/**
 * Named-property input for `Budget.create`/`Budget.rehydrate`. Mirrors the
 * mass-assignment whitelist enforced today by `budget.validator.ts`'s
 * `checkKeys(['Category','Month','Year','Limit'])` (design D4) — the
 * constructor never spreads its input, it destructures these named props
 * only. `Category` is a plain id string here; the domain aggregate guards
 * WRITE invariants only — the populated Category sub-document only ever
 * appears on the READ side (`BudgetView`, design D2/D3).
 */
export interface BudgetProps {
    Category: string;
    Month: number;
    Year: number;
    Limit: number;
}

export class Budget {
    private constructor(
        private readonly _id: Identity | undefined,
        private readonly _category: string,
        private readonly _month: number,
        private readonly _year: number,
        private readonly _limit: number,
    ) {}

    static create(props: BudgetProps): Budget {
        Budget.assertInvariants(props);

        return new Budget(undefined, props.Category, props.Month, props.Year, props.Limit);
    }

    static rehydrate(id: Identity, props: BudgetProps): Budget {
        Budget.assertInvariants(props);

        return new Budget(id, props.Category, props.Month, props.Year, props.Limit);
    }

    private static assertInvariants(props: BudgetProps): void {
        if (typeof props.Category !== 'string' || !props.Category.trim()) {
            throw new Error('Budget.Category must be a non-empty string');
        }
        if (!Number.isInteger(props.Month) || props.Month < 1 || props.Month > 12) {
            throw new Error(`Budget.Month must be an integer between 1 and 12, got "${String(props.Month)}"`);
        }
        if (typeof props.Year !== 'number' || Number.isNaN(props.Year)) {
            throw new Error('Budget.Year must be a number');
        }
        if (typeof props.Limit !== 'number' || Number.isNaN(props.Limit) || props.Limit < 0) {
            throw new Error('Budget.Limit must be a number >= 0');
        }
    }

    get id(): Identity | undefined {
        return this._id;
    }

    get category(): string {
        return this._category;
    }

    get month(): number {
        return this._month;
    }

    get year(): number {
        return this._year;
    }

    get limit(): number {
        return this._limit;
    }

    equals(other: Budget): boolean {
        return (
            other instanceof Budget &&
            this._category === other._category &&
            this._month === other._month &&
            this._year === other._year &&
            this._limit === other._limit &&
            (this._id === undefined
                ? other._id === undefined
                : other._id !== undefined && this._id.equals(other._id))
        );
    }
}

import { Identity } from '../../../shared/domain/Identity';

export type AccountType = 'efectivo' | 'banco' | 'tarjeta';

const VALID_TYPES: AccountType[] = ['efectivo', 'banco', 'tarjeta'];

/**
 * Named-property input for `Account.create`/`Account.rehydrate`. Mirrors the
 * mass-assignment whitelist enforced today by `account.validator.ts`'s
 * `checkKeys(['Name','Type','Currency','Icon','Archived'])` (design D4) — the
 * constructor never spreads its input, it destructures these named props
 * only.
 */
export interface AccountProps {
    Name: string;
    Type: AccountType;
    Currency?: string;
    Icon?: string;
    Archived?: boolean;
}

export class Account {
    private constructor(
        private readonly _id: Identity | undefined,
        private readonly _name: string,
        private readonly _type: AccountType,
        private readonly _currency: string,
        private readonly _icon: string,
        private readonly _archived: boolean,
    ) {}

    static create(props: AccountProps): Account {
        Account.assertInvariants(props);

        return new Account(
            undefined,
            props.Name.trim(),
            props.Type,
            props.Currency ?? 'ARS',
            props.Icon ?? '',
            props.Archived ?? false,
        );
    }

    static rehydrate(id: Identity, props: AccountProps): Account {
        Account.assertInvariants(props);

        return new Account(
            id,
            props.Name.trim(),
            props.Type,
            props.Currency ?? 'ARS',
            props.Icon ?? '',
            props.Archived ?? false,
        );
    }

    private static assertInvariants(props: AccountProps): void {
        if (typeof props.Name !== 'string' || !props.Name.trim()) {
            throw new Error('Account.Name must be a non-empty string');
        }
        if (!VALID_TYPES.includes(props.Type)) {
            throw new Error(`Account.Type must be one of ${VALID_TYPES.join(', ')}, got "${String(props.Type)}"`);
        }
        if (props.Currency !== undefined && (typeof props.Currency !== 'string' || !props.Currency.trim())) {
            throw new Error('Account.Currency must be a non-empty string when provided');
        }
        if (props.Icon !== undefined && typeof props.Icon !== 'string') {
            throw new Error('Account.Icon must be a string when provided');
        }
        if (props.Archived !== undefined && typeof props.Archived !== 'boolean') {
            throw new Error('Account.Archived must be a boolean when provided');
        }
    }

    get id(): Identity | undefined {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get type(): AccountType {
        return this._type;
    }

    get currency(): string {
        return this._currency;
    }

    get icon(): string {
        return this._icon;
    }

    get archived(): boolean {
        return this._archived;
    }

    equals(other: Account): boolean {
        return (
            other instanceof Account &&
            this._name === other._name &&
            this._type === other._type &&
            this._currency === other._currency &&
            this._icon === other._icon &&
            this._archived === other._archived &&
            (this._id === undefined
                ? other._id === undefined
                : other._id !== undefined && this._id.equals(other._id))
        );
    }
}

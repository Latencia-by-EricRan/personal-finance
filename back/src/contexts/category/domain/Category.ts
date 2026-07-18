import { Identity } from '../../../shared/domain/Identity';

export type CategoryType = 'variable' | 'fijo';

const VALID_TYPES: CategoryType[] = ['variable', 'fijo'];

/**
 * Named-property input for `Category.create`/`Category.rehydrate`. Mirrors
 * exactly the mass-assignment whitelist enforced today by
 * `category.validator.ts`'s `checkKeys(['Name','Description','Type','Tag','Icon','Color'])`
 * (design D2) — any other key on the caller's object is structurally ignored
 * since the constructor never spreads its input, it destructures named props.
 */
export interface CategoryProps {
    Description: string;
    Name: string;
    Type: CategoryType;
    Tag?: string;
    Icon?: string;
    Color?: string;
}

export interface CategoryNaturalKey {
    Tag: string;
}

export interface CategoryNaturalKeyByName {
    Name: string;
}

export class Category {
    private constructor(
        private readonly _id: Identity | undefined,
        private readonly _description: string,
        private readonly _name: string,
        private readonly _type: CategoryType,
        private readonly _tag: string,
        private readonly _icon: string,
        private readonly _color: string,
    ) {}

    static create(props: CategoryProps): Category {
        Category.assertInvariants(props);

        return new Category(
            undefined,
            props.Description,
            props.Name,
            props.Type,
            props.Tag ?? '',
            props.Icon ?? '',
            props.Color ?? '',
        );
    }

    static rehydrate(id: Identity, props: CategoryProps): Category {
        Category.assertInvariants(props);

        return new Category(
            id,
            props.Description,
            props.Name,
            props.Type,
            props.Tag ?? '',
            props.Icon ?? '',
            props.Color ?? '',
        );
    }

    private static assertInvariants(props: CategoryProps): void {
        if (!props.Name || !props.Name.trim()) {
            throw new Error('Category.Name must be a non-empty string');
        }
        if (!props.Description || !props.Description.trim()) {
            throw new Error('Category.Description must be a non-empty string');
        }
        if (!VALID_TYPES.includes(props.Type)) {
            throw new Error(`Category.Type must be one of ${VALID_TYPES.join(', ')}, got "${String(props.Type)}"`);
        }
    }

    get id(): Identity | undefined {
        return this._id;
    }

    get description(): string {
        return this._description;
    }

    get name(): string {
        return this._name;
    }

    get type(): CategoryType {
        return this._type;
    }

    get tag(): string {
        return this._tag;
    }

    get icon(): string {
        return this._icon;
    }

    get color(): string {
        return this._color;
    }

    /**
     * The upsert-by-business-key rule (Tag when present, otherwise Name),
     * consumed by both `SaveCategory` (single) and `BulkSaveCategory` (batch)
     * so the rule lives in exactly one place (design D3).
     */
    naturalKey(): CategoryNaturalKey | CategoryNaturalKeyByName {
        return this._tag ? { Tag: this._tag } : { Name: this._name };
    }

    equals(other: Category): boolean {
        return (
            other instanceof Category &&
            this._description === other._description &&
            this._name === other._name &&
            this._type === other._type &&
            this._tag === other._tag &&
            this._icon === other._icon &&
            this._color === other._color &&
            (this._id === undefined
                ? other._id === undefined
                : other._id !== undefined && this._id.equals(other._id))
        );
    }
}

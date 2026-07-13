import { Types } from 'mongoose';

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export class Identity {
    private constructor(private readonly _value: string) {}

    static create(id: string): Identity {
        if (!OBJECT_ID_PATTERN.test(id)) {
            throw new Error(`Invalid Identity: "${id}" is not a valid 24-char hex id`);
        }

        return new Identity(id);
    }

    static fromObjectId(objectId: Types.ObjectId): Identity {
        return new Identity(objectId.toString());
    }

    toObjectId(): Types.ObjectId {
        return new Types.ObjectId(this._value);
    }

    get value(): string {
        return this._value;
    }

    equals(other: Identity): boolean {
        return other instanceof Identity && this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}

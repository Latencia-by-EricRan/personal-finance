import { Identity } from '../../../../shared/domain/Identity';
import { Account, AccountProps, AccountType } from '../../domain/Account';

/**
 * Application-layer pagination shape, deliberately NOT imported from
 * `src/utils/controller.util.ts` (which pulls in `express.Request`) to keep
 * the application layer framework-free — same "driver-free port" principle
 * `category`/`movement` established.
 */
export interface Pagination {
    limit: number;
    skip: number;
}

/**
 * Read-model shape returned by every port method (design D2). The domain
 * `Account` aggregate guards the WRITE side only; reads echo a
 * persistence-faithful view carrying `createdAt`/`updatedAt` because
 * `AccountModel` has `timestamps:true`.
 */
export interface AccountView {
    _id: string;
    Name: string;
    Type: AccountType;
    Currency: string;
    Icon: string;
    Archived: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Partial patch accepted by `UpdateAccount` (design D3). `PUT /account/:id`
 * is genuinely partial (Name/Type optional on update), so this bypasses the
 * full-invariant `Account` aggregate on purpose — forwarded straight to
 * `repository.update`.
 */
export type AccountPatch = Partial<AccountProps>;

/**
 * Bespoke port for `account` (not the generic `Repository<T, Id>`) — mirrors
 * `account.service.ts`'s real current methods 1:1
 * (find/findById/create/update/archive), same shape category/movement
 * established for their own repository ports.
 */
export interface AccountRepository {
    find(filter: Record<string, unknown>, pagination?: Pagination): Promise<AccountView[]>;
    findById(id: Identity): Promise<AccountView | null>;
    create(account: Account): Promise<AccountView>;
    update(id: Identity, patch: AccountPatch): Promise<AccountView | null>;
    archive(id: Identity): Promise<AccountView | null>;
}

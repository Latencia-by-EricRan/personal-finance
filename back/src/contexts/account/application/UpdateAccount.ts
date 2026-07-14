import { Identity } from '../../../shared/domain/Identity';
import { AccountPatch, AccountRepository, AccountView } from './ports/AccountRepository';

export class UpdateAccount {
    constructor(private readonly repository: AccountRepository) {}

    async execute(id: string, patch: AccountPatch): Promise<AccountView | null> {
        return this.repository.update(Identity.create(id), patch);
    }
}

import { Pipe, PipeTransform } from '@angular/core';

import { IAccount } from '../../../../../core/reference';

/**
 * Sums every account's balance for the Accounts header's "Total balance"
 * subtitle. Returns `null` while any account's balance hasn't finished
 * loading yet, so the template can show a "—" placeholder instead of an
 * incomplete/incorrect sum.
 */
@Pipe({ name: 'totalBalance' })
export class TotalBalancePipe implements PipeTransform {
  transform(accounts: IAccount[], balances: Record<string, number>): number | null {
    if (accounts.length === 0) {
      return 0;
    }

    let total = 0;
    for (const acc of accounts) {
      if (!acc._id || balances[acc._id] === undefined) {
        return null;
      }
      total += balances[acc._id];
    }
    return total;
  }
}

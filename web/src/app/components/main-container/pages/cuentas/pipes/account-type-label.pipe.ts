import { Pipe, PipeTransform } from '@angular/core';

import { AccountType } from '../../../../../core/reference';

// AccountCard subtitle derivation: IAccount has no descriptive note/due-date
// field (the mockup implies one, e.g. "Credit • due Jul 28") — this pipe only
// translates the real `Type` field into a human-readable label (known model
// gap, not fixed in this PR).
const TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.EFECTIVO]: 'Cash',
  [AccountType.BANCO]: 'Bank',
  [AccountType.TARJETA]: 'Credit card',
};

@Pipe({ name: 'accountTypeLabel' })
export class AccountTypeLabelPipe implements PipeTransform {
  transform(type: AccountType): string {
    return TYPE_LABELS[type] ?? type;
  }
}

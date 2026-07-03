import { Component, effect, inject, signal } from '@angular/core';

import { AccountService } from '../../../../../../core/reference';
import { TransferSheetComponent } from '../../components/transfer-sheet/transfer-sheet.component';

@Component({
  selector: 'app-account-list',
  imports: [TransferSheetComponent],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
})
export class AccountListComponent {
  private readonly accountSvc = inject(AccountService);

  readonly accounts = this.accountSvc.accounts;
  readonly balances = signal<Record<string, number>>({});
  readonly showTransferSheet = signal(false);

  constructor() {
    this.accountSvc.ensureLoaded();

    // First use of effect() in this codebase: reacts to the shared `accounts`
    // signal (populated by ensureLoaded()/refresh()) to (re)fetch every
    // account's balance whenever the account list changes — including after
    // a successful transfer, so displayed balances stay in sync.
    effect(() => {
      const accts = this.accounts();
      for (const acc of accts) {
        if (acc._id) {
          this.fetchBalance(acc._id);
        }
      }
    });
  }

  openTransfer(): void {
    this.showTransferSheet.set(true);
  }

  closeTransfer(): void {
    this.showTransferSheet.set(false);
  }

  onTransferCompleted(): void {
    this.showTransferSheet.set(false);
    this.accountSvc.refresh();
  }

  private fetchBalance(id: string): void {
    this.accountSvc.getBalance(id).subscribe((balance) => {
      this.balances.update((current) => ({ ...current, [id]: balance }));
    });
  }
}

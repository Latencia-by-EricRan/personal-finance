import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { IAccount, ITransfer } from './account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly accountUrl = `${inject(API_BASE_URL)}/account`;

  private readonly _accounts = signal<IAccount[]>([]);
  readonly accounts = this._accounts.asReadonly();
  private loaded = false;

  ensureLoaded(): void {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.http.get<IAccount[]>(this.accountUrl).subscribe((list) => this._accounts.set(list));
  }

  refresh(): void {
    this.loaded = true;
    this.http.get<IAccount[]>(this.accountUrl).subscribe((list) => this._accounts.set(list));
  }

  // ASSUMPTION: response body is a bare number. Never verified against a
  // running backend — if the real shape is wrapped (e.g. `{ balance: number }`),
  // fix is contained to this method and AccountListComponent's balance typing.
  getBalance(id: string): Observable<number> {
    return this.http.get<number>(`${this.accountUrl}/${id}/balance`);
  }

  transfer(dto: ITransfer): Observable<void> {
    if (dto.From === dto.To) {
      return throwError(() => new Error('Cannot transfer to the same account.'));
    }
    if (dto.Amount <= 0) {
      return throwError(() => new Error('Transfer amount must be positive.'));
    }
    return this.http.post<void>(`${this.accountUrl}/transfer`, dto);
  }
}

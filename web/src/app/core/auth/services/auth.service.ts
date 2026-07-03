import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ICredentials, ILoginResponse } from '../models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly _isAuthenticated = signal<boolean>(!!this.tokenStorage.getToken());
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  login(credentials: ICredentials): Observable<ILoginResponse> {
    return this.http
      .post<ILoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.tokenStorage.setToken(response.token);
          this._isAuthenticated.set(true);
        }),
      );
  }

  logout(): void {
    this.tokenStorage.clear();
    this._isAuthenticated.set(false);
  }
}

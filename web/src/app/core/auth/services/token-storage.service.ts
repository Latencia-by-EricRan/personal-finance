import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private static readonly KEY = 'norte.token';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TokenStorageService.KEY);
  }

  setToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(TokenStorageService.KEY, token);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(TokenStorageService.KEY);
  }
}

import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type NorteTheme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'norte-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<NorteTheme>(this.readPersistedTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();

      if (!this.isBrowser) {
        return;
      }

      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: NorteTheme): void {
    this.theme.set(theme);

    if (this.isBrowser) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  private readPersistedTheme(): NorteTheme {
    if (!this.isBrowser) {
      return 'dark';
    }

    const persisted = localStorage.getItem(THEME_STORAGE_KEY);
    return persisted === 'light' ? 'light' : 'dark';
  }
}

import { PLATFORM_ID, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  afterEach(() => {
    localStorage.removeItem('norte-theme');
    document.documentElement.removeAttribute('data-theme');
  });

  describe('in the browser', () => {
    beforeEach(() => {
      localStorage.removeItem('norte-theme');
      TestBed.configureTestingModule({
        providers: [
          provideExperimentalZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
    });

    /** Injects the service and flushes its constructor effect (the `data-theme` sync runs on the next scheduler flush, not synchronously). */
    function createService(): ThemeService {
      const service = TestBed.inject(ThemeService);
      TestBed.flushEffects();
      return service;
    }

    it('defaults to dark when no preference is persisted', () => {
      const service = createService();

      expect(service.theme()).toBe('dark');
    });

    it('applies the theme to the document element', () => {
      createService();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('toggle() flips the theme and persists it', () => {
      const service = createService();

      service.toggle();
      TestBed.flushEffects();

      expect(service.theme()).toBe('light');
      expect(localStorage.getItem('norte-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      service.toggle();
      TestBed.flushEffects();

      expect(service.theme()).toBe('dark');
      expect(localStorage.getItem('norte-theme')).toBe('dark');
    });

    it('setTheme() sets the theme explicitly and persists it', () => {
      const service = createService();

      service.setTheme('light');
      TestBed.flushEffects();

      expect(service.theme()).toBe('light');
      expect(localStorage.getItem('norte-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('reads a persisted preference on construction', () => {
      localStorage.setItem('norte-theme', 'light');

      const service = createService();

      expect(service.theme()).toBe('light');
    });
  });

  describe('on the server', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideExperimentalZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });
    });

    it('defaults to dark without touching document/localStorage', () => {
      const service = TestBed.inject(ThemeService);
      TestBed.flushEffects();

      expect(service.theme()).toBe('dark');
    });

    it('toggle() still updates the signal without throwing', () => {
      const service = TestBed.inject(ThemeService);
      TestBed.flushEffects();

      expect(() => service.toggle()).not.toThrow();
      expect(service.theme()).toBe('light');
    });
  });
});

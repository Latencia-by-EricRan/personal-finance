import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  const TOKEN_KEY = 'norte.token';

  describe('in the browser', () => {
    let service: TokenStorageService;

    beforeEach(() => {
      localStorage.clear();
      TestBed.configureTestingModule({
        providers: [provideExperimentalZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'browser' }],
      });
      service = TestBed.inject(TokenStorageService);
    });

    afterEach(() => localStorage.clear());

    it('returns null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('persists a token via setToken and reads it back via getToken', () => {
      service.setToken('abc123');
      expect(service.getToken()).toBe('abc123');
      expect(localStorage.getItem(TOKEN_KEY)).toBe('abc123');
    });

    it('removes the token via clear', () => {
      service.setToken('abc123');
      service.clear();
      expect(service.getToken()).toBeNull();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  describe('on the server', () => {
    let service: TokenStorageService;

    beforeEach(() => {
      localStorage.clear();
      TestBed.configureTestingModule({
        providers: [provideExperimentalZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
      });
      service = TestBed.inject(TokenStorageService);
    });

    afterEach(() => localStorage.clear());

    it('does not throw on construction', () => {
      expect(service).toBeTruthy();
    });

    it('getToken() always returns null, never touching localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'should-be-ignored');
      expect(service.getToken()).toBeNull();
    });

    it('setToken() is a no-op', () => {
      expect(() => service.setToken('abc123')).not.toThrow();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('clear() is a no-op', () => {
      localStorage.setItem(TOKEN_KEY, 'existing');
      expect(() => service.clear()).not.toThrow();
      expect(localStorage.getItem(TOKEN_KEY)).toBe('existing');
    });
  });
});

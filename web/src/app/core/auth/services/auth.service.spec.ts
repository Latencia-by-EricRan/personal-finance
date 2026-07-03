import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { ICredentials, ILoginResponse } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;

  const credentials: ICredentials = { Email: 'user@example.com', Password: 'changeme' };

  beforeEach(() => {
    const tokenStorageSpy = jasmine.createSpyObj<TokenStorageService>(
      'TokenStorageService',
      ['getToken', 'setToken', 'clear'],
    );

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenStorageService, useValue: tokenStorageSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService) as jasmine.SpyObj<TokenStorageService>;
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  describe('login()', () => {
    it('posts credentials to /auth/login, stores the token, and flips isAuthenticated to true on success', () => {
      const response: ILoginResponse = { token: 'jwt-token', expiresIn: 3600 };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(response);

      expect(tokenStorage.setToken).toHaveBeenCalledWith('jwt-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('leaves isAuthenticated false and stores no token on 401', () => {
      service.login(credentials).subscribe({ error: () => undefined });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(tokenStorage.setToken).not.toHaveBeenCalled();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('logout()', () => {
    it('clears the stored token and flips isAuthenticated to false', () => {
      tokenStorage.getToken.and.returnValue('jwt-token');

      service.logout();

      expect(tokenStorage.clear).toHaveBeenCalled();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});

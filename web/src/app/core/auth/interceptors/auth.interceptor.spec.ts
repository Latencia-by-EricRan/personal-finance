import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from '../services';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const tokenStorageSpy = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', [
      'getToken',
      'setToken',
      'clear',
    ]);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenStorageService, useValue: tokenStorageSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService) as jasmine.SpyObj<TokenStorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => httpMock.verify());

  it('attaches Authorization: Bearer <token> to a protected request when a token exists', () => {
    tokenStorage.getToken.and.returnValue('jwt-token');

    http.get('/movement').subscribe();

    const req = httpMock.expectOne('/movement');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush({});
  });

  it('does not attach a header when no token is stored', () => {
    tokenStorage.getToken.and.returnValue(null);

    http.get('/movement').subscribe();

    const req = httpMock.expectOne('/movement');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  for (const publicPath of ['/auth/login', '/docs', '/health']) {
    it(`omits the Authorization header for ${publicPath}`, () => {
      tokenStorage.getToken.and.returnValue('jwt-token');

      http.post(publicPath, {}).subscribe();

      const req = httpMock.expectOne(publicPath);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  }

  it('on a 401 response, clears the token and navigates to /login', () => {
    tokenStorage.getToken.and.returnValue('jwt-token');

    http.get('/movement').subscribe({ error: () => undefined });

    const req = httpMock.expectOne('/movement');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('rethrows the error after handling a 401', () => {
    tokenStorage.getToken.and.returnValue('jwt-token');
    let caught: HttpErrorResponse | undefined;

    http.get('/movement').subscribe({ error: (err) => (caught = err) });

    const req = httpMock.expectOne('/movement');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(caught?.status).toBe(401);
  });

  it('does not clear the token or navigate on a non-401 error', () => {
    tokenStorage.getToken.and.returnValue('jwt-token');

    http.get('/movement').subscribe({ error: () => undefined });

    const req = httpMock.expectOne('/movement');
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Server Error' });

    expect(tokenStorage.clear).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../services';

describe('authGuard', () => {
  let isAuthenticated: jasmine.Spy<() => boolean>;
  let router: jasmine.SpyObj<Router>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    isAuthenticated = jasmine.createSpy('isAuthenticated').and.returnValue(false);
    const authServiceStub = { isAuthenticated } as unknown as AuthService;
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: routerSpy },
      ],
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('returns true when the user is authenticated', () => {
    isAuthenticated.and.returnValue(true);

    expect(runGuard()).toBeTrue();
  });

  it('returns a UrlTree to /login when the user is not authenticated', () => {
    isAuthenticated.and.returnValue(false);
    const urlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(urlTree);

    const result = runGuard();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(urlTree);
  });
});

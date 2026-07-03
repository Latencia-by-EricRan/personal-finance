import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth';
import { ILoginResponse } from '../../core/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is invalid when email and password are empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('is valid once both email and password are filled', () => {
    component.form.setValue({ email: 'user@example.com', password: 'changeme' });
    expect(component.form.valid).toBeTrue();
  });

  it('does not call AuthService.login() when the form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  describe('on valid submit', () => {
    beforeEach(() => {
      component.form.setValue({ email: 'user@example.com', password: 'changeme' });
    });

    it('calls AuthService.login() with the form values', () => {
      const response: ILoginResponse = { token: 'jwt-token', expiresIn: 3600 };
      authService.login.and.returnValue(of(response));

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        Email: 'user@example.com',
        Password: 'changeme',
      });
    });

    it('navigates to /records on success', () => {
      const response: ILoginResponse = { token: 'jwt-token', expiresIn: 3600 };
      authService.login.and.returnValue(of(response));

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/records']);
      expect(component.errorMessage()).toBeNull();
    });

    it('shows an error message and does not navigate on 401', () => {
      authService.login.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
      );

      component.onSubmit();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.errorMessage()).not.toBeNull();
    });
  });
});

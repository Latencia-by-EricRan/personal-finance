import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { environment } from '../../../environments/environment';
import { API_BASE_URL } from './api-base-url.token';

describe('API_BASE_URL', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  it('defaults to environment.apiUrl when no override is provided', () => {
    const baseUrl = TestBed.inject(API_BASE_URL);

    expect(baseUrl).toBe(environment.apiUrl);
  });
});

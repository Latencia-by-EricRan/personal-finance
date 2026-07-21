import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { CategoryService } from './category.service';
import { ICategory, TypeCategory } from './category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const categoryUrl = `${environment.apiUrl}/category`;

  const categories: ICategory[] = [{ Name: 'Comida', Type: TypeCategory.VARIABLE, _id: 'cat-1' }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with an empty categories signal', () => {
    expect(service.categories()).toEqual([]);
  });

  describe('ensureLoaded()', () => {
    it('GETs /category on first call and populates the categories signal', () => {
      service.ensureLoaded();

      const req = httpMock.expectOne(categoryUrl);
      expect(req.request.method).toBe('GET');
      req.flush(categories);

      expect(service.categories()).toEqual(categories);
    });

    it('does not issue a second request on subsequent calls', () => {
      service.ensureLoaded();
      httpMock.expectOne(categoryUrl).flush(categories);

      service.ensureLoaded();

      httpMock.expectNone(categoryUrl);
      expect().nothing();
    });
  });
});

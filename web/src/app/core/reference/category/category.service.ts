import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { ICategory } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoryUrl = `${inject(API_BASE_URL)}/category`;

  private readonly _categories = signal<ICategory[]>([]);
  readonly categories = this._categories.asReadonly();
  private loaded = false;

  ensureLoaded(): void {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.http.get<ICategory[]>(this.categoryUrl).subscribe((list) => this._categories.set(list));
  }
}

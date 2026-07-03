import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { ICategory } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoryUrl = `${environment.apiUrl}/category`;

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

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../../../../../../core/tokens/api-base-url.token';
import { ICreateBudget, IBudgetDeleted, IBudgetPatch, IBudgetStatus, IBudgetView } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private readonly mainUrl = inject(API_BASE_URL);
  private readonly budgetUrl = this.mainUrl + '/budget';

  constructor(private readonly http: HttpClient) {}

  list(): Observable<IBudgetView[]> {
    return this.http.get<IBudgetView[]>(this.budgetUrl);
  }

  status(month: number, year: number): Observable<IBudgetStatus[]> {
    return this.http.get<IBudgetStatus[]>(`${this.budgetUrl}/status/${month}/${year}`);
  }

  create(dto: ICreateBudget): Observable<IBudgetView> {
    return this.http.post<IBudgetView>(this.budgetUrl, dto);
  }

  update(id: string, patch: IBudgetPatch): Observable<IBudgetView> {
    return this.http.put<IBudgetView>(`${this.budgetUrl}/${id}`, patch);
  }

  remove(id: string): Observable<IBudgetDeleted> {
    return this.http.delete<IBudgetDeleted>(`${this.budgetUrl}/${id}`);
  }
}

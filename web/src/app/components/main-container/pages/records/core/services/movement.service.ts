import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../../../../../../core/tokens/api-base-url.token';
import { ICreateMovement, IMovement, IMovementFilter, IMovementResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  private readonly mainUrl = inject(API_BASE_URL);
  private readonly movementUrl = this.mainUrl + '/movement';

  constructor(private readonly http: HttpClient) {}

  getMovementsByMonth(year: number, month: number): Observable<IMovementResponse> {
    const url = `${this.movementUrl}/summary/${month}/${year}`;
    return this.http.get<IMovementResponse>(url);
  }

  getMovements(startDate: string, endDate: string, filter?: IMovementFilter): Observable<IMovement[]> {
    const url = `${this.movementUrl}/${startDate}/${endDate}`;
    const hasFilter = !!filter && Object.values(filter).some((value) => value !== undefined);

    if (hasFilter) {
      return this.http.post<IMovement[]>(url, filter);
    }

    return this.http.get<IMovement[]>(url);
  }

  createMovement(dto: ICreateMovement): Observable<IMovement> {
    return this.http.post<IMovement>(this.movementUrl, dto);
  }

  updateMovement(id: string, dto: Partial<ICreateMovement>): Observable<IMovement> {
    return this.http.put<IMovement>(`${this.movementUrl}/${id}`, dto);
  }

  deleteMovement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.movementUrl}/${id}`);
  }
}

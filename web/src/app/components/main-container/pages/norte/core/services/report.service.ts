import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../../../../../../core/tokens/api-base-url.token';
import { IReportByCategory, IReportCashflow, IReportMonthly } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly mainUrl = inject(API_BASE_URL);
  private readonly reportUrl = this.mainUrl + '/report';

  constructor(private readonly http: HttpClient) {}

  byCategory(month: number, year: number): Observable<IReportByCategory[]> {
    return this.http.get<IReportByCategory[]>(`${this.reportUrl}/by-category/${month}/${year}`);
  }

  monthly(year: number): Observable<IReportMonthly[]> {
    return this.http.get<IReportMonthly[]>(`${this.reportUrl}/monthly/${year}`);
  }

  cashflow(month: number, year: number): Observable<IReportCashflow> {
    return this.http.get<IReportCashflow>(`${this.reportUrl}/cashflow/${month}/${year}`);
  }
}

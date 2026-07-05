import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';
import '../../movements/presentation/providers/selected_month_provider.dart';

class ReportRepository {
  ReportRepository(this._dio);

  final Dio _dio;

  Future<List<CategoryReportEntry>> getByCategory({
    required int month,
    required int year,
  }) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/report/by-category/$month/$year',
      );
      return response.data!
          .map(
            (json) =>
                CategoryReportEntry.fromJson(json as Map<String, dynamic>),
          )
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<List<MonthlyReportEntry>> getMonthly({required int year}) async {
    try {
      final response =
          await _dio.get<List<dynamic>>('/report/monthly/$year');
      return response.data!
          .map(
            (json) =>
                MonthlyReportEntry.fromJson(json as Map<String, dynamic>),
          )
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<CashflowReport> getCashflow({
    required int month,
    required int year,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/report/cashflow/$month/$year',
      );
      return CashflowReport.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }
}

final reportRepositoryProvider = Provider<ReportRepository>((ref) {
  return ReportRepository(ref.read(dioClientProvider).dio);
});

// `retry: null` — matches `budgetStatusProvider`'s reasoning (see
// `budget_repository.dart`): each section exposes an explicit "Reintentar"
// button via `ErrorRetry`, so Riverpod's default automatic retries would
// make that button's effect (and the call count it drives) impossible to
// assert, and would keep silently hammering the backend on failure.
Duration? _noRetry(int retryCount, Object error) => null;

final categoryReportProvider =
    FutureProvider<List<CategoryReportEntry>>((ref) {
  final selected = ref.watch(selectedMonthProvider);
  return ref
      .watch(reportRepositoryProvider)
      .getByCategory(month: selected.month, year: selected.year);
}, retry: _noRetry);

final cashflowReportProvider = FutureProvider<CashflowReport>((ref) {
  final selected = ref.watch(selectedMonthProvider);
  return ref
      .watch(reportRepositoryProvider)
      .getCashflow(month: selected.month, year: selected.year);
}, retry: _noRetry);

// `.family`-parameterized by year: unlike `categoryReportProvider` and
// `cashflowReportProvider` (which follow the app-wide `selectedMonthProvider`),
// the monthly chart is scoped by year alone and that year is local UI state
// owned by `ReportsScreen` (see its `_year` field) — this provider takes the
// year as an explicit argument instead of watching a shared provider.
final monthlyReportProvider =
    FutureProvider.family<List<MonthlyReportEntry>, int>((ref, year) {
  return ref.watch(reportRepositoryProvider).getMonthly(year: year);
}, retry: _noRetry);

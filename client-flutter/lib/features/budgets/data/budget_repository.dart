import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';
import '../../movements/presentation/providers/selected_month_provider.dart';

class BudgetRepository {
  BudgetRepository(this._dio);

  final Dio _dio;

  Future<List<BudgetStatus>> getStatus({
    required int month,
    required int year,
  }) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/budget/status/$month/$year',
      );
      return response.data!
          .map((json) => BudgetStatus.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<List<Budget>> getAll({int? page, int? limit}) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/budget',
        queryParameters: {
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return response.data!
          .map((json) => Budget.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<Budget> create({
    required String category,
    required int month,
    required int year,
    required double limit,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/budget',
        data: {
          'Category': category,
          'Month': month,
          'Year': year,
          'Limit': limit,
        },
      );
      return Budget.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<Budget> update(
    String id, {
    String? category,
    int? month,
    int? year,
    double? limit,
  }) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(
        '/budget/$id',
        data: {
          if (category != null) 'Category': category,
          if (month != null) 'Month': month,
          if (year != null) 'Year': year,
          if (limit != null) 'Limit': limit,
        },
      );
      return Budget.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete<Map<String, dynamic>>('/budget/$id');
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }
}

final budgetRepositoryProvider = Provider<BudgetRepository>((ref) {
  return BudgetRepository(ref.read(dioClientProvider).dio);
});

// `retry: null` — matches `categoriesProvider`'s reasoning (see
// `category_repository.dart`): the screen exposes an explicit "Reintentar"
// button via `ErrorRetry`, so Riverpod's default automatic retries would
// make that button's effect (and the call count it drives) impossible to
// assert, and would keep silently hammering the backend on failure.
Duration? _noRetry(int retryCount, Object error) => null;

final budgetStatusProvider = FutureProvider<List<BudgetStatus>>((ref) {
  final selected = ref.watch(selectedMonthProvider);
  return ref
      .watch(budgetRepositoryProvider)
      .getStatus(month: selected.month, year: selected.year);
}, retry: _noRetry);

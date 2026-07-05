import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';

class RecurringRepository {
  RecurringRepository(this._dio);

  final Dio _dio;

  Future<List<Recurring>> getAll({int? page, int? limit}) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/recurring',
        queryParameters: {
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return response.data!
          .map((json) => Recurring.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  // Narrow, purpose-built for the list screen's Active switch — the fuller
  // general-purpose `update` covering every field arrives in Fase 5 slice 2
  // alongside the create/edit form.
  Future<Recurring> setActive(String id, {required bool active}) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(
        '/recurring/$id',
        data: {'Active': active},
      );
      return Recurring.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<List<Movement>> run() async {
    try {
      final response = await _dio.post<List<dynamic>>('/recurring/run');
      return response.data!
          .map((json) => Movement.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  // `Frequency` is always sent explicitly as `'mensual'` on create — it's
  // the only value the backend accepts, and being explicit here matches
  // this codebase's general preference for explicit request bodies over
  // relying on a backend default.
  Future<Recurring> create({
    required MovementType type,
    required double amount,
    required String category,
    required String account,
    required int dayOfMonth,
    bool active = true,
    String? description,
    String? card,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/recurring',
        data: {
          'Type': type.name,
          'Amount': amount,
          'Category': category,
          'Account': account,
          'DayOfMonth': dayOfMonth,
          'Frequency': 'mensual',
          'Active': active,
          if (description != null) 'Description': description,
          if (card != null) 'Card': card,
        },
      );
      return Recurring.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  // `Frequency` and `LastRunYearMonth` are deliberately never sent from this
  // form: `Frequency` has only one valid value (set once at create time),
  // and `LastRunYearMonth` is system-managed by the backend's `run` cycle.
  Future<Recurring> update(
    String id, {
    MovementType? type,
    double? amount,
    String? category,
    String? account,
    int? dayOfMonth,
    bool? active,
    String? description,
    String? card,
  }) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(
        '/recurring/$id',
        data: {
          if (type != null) 'Type': type.name,
          if (amount != null) 'Amount': amount,
          if (category != null) 'Category': category,
          if (account != null) 'Account': account,
          if (dayOfMonth != null) 'DayOfMonth': dayOfMonth,
          if (active != null) 'Active': active,
          if (description != null) 'Description': description,
          if (card != null) 'Card': card,
        },
      );
      return Recurring.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete<Map<String, dynamic>>('/recurring/$id');
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }
}

final recurringRepositoryProvider = Provider<RecurringRepository>((ref) {
  return RecurringRepository(ref.read(dioClientProvider).dio);
});

// `retry: null` — matches `categoriesProvider`'s reasoning (see
// `category_repository.dart`): the screen exposes an explicit "Reintentar"
// button via `ErrorRetry`, so Riverpod's default automatic retries would
// make that button's effect (and the call count it drives) impossible to
// assert, and would keep silently hammering the backend on failure.
Duration? _noRetry(int retryCount, Object error) => null;

final recurringsProvider = FutureProvider<List<Recurring>>((ref) {
  return ref.read(recurringRepositoryProvider).getAll();
}, retry: _noRetry);

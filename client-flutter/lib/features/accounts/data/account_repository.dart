import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';

class AccountRepository {
  AccountRepository(this._dio);

  final Dio _dio;

  Future<List<Account>> getAll({
    bool includeArchived = false,
    int? page,
    int? limit,
  }) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/account',
        queryParameters: {
          if (includeArchived) 'includeArchived': 'true',
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return response.data!
          .map((json) => Account.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<AccountBalance> getBalance(String accountId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/account/$accountId/balance',
      );
      return AccountBalance.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<Account> create({
    required String name,
    required AccountType type,
    String? currency,
    String? icon,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/account',
        data: {
          'Name': name,
          'Type': type.name,
          if (currency != null) 'Currency': currency,
          if (icon != null) 'Icon': icon,
        },
      );
      return Account.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<Account> update(
    String id, {
    String? name,
    AccountType? type,
    String? currency,
    String? icon,
    bool? archived,
  }) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(
        '/account/$id',
        data: {
          if (name != null) 'Name': name,
          if (type != null) 'Type': type.name,
          if (currency != null) 'Currency': currency,
          if (icon != null) 'Icon': icon,
          if (archived != null) 'Archived': archived,
        },
      );
      return Account.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  // The backend soft-deletes accounts: this returns the archived Account
  // object itself (200), not the generic {deleted:true,id} shape every other
  // delete endpoint in this backend uses.
  Future<Account> archive(String id) async {
    try {
      final response = await _dio.delete<Map<String, dynamic>>(
        '/account/$id',
      );
      return Account.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  /// Returns the pair `[egresoMovement, ingresoMovement]` the backend creates
  /// for the transfer (see `AccountService.transfer`), in that order.
  Future<List<Movement>> transfer({
    required String from,
    required String to,
    required num amount,
    required DateTime date,
    String? description,
  }) async {
    try {
      final response = await _dio.post<List<dynamic>>(
        '/account/transfer',
        data: {
          'From': from,
          'To': to,
          'Amount': amount,
          'Date': const DateOnlyConverter().toJson(date),
          if (description != null) 'Description': description,
        },
      );
      return response.data!
          .map((json) => Movement.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }
}

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  return AccountRepository(ref.read(dioClientProvider).dio);
});

// `retry: null` — matches `monthSummaryProvider`'s reasoning (see
// `dashboard_data_provider.dart`): the screens that consume this expose an
// explicit "Reintentar" button, so Riverpod's default automatic retries
// would make that button's effect (and the call count it drives) impossible
// to assert, and would keep silently hammering the backend on failure.
Duration? _noRetry(int retryCount, Object error) => null;

final accountsProvider = FutureProvider<List<Account>>((ref) {
  return ref.read(accountRepositoryProvider).getAll();
}, retry: _noRetry);

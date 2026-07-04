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

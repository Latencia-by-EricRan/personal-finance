import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';

class CategoryRepository {
  CategoryRepository(this._dio);

  final Dio _dio;

  Future<List<Category>> getAll({int? page, int? limit}) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/category',
        queryParameters: {
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return response.data!
          .map((json) => Category.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  // Named `upsert`, not `create`: the backend matches an existing category by
  // Tag if present, else by Name, and updates it if found instead of always
  // inserting a new one. There is no `PUT /category/:id` endpoint.
  Future<Category> upsert({
    required String name,
    required String description,
    required CategoryType type,
    String? tag,
    String? icon,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/category',
        data: {
          'Name': name,
          'Description': description,
          'Type': type.name,
          if (tag != null) 'Tag': tag,
          if (icon != null) 'Icon': icon,
        },
      );
      return Category.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete<Map<String, dynamic>>('/category/$id');
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }
}

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepository(ref.read(dioClientProvider).dio);
});

// `retry: null` — matches `accountsProvider`'s reasoning (see
// `account_repository.dart`): the screens that consume this expose an
// explicit "Reintentar" button, so Riverpod's default automatic retries
// would make that button's effect (and the call count it drives) impossible
// to assert, and would keep silently hammering the backend on failure.
Duration? _noRetry(int retryCount, Object error) => null;

final categoriesProvider = FutureProvider<List<Category>>((ref) {
  return ref.read(categoryRepositoryProvider).getAll();
}, retry: _noRetry);

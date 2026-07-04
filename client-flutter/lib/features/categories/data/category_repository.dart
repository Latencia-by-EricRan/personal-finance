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
}

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepository(ref.read(dioClientProvider).dio);
});

final categoriesProvider = FutureProvider<List<Category>>((ref) {
  return ref.read(categoryRepositoryProvider).getAll();
});

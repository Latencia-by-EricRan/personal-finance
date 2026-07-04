import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';

class MovementRepository {
  MovementRepository(this._dio);

  final Dio _dio;

  Future<MovementSummaryResponse> getSummaryByMonth({
    required int month,
    required int year,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/movement/summary/$month/$year',
      );
      return MovementSummaryResponse.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<List<Movement>> getByRange({
    required DateTime start,
    required DateTime end,
    MovementType? type,
    String? category,
    String? account,
    int? page,
    int? limit,
  }) async {
    try {
      const dateConverter = DateOnlyConverter();
      final startPath = dateConverter.toJson(start);
      final endPath = dateConverter.toJson(end);
      final response = await _dio.post<List<dynamic>>(
        '/movement/$startPath/$endPath',
        data: {
          if (type != null) 'Type': type.name,
          if (category != null) 'Category': category,
          if (account != null) 'Account': account,
        },
        queryParameters: {
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return response.data!
          .map((json) => Movement.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<Movement> create(MovementWriteRequest request) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/movement',
        data: request.toJson(),
      );
      return Movement.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<Movement> update(String id, MovementWriteRequest request) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(
        '/movement/$id',
        data: request.toJson(),
      );
      return Movement.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete<Map<String, dynamic>>('/movement/$id');
    } on DioException catch (error) {
      throw ApiException.fromDioException(error);
    }
  }
}

final movementRepositoryProvider = Provider<MovementRepository>((ref) {
  return MovementRepository(ref.read(dioClientProvider).dio);
});

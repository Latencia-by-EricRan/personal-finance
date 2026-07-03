import 'package:dio/dio.dart';

class ApiException implements Exception {
  const ApiException({required this.message, this.errors, this.statusCode});

  final String message;
  final List<String>? errors;
  final int? statusCode;

  factory ApiException.fromResponseData(dynamic data, {int? statusCode}) {
    if (data is Map<String, dynamic>) {
      final message = data['message'];
      final rawErrors = data['errors'];
      return ApiException(
        message: message is String ? message : 'Unexpected error',
        errors: rawErrors is List
            ? rawErrors.map((error) => error.toString()).toList()
            : null,
        statusCode: statusCode,
      );
    }
    return ApiException(message: 'Unexpected error', statusCode: statusCode);
  }

  factory ApiException.fromDioException(DioException error) {
    final data = error.response?.data;
    if (data != null) {
      return ApiException.fromResponseData(
        data,
        statusCode: error.response?.statusCode,
      );
    }
    return ApiException(
      message: error.message ?? 'Network error',
      statusCode: error.response?.statusCode,
    );
  }

  @override
  String toString() => message;
}

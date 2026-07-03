import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/network/index.dart';

void main() {
  group('ApiException.fromResponseData', () {
    test('parses message and errors from a well-formed error body', () {
      final exception = ApiException.fromResponseData(
        {
          'message': 'Validation failed',
          'errors': ['Email is required', 'Password is required'],
        },
        statusCode: 400,
      );

      expect(exception.message, 'Validation failed');
      expect(exception.errors, ['Email is required', 'Password is required']);
      expect(exception.statusCode, 400);
    });

    test('tolerates a missing errors field', () {
      final exception = ApiException.fromResponseData({
        'message': 'Account not found',
      }, statusCode: 404);

      expect(exception.message, 'Account not found');
      expect(exception.errors, isNull);
    });

    test('falls back to a generic message for malformed bodies', () {
      final exception = ApiException.fromResponseData('not a map');

      expect(exception.message, isNotEmpty);
      expect(exception.errors, isNull);
    });
  });

  group('ApiException.fromDioException', () {
    test('extracts message/errors from the response body', () {
      final dioException = DioException(
        requestOptions: RequestOptions(path: '/movement'),
        response: Response(
          requestOptions: RequestOptions(path: '/movement'),
          statusCode: 401,
          data: {'message': 'Invalid credentials'},
        ),
      );

      final exception = ApiException.fromDioException(dioException);

      expect(exception.message, 'Invalid credentials');
      expect(exception.statusCode, 401);
    });

    test('falls back to the Dio message when there is no response body', () {
      final dioException = DioException(
        requestOptions: RequestOptions(path: '/movement'),
        message: 'Connection timed out',
      );

      final exception = ApiException.fromDioException(dioException);

      expect(exception.message, 'Connection timed out');
      expect(exception.statusCode, isNull);
    });
  });

  test('toString returns the message', () {
    const exception = ApiException(message: 'Boom');
    expect(exception.toString(), 'Boom');
  });
}

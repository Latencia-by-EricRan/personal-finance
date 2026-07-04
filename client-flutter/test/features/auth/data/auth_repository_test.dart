import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/auth/data/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

class _ScriptedAdapter implements HttpClientAdapter {
  _ScriptedAdapter(this.statusCode, this.responseData);

  final int statusCode;
  final Map<String, dynamic> responseData;
  RequestOptions? lastRequestOptions;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastRequestOptions = options;
    return ResponseBody.fromString(
      jsonEncode(responseData),
      statusCode,
      headers: {
        'content-type': ['application/json'],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

Dio _buildDio(_ScriptedAdapter adapter) {
  final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'))
    ..httpClientAdapter = adapter;
  return dio;
}

void main() {
  test(
    'login sends the exact PascalCase body and parses the token response',
    () async {
      final adapter = _ScriptedAdapter(200, {
        'token': 'jwt-token',
        'expiresIn': '1d',
      });
      final repository = AuthRepository(_buildDio(adapter));

      final response = await repository.login(
        email: 'user@example.com',
        password: 's3cret',
      );

      expect(response, isA<AuthTokenResponse>());
      expect(response.token, 'jwt-token');
      expect(response.expiresIn, '1d');
      expect(adapter.lastRequestOptions?.path, '/auth/login');
      expect(adapter.lastRequestOptions?.data, {
        'Email': 'user@example.com',
        'Password': 's3cret',
      });
    },
  );

  test('login throws an ApiException with the backend message on 401',
      () async {
    final adapter = _ScriptedAdapter(401, {'message': 'Invalid credentials'});
    final repository = AuthRepository(_buildDio(adapter));

    await expectLater(
      repository.login(email: 'user@example.com', password: 'wrong'),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Invalid credentials')
            .having((error) => error.statusCode, 'statusCode', 401),
      ),
    );
  });

  test(
    'login surfaces an ApiException when the request fails with no response',
    () async {
      final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'))
        ..httpClientAdapter = _NoResponseAdapter();
      final repository = AuthRepository(dio);

      await expectLater(
        repository.login(email: 'user@example.com', password: 'wrong'),
        throwsA(
          isA<ApiException>()
              .having((error) => error.statusCode, 'statusCode', isNull)
              .having((error) => error.message, 'message', isNotEmpty),
        ),
      );
    },
  );
}

class _NoResponseAdapter implements HttpClientAdapter {
  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) {
    throw DioException.connectionTimeout(
      timeout: const Duration(seconds: 1),
      requestOptions: options,
    );
  }

  @override
  void close({bool force = false}) {}
}

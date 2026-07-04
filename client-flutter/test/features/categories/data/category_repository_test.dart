import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/categories/data/index.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

class _ScriptedAdapter implements HttpClientAdapter {
  _ScriptedAdapter(this.statusCode, this.responseData);

  final int statusCode;
  final dynamic responseData;
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
  test('getAll parses the raw category array', () async {
    final adapter = _ScriptedAdapter(200, [
      {
        '_id': 'cat-1',
        'Description': 'Groceries',
        'Name': 'Supermarket',
        'Tag': 'food',
        'Type': 'variable',
      },
    ]);
    final repository = CategoryRepository(_buildDio(adapter));

    final categories = await repository.getAll();

    expect(categories, hasLength(1));
    expect(categories.first.name, 'Supermarket');
    expect(adapter.lastRequestOptions?.path, '/category');
    expect(adapter.lastRequestOptions?.method, 'GET');
    expect(adapter.lastRequestOptions?.queryParameters, <String, dynamic>{});
  });

  test('getAll sends page and limit as query parameters when provided',
      () async {
    final adapter = _ScriptedAdapter(200, <dynamic>[]);
    final repository = CategoryRepository(_buildDio(adapter));

    await repository.getAll(page: 1, limit: 50);

    expect(adapter.lastRequestOptions?.queryParameters, {
      'page': 1,
      'limit': 50,
    });
  });

  test('getAll throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = CategoryRepository(_buildDio(adapter));

    await expectLater(
      repository.getAll(),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });
}

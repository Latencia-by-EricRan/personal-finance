import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/categories/data/index.dart';
import 'package:client_flutter/shared/models/index.dart';
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

  test('upsert posts the exact PascalCase body and parses the result',
      () async {
    final adapter = _ScriptedAdapter(201, {
      '_id': 'cat-1',
      'Description': 'Groceries',
      'Name': 'Supermarket',
      'Tag': 'food',
      'Type': 'variable',
    });
    final repository = CategoryRepository(_buildDio(adapter));

    final category = await repository.upsert(
      name: 'Supermarket',
      description: 'Groceries',
      type: CategoryType.variable,
      tag: 'food',
    );

    expect(category.id, 'cat-1');
    expect(category.name, 'Supermarket');
    expect(adapter.lastRequestOptions?.path, '/category');
    expect(adapter.lastRequestOptions?.method, 'POST');
    expect(adapter.lastRequestOptions?.data, {
      'Name': 'Supermarket',
      'Description': 'Groceries',
      'Type': 'variable',
      'Tag': 'food',
    });
  });

  test('upsert omits Tag and Icon from the body when they are null',
      () async {
    final adapter = _ScriptedAdapter(201, {
      '_id': 'cat-2',
      'Description': 'Rent',
      'Name': 'Alquiler',
      'Tag': '',
      'Type': 'fijo',
    });
    final repository = CategoryRepository(_buildDio(adapter));

    await repository.upsert(
      name: 'Alquiler',
      description: 'Rent',
      type: CategoryType.fijo,
    );

    expect(adapter.lastRequestOptions?.data, {
      'Name': 'Alquiler',
      'Description': 'Rent',
      'Type': 'fijo',
    });
  });

  test('upsert throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = CategoryRepository(_buildDio(adapter));

    await expectLater(
      repository.upsert(
        name: 'Supermarket',
        description: 'Groceries',
        type: CategoryType.variable,
      ),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });

  test('delete sends a DELETE request to /category/:id', () async {
    final adapter = _ScriptedAdapter(200, {'deleted': true, 'id': 'cat-1'});
    final repository = CategoryRepository(_buildDio(adapter));

    await repository.delete('cat-1');

    expect(adapter.lastRequestOptions?.path, '/category/cat-1');
    expect(adapter.lastRequestOptions?.method, 'DELETE');
  });

  test('delete throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = CategoryRepository(_buildDio(adapter));

    await expectLater(
      repository.delete('cat-1'),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });
}

import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/budgets/data/index.dart';
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
  test(
      'getStatus hits GET /budget/status/:month/:year and parses the array '
      'including the nested populated Category', () async {
    final adapter = _ScriptedAdapter(200, [
      {
        'Category': {
          '_id': 'cat-1',
          'Description': 'Groceries',
          'Name': 'Supermarket',
          'Tag': 'food',
          'Type': 'variable',
        },
        'Limit': 500.0,
        'Spent': 350.0,
        'Remaining': 150.0,
        'Percent': 70.0,
      },
    ]);
    final repository = BudgetRepository(_buildDio(adapter));

    final statuses = await repository.getStatus(month: 7, year: 2026);

    expect(statuses, hasLength(1));
    expect(statuses.first.category.name, 'Supermarket');
    expect(statuses.first.category.id, 'cat-1');
    expect(statuses.first.limit, 500.0);
    expect(statuses.first.spent, 350.0);
    expect(statuses.first.remaining, 150.0);
    expect(statuses.first.percent, 70.0);
    expect(adapter.lastRequestOptions?.path, '/budget/status/7/2026');
    expect(adapter.lastRequestOptions?.method, 'GET');
  });

  test('getStatus throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = BudgetRepository(_buildDio(adapter));

    await expectLater(
      repository.getStatus(month: 7, year: 2026),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });
}

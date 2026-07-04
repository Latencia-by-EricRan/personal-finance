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

  test('getAll parses the raw budget array', () async {
    final adapter = _ScriptedAdapter(200, [
      {'_id': 'budget-1', 'Category': 'cat-1', 'Month': 7, 'Year': 2026, 'Limit': 500.0},
    ]);
    final repository = BudgetRepository(_buildDio(adapter));

    final budgets = await repository.getAll();

    expect(budgets, hasLength(1));
    expect(budgets.first.id, 'budget-1');
    expect(budgets.first.category, 'cat-1');
    expect(budgets.first.month, 7);
    expect(budgets.first.year, 2026);
    expect(budgets.first.limit, 500.0);
    expect(adapter.lastRequestOptions?.path, '/budget');
    expect(adapter.lastRequestOptions?.method, 'GET');
    expect(adapter.lastRequestOptions?.queryParameters, <String, dynamic>{});
  });

  test('getAll sends page and limit as query parameters when provided',
      () async {
    final adapter = _ScriptedAdapter(200, <dynamic>[]);
    final repository = BudgetRepository(_buildDio(adapter));

    await repository.getAll(page: 1, limit: 200);

    expect(adapter.lastRequestOptions?.queryParameters, {
      'page': 1,
      'limit': 200,
    });
  });

  test('getAll throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = BudgetRepository(_buildDio(adapter));

    await expectLater(
      repository.getAll(),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });

  test('create sends the PascalCase body and parses the created budget',
      () async {
    final adapter = _ScriptedAdapter(201, {
      '_id': 'budget-1',
      'Category': 'cat-1',
      'Month': 7,
      'Year': 2026,
      'Limit': 500.0,
    });
    final repository = BudgetRepository(_buildDio(adapter));

    final budget = await repository.create(
      category: 'cat-1',
      month: 7,
      year: 2026,
      limit: 500.0,
    );

    expect(budget.id, 'budget-1');
    expect(adapter.lastRequestOptions?.path, '/budget');
    expect(adapter.lastRequestOptions?.method, 'POST');
    expect(adapter.lastRequestOptions?.data, {
      'Category': 'cat-1',
      'Month': 7,
      'Year': 2026,
      'Limit': 500.0,
    });
  });

  test(
      'create throws an ApiException on a duplicate {Category,Month,Year} '
      'constraint violation', () async {
    final adapter = _ScriptedAdapter(400, {
      'message':
          'A budget already exists for this category in this month/year',
    });
    final repository = BudgetRepository(_buildDio(adapter));

    await expectLater(
      repository.create(category: 'cat-1', month: 7, year: 2026, limit: 500),
      throwsA(
        isA<ApiException>()
            .having(
              (error) => error.message,
              'message',
              'A budget already exists for this category in this month/year',
            )
            .having((error) => error.statusCode, 'statusCode', 400),
      ),
    );
  });

  test('update sends only the provided fields and parses the updated budget',
      () async {
    final adapter = _ScriptedAdapter(200, {
      '_id': 'budget-1',
      'Category': 'cat-1',
      'Month': 7,
      'Year': 2026,
      'Limit': 750.0,
    });
    final repository = BudgetRepository(_buildDio(adapter));

    final budget = await repository.update('budget-1', limit: 750.0);

    expect(budget.limit, 750.0);
    expect(adapter.lastRequestOptions?.path, '/budget/budget-1');
    expect(adapter.lastRequestOptions?.method, 'PUT');
    expect(adapter.lastRequestOptions?.data, {'Limit': 750.0});
  });

  test('update throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Budget not found'});
    final repository = BudgetRepository(_buildDio(adapter));

    await expectLater(
      repository.update('missing', limit: 750),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Budget not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });

  test('delete sends a DELETE and parses the generic {deleted,id} shape',
      () async {
    final adapter = _ScriptedAdapter(200, {'deleted': true, 'id': 'budget-1'});
    final repository = BudgetRepository(_buildDio(adapter));

    await repository.delete('budget-1');

    expect(adapter.lastRequestOptions?.path, '/budget/budget-1');
    expect(adapter.lastRequestOptions?.method, 'DELETE');
  });

  test('delete throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Budget not found'});
    final repository = BudgetRepository(_buildDio(adapter));

    await expectLater(
      repository.delete('missing'),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Budget not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });
}

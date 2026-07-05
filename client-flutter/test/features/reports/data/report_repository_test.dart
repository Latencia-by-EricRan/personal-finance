import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/reports/data/index.dart';
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
  group('getByCategory', () {
    test(
        'hits GET /report/by-category/:month/:year and parses the array '
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
          'Total': 350.0,
        },
      ]);
      final repository = ReportRepository(_buildDio(adapter));

      final entries = await repository.getByCategory(month: 7, year: 2026);

      expect(entries, hasLength(1));
      expect(entries.first.category.name, 'Supermarket');
      expect(entries.first.category.id, 'cat-1');
      expect(entries.first.total, 350.0);
      expect(adapter.lastRequestOptions?.path, '/report/by-category/7/2026');
      expect(adapter.lastRequestOptions?.method, 'GET');
    });

    test('throws an ApiException on a server error', () async {
      final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
      final repository = ReportRepository(_buildDio(adapter));

      await expectLater(
        repository.getByCategory(month: 7, year: 2026),
        throwsA(
          isA<ApiException>()
              .having((error) => error.message, 'message', 'Server error')
              .having((error) => error.statusCode, 'statusCode', 500),
        ),
      );
    });
  });

  group('getMonthly', () {
    test('hits GET /report/monthly/:year and parses the 12 entries',
        () async {
      final adapter = _ScriptedAdapter(200, [
        for (var month = 1; month <= 12; month++)
          {
            'Month': month,
            'Income': 1000.0 * month,
            'Expense': 500.0 * month,
            'Net': 500.0 * month,
          },
      ]);
      final repository = ReportRepository(_buildDio(adapter));

      final entries = await repository.getMonthly(year: 2026);

      expect(entries, hasLength(12));
      expect(entries.first.month, 1);
      expect(entries.first.income, 1000.0);
      expect(entries.first.expense, 500.0);
      expect(entries.first.net, 500.0);
      expect(entries.last.month, 12);
      expect(adapter.lastRequestOptions?.path, '/report/monthly/2026');
      expect(adapter.lastRequestOptions?.method, 'GET');
    });

    test('throws an ApiException on a server error', () async {
      final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
      final repository = ReportRepository(_buildDio(adapter));

      await expectLater(
        repository.getMonthly(year: 2026),
        throwsA(
          isA<ApiException>()
              .having((error) => error.message, 'message', 'Server error')
              .having((error) => error.statusCode, 'statusCode', 500),
        ),
      );
    });
  });

  group('getCashflow', () {
    test('hits GET /report/cashflow/:month/:year and parses the object',
        () async {
      final adapter = _ScriptedAdapter(200, {
        'Month': 7,
        'Year': 2026,
        'Income': 5000.0,
        'Expense': 3000.0,
        'Net': 2000.0,
      });
      final repository = ReportRepository(_buildDio(adapter));

      final cashflow = await repository.getCashflow(month: 7, year: 2026);

      expect(cashflow.month, 7);
      expect(cashflow.year, 2026);
      expect(cashflow.income, 5000.0);
      expect(cashflow.expense, 3000.0);
      expect(cashflow.net, 2000.0);
      expect(adapter.lastRequestOptions?.path, '/report/cashflow/7/2026');
      expect(adapter.lastRequestOptions?.method, 'GET');
    });

    test('throws an ApiException on a server error', () async {
      final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
      final repository = ReportRepository(_buildDio(adapter));

      await expectLater(
        repository.getCashflow(month: 7, year: 2026),
        throwsA(
          isA<ApiException>()
              .having((error) => error.message, 'message', 'Server error')
              .having((error) => error.statusCode, 'statusCode', 500),
        ),
      );
    });
  });
}

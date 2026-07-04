import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/movements/data/index.dart';
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

Map<String, dynamic> _movementJson({String id = 'mv-1'}) => {
      '_id': id,
      'Amount': 150.5,
      'Category': {
        '_id': 'cat-1',
        'Description': 'Groceries',
        'Name': 'Supermarket',
        'Tag': 'food',
        'Type': 'variable',
      },
      'Date': '2026-06-15',
      'Type': 'egreso',
      'Account': 'acc-1',
      'Description': 'Weekly shopping',
    };

void main() {
  group('getSummaryByMonth', () {
    test('parses the summary response', () async {
      final adapter = _ScriptedAdapter(200, {
        'month': 6,
        'year': 2026,
        'summary': {
          'items': 2,
          'amount': {'income': 1000, 'expense': 500},
        },
        'movements': [_movementJson()],
      });
      final repository = MovementRepository(_buildDio(adapter));

      final response = await repository.getSummaryByMonth(
        month: 6,
        year: 2026,
      );

      expect(response.month, 6);
      expect(response.year, 2026);
      expect(response.movements, hasLength(1));
      expect(adapter.lastRequestOptions?.path, '/movement/summary/6/2026');
      expect(adapter.lastRequestOptions?.method, 'GET');
    });
  });

  group('getByRange', () {
    test(
      'builds the YYYY-MM-DD path and sends an empty body without filters',
      () async {
        final adapter = _ScriptedAdapter(200, [_movementJson()]);
        final repository = MovementRepository(_buildDio(adapter));

        final movements = await repository.getByRange(
          start: DateTime(2026, 6, 1),
          end: DateTime(2026, 6, 30),
        );

        expect(movements, hasLength(1));
        expect(movements.first.id, 'mv-1');
        expect(adapter.lastRequestOptions?.path,
            '/movement/2026-06-01/2026-06-30');
        expect(adapter.lastRequestOptions?.method, 'POST');
        expect(adapter.lastRequestOptions?.data, <String, dynamic>{});
        expect(
            adapter.lastRequestOptions?.queryParameters, <String, dynamic>{});
      },
    );

    test('includes only the non-null filter fields in the body', () async {
      final adapter = _ScriptedAdapter(200, [_movementJson()]);
      final repository = MovementRepository(_buildDio(adapter));

      await repository.getByRange(
        start: DateTime(2026, 1, 5),
        end: DateTime(2026, 1, 10),
        type: MovementType.ingreso,
        category: 'cat-1',
      );

      expect(
          adapter.lastRequestOptions?.path, '/movement/2026-01-05/2026-01-10');
      expect(adapter.lastRequestOptions?.data, {
        'Type': 'ingreso',
        'Category': 'cat-1',
      });
    });

    test('sends page and limit as query parameters when provided', () async {
      final adapter = _ScriptedAdapter(200, [_movementJson()]);
      final repository = MovementRepository(_buildDio(adapter));

      await repository.getByRange(
        start: DateTime(2026, 1, 1),
        end: DateTime(2026, 1, 31),
        page: 2,
        limit: 20,
      );

      expect(adapter.lastRequestOptions?.queryParameters, {
        'page': 2,
        'limit': 20,
      });
    });
  });

  group('create', () {
    test('sends the exact MovementWriteRequest JSON body', () async {
      final adapter = _ScriptedAdapter(201, _movementJson());
      final repository = MovementRepository(_buildDio(adapter));
      final request = MovementWriteRequest(
        type: MovementType.egreso,
        amount: 150.5,
        category: 'cat-1',
        account: 'acc-1',
        date: DateTime(2026, 6, 15),
        description: 'Weekly shopping',
      );

      final movement = await repository.create(request);

      expect(movement.id, 'mv-1');
      expect(adapter.lastRequestOptions?.path, '/movement');
      expect(adapter.lastRequestOptions?.method, 'POST');
      expect(adapter.lastRequestOptions?.data,
          jsonDecode(jsonEncode(request.toJson())));
    });
  });

  group('update', () {
    test('sends a PUT with the exact MovementWriteRequest JSON body', () async {
      final adapter = _ScriptedAdapter(200, _movementJson());
      final repository = MovementRepository(_buildDio(adapter));
      final request = MovementWriteRequest(
        type: MovementType.egreso,
        amount: 200,
        category: 'cat-1',
        account: 'acc-1',
        date: DateTime(2026, 6, 15),
      );

      final movement = await repository.update('mv-1', request);

      expect(movement.id, 'mv-1');
      expect(adapter.lastRequestOptions?.path, '/movement/mv-1');
      expect(adapter.lastRequestOptions?.method, 'PUT');
      expect(adapter.lastRequestOptions?.data,
          jsonDecode(jsonEncode(request.toJson())));
    });
  });

  group('delete', () {
    test('completes successfully on 200', () async {
      final adapter = _ScriptedAdapter(200, {'deleted': true, 'id': 'mv-1'});
      final repository = MovementRepository(_buildDio(adapter));

      await repository.delete('mv-1');

      expect(adapter.lastRequestOptions?.path, '/movement/mv-1');
      expect(adapter.lastRequestOptions?.method, 'DELETE');
    });

    test('throws an ApiException when the movement is not found', () async {
      final adapter = _ScriptedAdapter(404, {'message': 'Movement not found'});
      final repository = MovementRepository(_buildDio(adapter));

      await expectLater(
        repository.delete('missing'),
        throwsA(
          isA<ApiException>()
              .having((error) => error.message, 'message', 'Movement not found')
              .having((error) => error.statusCode, 'statusCode', 404),
        ),
      );
    });
  });
}

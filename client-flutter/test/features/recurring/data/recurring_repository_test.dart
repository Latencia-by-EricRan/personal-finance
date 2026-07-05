import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/recurring/data/index.dart';
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

Map<String, dynamic> _recurringJson({
  String id = 'rec-1',
  bool active = true,
}) =>
    {
      '_id': id,
      'Type': 'egreso',
      'Amount': 1500.0,
      'Category': 'cat-1',
      'Account': 'acc-1',
      'Frequency': 'mensual',
      'DayOfMonth': 5,
      'Active': active,
    };

void main() {
  test('getAll parses the raw recurring array with unpopulated ids', () async {
    final adapter = _ScriptedAdapter(200, [_recurringJson()]);
    final repository = RecurringRepository(_buildDio(adapter));

    final recurrings = await repository.getAll();

    expect(recurrings, hasLength(1));
    expect(recurrings.first.id, 'rec-1');
    expect(recurrings.first.category, 'cat-1');
    expect(recurrings.first.account, 'acc-1');
    expect(recurrings.first.dayOfMonth, 5);
    expect(recurrings.first.active, isTrue);
    expect(adapter.lastRequestOptions?.path, '/recurring');
    expect(adapter.lastRequestOptions?.method, 'GET');
    expect(adapter.lastRequestOptions?.queryParameters, <String, dynamic>{});
  });

  test('getAll sends page and limit as query parameters when provided',
      () async {
    final adapter = _ScriptedAdapter(200, <dynamic>[]);
    final repository = RecurringRepository(_buildDio(adapter));

    await repository.getAll(page: 1, limit: 50);

    expect(adapter.lastRequestOptions?.queryParameters, {
      'page': 1,
      'limit': 50,
    });
  });

  test('getAll throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = RecurringRepository(_buildDio(adapter));

    await expectLater(
      repository.getAll(),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });

  test('setActive sends exactly {Active: true} and parses the updated entity',
      () async {
    final adapter = _ScriptedAdapter(200, _recurringJson(active: true));
    final repository = RecurringRepository(_buildDio(adapter));

    final recurring = await repository.setActive('rec-1', active: true);

    expect(recurring.active, isTrue);
    expect(adapter.lastRequestOptions?.path, '/recurring/rec-1');
    expect(adapter.lastRequestOptions?.method, 'PUT');
    expect(adapter.lastRequestOptions?.data, {'Active': true});
  });

  test('setActive sends exactly {Active: false}', () async {
    final adapter = _ScriptedAdapter(200, _recurringJson(active: false));
    final repository = RecurringRepository(_buildDio(adapter));

    await repository.setActive('rec-1', active: false);

    expect(adapter.lastRequestOptions?.data, {'Active': false});
  });

  test('setActive throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Recurring not found'});
    final repository = RecurringRepository(_buildDio(adapter));

    await expectLater(
      repository.setActive('missing', active: true),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Recurring not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });

  test(
      'run posts with no body and parses the created, populated-Category '
      'movement array', () async {
    final adapter = _ScriptedAdapter(200, [
      {
        '_id': 'mv-1',
        'Amount': 1500.0,
        'Category': {
          '_id': 'cat-1',
          'Description': 'Renta',
          'Name': 'Alquiler',
          'Tag': 'housing',
          'Type': 'fijo',
        },
        'Date': '2026-07-05',
        'Type': 'egreso',
        'Account': 'acc-1',
      },
    ]);
    final repository = RecurringRepository(_buildDio(adapter));

    final movements = await repository.run();

    expect(movements, hasLength(1));
    expect(movements.first.id, 'mv-1');
    expect(movements.first.category?.name, 'Alquiler');
    expect(adapter.lastRequestOptions?.path, '/recurring/run');
    expect(adapter.lastRequestOptions?.method, 'POST');
    expect(adapter.lastRequestOptions?.data, isNull);
  });

  test('run returns an empty list when no template was due', () async {
    final adapter = _ScriptedAdapter(200, <dynamic>[]);
    final repository = RecurringRepository(_buildDio(adapter));

    final movements = await repository.run();

    expect(movements, isEmpty);
  });

  test('run throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = RecurringRepository(_buildDio(adapter));

    await expectLater(
      repository.run(),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });

  test(
      'create sends the exact PascalCase body with explicit Frequency: '
      'mensual and parses the created entity', () async {
    final adapter = _ScriptedAdapter(200, _recurringJson());
    final repository = RecurringRepository(_buildDio(adapter));

    final recurring = await repository.create(
      type: MovementType.egreso,
      amount: 1500,
      category: 'cat-1',
      account: 'acc-1',
      dayOfMonth: 5,
    );

    expect(recurring.id, 'rec-1');
    expect(adapter.lastRequestOptions?.path, '/recurring');
    expect(adapter.lastRequestOptions?.method, 'POST');
    expect(adapter.lastRequestOptions?.data, {
      'Type': 'egreso',
      'Amount': 1500.0,
      'Category': 'cat-1',
      'Account': 'acc-1',
      'DayOfMonth': 5,
      'Frequency': 'mensual',
      'Active': true,
    });
  });

  test('create includes optional Description and Card when provided',
      () async {
    final adapter = _ScriptedAdapter(200, _recurringJson());
    final repository = RecurringRepository(_buildDio(adapter));

    await repository.create(
      type: MovementType.egreso,
      amount: 1500,
      category: 'cat-1',
      account: 'acc-1',
      dayOfMonth: 5,
      active: false,
      description: 'Alquiler',
      card: 'Visa',
    );

    expect(adapter.lastRequestOptions?.data, {
      'Type': 'egreso',
      'Amount': 1500.0,
      'Category': 'cat-1',
      'Account': 'acc-1',
      'DayOfMonth': 5,
      'Frequency': 'mensual',
      'Active': false,
      'Description': 'Alquiler',
      'Card': 'Visa',
    });
  });

  test('create throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = RecurringRepository(_buildDio(adapter));

    await expectLater(
      repository.create(
        type: MovementType.egreso,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        dayOfMonth: 5,
      ),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });

  test(
      'update sends only the provided fields and never includes Frequency '
      'or LastRunYearMonth', () async {
    final adapter = _ScriptedAdapter(200, _recurringJson());
    final repository = RecurringRepository(_buildDio(adapter));

    await repository.update('rec-1', amount: 2000, dayOfMonth: 10);

    expect(adapter.lastRequestOptions?.path, '/recurring/rec-1');
    expect(adapter.lastRequestOptions?.method, 'PUT');
    expect(adapter.lastRequestOptions?.data, {
      'Amount': 2000.0,
      'DayOfMonth': 10,
    });
  });

  test('update sends every field when all are provided', () async {
    final adapter = _ScriptedAdapter(200, _recurringJson());
    final repository = RecurringRepository(_buildDio(adapter));

    await repository.update(
      'rec-1',
      type: MovementType.ingreso,
      amount: 3000,
      category: 'cat-2',
      account: 'acc-2',
      dayOfMonth: 15,
      active: false,
      description: 'Sueldo',
      card: 'Visa',
    );

    expect(adapter.lastRequestOptions?.data, {
      'Type': 'ingreso',
      'Amount': 3000.0,
      'Category': 'cat-2',
      'Account': 'acc-2',
      'DayOfMonth': 15,
      'Active': false,
      'Description': 'Sueldo',
      'Card': 'Visa',
    });
  });

  test('update parses the returned entity', () async {
    final adapter = _ScriptedAdapter(200, _recurringJson(active: false));
    final repository = RecurringRepository(_buildDio(adapter));

    final recurring = await repository.update('rec-1', active: false);

    expect(recurring.active, isFalse);
  });

  test('update throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Recurring not found'});
    final repository = RecurringRepository(_buildDio(adapter));

    await expectLater(
      repository.update('missing', amount: 100),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Recurring not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });

  test('delete sends a DELETE to /recurring/:id', () async {
    final adapter = _ScriptedAdapter(200, {'deleted': true, 'id': 'rec-1'});
    final repository = RecurringRepository(_buildDio(adapter));

    await repository.delete('rec-1');

    expect(adapter.lastRequestOptions?.path, '/recurring/rec-1');
    expect(adapter.lastRequestOptions?.method, 'DELETE');
  });

  test('delete throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Recurring not found'});
    final repository = RecurringRepository(_buildDio(adapter));

    await expectLater(
      repository.delete('missing'),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Recurring not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });
}

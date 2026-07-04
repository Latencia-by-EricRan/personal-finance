import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/accounts/data/index.dart';
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

Map<String, dynamic> _accountJson() => {
      '_id': 'acc-1',
      'Name': 'Main checking',
      'Type': 'banco',
      'Currency': 'ARS',
      'Archived': false,
    };

void main() {
  test('getAll parses the raw account array and excludes archived by default',
      () async {
    final adapter = _ScriptedAdapter(200, [_accountJson()]);
    final repository = AccountRepository(_buildDio(adapter));

    final accounts = await repository.getAll();

    expect(accounts, hasLength(1));
    expect(accounts.first.name, 'Main checking');
    expect(adapter.lastRequestOptions?.path, '/account');
    expect(adapter.lastRequestOptions?.method, 'GET');
    expect(adapter.lastRequestOptions?.queryParameters, <String, dynamic>{});
  });

  test('getAll sends includeArchived=true only when requested', () async {
    final adapter = _ScriptedAdapter(200, [_accountJson()]);
    final repository = AccountRepository(_buildDio(adapter));

    await repository.getAll(includeArchived: true);

    expect(adapter.lastRequestOptions?.queryParameters, {
      'includeArchived': 'true',
    });
  });

  test('getAll sends page and limit as query parameters when provided',
      () async {
    final adapter = _ScriptedAdapter(200, <dynamic>[]);
    final repository = AccountRepository(_buildDio(adapter));

    await repository.getAll(page: 3, limit: 10);

    expect(adapter.lastRequestOptions?.queryParameters, {
      'page': 3,
      'limit': 10,
    });
  });

  test('getAll throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final repository = AccountRepository(_buildDio(adapter));

    await expectLater(
      repository.getAll(),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Server error')
            .having((error) => error.statusCode, 'statusCode', 500),
      ),
    );
  });

  test('getBalance parses the account balance response', () async {
    final adapter = _ScriptedAdapter(200, {
      'Account': 'acc-1',
      'Balance': -1250.5,
    });
    final repository = AccountRepository(_buildDio(adapter));

    final balance = await repository.getBalance('acc-1');

    expect(balance.account, 'acc-1');
    expect(balance.balance, -1250.5);
    expect(adapter.lastRequestOptions?.path, '/account/acc-1/balance');
    expect(adapter.lastRequestOptions?.method, 'GET');
  });

  test('getBalance throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Account not found'});
    final repository = AccountRepository(_buildDio(adapter));

    await expectLater(
      repository.getBalance('missing'),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Account not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });

  test('create sends only the provided fields and parses the created account',
      () async {
    final adapter = _ScriptedAdapter(201, _accountJson());
    final repository = AccountRepository(_buildDio(adapter));

    final account = await repository.create(
      name: 'Main checking',
      type: AccountType.banco,
    );

    expect(account.name, 'Main checking');
    expect(adapter.lastRequestOptions?.path, '/account');
    expect(adapter.lastRequestOptions?.method, 'POST');
    expect(adapter.lastRequestOptions?.data, {
      'Name': 'Main checking',
      'Type': 'banco',
    });
  });

  test('create sends currency and icon when provided', () async {
    final adapter = _ScriptedAdapter(201, _accountJson());
    final repository = AccountRepository(_buildDio(adapter));

    await repository.create(
      name: 'Main checking',
      type: AccountType.banco,
      currency: 'USD',
      icon: 'wallet',
    );

    expect(adapter.lastRequestOptions?.data, {
      'Name': 'Main checking',
      'Type': 'banco',
      'Currency': 'USD',
      'Icon': 'wallet',
    });
  });

  test('create throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(400, {'message': 'Invalid account'});
    final repository = AccountRepository(_buildDio(adapter));

    await expectLater(
      repository.create(name: 'Bad', type: AccountType.efectivo),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Invalid account')
            .having((error) => error.statusCode, 'statusCode', 400),
      ),
    );
  });

  test('update sends only the provided fields and parses the updated account',
      () async {
    final adapter = _ScriptedAdapter(200, _accountJson());
    final repository = AccountRepository(_buildDio(adapter));

    final account = await repository.update('acc-1', name: 'New name');

    expect(account.name, 'Main checking');
    expect(adapter.lastRequestOptions?.path, '/account/acc-1');
    expect(adapter.lastRequestOptions?.method, 'PUT');
    expect(adapter.lastRequestOptions?.data, {'Name': 'New name'});
  });

  test('update sends archived:false to restore an archived account', () async {
    final adapter = _ScriptedAdapter(200, _accountJson());
    final repository = AccountRepository(_buildDio(adapter));

    await repository.update('acc-1', archived: false);

    expect(adapter.lastRequestOptions?.data, {'Archived': false});
  });

  test('update sends every provided optional field together', () async {
    final adapter = _ScriptedAdapter(200, _accountJson());
    final repository = AccountRepository(_buildDio(adapter));

    await repository.update(
      'acc-1',
      name: 'New name',
      type: AccountType.tarjeta,
      currency: 'USD',
      icon: 'card',
      archived: true,
    );

    expect(adapter.lastRequestOptions?.data, {
      'Name': 'New name',
      'Type': 'tarjeta',
      'Currency': 'USD',
      'Icon': 'card',
      'Archived': true,
    });
  });

  test('update throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Account not found'});
    final repository = AccountRepository(_buildDio(adapter));

    await expectLater(
      repository.update('missing', name: 'New name'),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Account not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });

  test(
      'archive sends a DELETE and parses the archived account object,'
      ' not a generic delete-confirmation shape', () async {
    final archivedJson = {..._accountJson(), 'Archived': true};
    final adapter = _ScriptedAdapter(200, archivedJson);
    final repository = AccountRepository(_buildDio(adapter));

    final account = await repository.archive('acc-1');

    expect(account.id, 'acc-1');
    expect(account.archived, isTrue);
    expect(adapter.lastRequestOptions?.path, '/account/acc-1');
    expect(adapter.lastRequestOptions?.method, 'DELETE');
  });

  test('archive throws an ApiException on a server error', () async {
    final adapter = _ScriptedAdapter(404, {'message': 'Account not found'});
    final repository = AccountRepository(_buildDio(adapter));

    await expectLater(
      repository.archive('missing'),
      throwsA(
        isA<ApiException>()
            .having((error) => error.message, 'message', 'Account not found')
            .having((error) => error.statusCode, 'statusCode', 404),
      ),
    );
  });

  test(
    'transfer sends the PascalCase body and parses the 2-movement array'
    ' response',
    () async {
      final movementsJson = [
        {
          '_id': 'mv-egreso',
          'Amount': 500.0,
          'Date': '2026-07-03',
          'Type': 'egreso',
          'Account': 'acc-1',
          'TransferId': 'transfer-1',
        },
        {
          '_id': 'mv-ingreso',
          'Amount': 500.0,
          'Date': '2026-07-03',
          'Type': 'ingreso',
          'Account': 'acc-2',
          'TransferId': 'transfer-1',
        },
      ];
      final adapter = _ScriptedAdapter(201, movementsJson);
      final repository = AccountRepository(_buildDio(adapter));

      final movements = await repository.transfer(
        from: 'acc-1',
        to: 'acc-2',
        amount: 500,
        date: DateTime(2026, 7, 3),
        description: 'Ahorro mensual',
      );

      expect(movements, hasLength(2));
      expect(movements.first.type, MovementType.egreso);
      expect(movements.last.type, MovementType.ingreso);
      expect(movements.first.transferId, 'transfer-1');
      expect(adapter.lastRequestOptions?.path, '/account/transfer');
      expect(adapter.lastRequestOptions?.method, 'POST');
      expect(adapter.lastRequestOptions?.data, {
        'From': 'acc-1',
        'To': 'acc-2',
        'Amount': 500,
        'Date': '2026-07-03',
        'Description': 'Ahorro mensual',
      });
    },
  );

  test('transfer omits Description when not provided', () async {
    final movementsJson = [
      {
        '_id': 'mv-egreso',
        'Amount': 500.0,
        'Date': '2026-07-03',
        'Type': 'egreso',
        'Account': 'acc-1',
        'TransferId': 'transfer-1',
      },
      {
        '_id': 'mv-ingreso',
        'Amount': 500.0,
        'Date': '2026-07-03',
        'Type': 'ingreso',
        'Account': 'acc-2',
        'TransferId': 'transfer-1',
      },
    ];
    final adapter = _ScriptedAdapter(201, movementsJson);
    final repository = AccountRepository(_buildDio(adapter));

    await repository.transfer(
      from: 'acc-1',
      to: 'acc-2',
      amount: 500,
      date: DateTime(2026, 7, 3),
    );

    expect(adapter.lastRequestOptions?.data, {
      'From': 'acc-1',
      'To': 'acc-2',
      'Amount': 500,
      'Date': '2026-07-03',
    });
  });

  test(
    'transfer throws an ApiException on a same-account 400 response',
    () async {
      final adapter = _ScriptedAdapter(400, {
        'message': 'From and To accounts must differ',
      });
      final repository = AccountRepository(_buildDio(adapter));

      await expectLater(
        repository.transfer(
          from: 'acc-1',
          to: 'acc-1',
          amount: 500,
          date: DateTime(2026, 7, 3),
        ),
        throwsA(
          isA<ApiException>()
              .having(
                (error) => error.message,
                'message',
                'From and To accounts must differ',
              )
              .having((error) => error.statusCode, 'statusCode', 400),
        ),
      );
    },
  );
}

import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/accounts/data/index.dart';
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
}

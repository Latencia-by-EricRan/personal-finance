import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/network/index.dart';

import '../../support/fake_token_store.dart';

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

void main() {
  test('injects the Bearer token from the token store on every request',
      () async {
    final tokenStore = FakeTokenStore()..token = 'abc123';
    final adapter = _ScriptedAdapter(200, {'ok': true});
    final client = DioClient(tokenStore: tokenStore);
    client.dio.httpClientAdapter = adapter;

    await client.dio.get('/movement');

    expect(
      adapter.lastRequestOptions?.headers['Authorization'],
      'Bearer abc123',
    );
  });

  test('omits the Authorization header when there is no stored token',
      () async {
    final tokenStore = FakeTokenStore();
    final adapter = _ScriptedAdapter(200, {'ok': true});
    final client = DioClient(tokenStore: tokenStore);
    client.dio.httpClientAdapter = adapter;

    await client.dio.get('/movement');

    expect(adapter.lastRequestOptions?.headers['Authorization'], isNull);
  });

  test('clears the stored token and notifies on a 401 response', () async {
    final tokenStore = FakeTokenStore()..token = 'expired-token';
    final adapter = _ScriptedAdapter(401, {'message': 'Invalid credentials'});
    var unauthorizedCalls = 0;
    final client = DioClient(
      tokenStore: tokenStore,
      onUnauthorized: () async => unauthorizedCalls++,
    );
    client.dio.httpClientAdapter = adapter;

    await expectLater(
        client.dio.get('/movement'), throwsA(isA<DioException>()));

    expect(tokenStore.clearCallCount, 1);
    expect(tokenStore.token, isNull);
    expect(unauthorizedCalls, 1);
  });

  test('does not clear the token on a non-401 error', () async {
    final tokenStore = FakeTokenStore()..token = 'still-valid';
    final adapter = _ScriptedAdapter(500, {'message': 'Server error'});
    final client = DioClient(tokenStore: tokenStore);
    client.dio.httpClientAdapter = adapter;

    await expectLater(
        client.dio.get('/movement'), throwsA(isA<DioException>()));

    expect(tokenStore.clearCallCount, 0);
    expect(tokenStore.token, 'still-valid');
  });
}

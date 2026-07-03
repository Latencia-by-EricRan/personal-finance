import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/auth/index.dart';

// flutter_secure_storage 10.3.1 supports test-mode mocking via
// FlutterSecureStorage.setMockInitialValues, which swaps
// FlutterSecureStoragePlatform.instance for an in-memory
// TestFlutterSecureStoragePlatform — no platform channel mocking needed.
void main() {
  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  test('readToken returns null when nothing has been written', () async {
    final storage = AuthTokenStorage();

    expect(await storage.readToken(), isNull);
  });

  test('writeToken then readToken round-trips the value', () async {
    final storage = AuthTokenStorage();

    await storage.writeToken('jwt-token');

    expect(await storage.readToken(), 'jwt-token');
  });

  test('writeToken overwrites a previously stored value', () async {
    final storage = AuthTokenStorage();

    await storage.writeToken('first-token');
    await storage.writeToken('second-token');

    expect(await storage.readToken(), 'second-token');
  });

  test('clearToken removes the stored value', () async {
    final storage = AuthTokenStorage();
    await storage.writeToken('jwt-token');

    await storage.clearToken();

    expect(await storage.readToken(), isNull);
  });

  test('clearToken on an empty store is a no-op', () async {
    final storage = AuthTokenStorage();

    await storage.clearToken();

    expect(await storage.readToken(), isNull);
  });
}

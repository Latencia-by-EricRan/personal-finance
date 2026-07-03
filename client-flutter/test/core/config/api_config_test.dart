import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/config/index.dart';

void main() {
  tearDown(() => ApiConfig.hostOverride = null);

  test('defaults to localhost on the host running the tests', () {
    expect(ApiConfig.baseUrl, 'http://localhost:3000');
  });

  test('uses the manual override when set, for physical devices', () {
    ApiConfig.hostOverride = '192.168.1.50';
    expect(ApiConfig.baseUrl, 'http://192.168.1.50:3000');
  });
}

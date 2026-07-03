import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/format/index.dart';

void main() {
  group('AppFormatters.currency', () {
    test('formats with period thousands separator and comma decimals', () {
      expect(AppFormatters.currency(122600), r'$ 122.600,00');
    });

    test('pads a single decimal digit to two places', () {
      expect(AppFormatters.currency(35000.5), r'$ 35.000,50');
    });

    test('formats zero', () {
      expect(AppFormatters.currency(0), r'$ 0,00');
    });
  });

  group('AppFormatters.shortDate', () {
    test('formats with Spanish month abbreviation', () {
      expect(AppFormatters.shortDate(DateTime(2026, 7, 3)), '3 jul 2026');
    });

    test('formats a different month', () {
      expect(AppFormatters.shortDate(DateTime(2026, 1, 15)), '15 ene 2026');
    });
  });
}

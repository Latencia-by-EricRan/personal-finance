import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

abstract final class ApiConfig {
  ApiConfig._();

  static const _port = 3000;

  // Manual override for a physical device on the LAN — Platform.isAndroid
  // alone can't distinguish the emulator (10.0.2.2) from a real phone.
  static String? hostOverride;

  static String get baseUrl {
    final override = hostOverride;
    if (override != null) return 'http://$override:$_port';
    if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:$_port';
    return 'http://localhost:$_port';
  }
}

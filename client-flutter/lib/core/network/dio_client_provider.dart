import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/session_provider.dart';
import '../config/api_config.dart';
import 'dio_client.dart';

/// Real [DioClient] wired to the app's auth session: a 401 response logs the
/// user out via [AuthSessionNotifier.logout], and the resolved base URL is
/// logged once (debug builds only) so a wrong host guess is diagnosable.
final dioClientProvider = Provider<DioClient>((ref) {
  ApiConfig.logResolvedBaseUrl();
  return DioClient(
    tokenStore: ref.read(authTokenStoreProvider),
    onUnauthorized: () => ref.read(authSessionProvider.notifier).logout(),
  );
});

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/index.dart';
import '../auth/session_provider.dart';

const loginRoute = '/login';

String? authRedirect({required bool isLoggedIn, required String location}) {
  final onLoginRoute = location == loginRoute;
  if (!isLoggedIn && !onLoginRoute) return loginRoute;
  if (isLoggedIn && onLoginRoute) return '/';
  return null;
}

/// Bridges [authSessionProvider] changes into a [Listenable] that go_router
/// accepts as `refreshListenable`, so the router re-runs `redirect` on
/// login/logout without rebuilding the whole [GoRouter] instance (which
/// would drop navigation stack state).
class AuthRefreshNotifier extends ChangeNotifier {
  AuthRefreshNotifier(Ref ref) {
    _subscription = ref.listen<bool>(
      authSessionProvider,
      (_, _) => notifyListeners(),
    );
  }

  late final ProviderSubscription<bool> _subscription;

  @override
  void dispose() {
    _subscription.close();
    super.dispose();
  }
}

GoRouter buildAppRouter({
  required bool Function() isLoggedIn,
  Listenable? refreshListenable,
}) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: refreshListenable,
    // Reads live auth state at redirect-time via the [isLoggedIn] callback
    // rather than baking a snapshot boolean into this closure.
    redirect: (context, state) =>
        authRedirect(isLoggedIn: isLoggedIn(), location: state.matchedLocation),
    routes: [
      GoRoute(
        path: loginRoute,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const _StubScreen(name: 'dashboard'),
      ),
      GoRoute(
        path: '/accounts',
        builder: (context, state) => const _StubScreen(name: 'accounts'),
      ),
      GoRoute(
        path: '/budgets',
        builder: (context, state) => const _StubScreen(name: 'budgets'),
      ),
      GoRoute(
        path: '/recurring',
        builder: (context, state) => const _StubScreen(name: 'recurring'),
      ),
      GoRoute(
        path: '/reports',
        builder: (context, state) => const _StubScreen(name: 'reports'),
      ),
    ],
  );
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = AuthRefreshNotifier(ref);
  ref.onDispose(refreshNotifier.dispose);
  return buildAppRouter(
    isLoggedIn: () => ref.read(authSessionProvider),
    refreshListenable: refreshNotifier,
  );
});

class _StubScreen extends StatelessWidget {
  const _StubScreen({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: Center(child: Text('TODO: $name')));
  }
}

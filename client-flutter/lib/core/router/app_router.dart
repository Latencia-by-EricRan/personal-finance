import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/session_provider.dart';

const loginRoute = '/login';

String? authRedirect({required bool isLoggedIn, required String location}) {
  final onLoginRoute = location == loginRoute;
  if (!isLoggedIn && !onLoginRoute) return loginRoute;
  if (isLoggedIn && onLoginRoute) return '/';
  return null;
}

GoRouter buildAppRouter({required bool isLoggedIn}) {
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) =>
        authRedirect(isLoggedIn: isLoggedIn, location: state.matchedLocation),
    routes: [
      GoRoute(
        path: loginRoute,
        builder: (context, state) => const _StubScreen(name: 'login'),
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
  final isLoggedIn = ref.watch(authSessionProvider);
  return buildAppRouter(isLoggedIn: isLoggedIn);
});

class _StubScreen extends StatelessWidget {
  const _StubScreen({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: Center(child: Text('TODO: $name')));
  }
}

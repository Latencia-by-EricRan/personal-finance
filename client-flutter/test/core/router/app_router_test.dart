import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/router/index.dart';

void main() {
  group('authRedirect', () {
    test('sends an unauthenticated user to /login', () {
      expect(
        authRedirect(isLoggedIn: false, location: '/'),
        loginRoute,
      );
      expect(
        authRedirect(isLoggedIn: false, location: '/accounts'),
        loginRoute,
      );
    });

    test('leaves an unauthenticated user already on /login alone', () {
      expect(authRedirect(isLoggedIn: false, location: loginRoute), isNull);
    });

    test('sends an authenticated user away from /login', () {
      expect(authRedirect(isLoggedIn: true, location: loginRoute), '/');
    });

    test('leaves an authenticated user on any other route alone', () {
      expect(authRedirect(isLoggedIn: true, location: '/budgets'), isNull);
      expect(authRedirect(isLoggedIn: true, location: '/'), isNull);
    });
  });

  group('buildAppRouter wiring', () {
    testWidgets('redirects to /login when logged out', (tester) async {
      final router = buildAppRouter(isLoggedIn: false);
      await tester.pumpWidget(MaterialApp.router(routerConfig: router));
      await tester.pumpAndSettle();

      expect(find.text('TODO: login'), findsOneWidget);
    });

    testWidgets('redirects away from /login when logged in', (tester) async {
      final router = buildAppRouter(isLoggedIn: true);
      router.go(loginRoute);
      await tester.pumpWidget(MaterialApp.router(routerConfig: router));
      await tester.pumpAndSettle();

      expect(find.text('TODO: dashboard'), findsOneWidget);
    });

    testWidgets('exposes stub placeholders for every Fase 0 route', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: true);
      await tester.pumpWidget(MaterialApp.router(routerConfig: router));

      for (final route in ['/accounts', '/budgets', '/recurring', '/reports']) {
        router.go(route);
        await tester.pumpAndSettle();
        expect(find.textContaining('TODO:'), findsOneWidget);
      }
    });
  });
}

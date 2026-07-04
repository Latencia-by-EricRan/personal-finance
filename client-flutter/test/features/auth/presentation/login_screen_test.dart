import 'package:client_flutter/core/auth/index.dart';
import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/features/auth/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';

import '../../../support/fake_token_store.dart';

class _FakeAuthRepository extends AuthRepository {
  _FakeAuthRepository({this.response, this.error}) : super(Dio());

  final AuthTokenResponse? response;
  final Object? error;

  @override
  Future<AuthTokenResponse> login({
    required String email,
    required String password,
  }) async {
    if (error != null) throw error!;
    return response!;
  }
}

Widget _wrap(Widget child, {required List<Override> overrides}) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(home: child),
  );
}

void main() {
  testWidgets('does not submit when email and password are empty', (
    tester,
  ) async {
    final tokenStore = FakeTokenStore();
    final fakeRepository = _FakeAuthRepository(
      response: const AuthTokenResponse(token: 't', expiresIn: '1d'),
    );

    await tester.pumpWidget(
      _wrap(
        const LoginScreen(),
        overrides: [
          authTokenStoreProvider.overrideWithValue(tokenStore),
          authRepositoryProvider.overrideWithValue(fakeRepository),
        ],
      ),
    );

    await tester.tap(find.text('Ingresar'));
    await tester.pumpAndSettle();

    expect(find.text('Ingresá tu email'), findsOneWidget);
    expect(find.text('Ingresá tu contraseña'), findsOneWidget);
    expect(tokenStore.token, isNull);
  });

  testWidgets(
    'a successful login stores the token and flips the session',
    (tester) async {
      final tokenStore = FakeTokenStore();
      final fakeRepository = _FakeAuthRepository(
        response: const AuthTokenResponse(
          token: 'jwt-token',
          expiresIn: '1d',
        ),
      );

      late BuildContext capturedContext;
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authTokenStoreProvider.overrideWithValue(tokenStore),
            authRepositoryProvider.overrideWithValue(fakeRepository),
          ],
          child: MaterialApp(
            home: Builder(
              builder: (context) {
                capturedContext = context;
                return const LoginScreen();
              },
            ),
          ),
        ),
      );

      await tester.enterText(
        find.byType(TextFormField).at(0),
        'user@example.com',
      );
      await tester.enterText(find.byType(TextFormField).at(1), 's3cret');
      await tester.tap(find.text('Ingresar'));
      await tester.pumpAndSettle();

      final container = ProviderScope.containerOf(capturedContext);
      expect(tokenStore.token, 'jwt-token');
      expect(container.read(authSessionProvider), isTrue);
    },
  );

  testWidgets(
    'a failed login shows an error and does not change the session',
    (tester) async {
      final tokenStore = FakeTokenStore();
      final fakeRepository = _FakeAuthRepository(
        error: const ApiException(message: 'Invalid credentials'),
      );

      await tester.pumpWidget(
        _wrap(
          const LoginScreen(),
          overrides: [
            authTokenStoreProvider.overrideWithValue(tokenStore),
            authRepositoryProvider.overrideWithValue(fakeRepository),
          ],
        ),
      );

      await tester.enterText(
        find.byType(TextFormField).at(0),
        'user@example.com',
      );
      await tester.enterText(find.byType(TextFormField).at(1), 'wrong');
      await tester.tap(find.text('Ingresar'));
      await tester.pumpAndSettle();

      expect(find.text('Invalid credentials'), findsOneWidget);
      expect(tokenStore.token, isNull);
    },
  );
}

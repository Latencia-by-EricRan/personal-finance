import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/index.dart';
import '../../../../shared/models/index.dart';
import '../../data/index.dart';

typedef AccountWithBalance = ({Account account, num balance});

// `retry: null` — matches `monthSummaryProvider`'s reasoning: the screen's
// error state exposes an explicit "Reintentar" button, so Riverpod's default
// automatic retries would make that button's effect impossible to assert.
Duration? _noRetry(int retryCount, Object error) => null;

// Partial-failure decision: the account list itself failing to load (or
// throwing a non-ApiException) fails this whole provider, surfacing the
// screen's error-retry state — there's nothing sensible to show without the
// account list. A single account's *balance* fetch failing is treated as a
// lesser, isolated failure: it falls back to a 0 balance for just that
// account rather than taking down the whole screen. Rationale: N+1 balance
// requests against a personal single-user backend are already an accepted
// tradeoff per spec, so one flaky balance call shouldn't hide every other
// account the user has — 0 is the simplest honest placeholder until a retry
// succeeds (the whole provider can still be invalidated/retried from the
// screen like any other).
final accountsWithBalanceProvider = FutureProvider<List<AccountWithBalance>>((
  ref,
) async {
  final accounts = await ref.watch(accountsProvider.future);
  final repository = ref.watch(accountRepositoryProvider);

  return Future.wait(
    accounts.map((account) async {
      final id = account.id;
      if (id == null) return (account: account, balance: 0);
      try {
        final balance = await repository.getBalance(id);
        return (account: account, balance: balance.balance);
      } on ApiException {
        return (account: account, balance: 0);
      }
    }),
  );
}, retry: _noRetry);

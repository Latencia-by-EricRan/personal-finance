import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/models/index.dart';
import '../../data/index.dart';

// `retry: null` — matches `accountsProvider`'s reasoning: the archived
// section exposes its own loading/empty rendering, so an automatic retry
// storm on failure isn't wanted here either.
Duration? _noRetry(int retryCount, Object error) => null;

final archivedAccountsProvider = FutureProvider<List<Account>>((ref) async {
  final repository = ref.watch(accountRepositoryProvider);
  final accounts = await repository.getAll(includeArchived: true);
  return accounts.where((account) => account.archived).toList();
}, retry: _noRetry);

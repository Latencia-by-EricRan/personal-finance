import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/models/index.dart';
import '../../data/index.dart';
import 'movement_filter_provider.dart';
import 'selected_month_provider.dart';

// `retry: null` — the screen's error state gives the user an explicit
// "Reintentar" button (see `ErrorRetry`/`ref.invalidate`); Riverpod's default
// automatic background retries would otherwise keep hammering the backend
// silently and make that button's effect impossible to assert in tests.
Duration? _noRetry(int retryCount, Object error) => null;

final monthSummaryProvider = FutureProvider<MovementSummaryResponse>((ref) {
  final selected = ref.watch(selectedMonthProvider);
  return ref
      .watch(movementRepositoryProvider)
      .getSummaryByMonth(month: selected.month, year: selected.year);
}, retry: _noRetry);

/// Movements shown in the list. Unfiltered, this is just the unfiltered
/// month's [MovementSummaryResponse.movements]; with any filter field set it
/// switches to [MovementRepository.getByRange] for the whole selected month
/// instead. [monthSummaryProvider] (and the `BalanceCard` it feeds) always
/// stays on the unfiltered whole-month summary regardless — only this list
/// narrows, matching the existing web client.
final dashboardMovementsProvider = FutureProvider<List<Movement>>((ref) async {
  final filter = ref.watch(movementFilterProvider);
  final selected = ref.watch(selectedMonthProvider);

  if (filter.isEmpty) {
    final summary = await ref.watch(monthSummaryProvider.future);
    return summary.movements;
  }

  final start = DateTime(selected.year, selected.month);
  final end = DateTime(selected.year, selected.month + 1, 0);
  return ref.watch(movementRepositoryProvider).getByRange(
        start: start,
        end: end,
        type: filter.type,
        category: filter.category,
        account: filter.account,
      );
}, retry: _noRetry);

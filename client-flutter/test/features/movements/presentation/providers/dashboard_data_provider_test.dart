import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/features/movements/data/index.dart';
import 'package:client_flutter/features/movements/presentation/providers/index.dart';
import 'package:client_flutter/shared/models/index.dart';

Movement _movement(String id) => Movement(
      id: id,
      amount: 100,
      date: DateTime(2026, 7, 1),
      type: MovementType.ingreso,
      account: 'acc-1',
    );

class _FakeMovementRepository extends MovementRepository {
  _FakeMovementRepository({this.summary, this.rangeMovements}) : super(Dio());

  final MovementSummaryResponse? summary;
  final List<Movement>? rangeMovements;
  var summaryCallCount = 0;
  var rangeCallCount = 0;
  DateTime? lastRangeStart;
  DateTime? lastRangeEnd;
  MovementType? lastRangeType;

  @override
  Future<MovementSummaryResponse> getSummaryByMonth({
    required int month,
    required int year,
  }) async {
    summaryCallCount++;
    return summary!;
  }

  @override
  Future<List<Movement>> getByRange({
    required DateTime start,
    required DateTime end,
    MovementType? type,
    String? category,
    String? account,
    int? page,
    int? limit,
  }) async {
    rangeCallCount++;
    lastRangeStart = start;
    lastRangeEnd = end;
    lastRangeType = type;
    return rangeMovements!;
  }
}

void main() {
  group('dashboardMovementsProvider', () {
    test('uses summary movements when the filter is empty', () async {
      final repository = _FakeMovementRepository(
        summary: MovementSummaryResponse(
          month: 7,
          year: 2026,
          summary: const MovementSummary(
            items: 1,
            amount: MovementAmountSummary(income: 100, expense: 0),
          ),
          movements: [_movement('mv-1')],
        ),
      );
      final container = ProviderContainer(
        overrides: [movementRepositoryProvider.overrideWithValue(repository)],
      );
      addTearDown(container.dispose);

      final movements = await container.read(dashboardMovementsProvider.future);

      expect(movements.map((m) => m.id), ['mv-1']);
      expect(repository.rangeCallCount, 0);
    });

    test('switches to getByRange for the whole month when a filter is set',
        () async {
      final repository = _FakeMovementRepository(
        summary: MovementSummaryResponse(
          month: 7,
          year: 2026,
          summary: const MovementSummary(
            items: 1,
            amount: MovementAmountSummary(income: 100, expense: 0),
          ),
          movements: [_movement('mv-1')],
        ),
        rangeMovements: [_movement('mv-2')],
      );
      final container = ProviderContainer(
        overrides: [movementRepositoryProvider.overrideWithValue(repository)],
      );
      addTearDown(container.dispose);
      container.read(selectedMonthProvider.notifier).state = (
        month: 7,
        year: 2026,
      );
      container.read(movementFilterProvider.notifier).setType(
            MovementType.ingreso,
          );

      final movements = await container.read(dashboardMovementsProvider.future);

      expect(movements.map((m) => m.id), ['mv-2']);
      expect(repository.summaryCallCount, 0);
      expect(repository.lastRangeStart, DateTime(2026, 7, 1));
      expect(repository.lastRangeEnd, DateTime(2026, 7, 31));
      expect(repository.lastRangeType, MovementType.ingreso);
    });

    test(
      'covers December range end-of-month correctly (year rollover safe)',
      () async {
        final repository = _FakeMovementRepository(
          summary: const MovementSummaryResponse(
            month: 12,
            year: 2026,
            summary: MovementSummary(
              items: 0,
              amount: MovementAmountSummary(income: 0, expense: 0),
            ),
            movements: [],
          ),
          rangeMovements: const [],
        );
        final container = ProviderContainer(
          overrides: [
            movementRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);
        container.read(selectedMonthProvider.notifier).state = (
          month: 12,
          year: 2026,
        );
        container.read(movementFilterProvider.notifier).setCategory('cat-1');

        await container.read(dashboardMovementsProvider.future);

        expect(repository.lastRangeStart, DateTime(2026, 12, 1));
        expect(repository.lastRangeEnd, DateTime(2026, 12, 31));
      },
    );
  });

  group('monthSummaryProvider', () {
    test('always fetches the unfiltered whole-month summary', () async {
      final repository = _FakeMovementRepository(
        summary: const MovementSummaryResponse(
          month: 7,
          year: 2026,
          summary: MovementSummary(
            items: 2,
            amount: MovementAmountSummary(income: 1000, expense: 400),
          ),
          movements: [],
        ),
      );
      final container = ProviderContainer(
        overrides: [movementRepositoryProvider.overrideWithValue(repository)],
      );
      addTearDown(container.dispose);

      final response = await container.read(monthSummaryProvider.future);

      expect(response.summary.amount.income, 1000);
      expect(response.summary.amount.expense, 400);
    });
  });
}

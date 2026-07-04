import 'package:flutter_riverpod/flutter_riverpod.dart';

typedef MonthYear = ({int month, int year});

class SelectedMonthNotifier extends Notifier<MonthYear> {
  @override
  MonthYear build() {
    final now = DateTime.now();
    return (month: now.month, year: now.year);
  }

  void previousMonth() {
    final current = state;
    state = current.month == 1
        ? (month: 12, year: current.year - 1)
        : (month: current.month - 1, year: current.year);
  }

  void nextMonth() {
    final current = state;
    state = current.month == 12
        ? (month: 1, year: current.year + 1)
        : (month: current.month + 1, year: current.year);
  }
}

final selectedMonthProvider =
    NotifierProvider<SelectedMonthNotifier, MonthYear>(
  SelectedMonthNotifier.new,
);

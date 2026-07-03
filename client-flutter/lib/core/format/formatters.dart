import 'package:intl/intl.dart';

abstract final class AppFormatters {
  AppFormatters._();

  static final NumberFormat _amount = NumberFormat('#,##0.00', 'es');

  static String currency(num amount) => '\$ ${_amount.format(amount)}';

  // Hardcoded instead of intl's DateFormat month symbols: those require an
  // async initializeDateFormatting() call this infra layer has no hook to run.
  static const _monthAbbreviations = <String>[
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];

  static String shortDate(DateTime date) =>
      '${date.day} ${_monthAbbreviations[date.month - 1]} ${date.year}';
}

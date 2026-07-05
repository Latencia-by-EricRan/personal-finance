import 'package:intl/intl.dart';

abstract final class AppFormatters {
  AppFormatters._();

  static final NumberFormat _amount = NumberFormat('#,##0.00', 'es');

  static String currency(num amount) => '\$ ${_amount.format(amount)}';

  /// Same digits as [currency] — kept as a distinct name so call sites (e.g.
  /// `BalanceCard`'s net figure) declare intent explicitly. The actual
  /// hero/data-column distinction (no tabular-nums vs tabular-nums) is a
  /// [TextStyle.fontFeatures] concern applied where the text is rendered,
  /// not something a plain formatted [String] can carry.
  static String currencyHero(num amount) => currency(amount);

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

  static const _monthNames = <String>[
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  static String shortDate(DateTime date) =>
      '${date.day} ${_monthAbbreviations[date.month - 1]} ${date.year}';

  static String monthYear(int month, int year) =>
      '${_monthNames[month - 1]} $year';

  /// Public by-index accessor for the monthly bar chart's x-axis labels
  /// (`ReportsScreen`'s monthly report has no `DateTime`, only a raw
  /// 1-12 `month` int, so it can't call [shortDate]).
  static String monthAbbreviation(int month) => _monthAbbreviations[month - 1];
}

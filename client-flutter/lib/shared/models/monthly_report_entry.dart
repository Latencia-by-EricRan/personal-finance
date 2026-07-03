import 'package:freezed_annotation/freezed_annotation.dart';

part 'monthly_report_entry.freezed.dart';
part 'monthly_report_entry.g.dart';

@freezed
abstract class MonthlyReportEntry with _$MonthlyReportEntry {
  const factory MonthlyReportEntry({
    @JsonKey(name: 'Month') required int month,
    @JsonKey(name: 'Income') required double income,
    @JsonKey(name: 'Expense') required double expense,
    @JsonKey(name: 'Net') required double net,
  }) = _MonthlyReportEntry;

  factory MonthlyReportEntry.fromJson(Map<String, dynamic> json) =>
      _$MonthlyReportEntryFromJson(json);
}

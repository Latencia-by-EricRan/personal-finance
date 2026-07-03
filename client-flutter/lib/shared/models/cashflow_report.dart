import 'package:freezed_annotation/freezed_annotation.dart';

part 'cashflow_report.freezed.dart';
part 'cashflow_report.g.dart';

@freezed
abstract class CashflowReport with _$CashflowReport {
  const factory CashflowReport({
    @JsonKey(name: 'Month') required int month,
    @JsonKey(name: 'Year') required int year,
    @JsonKey(name: 'Income') required double income,
    @JsonKey(name: 'Expense') required double expense,
    @JsonKey(name: 'Net') required double net,
  }) = _CashflowReport;

  factory CashflowReport.fromJson(Map<String, dynamic> json) =>
      _$CashflowReportFromJson(json);
}

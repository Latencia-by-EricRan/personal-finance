// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'monthly_report_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_MonthlyReportEntry _$MonthlyReportEntryFromJson(Map<String, dynamic> json) =>
    _MonthlyReportEntry(
      month: (json['Month'] as num).toInt(),
      income: (json['Income'] as num).toDouble(),
      expense: (json['Expense'] as num).toDouble(),
      net: (json['Net'] as num).toDouble(),
    );

Map<String, dynamic> _$MonthlyReportEntryToJson(_MonthlyReportEntry instance) =>
    <String, dynamic>{
      'Month': instance.month,
      'Income': instance.income,
      'Expense': instance.expense,
      'Net': instance.net,
    };

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cashflow_report.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CashflowReport _$CashflowReportFromJson(Map<String, dynamic> json) =>
    _CashflowReport(
      month: (json['Month'] as num).toInt(),
      year: (json['Year'] as num).toInt(),
      income: (json['Income'] as num).toDouble(),
      expense: (json['Expense'] as num).toDouble(),
      net: (json['Net'] as num).toDouble(),
    );

Map<String, dynamic> _$CashflowReportToJson(_CashflowReport instance) =>
    <String, dynamic>{
      'Month': instance.month,
      'Year': instance.year,
      'Income': instance.income,
      'Expense': instance.expense,
      'Net': instance.net,
    };

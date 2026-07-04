// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'movement_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_MovementAmountSummary _$MovementAmountSummaryFromJson(
  Map<String, dynamic> json,
) =>
    _MovementAmountSummary(
      income: (json['income'] as num).toDouble(),
      expense: (json['expense'] as num).toDouble(),
    );

Map<String, dynamic> _$MovementAmountSummaryToJson(
  _MovementAmountSummary instance,
) =>
    <String, dynamic>{'income': instance.income, 'expense': instance.expense};

_MovementSummary _$MovementSummaryFromJson(Map<String, dynamic> json) =>
    _MovementSummary(
      items: (json['items'] as num).toInt(),
      amount: MovementAmountSummary.fromJson(
        json['amount'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$MovementSummaryToJson(_MovementSummary instance) =>
    <String, dynamic>{'items': instance.items, 'amount': instance.amount};

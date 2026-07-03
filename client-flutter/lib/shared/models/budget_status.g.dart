// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'budget_status.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_BudgetStatus _$BudgetStatusFromJson(Map<String, dynamic> json) =>
    _BudgetStatus(
      category: Category.fromJson(json['Category'] as Map<String, dynamic>),
      limit: (json['Limit'] as num).toDouble(),
      spent: (json['Spent'] as num).toDouble(),
      remaining: (json['Remaining'] as num).toDouble(),
      percent: (json['Percent'] as num).toDouble(),
    );

Map<String, dynamic> _$BudgetStatusToJson(_BudgetStatus instance) =>
    <String, dynamic>{
      'Category': instance.category,
      'Limit': instance.limit,
      'Spent': instance.spent,
      'Remaining': instance.remaining,
      'Percent': instance.percent,
    };

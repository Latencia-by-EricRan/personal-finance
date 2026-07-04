// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'budget.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Budget _$BudgetFromJson(Map<String, dynamic> json) => _Budget(
      id: json['_id'] as String?,
      category: json['Category'] as String,
      month: (json['Month'] as num).toInt(),
      year: (json['Year'] as num).toInt(),
      limit: (json['Limit'] as num).toDouble(),
    );

Map<String, dynamic> _$BudgetToJson(_Budget instance) => <String, dynamic>{
      '_id': instance.id,
      'Category': instance.category,
      'Month': instance.month,
      'Year': instance.year,
      'Limit': instance.limit,
    };

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recurring.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Recurring _$RecurringFromJson(Map<String, dynamic> json) => _Recurring(
  id: json['_id'] as String?,
  type: $enumDecode(_$MovementTypeEnumMap, json['Type']),
  amount: (json['Amount'] as num).toDouble(),
  category: json['Category'] as String,
  account: json['Account'] as String,
  description: json['Description'] as String?,
  card: json['Card'] as String?,
  frequency: $enumDecode(_$RecurringFrequencyEnumMap, json['Frequency']),
  dayOfMonth: (json['DayOfMonth'] as num).toInt(),
  active: json['Active'] as bool?,
  lastRunYearMonth: json['LastRunYearMonth'] as String?,
);

Map<String, dynamic> _$RecurringToJson(_Recurring instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'Type': _$MovementTypeEnumMap[instance.type]!,
      'Amount': instance.amount,
      'Category': instance.category,
      'Account': instance.account,
      'Description': instance.description,
      'Card': instance.card,
      'Frequency': _$RecurringFrequencyEnumMap[instance.frequency]!,
      'DayOfMonth': instance.dayOfMonth,
      'Active': instance.active,
      'LastRunYearMonth': instance.lastRunYearMonth,
    };

const _$MovementTypeEnumMap = {
  MovementType.ingreso: 'ingreso',
  MovementType.egreso: 'egreso',
};

const _$RecurringFrequencyEnumMap = {RecurringFrequency.mensual: 'mensual'};

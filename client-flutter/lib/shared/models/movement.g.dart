// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'movement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Movement _$MovementFromJson(Map<String, dynamic> json) => _Movement(
  id: json['_id'] as String?,
  amount: (json['Amount'] as num).toDouble(),
  category: json['Category'] as String?,
  date: const DateOnlyConverter().fromJson(json['Date'] as String),
  type: $enumDecode(_$MovementTypeEnumMap, json['Type']),
  account: json['Account'] as String,
  transferId: json['TransferId'] as String?,
  card: json['Card'] as String?,
  description: json['Description'] as String?,
);

Map<String, dynamic> _$MovementToJson(_Movement instance) => <String, dynamic>{
  '_id': instance.id,
  'Amount': instance.amount,
  'Category': instance.category,
  'Date': const DateOnlyConverter().toJson(instance.date),
  'Type': _$MovementTypeEnumMap[instance.type]!,
  'Account': instance.account,
  'TransferId': instance.transferId,
  'Card': instance.card,
  'Description': instance.description,
};

const _$MovementTypeEnumMap = {
  MovementType.ingreso: 'ingreso',
  MovementType.egreso: 'egreso',
};

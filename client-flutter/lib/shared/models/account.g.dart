// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Account _$AccountFromJson(Map<String, dynamic> json) => _Account(
  id: json['_id'] as String?,
  name: json['Name'] as String,
  type: $enumDecode(_$AccountTypeEnumMap, json['Type']),
  currency: json['Currency'] as String,
  icon: json['Icon'] as String?,
  archived: json['Archived'] as bool,
);

Map<String, dynamic> _$AccountToJson(_Account instance) => <String, dynamic>{
  '_id': instance.id,
  'Name': instance.name,
  'Type': _$AccountTypeEnumMap[instance.type]!,
  'Currency': instance.currency,
  'Icon': instance.icon,
  'Archived': instance.archived,
};

const _$AccountTypeEnumMap = {
  AccountType.efectivo: 'efectivo',
  AccountType.banco: 'banco',
  AccountType.tarjeta: 'tarjeta',
};

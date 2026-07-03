// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'movement_write_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_MovementWriteRequest _$MovementWriteRequestFromJson(
  Map<String, dynamic> json,
) =>
    _MovementWriteRequest(
      type: $enumDecode(_$MovementTypeEnumMap, json['Type']),
      amount: json['Amount'] as num,
      category: json['Category'] as String,
      account: json['Account'] as String,
      date: const DateOnlyConverter().fromJson(json['Date'] as String),
      description: json['Description'] as String?,
      card: json['Card'] as String?,
    );

Map<String, dynamic> _$MovementWriteRequestToJson(
  _MovementWriteRequest instance,
) =>
    <String, dynamic>{
      'Type': _$MovementTypeEnumMap[instance.type]!,
      'Amount': instance.amount,
      'Category': instance.category,
      'Account': instance.account,
      'Date': const DateOnlyConverter().toJson(instance.date),
      'Description': instance.description,
      'Card': instance.card,
    };

const _$MovementTypeEnumMap = {
  MovementType.ingreso: 'ingreso',
  MovementType.egreso: 'egreso',
};

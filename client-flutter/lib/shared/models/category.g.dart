// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Category _$CategoryFromJson(Map<String, dynamic> json) => _Category(
      id: json['_id'] as String?,
      description: json['Description'] as String,
      name: json['Name'] as String,
      tag: json['Tag'] as String,
      type: $enumDecode(_$CategoryTypeEnumMap, json['Type']),
      icon: json['Icon'] as String?,
    );

Map<String, dynamic> _$CategoryToJson(_Category instance) => <String, dynamic>{
      '_id': instance.id,
      'Description': instance.description,
      'Name': instance.name,
      'Tag': instance.tag,
      'Type': _$CategoryTypeEnumMap[instance.type]!,
      'Icon': instance.icon,
    };

const _$CategoryTypeEnumMap = {
  CategoryType.variable: 'variable',
  CategoryType.fijo: 'fijo',
};

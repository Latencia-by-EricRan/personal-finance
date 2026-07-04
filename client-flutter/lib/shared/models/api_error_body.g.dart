// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'api_error_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ApiErrorBody _$ApiErrorBodyFromJson(Map<String, dynamic> json) =>
    _ApiErrorBody(
      message: json['message'] as String,
      errors:
          (json['errors'] as List<dynamic>?)?.map((e) => e as String).toList(),
    );

Map<String, dynamic> _$ApiErrorBodyToJson(_ApiErrorBody instance) =>
    <String, dynamic>{'message': instance.message, 'errors': instance.errors};

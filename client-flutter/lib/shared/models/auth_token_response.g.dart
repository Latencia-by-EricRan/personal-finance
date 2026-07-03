// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_token_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AuthTokenResponse _$AuthTokenResponseFromJson(Map<String, dynamic> json) =>
    _AuthTokenResponse(
      token: json['token'] as String,
      expiresIn: json['expiresIn'] as String,
    );

Map<String, dynamic> _$AuthTokenResponseToJson(_AuthTokenResponse instance) =>
    <String, dynamic>{'token': instance.token, 'expiresIn': instance.expiresIn};

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_balance.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AccountBalance _$AccountBalanceFromJson(Map<String, dynamic> json) =>
    _AccountBalance(
      account: json['Account'] as String,
      balance: json['Balance'] as num,
    );

Map<String, dynamic> _$AccountBalanceToJson(_AccountBalance instance) =>
    <String, dynamic>{'Account': instance.account, 'Balance': instance.balance};

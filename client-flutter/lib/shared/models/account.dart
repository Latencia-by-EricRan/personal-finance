import 'package:freezed_annotation/freezed_annotation.dart';

part 'account.freezed.dart';
part 'account.g.dart';

enum AccountType {
  @JsonValue('efectivo')
  efectivo,
  @JsonValue('banco')
  banco,
  @JsonValue('tarjeta')
  tarjeta,
}

@freezed
abstract class Account with _$Account {
  const factory Account({
    @JsonKey(name: '_id') String? id,
    @JsonKey(name: 'Name') required String name,
    @JsonKey(name: 'Type') required AccountType type,
    @JsonKey(name: 'Currency') required String currency,
    @JsonKey(name: 'Icon') String? icon,
    @JsonKey(name: 'Archived') required bool archived,
  }) = _Account;

  factory Account.fromJson(Map<String, dynamic> json) =>
      _$AccountFromJson(json);
}

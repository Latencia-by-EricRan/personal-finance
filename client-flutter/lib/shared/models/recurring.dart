import 'package:freezed_annotation/freezed_annotation.dart';

import 'movement.dart';

part 'recurring.freezed.dart';
part 'recurring.g.dart';

enum RecurringFrequency {
  @JsonValue('mensual')
  mensual,
}

@freezed
abstract class Recurring with _$Recurring {
  const factory Recurring({
    @JsonKey(name: '_id') String? id,
    @JsonKey(name: 'Type') required MovementType type,
    @JsonKey(name: 'Amount') required double amount,
    @JsonKey(name: 'Category') required String category,
    @JsonKey(name: 'Account') required String account,
    @JsonKey(name: 'Description') String? description,
    @JsonKey(name: 'Card') String? card,
    @JsonKey(name: 'Frequency') required RecurringFrequency frequency,
    @JsonKey(name: 'DayOfMonth') required int dayOfMonth,
    @JsonKey(name: 'Active') bool? active,
    @JsonKey(name: 'LastRunYearMonth') String? lastRunYearMonth,
  }) = _Recurring;

  factory Recurring.fromJson(Map<String, dynamic> json) =>
      _$RecurringFromJson(json);
}

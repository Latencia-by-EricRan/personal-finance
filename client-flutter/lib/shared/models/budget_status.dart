import 'package:freezed_annotation/freezed_annotation.dart';

import 'category.dart';

part 'budget_status.freezed.dart';
part 'budget_status.g.dart';

@freezed
abstract class BudgetStatus with _$BudgetStatus {
  const factory BudgetStatus({
    @JsonKey(name: 'Category') required Category category,
    @JsonKey(name: 'Limit') required double limit,
    @JsonKey(name: 'Spent') required double spent,
    @JsonKey(name: 'Remaining') required double remaining,
    @JsonKey(name: 'Percent') required double percent,
  }) = _BudgetStatus;

  factory BudgetStatus.fromJson(Map<String, dynamic> json) =>
      _$BudgetStatusFromJson(json);
}

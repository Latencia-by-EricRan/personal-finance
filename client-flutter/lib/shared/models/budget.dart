import 'package:freezed_annotation/freezed_annotation.dart';

part 'budget.freezed.dart';
part 'budget.g.dart';

@freezed
abstract class Budget with _$Budget {
  const factory Budget({
    @JsonKey(name: '_id') String? id,
    @JsonKey(name: 'Category') required String category,
    @JsonKey(name: 'Month') required int month,
    @JsonKey(name: 'Year') required int year,
    @JsonKey(name: 'Limit') required double limit,
  }) = _Budget;

  factory Budget.fromJson(Map<String, dynamic> json) => _$BudgetFromJson(json);
}

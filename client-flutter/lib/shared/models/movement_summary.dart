import 'package:freezed_annotation/freezed_annotation.dart';

part 'movement_summary.freezed.dart';
part 'movement_summary.g.dart';

@freezed
abstract class MovementAmountSummary with _$MovementAmountSummary {
  const factory MovementAmountSummary({
    @JsonKey(name: 'income') required double income,
    @JsonKey(name: 'expense') required double expense,
  }) = _MovementAmountSummary;

  factory MovementAmountSummary.fromJson(Map<String, dynamic> json) =>
      _$MovementAmountSummaryFromJson(json);
}

@freezed
abstract class MovementSummary with _$MovementSummary {
  const factory MovementSummary({
    @JsonKey(name: 'items') required int items,
    @JsonKey(name: 'amount') required MovementAmountSummary amount,
  }) = _MovementSummary;

  factory MovementSummary.fromJson(Map<String, dynamic> json) =>
      _$MovementSummaryFromJson(json);
}

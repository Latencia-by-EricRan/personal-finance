import 'package:freezed_annotation/freezed_annotation.dart';

import 'movement.dart';
import 'movement_summary.dart';

part 'movement_summary_response.freezed.dart';
part 'movement_summary_response.g.dart';

@freezed
abstract class MovementSummaryResponse with _$MovementSummaryResponse {
  const factory MovementSummaryResponse({
    @JsonKey(name: 'month') required int month,
    @JsonKey(name: 'year') required int year,
    @JsonKey(name: 'summary') required MovementSummary summary,
    @JsonKey(name: 'movements') required List<Movement> movements,
  }) = _MovementSummaryResponse;

  factory MovementSummaryResponse.fromJson(Map<String, dynamic> json) =>
      _$MovementSummaryResponseFromJson(json);
}

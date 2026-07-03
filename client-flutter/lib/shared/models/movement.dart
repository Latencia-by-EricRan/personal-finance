import 'package:freezed_annotation/freezed_annotation.dart';

import 'category.dart';
import 'date_only_converter.dart';

part 'movement.freezed.dart';
part 'movement.g.dart';

enum MovementType {
  @JsonValue('ingreso')
  ingreso,
  @JsonValue('egreso')
  egreso,
}

@freezed
abstract class Movement with _$Movement {
  const factory Movement({
    @JsonKey(name: '_id') String? id,
    @JsonKey(name: 'Amount') required double amount,
    // Optional: transfer-generated movements have no Category (see backend
    // AccountService.transfer). Populated as a nested object on every read —
    // the backend's MovementService always calls .populate('Category') — so
    // this must be the nested Category, not a raw id string (see
    // BudgetStatus.category / CategoryReportEntry.category for the same
    // pattern). Movement creation/update instead sends a plain id string;
    // see MovementWriteRequest for that write-side shape.
    @JsonKey(name: 'Category') Category? category,
    @DateOnlyConverter() @JsonKey(name: 'Date') required DateTime date,
    @JsonKey(name: 'Type') required MovementType type,
    @JsonKey(name: 'Account') required String account,
    @JsonKey(name: 'TransferId') String? transferId,
    @JsonKey(name: 'Card') String? card,
    @JsonKey(name: 'Description') String? description,
  }) = _Movement;

  factory Movement.fromJson(Map<String, dynamic> json) =>
      _$MovementFromJson(json);
}

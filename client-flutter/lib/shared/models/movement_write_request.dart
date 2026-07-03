import 'package:freezed_annotation/freezed_annotation.dart';

import 'date_only_converter.dart';
import 'movement.dart';

part 'movement_write_request.freezed.dart';
part 'movement_write_request.g.dart';

/// Body shape for `POST`/`PUT /movement`.
///
/// The backend's read shape (see [Movement]) populates `Category` as a
/// nested object, but create/update requests must send `Category` and
/// `Account` as plain ObjectId strings (see
/// `back/src/modules/validators/movement.validator.ts`'s
/// `addUpdateBodyValidate`, which requires `isMongoId()` for both). That
/// read/write shape mismatch is why this is a separate model rather than
/// reusing [Movement] for writes.
@freezed
abstract class MovementWriteRequest with _$MovementWriteRequest {
  const factory MovementWriteRequest({
    @JsonKey(name: 'Type') required MovementType type,
    @JsonKey(name: 'Amount') required num amount,
    @JsonKey(name: 'Category') required String category,
    @JsonKey(name: 'Account') required String account,
    @DateOnlyConverter() @JsonKey(name: 'Date') required DateTime date,
    @JsonKey(name: 'Description') String? description,
    @JsonKey(name: 'Card') String? card,
  }) = _MovementWriteRequest;

  factory MovementWriteRequest.fromJson(Map<String, dynamic> json) =>
      _$MovementWriteRequestFromJson(json);
}

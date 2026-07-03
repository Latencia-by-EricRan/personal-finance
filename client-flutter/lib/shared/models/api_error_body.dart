import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_error_body.freezed.dart';
part 'api_error_body.g.dart';

@freezed
abstract class ApiErrorBody with _$ApiErrorBody {
  const factory ApiErrorBody({
    @JsonKey(name: 'message') required String message,
    @JsonKey(name: 'errors') List<String>? errors,
  }) = _ApiErrorBody;

  factory ApiErrorBody.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorBodyFromJson(json);
}

import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_token_response.freezed.dart';
part 'auth_token_response.g.dart';

@freezed
abstract class AuthTokenResponse with _$AuthTokenResponse {
  const factory AuthTokenResponse({
    @JsonKey(name: 'token') required String token,
    @JsonKey(name: 'expiresIn') required String expiresIn,
  }) = _AuthTokenResponse;

  factory AuthTokenResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthTokenResponseFromJson(json);
}

// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_token_response.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$AuthTokenResponse {

@JsonKey(name: 'token') String get token;@JsonKey(name: 'expiresIn') String get expiresIn;
/// Create a copy of AuthTokenResponse
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthTokenResponseCopyWith<AuthTokenResponse> get copyWith => _$AuthTokenResponseCopyWithImpl<AuthTokenResponse>(this as AuthTokenResponse, _$identity);

  /// Serializes this AuthTokenResponse to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthTokenResponse&&(identical(other.token, token) || other.token == token)&&(identical(other.expiresIn, expiresIn) || other.expiresIn == expiresIn));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,token,expiresIn);

@override
String toString() {
  return 'AuthTokenResponse(token: $token, expiresIn: $expiresIn)';
}


}

/// @nodoc
abstract mixin class $AuthTokenResponseCopyWith<$Res>  {
  factory $AuthTokenResponseCopyWith(AuthTokenResponse value, $Res Function(AuthTokenResponse) _then) = _$AuthTokenResponseCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'token') String token,@JsonKey(name: 'expiresIn') String expiresIn
});




}
/// @nodoc
class _$AuthTokenResponseCopyWithImpl<$Res>
    implements $AuthTokenResponseCopyWith<$Res> {
  _$AuthTokenResponseCopyWithImpl(this._self, this._then);

  final AuthTokenResponse _self;
  final $Res Function(AuthTokenResponse) _then;

/// Create a copy of AuthTokenResponse
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? token = null,Object? expiresIn = null,}) {
  return _then(_self.copyWith(
token: null == token ? _self.token : token // ignore: cast_nullable_to_non_nullable
as String,expiresIn: null == expiresIn ? _self.expiresIn : expiresIn // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [AuthTokenResponse].
extension AuthTokenResponsePatterns on AuthTokenResponse {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuthTokenResponse value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuthTokenResponse() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuthTokenResponse value)  $default,){
final _that = this;
switch (_that) {
case _AuthTokenResponse():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuthTokenResponse value)?  $default,){
final _that = this;
switch (_that) {
case _AuthTokenResponse() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'token')  String token, @JsonKey(name: 'expiresIn')  String expiresIn)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuthTokenResponse() when $default != null:
return $default(_that.token,_that.expiresIn);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'token')  String token, @JsonKey(name: 'expiresIn')  String expiresIn)  $default,) {final _that = this;
switch (_that) {
case _AuthTokenResponse():
return $default(_that.token,_that.expiresIn);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'token')  String token, @JsonKey(name: 'expiresIn')  String expiresIn)?  $default,) {final _that = this;
switch (_that) {
case _AuthTokenResponse() when $default != null:
return $default(_that.token,_that.expiresIn);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AuthTokenResponse implements AuthTokenResponse {
  const _AuthTokenResponse({@JsonKey(name: 'token') required this.token, @JsonKey(name: 'expiresIn') required this.expiresIn});
  factory _AuthTokenResponse.fromJson(Map<String, dynamic> json) => _$AuthTokenResponseFromJson(json);

@override@JsonKey(name: 'token') final  String token;
@override@JsonKey(name: 'expiresIn') final  String expiresIn;

/// Create a copy of AuthTokenResponse
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuthTokenResponseCopyWith<_AuthTokenResponse> get copyWith => __$AuthTokenResponseCopyWithImpl<_AuthTokenResponse>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthTokenResponseToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuthTokenResponse&&(identical(other.token, token) || other.token == token)&&(identical(other.expiresIn, expiresIn) || other.expiresIn == expiresIn));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,token,expiresIn);

@override
String toString() {
  return 'AuthTokenResponse(token: $token, expiresIn: $expiresIn)';
}


}

/// @nodoc
abstract mixin class _$AuthTokenResponseCopyWith<$Res> implements $AuthTokenResponseCopyWith<$Res> {
  factory _$AuthTokenResponseCopyWith(_AuthTokenResponse value, $Res Function(_AuthTokenResponse) _then) = __$AuthTokenResponseCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'token') String token,@JsonKey(name: 'expiresIn') String expiresIn
});




}
/// @nodoc
class __$AuthTokenResponseCopyWithImpl<$Res>
    implements _$AuthTokenResponseCopyWith<$Res> {
  __$AuthTokenResponseCopyWithImpl(this._self, this._then);

  final _AuthTokenResponse _self;
  final $Res Function(_AuthTokenResponse) _then;

/// Create a copy of AuthTokenResponse
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? token = null,Object? expiresIn = null,}) {
  return _then(_AuthTokenResponse(
token: null == token ? _self.token : token // ignore: cast_nullable_to_non_nullable
as String,expiresIn: null == expiresIn ? _self.expiresIn : expiresIn // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on

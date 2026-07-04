// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'api_error_body.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ApiErrorBody {
  @JsonKey(name: 'message')
  String get message;
  @JsonKey(name: 'errors')
  List<String>? get errors;

  /// Create a copy of ApiErrorBody
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ApiErrorBodyCopyWith<ApiErrorBody> get copyWith =>
      _$ApiErrorBodyCopyWithImpl<ApiErrorBody>(
          this as ApiErrorBody, _$identity);

  /// Serializes this ApiErrorBody to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ApiErrorBody &&
            (identical(other.message, message) || other.message == message) &&
            const DeepCollectionEquality().equals(other.errors, errors));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, message, const DeepCollectionEquality().hash(errors));

  @override
  String toString() {
    return 'ApiErrorBody(message: $message, errors: $errors)';
  }
}

/// @nodoc
abstract mixin class $ApiErrorBodyCopyWith<$Res> {
  factory $ApiErrorBodyCopyWith(
          ApiErrorBody value, $Res Function(ApiErrorBody) _then) =
      _$ApiErrorBodyCopyWithImpl;
  @useResult
  $Res call(
      {@JsonKey(name: 'message') String message,
      @JsonKey(name: 'errors') List<String>? errors});
}

/// @nodoc
class _$ApiErrorBodyCopyWithImpl<$Res> implements $ApiErrorBodyCopyWith<$Res> {
  _$ApiErrorBodyCopyWithImpl(this._self, this._then);

  final ApiErrorBody _self;
  final $Res Function(ApiErrorBody) _then;

  /// Create a copy of ApiErrorBody
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? message = null,
    Object? errors = freezed,
  }) {
    return _then(_self.copyWith(
      message: null == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      errors: freezed == errors
          ? _self.errors
          : errors // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

/// Adds pattern-matching-related methods to [ApiErrorBody].
extension ApiErrorBodyPatterns on ApiErrorBody {
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

  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>(
    TResult Function(_ApiErrorBody value)? $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _ApiErrorBody() when $default != null:
        return $default(_that);
      case _:
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

  @optionalTypeArgs
  TResult map<TResult extends Object?>(
    TResult Function(_ApiErrorBody value) $default,
  ) {
    final _that = this;
    switch (_that) {
      case _ApiErrorBody():
        return $default(_that);
      case _:
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

  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>(
    TResult? Function(_ApiErrorBody value)? $default,
  ) {
    final _that = this;
    switch (_that) {
      case _ApiErrorBody() when $default != null:
        return $default(_that);
      case _:
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

  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>(
    TResult Function(@JsonKey(name: 'message') String message,
            @JsonKey(name: 'errors') List<String>? errors)?
        $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _ApiErrorBody() when $default != null:
        return $default(_that.message, _that.errors);
      case _:
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

  @optionalTypeArgs
  TResult when<TResult extends Object?>(
    TResult Function(@JsonKey(name: 'message') String message,
            @JsonKey(name: 'errors') List<String>? errors)
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _ApiErrorBody():
        return $default(_that.message, _that.errors);
      case _:
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

  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>(
    TResult? Function(@JsonKey(name: 'message') String message,
            @JsonKey(name: 'errors') List<String>? errors)?
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _ApiErrorBody() when $default != null:
        return $default(_that.message, _that.errors);
      case _:
        return null;
    }
  }
}

/// @nodoc
@JsonSerializable()
class _ApiErrorBody implements ApiErrorBody {
  const _ApiErrorBody(
      {@JsonKey(name: 'message') required this.message,
      @JsonKey(name: 'errors') final List<String>? errors})
      : _errors = errors;
  factory _ApiErrorBody.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorBodyFromJson(json);

  @override
  @JsonKey(name: 'message')
  final String message;
  final List<String>? _errors;
  @override
  @JsonKey(name: 'errors')
  List<String>? get errors {
    final value = _errors;
    if (value == null) return null;
    if (_errors is EqualUnmodifiableListView) return _errors;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  /// Create a copy of ApiErrorBody
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$ApiErrorBodyCopyWith<_ApiErrorBody> get copyWith =>
      __$ApiErrorBodyCopyWithImpl<_ApiErrorBody>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ApiErrorBodyToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _ApiErrorBody &&
            (identical(other.message, message) || other.message == message) &&
            const DeepCollectionEquality().equals(other._errors, _errors));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, message, const DeepCollectionEquality().hash(_errors));

  @override
  String toString() {
    return 'ApiErrorBody(message: $message, errors: $errors)';
  }
}

/// @nodoc
abstract mixin class _$ApiErrorBodyCopyWith<$Res>
    implements $ApiErrorBodyCopyWith<$Res> {
  factory _$ApiErrorBodyCopyWith(
          _ApiErrorBody value, $Res Function(_ApiErrorBody) _then) =
      __$ApiErrorBodyCopyWithImpl;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'message') String message,
      @JsonKey(name: 'errors') List<String>? errors});
}

/// @nodoc
class __$ApiErrorBodyCopyWithImpl<$Res>
    implements _$ApiErrorBodyCopyWith<$Res> {
  __$ApiErrorBodyCopyWithImpl(this._self, this._then);

  final _ApiErrorBody _self;
  final $Res Function(_ApiErrorBody) _then;

  /// Create a copy of ApiErrorBody
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? message = null,
    Object? errors = freezed,
  }) {
    return _then(_ApiErrorBody(
      message: null == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      errors: freezed == errors
          ? _self._errors
          : errors // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

// dart format on

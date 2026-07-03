// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'movement_write_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$MovementWriteRequest {
  @JsonKey(name: 'Type')
  MovementType get type;
  @JsonKey(name: 'Amount')
  num get amount;
  @JsonKey(name: 'Category')
  String get category;
  @JsonKey(name: 'Account')
  String get account;
  @DateOnlyConverter()
  @JsonKey(name: 'Date')
  DateTime get date;
  @JsonKey(name: 'Description')
  String? get description;
  @JsonKey(name: 'Card')
  String? get card;

  /// Create a copy of MovementWriteRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MovementWriteRequestCopyWith<MovementWriteRequest> get copyWith =>
      _$MovementWriteRequestCopyWithImpl<MovementWriteRequest>(
          this as MovementWriteRequest, _$identity);

  /// Serializes this MovementWriteRequest to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MovementWriteRequest &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.account, account) || other.account == account) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.card, card) || other.card == card));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, type, amount, category, account, date, description, card);

  @override
  String toString() {
    return 'MovementWriteRequest(type: $type, amount: $amount, category: $category, account: $account, date: $date, description: $description, card: $card)';
  }
}

/// @nodoc
abstract mixin class $MovementWriteRequestCopyWith<$Res> {
  factory $MovementWriteRequestCopyWith(MovementWriteRequest value,
          $Res Function(MovementWriteRequest) _then) =
      _$MovementWriteRequestCopyWithImpl;
  @useResult
  $Res call(
      {@JsonKey(name: 'Type') MovementType type,
      @JsonKey(name: 'Amount') num amount,
      @JsonKey(name: 'Category') String category,
      @JsonKey(name: 'Account') String account,
      @DateOnlyConverter() @JsonKey(name: 'Date') DateTime date,
      @JsonKey(name: 'Description') String? description,
      @JsonKey(name: 'Card') String? card});
}

/// @nodoc
class _$MovementWriteRequestCopyWithImpl<$Res>
    implements $MovementWriteRequestCopyWith<$Res> {
  _$MovementWriteRequestCopyWithImpl(this._self, this._then);

  final MovementWriteRequest _self;
  final $Res Function(MovementWriteRequest) _then;

  /// Create a copy of MovementWriteRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? amount = null,
    Object? category = null,
    Object? account = null,
    Object? date = null,
    Object? description = freezed,
    Object? card = freezed,
  }) {
    return _then(_self.copyWith(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as MovementType,
      amount: null == amount
          ? _self.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as num,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      account: null == account
          ? _self.account
          : account // ignore: cast_nullable_to_non_nullable
              as String,
      date: null == date
          ? _self.date
          : date // ignore: cast_nullable_to_non_nullable
              as DateTime,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      card: freezed == card
          ? _self.card
          : card // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// Adds pattern-matching-related methods to [MovementWriteRequest].
extension MovementWriteRequestPatterns on MovementWriteRequest {
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
    TResult Function(_MovementWriteRequest value)? $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _MovementWriteRequest() when $default != null:
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
    TResult Function(_MovementWriteRequest value) $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementWriteRequest():
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
    TResult? Function(_MovementWriteRequest value)? $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementWriteRequest() when $default != null:
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
    TResult Function(
            @JsonKey(name: 'Type') MovementType type,
            @JsonKey(name: 'Amount') num amount,
            @JsonKey(name: 'Category') String category,
            @JsonKey(name: 'Account') String account,
            @DateOnlyConverter() @JsonKey(name: 'Date') DateTime date,
            @JsonKey(name: 'Description') String? description,
            @JsonKey(name: 'Card') String? card)?
        $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _MovementWriteRequest() when $default != null:
        return $default(_that.type, _that.amount, _that.category, _that.account,
            _that.date, _that.description, _that.card);
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
    TResult Function(
            @JsonKey(name: 'Type') MovementType type,
            @JsonKey(name: 'Amount') num amount,
            @JsonKey(name: 'Category') String category,
            @JsonKey(name: 'Account') String account,
            @DateOnlyConverter() @JsonKey(name: 'Date') DateTime date,
            @JsonKey(name: 'Description') String? description,
            @JsonKey(name: 'Card') String? card)
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementWriteRequest():
        return $default(_that.type, _that.amount, _that.category, _that.account,
            _that.date, _that.description, _that.card);
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
    TResult? Function(
            @JsonKey(name: 'Type') MovementType type,
            @JsonKey(name: 'Amount') num amount,
            @JsonKey(name: 'Category') String category,
            @JsonKey(name: 'Account') String account,
            @DateOnlyConverter() @JsonKey(name: 'Date') DateTime date,
            @JsonKey(name: 'Description') String? description,
            @JsonKey(name: 'Card') String? card)?
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementWriteRequest() when $default != null:
        return $default(_that.type, _that.amount, _that.category, _that.account,
            _that.date, _that.description, _that.card);
      case _:
        return null;
    }
  }
}

/// @nodoc
@JsonSerializable()
class _MovementWriteRequest implements MovementWriteRequest {
  const _MovementWriteRequest(
      {@JsonKey(name: 'Type') required this.type,
      @JsonKey(name: 'Amount') required this.amount,
      @JsonKey(name: 'Category') required this.category,
      @JsonKey(name: 'Account') required this.account,
      @DateOnlyConverter() @JsonKey(name: 'Date') required this.date,
      @JsonKey(name: 'Description') this.description,
      @JsonKey(name: 'Card') this.card});
  factory _MovementWriteRequest.fromJson(Map<String, dynamic> json) =>
      _$MovementWriteRequestFromJson(json);

  @override
  @JsonKey(name: 'Type')
  final MovementType type;
  @override
  @JsonKey(name: 'Amount')
  final num amount;
  @override
  @JsonKey(name: 'Category')
  final String category;
  @override
  @JsonKey(name: 'Account')
  final String account;
  @override
  @DateOnlyConverter()
  @JsonKey(name: 'Date')
  final DateTime date;
  @override
  @JsonKey(name: 'Description')
  final String? description;
  @override
  @JsonKey(name: 'Card')
  final String? card;

  /// Create a copy of MovementWriteRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$MovementWriteRequestCopyWith<_MovementWriteRequest> get copyWith =>
      __$MovementWriteRequestCopyWithImpl<_MovementWriteRequest>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MovementWriteRequestToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _MovementWriteRequest &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.account, account) || other.account == account) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.card, card) || other.card == card));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, type, amount, category, account, date, description, card);

  @override
  String toString() {
    return 'MovementWriteRequest(type: $type, amount: $amount, category: $category, account: $account, date: $date, description: $description, card: $card)';
  }
}

/// @nodoc
abstract mixin class _$MovementWriteRequestCopyWith<$Res>
    implements $MovementWriteRequestCopyWith<$Res> {
  factory _$MovementWriteRequestCopyWith(_MovementWriteRequest value,
          $Res Function(_MovementWriteRequest) _then) =
      __$MovementWriteRequestCopyWithImpl;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'Type') MovementType type,
      @JsonKey(name: 'Amount') num amount,
      @JsonKey(name: 'Category') String category,
      @JsonKey(name: 'Account') String account,
      @DateOnlyConverter() @JsonKey(name: 'Date') DateTime date,
      @JsonKey(name: 'Description') String? description,
      @JsonKey(name: 'Card') String? card});
}

/// @nodoc
class __$MovementWriteRequestCopyWithImpl<$Res>
    implements _$MovementWriteRequestCopyWith<$Res> {
  __$MovementWriteRequestCopyWithImpl(this._self, this._then);

  final _MovementWriteRequest _self;
  final $Res Function(_MovementWriteRequest) _then;

  /// Create a copy of MovementWriteRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? type = null,
    Object? amount = null,
    Object? category = null,
    Object? account = null,
    Object? date = null,
    Object? description = freezed,
    Object? card = freezed,
  }) {
    return _then(_MovementWriteRequest(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as MovementType,
      amount: null == amount
          ? _self.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as num,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      account: null == account
          ? _self.account
          : account // ignore: cast_nullable_to_non_nullable
              as String,
      date: null == date
          ? _self.date
          : date // ignore: cast_nullable_to_non_nullable
              as DateTime,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      card: freezed == card
          ? _self.card
          : card // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

// dart format on

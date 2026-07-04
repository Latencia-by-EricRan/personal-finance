// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'movement_summary.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$MovementAmountSummary {
  @JsonKey(name: 'income')
  double get income;
  @JsonKey(name: 'expense')
  double get expense;

  /// Create a copy of MovementAmountSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MovementAmountSummaryCopyWith<MovementAmountSummary> get copyWith =>
      _$MovementAmountSummaryCopyWithImpl<MovementAmountSummary>(
          this as MovementAmountSummary, _$identity);

  /// Serializes this MovementAmountSummary to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MovementAmountSummary &&
            (identical(other.income, income) || other.income == income) &&
            (identical(other.expense, expense) || other.expense == expense));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, income, expense);

  @override
  String toString() {
    return 'MovementAmountSummary(income: $income, expense: $expense)';
  }
}

/// @nodoc
abstract mixin class $MovementAmountSummaryCopyWith<$Res> {
  factory $MovementAmountSummaryCopyWith(MovementAmountSummary value,
          $Res Function(MovementAmountSummary) _then) =
      _$MovementAmountSummaryCopyWithImpl;
  @useResult
  $Res call(
      {@JsonKey(name: 'income') double income,
      @JsonKey(name: 'expense') double expense});
}

/// @nodoc
class _$MovementAmountSummaryCopyWithImpl<$Res>
    implements $MovementAmountSummaryCopyWith<$Res> {
  _$MovementAmountSummaryCopyWithImpl(this._self, this._then);

  final MovementAmountSummary _self;
  final $Res Function(MovementAmountSummary) _then;

  /// Create a copy of MovementAmountSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? income = null,
    Object? expense = null,
  }) {
    return _then(_self.copyWith(
      income: null == income
          ? _self.income
          : income // ignore: cast_nullable_to_non_nullable
              as double,
      expense: null == expense
          ? _self.expense
          : expense // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// Adds pattern-matching-related methods to [MovementAmountSummary].
extension MovementAmountSummaryPatterns on MovementAmountSummary {
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
    TResult Function(_MovementAmountSummary value)? $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _MovementAmountSummary() when $default != null:
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
    TResult Function(_MovementAmountSummary value) $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementAmountSummary():
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
    TResult? Function(_MovementAmountSummary value)? $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementAmountSummary() when $default != null:
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
    TResult Function(@JsonKey(name: 'income') double income,
            @JsonKey(name: 'expense') double expense)?
        $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _MovementAmountSummary() when $default != null:
        return $default(_that.income, _that.expense);
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
    TResult Function(@JsonKey(name: 'income') double income,
            @JsonKey(name: 'expense') double expense)
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementAmountSummary():
        return $default(_that.income, _that.expense);
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
    TResult? Function(@JsonKey(name: 'income') double income,
            @JsonKey(name: 'expense') double expense)?
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementAmountSummary() when $default != null:
        return $default(_that.income, _that.expense);
      case _:
        return null;
    }
  }
}

/// @nodoc
@JsonSerializable()
class _MovementAmountSummary implements MovementAmountSummary {
  const _MovementAmountSummary(
      {@JsonKey(name: 'income') required this.income,
      @JsonKey(name: 'expense') required this.expense});
  factory _MovementAmountSummary.fromJson(Map<String, dynamic> json) =>
      _$MovementAmountSummaryFromJson(json);

  @override
  @JsonKey(name: 'income')
  final double income;
  @override
  @JsonKey(name: 'expense')
  final double expense;

  /// Create a copy of MovementAmountSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$MovementAmountSummaryCopyWith<_MovementAmountSummary> get copyWith =>
      __$MovementAmountSummaryCopyWithImpl<_MovementAmountSummary>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MovementAmountSummaryToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _MovementAmountSummary &&
            (identical(other.income, income) || other.income == income) &&
            (identical(other.expense, expense) || other.expense == expense));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, income, expense);

  @override
  String toString() {
    return 'MovementAmountSummary(income: $income, expense: $expense)';
  }
}

/// @nodoc
abstract mixin class _$MovementAmountSummaryCopyWith<$Res>
    implements $MovementAmountSummaryCopyWith<$Res> {
  factory _$MovementAmountSummaryCopyWith(_MovementAmountSummary value,
          $Res Function(_MovementAmountSummary) _then) =
      __$MovementAmountSummaryCopyWithImpl;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'income') double income,
      @JsonKey(name: 'expense') double expense});
}

/// @nodoc
class __$MovementAmountSummaryCopyWithImpl<$Res>
    implements _$MovementAmountSummaryCopyWith<$Res> {
  __$MovementAmountSummaryCopyWithImpl(this._self, this._then);

  final _MovementAmountSummary _self;
  final $Res Function(_MovementAmountSummary) _then;

  /// Create a copy of MovementAmountSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? income = null,
    Object? expense = null,
  }) {
    return _then(_MovementAmountSummary(
      income: null == income
          ? _self.income
          : income // ignore: cast_nullable_to_non_nullable
              as double,
      expense: null == expense
          ? _self.expense
          : expense // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
mixin _$MovementSummary {
  @JsonKey(name: 'items')
  int get items;
  @JsonKey(name: 'amount')
  MovementAmountSummary get amount;

  /// Create a copy of MovementSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MovementSummaryCopyWith<MovementSummary> get copyWith =>
      _$MovementSummaryCopyWithImpl<MovementSummary>(
          this as MovementSummary, _$identity);

  /// Serializes this MovementSummary to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MovementSummary &&
            (identical(other.items, items) || other.items == items) &&
            (identical(other.amount, amount) || other.amount == amount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, items, amount);

  @override
  String toString() {
    return 'MovementSummary(items: $items, amount: $amount)';
  }
}

/// @nodoc
abstract mixin class $MovementSummaryCopyWith<$Res> {
  factory $MovementSummaryCopyWith(
          MovementSummary value, $Res Function(MovementSummary) _then) =
      _$MovementSummaryCopyWithImpl;
  @useResult
  $Res call(
      {@JsonKey(name: 'items') int items,
      @JsonKey(name: 'amount') MovementAmountSummary amount});

  $MovementAmountSummaryCopyWith<$Res> get amount;
}

/// @nodoc
class _$MovementSummaryCopyWithImpl<$Res>
    implements $MovementSummaryCopyWith<$Res> {
  _$MovementSummaryCopyWithImpl(this._self, this._then);

  final MovementSummary _self;
  final $Res Function(MovementSummary) _then;

  /// Create a copy of MovementSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? items = null,
    Object? amount = null,
  }) {
    return _then(_self.copyWith(
      items: null == items
          ? _self.items
          : items // ignore: cast_nullable_to_non_nullable
              as int,
      amount: null == amount
          ? _self.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as MovementAmountSummary,
    ));
  }

  /// Create a copy of MovementSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MovementAmountSummaryCopyWith<$Res> get amount {
    return $MovementAmountSummaryCopyWith<$Res>(_self.amount, (value) {
      return _then(_self.copyWith(amount: value));
    });
  }
}

/// Adds pattern-matching-related methods to [MovementSummary].
extension MovementSummaryPatterns on MovementSummary {
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
    TResult Function(_MovementSummary value)? $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _MovementSummary() when $default != null:
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
    TResult Function(_MovementSummary value) $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementSummary():
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
    TResult? Function(_MovementSummary value)? $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementSummary() when $default != null:
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
    TResult Function(@JsonKey(name: 'items') int items,
            @JsonKey(name: 'amount') MovementAmountSummary amount)?
        $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _MovementSummary() when $default != null:
        return $default(_that.items, _that.amount);
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
    TResult Function(@JsonKey(name: 'items') int items,
            @JsonKey(name: 'amount') MovementAmountSummary amount)
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementSummary():
        return $default(_that.items, _that.amount);
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
    TResult? Function(@JsonKey(name: 'items') int items,
            @JsonKey(name: 'amount') MovementAmountSummary amount)?
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _MovementSummary() when $default != null:
        return $default(_that.items, _that.amount);
      case _:
        return null;
    }
  }
}

/// @nodoc
@JsonSerializable()
class _MovementSummary implements MovementSummary {
  const _MovementSummary(
      {@JsonKey(name: 'items') required this.items,
      @JsonKey(name: 'amount') required this.amount});
  factory _MovementSummary.fromJson(Map<String, dynamic> json) =>
      _$MovementSummaryFromJson(json);

  @override
  @JsonKey(name: 'items')
  final int items;
  @override
  @JsonKey(name: 'amount')
  final MovementAmountSummary amount;

  /// Create a copy of MovementSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$MovementSummaryCopyWith<_MovementSummary> get copyWith =>
      __$MovementSummaryCopyWithImpl<_MovementSummary>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MovementSummaryToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _MovementSummary &&
            (identical(other.items, items) || other.items == items) &&
            (identical(other.amount, amount) || other.amount == amount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, items, amount);

  @override
  String toString() {
    return 'MovementSummary(items: $items, amount: $amount)';
  }
}

/// @nodoc
abstract mixin class _$MovementSummaryCopyWith<$Res>
    implements $MovementSummaryCopyWith<$Res> {
  factory _$MovementSummaryCopyWith(
          _MovementSummary value, $Res Function(_MovementSummary) _then) =
      __$MovementSummaryCopyWithImpl;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'items') int items,
      @JsonKey(name: 'amount') MovementAmountSummary amount});

  @override
  $MovementAmountSummaryCopyWith<$Res> get amount;
}

/// @nodoc
class __$MovementSummaryCopyWithImpl<$Res>
    implements _$MovementSummaryCopyWith<$Res> {
  __$MovementSummaryCopyWithImpl(this._self, this._then);

  final _MovementSummary _self;
  final $Res Function(_MovementSummary) _then;

  /// Create a copy of MovementSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? items = null,
    Object? amount = null,
  }) {
    return _then(_MovementSummary(
      items: null == items
          ? _self.items
          : items // ignore: cast_nullable_to_non_nullable
              as int,
      amount: null == amount
          ? _self.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as MovementAmountSummary,
    ));
  }

  /// Create a copy of MovementSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MovementAmountSummaryCopyWith<$Res> get amount {
    return $MovementAmountSummaryCopyWith<$Res>(_self.amount, (value) {
      return _then(_self.copyWith(amount: value));
    });
  }
}

// dart format on

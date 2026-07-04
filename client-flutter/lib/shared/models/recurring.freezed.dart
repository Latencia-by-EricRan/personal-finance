// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recurring.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Recurring {
  @JsonKey(name: '_id')
  String? get id;
  @JsonKey(name: 'Type')
  MovementType get type;
  @JsonKey(name: 'Amount')
  double get amount;
  @JsonKey(name: 'Category')
  String get category;
  @JsonKey(name: 'Account')
  String get account;
  @JsonKey(name: 'Description')
  String? get description;
  @JsonKey(name: 'Card')
  String? get card;
  @JsonKey(name: 'Frequency')
  RecurringFrequency get frequency;
  @JsonKey(name: 'DayOfMonth')
  int get dayOfMonth;
  @JsonKey(name: 'Active')
  bool? get active;
  @JsonKey(name: 'LastRunYearMonth')
  String? get lastRunYearMonth;

  /// Create a copy of Recurring
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $RecurringCopyWith<Recurring> get copyWith =>
      _$RecurringCopyWithImpl<Recurring>(this as Recurring, _$identity);

  /// Serializes this Recurring to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is Recurring &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.account, account) || other.account == account) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.card, card) || other.card == card) &&
            (identical(other.frequency, frequency) ||
                other.frequency == frequency) &&
            (identical(other.dayOfMonth, dayOfMonth) ||
                other.dayOfMonth == dayOfMonth) &&
            (identical(other.active, active) || other.active == active) &&
            (identical(other.lastRunYearMonth, lastRunYearMonth) ||
                other.lastRunYearMonth == lastRunYearMonth));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      amount,
      category,
      account,
      description,
      card,
      frequency,
      dayOfMonth,
      active,
      lastRunYearMonth);

  @override
  String toString() {
    return 'Recurring(id: $id, type: $type, amount: $amount, category: $category, account: $account, description: $description, card: $card, frequency: $frequency, dayOfMonth: $dayOfMonth, active: $active, lastRunYearMonth: $lastRunYearMonth)';
  }
}

/// @nodoc
abstract mixin class $RecurringCopyWith<$Res> {
  factory $RecurringCopyWith(Recurring value, $Res Function(Recurring) _then) =
      _$RecurringCopyWithImpl;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String? id,
      @JsonKey(name: 'Type') MovementType type,
      @JsonKey(name: 'Amount') double amount,
      @JsonKey(name: 'Category') String category,
      @JsonKey(name: 'Account') String account,
      @JsonKey(name: 'Description') String? description,
      @JsonKey(name: 'Card') String? card,
      @JsonKey(name: 'Frequency') RecurringFrequency frequency,
      @JsonKey(name: 'DayOfMonth') int dayOfMonth,
      @JsonKey(name: 'Active') bool? active,
      @JsonKey(name: 'LastRunYearMonth') String? lastRunYearMonth});
}

/// @nodoc
class _$RecurringCopyWithImpl<$Res> implements $RecurringCopyWith<$Res> {
  _$RecurringCopyWithImpl(this._self, this._then);

  final Recurring _self;
  final $Res Function(Recurring) _then;

  /// Create a copy of Recurring
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = freezed,
    Object? type = null,
    Object? amount = null,
    Object? category = null,
    Object? account = null,
    Object? description = freezed,
    Object? card = freezed,
    Object? frequency = null,
    Object? dayOfMonth = null,
    Object? active = freezed,
    Object? lastRunYearMonth = freezed,
  }) {
    return _then(_self.copyWith(
      id: freezed == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as MovementType,
      amount: null == amount
          ? _self.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      account: null == account
          ? _self.account
          : account // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      card: freezed == card
          ? _self.card
          : card // ignore: cast_nullable_to_non_nullable
              as String?,
      frequency: null == frequency
          ? _self.frequency
          : frequency // ignore: cast_nullable_to_non_nullable
              as RecurringFrequency,
      dayOfMonth: null == dayOfMonth
          ? _self.dayOfMonth
          : dayOfMonth // ignore: cast_nullable_to_non_nullable
              as int,
      active: freezed == active
          ? _self.active
          : active // ignore: cast_nullable_to_non_nullable
              as bool?,
      lastRunYearMonth: freezed == lastRunYearMonth
          ? _self.lastRunYearMonth
          : lastRunYearMonth // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// Adds pattern-matching-related methods to [Recurring].
extension RecurringPatterns on Recurring {
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
    TResult Function(_Recurring value)? $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _Recurring() when $default != null:
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
    TResult Function(_Recurring value) $default,
  ) {
    final _that = this;
    switch (_that) {
      case _Recurring():
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
    TResult? Function(_Recurring value)? $default,
  ) {
    final _that = this;
    switch (_that) {
      case _Recurring() when $default != null:
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
            @JsonKey(name: '_id') String? id,
            @JsonKey(name: 'Type') MovementType type,
            @JsonKey(name: 'Amount') double amount,
            @JsonKey(name: 'Category') String category,
            @JsonKey(name: 'Account') String account,
            @JsonKey(name: 'Description') String? description,
            @JsonKey(name: 'Card') String? card,
            @JsonKey(name: 'Frequency') RecurringFrequency frequency,
            @JsonKey(name: 'DayOfMonth') int dayOfMonth,
            @JsonKey(name: 'Active') bool? active,
            @JsonKey(name: 'LastRunYearMonth') String? lastRunYearMonth)?
        $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _Recurring() when $default != null:
        return $default(
            _that.id,
            _that.type,
            _that.amount,
            _that.category,
            _that.account,
            _that.description,
            _that.card,
            _that.frequency,
            _that.dayOfMonth,
            _that.active,
            _that.lastRunYearMonth);
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
            @JsonKey(name: '_id') String? id,
            @JsonKey(name: 'Type') MovementType type,
            @JsonKey(name: 'Amount') double amount,
            @JsonKey(name: 'Category') String category,
            @JsonKey(name: 'Account') String account,
            @JsonKey(name: 'Description') String? description,
            @JsonKey(name: 'Card') String? card,
            @JsonKey(name: 'Frequency') RecurringFrequency frequency,
            @JsonKey(name: 'DayOfMonth') int dayOfMonth,
            @JsonKey(name: 'Active') bool? active,
            @JsonKey(name: 'LastRunYearMonth') String? lastRunYearMonth)
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _Recurring():
        return $default(
            _that.id,
            _that.type,
            _that.amount,
            _that.category,
            _that.account,
            _that.description,
            _that.card,
            _that.frequency,
            _that.dayOfMonth,
            _that.active,
            _that.lastRunYearMonth);
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
            @JsonKey(name: '_id') String? id,
            @JsonKey(name: 'Type') MovementType type,
            @JsonKey(name: 'Amount') double amount,
            @JsonKey(name: 'Category') String category,
            @JsonKey(name: 'Account') String account,
            @JsonKey(name: 'Description') String? description,
            @JsonKey(name: 'Card') String? card,
            @JsonKey(name: 'Frequency') RecurringFrequency frequency,
            @JsonKey(name: 'DayOfMonth') int dayOfMonth,
            @JsonKey(name: 'Active') bool? active,
            @JsonKey(name: 'LastRunYearMonth') String? lastRunYearMonth)?
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _Recurring() when $default != null:
        return $default(
            _that.id,
            _that.type,
            _that.amount,
            _that.category,
            _that.account,
            _that.description,
            _that.card,
            _that.frequency,
            _that.dayOfMonth,
            _that.active,
            _that.lastRunYearMonth);
      case _:
        return null;
    }
  }
}

/// @nodoc
@JsonSerializable()
class _Recurring implements Recurring {
  const _Recurring(
      {@JsonKey(name: '_id') this.id,
      @JsonKey(name: 'Type') required this.type,
      @JsonKey(name: 'Amount') required this.amount,
      @JsonKey(name: 'Category') required this.category,
      @JsonKey(name: 'Account') required this.account,
      @JsonKey(name: 'Description') this.description,
      @JsonKey(name: 'Card') this.card,
      @JsonKey(name: 'Frequency') required this.frequency,
      @JsonKey(name: 'DayOfMonth') required this.dayOfMonth,
      @JsonKey(name: 'Active') this.active,
      @JsonKey(name: 'LastRunYearMonth') this.lastRunYearMonth});
  factory _Recurring.fromJson(Map<String, dynamic> json) =>
      _$RecurringFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String? id;
  @override
  @JsonKey(name: 'Type')
  final MovementType type;
  @override
  @JsonKey(name: 'Amount')
  final double amount;
  @override
  @JsonKey(name: 'Category')
  final String category;
  @override
  @JsonKey(name: 'Account')
  final String account;
  @override
  @JsonKey(name: 'Description')
  final String? description;
  @override
  @JsonKey(name: 'Card')
  final String? card;
  @override
  @JsonKey(name: 'Frequency')
  final RecurringFrequency frequency;
  @override
  @JsonKey(name: 'DayOfMonth')
  final int dayOfMonth;
  @override
  @JsonKey(name: 'Active')
  final bool? active;
  @override
  @JsonKey(name: 'LastRunYearMonth')
  final String? lastRunYearMonth;

  /// Create a copy of Recurring
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$RecurringCopyWith<_Recurring> get copyWith =>
      __$RecurringCopyWithImpl<_Recurring>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$RecurringToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _Recurring &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.account, account) || other.account == account) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.card, card) || other.card == card) &&
            (identical(other.frequency, frequency) ||
                other.frequency == frequency) &&
            (identical(other.dayOfMonth, dayOfMonth) ||
                other.dayOfMonth == dayOfMonth) &&
            (identical(other.active, active) || other.active == active) &&
            (identical(other.lastRunYearMonth, lastRunYearMonth) ||
                other.lastRunYearMonth == lastRunYearMonth));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      amount,
      category,
      account,
      description,
      card,
      frequency,
      dayOfMonth,
      active,
      lastRunYearMonth);

  @override
  String toString() {
    return 'Recurring(id: $id, type: $type, amount: $amount, category: $category, account: $account, description: $description, card: $card, frequency: $frequency, dayOfMonth: $dayOfMonth, active: $active, lastRunYearMonth: $lastRunYearMonth)';
  }
}

/// @nodoc
abstract mixin class _$RecurringCopyWith<$Res>
    implements $RecurringCopyWith<$Res> {
  factory _$RecurringCopyWith(
          _Recurring value, $Res Function(_Recurring) _then) =
      __$RecurringCopyWithImpl;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String? id,
      @JsonKey(name: 'Type') MovementType type,
      @JsonKey(name: 'Amount') double amount,
      @JsonKey(name: 'Category') String category,
      @JsonKey(name: 'Account') String account,
      @JsonKey(name: 'Description') String? description,
      @JsonKey(name: 'Card') String? card,
      @JsonKey(name: 'Frequency') RecurringFrequency frequency,
      @JsonKey(name: 'DayOfMonth') int dayOfMonth,
      @JsonKey(name: 'Active') bool? active,
      @JsonKey(name: 'LastRunYearMonth') String? lastRunYearMonth});
}

/// @nodoc
class __$RecurringCopyWithImpl<$Res> implements _$RecurringCopyWith<$Res> {
  __$RecurringCopyWithImpl(this._self, this._then);

  final _Recurring _self;
  final $Res Function(_Recurring) _then;

  /// Create a copy of Recurring
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = freezed,
    Object? type = null,
    Object? amount = null,
    Object? category = null,
    Object? account = null,
    Object? description = freezed,
    Object? card = freezed,
    Object? frequency = null,
    Object? dayOfMonth = null,
    Object? active = freezed,
    Object? lastRunYearMonth = freezed,
  }) {
    return _then(_Recurring(
      id: freezed == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as MovementType,
      amount: null == amount
          ? _self.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      account: null == account
          ? _self.account
          : account // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      card: freezed == card
          ? _self.card
          : card // ignore: cast_nullable_to_non_nullable
              as String?,
      frequency: null == frequency
          ? _self.frequency
          : frequency // ignore: cast_nullable_to_non_nullable
              as RecurringFrequency,
      dayOfMonth: null == dayOfMonth
          ? _self.dayOfMonth
          : dayOfMonth // ignore: cast_nullable_to_non_nullable
              as int,
      active: freezed == active
          ? _self.active
          : active // ignore: cast_nullable_to_non_nullable
              as bool?,
      lastRunYearMonth: freezed == lastRunYearMonth
          ? _self.lastRunYearMonth
          : lastRunYearMonth // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

// dart format on

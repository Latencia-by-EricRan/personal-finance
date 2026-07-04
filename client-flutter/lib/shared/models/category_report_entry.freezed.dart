// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'category_report_entry.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CategoryReportEntry {
  @JsonKey(name: 'Category')
  Category get category;
  @JsonKey(name: 'Total')
  double get total;

  /// Create a copy of CategoryReportEntry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $CategoryReportEntryCopyWith<CategoryReportEntry> get copyWith =>
      _$CategoryReportEntryCopyWithImpl<CategoryReportEntry>(
          this as CategoryReportEntry, _$identity);

  /// Serializes this CategoryReportEntry to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is CategoryReportEntry &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.total, total) || other.total == total));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, category, total);

  @override
  String toString() {
    return 'CategoryReportEntry(category: $category, total: $total)';
  }
}

/// @nodoc
abstract mixin class $CategoryReportEntryCopyWith<$Res> {
  factory $CategoryReportEntryCopyWith(
          CategoryReportEntry value, $Res Function(CategoryReportEntry) _then) =
      _$CategoryReportEntryCopyWithImpl;
  @useResult
  $Res call(
      {@JsonKey(name: 'Category') Category category,
      @JsonKey(name: 'Total') double total});

  $CategoryCopyWith<$Res> get category;
}

/// @nodoc
class _$CategoryReportEntryCopyWithImpl<$Res>
    implements $CategoryReportEntryCopyWith<$Res> {
  _$CategoryReportEntryCopyWithImpl(this._self, this._then);

  final CategoryReportEntry _self;
  final $Res Function(CategoryReportEntry) _then;

  /// Create a copy of CategoryReportEntry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? category = null,
    Object? total = null,
  }) {
    return _then(_self.copyWith(
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as Category,
      total: null == total
          ? _self.total
          : total // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }

  /// Create a copy of CategoryReportEntry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CategoryCopyWith<$Res> get category {
    return $CategoryCopyWith<$Res>(_self.category, (value) {
      return _then(_self.copyWith(category: value));
    });
  }
}

/// Adds pattern-matching-related methods to [CategoryReportEntry].
extension CategoryReportEntryPatterns on CategoryReportEntry {
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
    TResult Function(_CategoryReportEntry value)? $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _CategoryReportEntry() when $default != null:
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
    TResult Function(_CategoryReportEntry value) $default,
  ) {
    final _that = this;
    switch (_that) {
      case _CategoryReportEntry():
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
    TResult? Function(_CategoryReportEntry value)? $default,
  ) {
    final _that = this;
    switch (_that) {
      case _CategoryReportEntry() when $default != null:
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
    TResult Function(@JsonKey(name: 'Category') Category category,
            @JsonKey(name: 'Total') double total)?
        $default, {
    required TResult orElse(),
  }) {
    final _that = this;
    switch (_that) {
      case _CategoryReportEntry() when $default != null:
        return $default(_that.category, _that.total);
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
    TResult Function(@JsonKey(name: 'Category') Category category,
            @JsonKey(name: 'Total') double total)
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _CategoryReportEntry():
        return $default(_that.category, _that.total);
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
    TResult? Function(@JsonKey(name: 'Category') Category category,
            @JsonKey(name: 'Total') double total)?
        $default,
  ) {
    final _that = this;
    switch (_that) {
      case _CategoryReportEntry() when $default != null:
        return $default(_that.category, _that.total);
      case _:
        return null;
    }
  }
}

/// @nodoc
@JsonSerializable()
class _CategoryReportEntry implements CategoryReportEntry {
  const _CategoryReportEntry(
      {@JsonKey(name: 'Category') required this.category,
      @JsonKey(name: 'Total') required this.total});
  factory _CategoryReportEntry.fromJson(Map<String, dynamic> json) =>
      _$CategoryReportEntryFromJson(json);

  @override
  @JsonKey(name: 'Category')
  final Category category;
  @override
  @JsonKey(name: 'Total')
  final double total;

  /// Create a copy of CategoryReportEntry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$CategoryReportEntryCopyWith<_CategoryReportEntry> get copyWith =>
      __$CategoryReportEntryCopyWithImpl<_CategoryReportEntry>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$CategoryReportEntryToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _CategoryReportEntry &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.total, total) || other.total == total));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, category, total);

  @override
  String toString() {
    return 'CategoryReportEntry(category: $category, total: $total)';
  }
}

/// @nodoc
abstract mixin class _$CategoryReportEntryCopyWith<$Res>
    implements $CategoryReportEntryCopyWith<$Res> {
  factory _$CategoryReportEntryCopyWith(_CategoryReportEntry value,
          $Res Function(_CategoryReportEntry) _then) =
      __$CategoryReportEntryCopyWithImpl;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'Category') Category category,
      @JsonKey(name: 'Total') double total});

  @override
  $CategoryCopyWith<$Res> get category;
}

/// @nodoc
class __$CategoryReportEntryCopyWithImpl<$Res>
    implements _$CategoryReportEntryCopyWith<$Res> {
  __$CategoryReportEntryCopyWithImpl(this._self, this._then);

  final _CategoryReportEntry _self;
  final $Res Function(_CategoryReportEntry) _then;

  /// Create a copy of CategoryReportEntry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? category = null,
    Object? total = null,
  }) {
    return _then(_CategoryReportEntry(
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as Category,
      total: null == total
          ? _self.total
          : total // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }

  /// Create a copy of CategoryReportEntry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CategoryCopyWith<$Res> get category {
    return $CategoryCopyWith<$Res>(_self.category, (value) {
      return _then(_self.copyWith(category: value));
    });
  }
}

// dart format on

// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'budget_status.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$BudgetStatus {

@JsonKey(name: 'Category') Category get category;@JsonKey(name: 'Limit') double get limit;@JsonKey(name: 'Spent') double get spent;@JsonKey(name: 'Remaining') double get remaining;@JsonKey(name: 'Percent') double get percent;
/// Create a copy of BudgetStatus
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BudgetStatusCopyWith<BudgetStatus> get copyWith => _$BudgetStatusCopyWithImpl<BudgetStatus>(this as BudgetStatus, _$identity);

  /// Serializes this BudgetStatus to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BudgetStatus&&(identical(other.category, category) || other.category == category)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.spent, spent) || other.spent == spent)&&(identical(other.remaining, remaining) || other.remaining == remaining)&&(identical(other.percent, percent) || other.percent == percent));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,category,limit,spent,remaining,percent);

@override
String toString() {
  return 'BudgetStatus(category: $category, limit: $limit, spent: $spent, remaining: $remaining, percent: $percent)';
}


}

/// @nodoc
abstract mixin class $BudgetStatusCopyWith<$Res>  {
  factory $BudgetStatusCopyWith(BudgetStatus value, $Res Function(BudgetStatus) _then) = _$BudgetStatusCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'Category') Category category,@JsonKey(name: 'Limit') double limit,@JsonKey(name: 'Spent') double spent,@JsonKey(name: 'Remaining') double remaining,@JsonKey(name: 'Percent') double percent
});


$CategoryCopyWith<$Res> get category;

}
/// @nodoc
class _$BudgetStatusCopyWithImpl<$Res>
    implements $BudgetStatusCopyWith<$Res> {
  _$BudgetStatusCopyWithImpl(this._self, this._then);

  final BudgetStatus _self;
  final $Res Function(BudgetStatus) _then;

/// Create a copy of BudgetStatus
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? category = null,Object? limit = null,Object? spent = null,Object? remaining = null,Object? percent = null,}) {
  return _then(_self.copyWith(
category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as Category,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as double,spent: null == spent ? _self.spent : spent // ignore: cast_nullable_to_non_nullable
as double,remaining: null == remaining ? _self.remaining : remaining // ignore: cast_nullable_to_non_nullable
as double,percent: null == percent ? _self.percent : percent // ignore: cast_nullable_to_non_nullable
as double,
  ));
}
/// Create a copy of BudgetStatus
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CategoryCopyWith<$Res> get category {
  
  return $CategoryCopyWith<$Res>(_self.category, (value) {
    return _then(_self.copyWith(category: value));
  });
}
}


/// Adds pattern-matching-related methods to [BudgetStatus].
extension BudgetStatusPatterns on BudgetStatus {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BudgetStatus value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BudgetStatus() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BudgetStatus value)  $default,){
final _that = this;
switch (_that) {
case _BudgetStatus():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BudgetStatus value)?  $default,){
final _that = this;
switch (_that) {
case _BudgetStatus() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'Category')  Category category, @JsonKey(name: 'Limit')  double limit, @JsonKey(name: 'Spent')  double spent, @JsonKey(name: 'Remaining')  double remaining, @JsonKey(name: 'Percent')  double percent)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BudgetStatus() when $default != null:
return $default(_that.category,_that.limit,_that.spent,_that.remaining,_that.percent);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'Category')  Category category, @JsonKey(name: 'Limit')  double limit, @JsonKey(name: 'Spent')  double spent, @JsonKey(name: 'Remaining')  double remaining, @JsonKey(name: 'Percent')  double percent)  $default,) {final _that = this;
switch (_that) {
case _BudgetStatus():
return $default(_that.category,_that.limit,_that.spent,_that.remaining,_that.percent);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'Category')  Category category, @JsonKey(name: 'Limit')  double limit, @JsonKey(name: 'Spent')  double spent, @JsonKey(name: 'Remaining')  double remaining, @JsonKey(name: 'Percent')  double percent)?  $default,) {final _that = this;
switch (_that) {
case _BudgetStatus() when $default != null:
return $default(_that.category,_that.limit,_that.spent,_that.remaining,_that.percent);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _BudgetStatus implements BudgetStatus {
  const _BudgetStatus({@JsonKey(name: 'Category') required this.category, @JsonKey(name: 'Limit') required this.limit, @JsonKey(name: 'Spent') required this.spent, @JsonKey(name: 'Remaining') required this.remaining, @JsonKey(name: 'Percent') required this.percent});
  factory _BudgetStatus.fromJson(Map<String, dynamic> json) => _$BudgetStatusFromJson(json);

@override@JsonKey(name: 'Category') final  Category category;
@override@JsonKey(name: 'Limit') final  double limit;
@override@JsonKey(name: 'Spent') final  double spent;
@override@JsonKey(name: 'Remaining') final  double remaining;
@override@JsonKey(name: 'Percent') final  double percent;

/// Create a copy of BudgetStatus
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BudgetStatusCopyWith<_BudgetStatus> get copyWith => __$BudgetStatusCopyWithImpl<_BudgetStatus>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BudgetStatusToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BudgetStatus&&(identical(other.category, category) || other.category == category)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.spent, spent) || other.spent == spent)&&(identical(other.remaining, remaining) || other.remaining == remaining)&&(identical(other.percent, percent) || other.percent == percent));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,category,limit,spent,remaining,percent);

@override
String toString() {
  return 'BudgetStatus(category: $category, limit: $limit, spent: $spent, remaining: $remaining, percent: $percent)';
}


}

/// @nodoc
abstract mixin class _$BudgetStatusCopyWith<$Res> implements $BudgetStatusCopyWith<$Res> {
  factory _$BudgetStatusCopyWith(_BudgetStatus value, $Res Function(_BudgetStatus) _then) = __$BudgetStatusCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'Category') Category category,@JsonKey(name: 'Limit') double limit,@JsonKey(name: 'Spent') double spent,@JsonKey(name: 'Remaining') double remaining,@JsonKey(name: 'Percent') double percent
});


@override $CategoryCopyWith<$Res> get category;

}
/// @nodoc
class __$BudgetStatusCopyWithImpl<$Res>
    implements _$BudgetStatusCopyWith<$Res> {
  __$BudgetStatusCopyWithImpl(this._self, this._then);

  final _BudgetStatus _self;
  final $Res Function(_BudgetStatus) _then;

/// Create a copy of BudgetStatus
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? category = null,Object? limit = null,Object? spent = null,Object? remaining = null,Object? percent = null,}) {
  return _then(_BudgetStatus(
category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as Category,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as double,spent: null == spent ? _self.spent : spent // ignore: cast_nullable_to_non_nullable
as double,remaining: null == remaining ? _self.remaining : remaining // ignore: cast_nullable_to_non_nullable
as double,percent: null == percent ? _self.percent : percent // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

/// Create a copy of BudgetStatus
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

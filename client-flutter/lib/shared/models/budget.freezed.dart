// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'budget.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Budget {

@JsonKey(name: '_id') String? get id;@JsonKey(name: 'Category') String get category;@JsonKey(name: 'Month') int get month;@JsonKey(name: 'Year') int get year;@JsonKey(name: 'Limit') double get limit;
/// Create a copy of Budget
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BudgetCopyWith<Budget> get copyWith => _$BudgetCopyWithImpl<Budget>(this as Budget, _$identity);

  /// Serializes this Budget to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Budget&&(identical(other.id, id) || other.id == id)&&(identical(other.category, category) || other.category == category)&&(identical(other.month, month) || other.month == month)&&(identical(other.year, year) || other.year == year)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,category,month,year,limit);

@override
String toString() {
  return 'Budget(id: $id, category: $category, month: $month, year: $year, limit: $limit)';
}


}

/// @nodoc
abstract mixin class $BudgetCopyWith<$Res>  {
  factory $BudgetCopyWith(Budget value, $Res Function(Budget) _then) = _$BudgetCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id') String? id,@JsonKey(name: 'Category') String category,@JsonKey(name: 'Month') int month,@JsonKey(name: 'Year') int year,@JsonKey(name: 'Limit') double limit
});




}
/// @nodoc
class _$BudgetCopyWithImpl<$Res>
    implements $BudgetCopyWith<$Res> {
  _$BudgetCopyWithImpl(this._self, this._then);

  final Budget _self;
  final $Res Function(Budget) _then;

/// Create a copy of Budget
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? category = null,Object? month = null,Object? year = null,Object? limit = null,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as int,year: null == year ? _self.year : year // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [Budget].
extension BudgetPatterns on Budget {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Budget value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Budget() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Budget value)  $default,){
final _that = this;
switch (_that) {
case _Budget():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Budget value)?  $default,){
final _that = this;
switch (_that) {
case _Budget() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id, @JsonKey(name: 'Category')  String category, @JsonKey(name: 'Month')  int month, @JsonKey(name: 'Year')  int year, @JsonKey(name: 'Limit')  double limit)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Budget() when $default != null:
return $default(_that.id,_that.category,_that.month,_that.year,_that.limit);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id, @JsonKey(name: 'Category')  String category, @JsonKey(name: 'Month')  int month, @JsonKey(name: 'Year')  int year, @JsonKey(name: 'Limit')  double limit)  $default,) {final _that = this;
switch (_that) {
case _Budget():
return $default(_that.id,_that.category,_that.month,_that.year,_that.limit);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id')  String? id, @JsonKey(name: 'Category')  String category, @JsonKey(name: 'Month')  int month, @JsonKey(name: 'Year')  int year, @JsonKey(name: 'Limit')  double limit)?  $default,) {final _that = this;
switch (_that) {
case _Budget() when $default != null:
return $default(_that.id,_that.category,_that.month,_that.year,_that.limit);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Budget implements Budget {
  const _Budget({@JsonKey(name: '_id') this.id, @JsonKey(name: 'Category') required this.category, @JsonKey(name: 'Month') required this.month, @JsonKey(name: 'Year') required this.year, @JsonKey(name: 'Limit') required this.limit});
  factory _Budget.fromJson(Map<String, dynamic> json) => _$BudgetFromJson(json);

@override@JsonKey(name: '_id') final  String? id;
@override@JsonKey(name: 'Category') final  String category;
@override@JsonKey(name: 'Month') final  int month;
@override@JsonKey(name: 'Year') final  int year;
@override@JsonKey(name: 'Limit') final  double limit;

/// Create a copy of Budget
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BudgetCopyWith<_Budget> get copyWith => __$BudgetCopyWithImpl<_Budget>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BudgetToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Budget&&(identical(other.id, id) || other.id == id)&&(identical(other.category, category) || other.category == category)&&(identical(other.month, month) || other.month == month)&&(identical(other.year, year) || other.year == year)&&(identical(other.limit, limit) || other.limit == limit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,category,month,year,limit);

@override
String toString() {
  return 'Budget(id: $id, category: $category, month: $month, year: $year, limit: $limit)';
}


}

/// @nodoc
abstract mixin class _$BudgetCopyWith<$Res> implements $BudgetCopyWith<$Res> {
  factory _$BudgetCopyWith(_Budget value, $Res Function(_Budget) _then) = __$BudgetCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id') String? id,@JsonKey(name: 'Category') String category,@JsonKey(name: 'Month') int month,@JsonKey(name: 'Year') int year,@JsonKey(name: 'Limit') double limit
});




}
/// @nodoc
class __$BudgetCopyWithImpl<$Res>
    implements _$BudgetCopyWith<$Res> {
  __$BudgetCopyWithImpl(this._self, this._then);

  final _Budget _self;
  final $Res Function(_Budget) _then;

/// Create a copy of Budget
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? category = null,Object? month = null,Object? year = null,Object? limit = null,}) {
  return _then(_Budget(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as int,year: null == year ? _self.year : year // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}

// dart format on

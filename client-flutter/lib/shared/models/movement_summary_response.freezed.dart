// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'movement_summary_response.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$MovementSummaryResponse {

@JsonKey(name: 'month') int get month;@JsonKey(name: 'year') int get year;@JsonKey(name: 'summary') MovementSummary get summary;@JsonKey(name: 'movements') List<Movement> get movements;
/// Create a copy of MovementSummaryResponse
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MovementSummaryResponseCopyWith<MovementSummaryResponse> get copyWith => _$MovementSummaryResponseCopyWithImpl<MovementSummaryResponse>(this as MovementSummaryResponse, _$identity);

  /// Serializes this MovementSummaryResponse to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MovementSummaryResponse&&(identical(other.month, month) || other.month == month)&&(identical(other.year, year) || other.year == year)&&(identical(other.summary, summary) || other.summary == summary)&&const DeepCollectionEquality().equals(other.movements, movements));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,month,year,summary,const DeepCollectionEquality().hash(movements));

@override
String toString() {
  return 'MovementSummaryResponse(month: $month, year: $year, summary: $summary, movements: $movements)';
}


}

/// @nodoc
abstract mixin class $MovementSummaryResponseCopyWith<$Res>  {
  factory $MovementSummaryResponseCopyWith(MovementSummaryResponse value, $Res Function(MovementSummaryResponse) _then) = _$MovementSummaryResponseCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'month') int month,@JsonKey(name: 'year') int year,@JsonKey(name: 'summary') MovementSummary summary,@JsonKey(name: 'movements') List<Movement> movements
});


$MovementSummaryCopyWith<$Res> get summary;

}
/// @nodoc
class _$MovementSummaryResponseCopyWithImpl<$Res>
    implements $MovementSummaryResponseCopyWith<$Res> {
  _$MovementSummaryResponseCopyWithImpl(this._self, this._then);

  final MovementSummaryResponse _self;
  final $Res Function(MovementSummaryResponse) _then;

/// Create a copy of MovementSummaryResponse
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? month = null,Object? year = null,Object? summary = null,Object? movements = null,}) {
  return _then(_self.copyWith(
month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as int,year: null == year ? _self.year : year // ignore: cast_nullable_to_non_nullable
as int,summary: null == summary ? _self.summary : summary // ignore: cast_nullable_to_non_nullable
as MovementSummary,movements: null == movements ? _self.movements : movements // ignore: cast_nullable_to_non_nullable
as List<Movement>,
  ));
}
/// Create a copy of MovementSummaryResponse
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$MovementSummaryCopyWith<$Res> get summary {
  
  return $MovementSummaryCopyWith<$Res>(_self.summary, (value) {
    return _then(_self.copyWith(summary: value));
  });
}
}


/// Adds pattern-matching-related methods to [MovementSummaryResponse].
extension MovementSummaryResponsePatterns on MovementSummaryResponse {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MovementSummaryResponse value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MovementSummaryResponse() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MovementSummaryResponse value)  $default,){
final _that = this;
switch (_that) {
case _MovementSummaryResponse():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MovementSummaryResponse value)?  $default,){
final _that = this;
switch (_that) {
case _MovementSummaryResponse() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'month')  int month, @JsonKey(name: 'year')  int year, @JsonKey(name: 'summary')  MovementSummary summary, @JsonKey(name: 'movements')  List<Movement> movements)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MovementSummaryResponse() when $default != null:
return $default(_that.month,_that.year,_that.summary,_that.movements);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'month')  int month, @JsonKey(name: 'year')  int year, @JsonKey(name: 'summary')  MovementSummary summary, @JsonKey(name: 'movements')  List<Movement> movements)  $default,) {final _that = this;
switch (_that) {
case _MovementSummaryResponse():
return $default(_that.month,_that.year,_that.summary,_that.movements);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'month')  int month, @JsonKey(name: 'year')  int year, @JsonKey(name: 'summary')  MovementSummary summary, @JsonKey(name: 'movements')  List<Movement> movements)?  $default,) {final _that = this;
switch (_that) {
case _MovementSummaryResponse() when $default != null:
return $default(_that.month,_that.year,_that.summary,_that.movements);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MovementSummaryResponse implements MovementSummaryResponse {
  const _MovementSummaryResponse({@JsonKey(name: 'month') required this.month, @JsonKey(name: 'year') required this.year, @JsonKey(name: 'summary') required this.summary, @JsonKey(name: 'movements') required final  List<Movement> movements}): _movements = movements;
  factory _MovementSummaryResponse.fromJson(Map<String, dynamic> json) => _$MovementSummaryResponseFromJson(json);

@override@JsonKey(name: 'month') final  int month;
@override@JsonKey(name: 'year') final  int year;
@override@JsonKey(name: 'summary') final  MovementSummary summary;
 final  List<Movement> _movements;
@override@JsonKey(name: 'movements') List<Movement> get movements {
  if (_movements is EqualUnmodifiableListView) return _movements;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_movements);
}


/// Create a copy of MovementSummaryResponse
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MovementSummaryResponseCopyWith<_MovementSummaryResponse> get copyWith => __$MovementSummaryResponseCopyWithImpl<_MovementSummaryResponse>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MovementSummaryResponseToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MovementSummaryResponse&&(identical(other.month, month) || other.month == month)&&(identical(other.year, year) || other.year == year)&&(identical(other.summary, summary) || other.summary == summary)&&const DeepCollectionEquality().equals(other._movements, _movements));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,month,year,summary,const DeepCollectionEquality().hash(_movements));

@override
String toString() {
  return 'MovementSummaryResponse(month: $month, year: $year, summary: $summary, movements: $movements)';
}


}

/// @nodoc
abstract mixin class _$MovementSummaryResponseCopyWith<$Res> implements $MovementSummaryResponseCopyWith<$Res> {
  factory _$MovementSummaryResponseCopyWith(_MovementSummaryResponse value, $Res Function(_MovementSummaryResponse) _then) = __$MovementSummaryResponseCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'month') int month,@JsonKey(name: 'year') int year,@JsonKey(name: 'summary') MovementSummary summary,@JsonKey(name: 'movements') List<Movement> movements
});


@override $MovementSummaryCopyWith<$Res> get summary;

}
/// @nodoc
class __$MovementSummaryResponseCopyWithImpl<$Res>
    implements _$MovementSummaryResponseCopyWith<$Res> {
  __$MovementSummaryResponseCopyWithImpl(this._self, this._then);

  final _MovementSummaryResponse _self;
  final $Res Function(_MovementSummaryResponse) _then;

/// Create a copy of MovementSummaryResponse
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? month = null,Object? year = null,Object? summary = null,Object? movements = null,}) {
  return _then(_MovementSummaryResponse(
month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as int,year: null == year ? _self.year : year // ignore: cast_nullable_to_non_nullable
as int,summary: null == summary ? _self.summary : summary // ignore: cast_nullable_to_non_nullable
as MovementSummary,movements: null == movements ? _self._movements : movements // ignore: cast_nullable_to_non_nullable
as List<Movement>,
  ));
}

/// Create a copy of MovementSummaryResponse
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$MovementSummaryCopyWith<$Res> get summary {
  
  return $MovementSummaryCopyWith<$Res>(_self.summary, (value) {
    return _then(_self.copyWith(summary: value));
  });
}
}

// dart format on

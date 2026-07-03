// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'cashflow_report.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CashflowReport {

@JsonKey(name: 'Month') int get month;@JsonKey(name: 'Year') int get year;@JsonKey(name: 'Income') double get income;@JsonKey(name: 'Expense') double get expense;@JsonKey(name: 'Net') double get net;
/// Create a copy of CashflowReport
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CashflowReportCopyWith<CashflowReport> get copyWith => _$CashflowReportCopyWithImpl<CashflowReport>(this as CashflowReport, _$identity);

  /// Serializes this CashflowReport to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CashflowReport&&(identical(other.month, month) || other.month == month)&&(identical(other.year, year) || other.year == year)&&(identical(other.income, income) || other.income == income)&&(identical(other.expense, expense) || other.expense == expense)&&(identical(other.net, net) || other.net == net));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,month,year,income,expense,net);

@override
String toString() {
  return 'CashflowReport(month: $month, year: $year, income: $income, expense: $expense, net: $net)';
}


}

/// @nodoc
abstract mixin class $CashflowReportCopyWith<$Res>  {
  factory $CashflowReportCopyWith(CashflowReport value, $Res Function(CashflowReport) _then) = _$CashflowReportCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'Month') int month,@JsonKey(name: 'Year') int year,@JsonKey(name: 'Income') double income,@JsonKey(name: 'Expense') double expense,@JsonKey(name: 'Net') double net
});




}
/// @nodoc
class _$CashflowReportCopyWithImpl<$Res>
    implements $CashflowReportCopyWith<$Res> {
  _$CashflowReportCopyWithImpl(this._self, this._then);

  final CashflowReport _self;
  final $Res Function(CashflowReport) _then;

/// Create a copy of CashflowReport
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? month = null,Object? year = null,Object? income = null,Object? expense = null,Object? net = null,}) {
  return _then(_self.copyWith(
month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as int,year: null == year ? _self.year : year // ignore: cast_nullable_to_non_nullable
as int,income: null == income ? _self.income : income // ignore: cast_nullable_to_non_nullable
as double,expense: null == expense ? _self.expense : expense // ignore: cast_nullable_to_non_nullable
as double,net: null == net ? _self.net : net // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [CashflowReport].
extension CashflowReportPatterns on CashflowReport {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CashflowReport value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CashflowReport() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CashflowReport value)  $default,){
final _that = this;
switch (_that) {
case _CashflowReport():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CashflowReport value)?  $default,){
final _that = this;
switch (_that) {
case _CashflowReport() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'Month')  int month, @JsonKey(name: 'Year')  int year, @JsonKey(name: 'Income')  double income, @JsonKey(name: 'Expense')  double expense, @JsonKey(name: 'Net')  double net)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CashflowReport() when $default != null:
return $default(_that.month,_that.year,_that.income,_that.expense,_that.net);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'Month')  int month, @JsonKey(name: 'Year')  int year, @JsonKey(name: 'Income')  double income, @JsonKey(name: 'Expense')  double expense, @JsonKey(name: 'Net')  double net)  $default,) {final _that = this;
switch (_that) {
case _CashflowReport():
return $default(_that.month,_that.year,_that.income,_that.expense,_that.net);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'Month')  int month, @JsonKey(name: 'Year')  int year, @JsonKey(name: 'Income')  double income, @JsonKey(name: 'Expense')  double expense, @JsonKey(name: 'Net')  double net)?  $default,) {final _that = this;
switch (_that) {
case _CashflowReport() when $default != null:
return $default(_that.month,_that.year,_that.income,_that.expense,_that.net);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CashflowReport implements CashflowReport {
  const _CashflowReport({@JsonKey(name: 'Month') required this.month, @JsonKey(name: 'Year') required this.year, @JsonKey(name: 'Income') required this.income, @JsonKey(name: 'Expense') required this.expense, @JsonKey(name: 'Net') required this.net});
  factory _CashflowReport.fromJson(Map<String, dynamic> json) => _$CashflowReportFromJson(json);

@override@JsonKey(name: 'Month') final  int month;
@override@JsonKey(name: 'Year') final  int year;
@override@JsonKey(name: 'Income') final  double income;
@override@JsonKey(name: 'Expense') final  double expense;
@override@JsonKey(name: 'Net') final  double net;

/// Create a copy of CashflowReport
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CashflowReportCopyWith<_CashflowReport> get copyWith => __$CashflowReportCopyWithImpl<_CashflowReport>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CashflowReportToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CashflowReport&&(identical(other.month, month) || other.month == month)&&(identical(other.year, year) || other.year == year)&&(identical(other.income, income) || other.income == income)&&(identical(other.expense, expense) || other.expense == expense)&&(identical(other.net, net) || other.net == net));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,month,year,income,expense,net);

@override
String toString() {
  return 'CashflowReport(month: $month, year: $year, income: $income, expense: $expense, net: $net)';
}


}

/// @nodoc
abstract mixin class _$CashflowReportCopyWith<$Res> implements $CashflowReportCopyWith<$Res> {
  factory _$CashflowReportCopyWith(_CashflowReport value, $Res Function(_CashflowReport) _then) = __$CashflowReportCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'Month') int month,@JsonKey(name: 'Year') int year,@JsonKey(name: 'Income') double income,@JsonKey(name: 'Expense') double expense,@JsonKey(name: 'Net') double net
});




}
/// @nodoc
class __$CashflowReportCopyWithImpl<$Res>
    implements _$CashflowReportCopyWith<$Res> {
  __$CashflowReportCopyWithImpl(this._self, this._then);

  final _CashflowReport _self;
  final $Res Function(_CashflowReport) _then;

/// Create a copy of CashflowReport
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? month = null,Object? year = null,Object? income = null,Object? expense = null,Object? net = null,}) {
  return _then(_CashflowReport(
month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as int,year: null == year ? _self.year : year // ignore: cast_nullable_to_non_nullable
as int,income: null == income ? _self.income : income // ignore: cast_nullable_to_non_nullable
as double,expense: null == expense ? _self.expense : expense // ignore: cast_nullable_to_non_nullable
as double,net: null == net ? _self.net : net // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}

// dart format on

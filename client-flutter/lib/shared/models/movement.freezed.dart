// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'movement.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Movement {

@JsonKey(name: '_id') String? get id;@JsonKey(name: 'Amount') double get amount;// Optional: transfer-generated movements have no Category (see backend
// AccountService.transfer).
@JsonKey(name: 'Category') String? get category;@DateOnlyConverter()@JsonKey(name: 'Date') DateTime get date;@JsonKey(name: 'Type') MovementType get type;@JsonKey(name: 'Account') String get account;@JsonKey(name: 'TransferId') String? get transferId;@JsonKey(name: 'Card') String? get card;@JsonKey(name: 'Description') String? get description;
/// Create a copy of Movement
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MovementCopyWith<Movement> get copyWith => _$MovementCopyWithImpl<Movement>(this as Movement, _$identity);

  /// Serializes this Movement to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Movement&&(identical(other.id, id) || other.id == id)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.category, category) || other.category == category)&&(identical(other.date, date) || other.date == date)&&(identical(other.type, type) || other.type == type)&&(identical(other.account, account) || other.account == account)&&(identical(other.transferId, transferId) || other.transferId == transferId)&&(identical(other.card, card) || other.card == card)&&(identical(other.description, description) || other.description == description));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,amount,category,date,type,account,transferId,card,description);

@override
String toString() {
  return 'Movement(id: $id, amount: $amount, category: $category, date: $date, type: $type, account: $account, transferId: $transferId, card: $card, description: $description)';
}


}

/// @nodoc
abstract mixin class $MovementCopyWith<$Res>  {
  factory $MovementCopyWith(Movement value, $Res Function(Movement) _then) = _$MovementCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id') String? id,@JsonKey(name: 'Amount') double amount,@JsonKey(name: 'Category') String? category,@DateOnlyConverter()@JsonKey(name: 'Date') DateTime date,@JsonKey(name: 'Type') MovementType type,@JsonKey(name: 'Account') String account,@JsonKey(name: 'TransferId') String? transferId,@JsonKey(name: 'Card') String? card,@JsonKey(name: 'Description') String? description
});




}
/// @nodoc
class _$MovementCopyWithImpl<$Res>
    implements $MovementCopyWith<$Res> {
  _$MovementCopyWithImpl(this._self, this._then);

  final Movement _self;
  final $Res Function(Movement) _then;

/// Create a copy of Movement
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? amount = null,Object? category = freezed,Object? date = null,Object? type = null,Object? account = null,Object? transferId = freezed,Object? card = freezed,Object? description = freezed,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String?,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as DateTime,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as MovementType,account: null == account ? _self.account : account // ignore: cast_nullable_to_non_nullable
as String,transferId: freezed == transferId ? _self.transferId : transferId // ignore: cast_nullable_to_non_nullable
as String?,card: freezed == card ? _self.card : card // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [Movement].
extension MovementPatterns on Movement {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Movement value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Movement() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Movement value)  $default,){
final _that = this;
switch (_that) {
case _Movement():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Movement value)?  $default,){
final _that = this;
switch (_that) {
case _Movement() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id, @JsonKey(name: 'Amount')  double amount, @JsonKey(name: 'Category')  String? category, @DateOnlyConverter()@JsonKey(name: 'Date')  DateTime date, @JsonKey(name: 'Type')  MovementType type, @JsonKey(name: 'Account')  String account, @JsonKey(name: 'TransferId')  String? transferId, @JsonKey(name: 'Card')  String? card, @JsonKey(name: 'Description')  String? description)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Movement() when $default != null:
return $default(_that.id,_that.amount,_that.category,_that.date,_that.type,_that.account,_that.transferId,_that.card,_that.description);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id, @JsonKey(name: 'Amount')  double amount, @JsonKey(name: 'Category')  String? category, @DateOnlyConverter()@JsonKey(name: 'Date')  DateTime date, @JsonKey(name: 'Type')  MovementType type, @JsonKey(name: 'Account')  String account, @JsonKey(name: 'TransferId')  String? transferId, @JsonKey(name: 'Card')  String? card, @JsonKey(name: 'Description')  String? description)  $default,) {final _that = this;
switch (_that) {
case _Movement():
return $default(_that.id,_that.amount,_that.category,_that.date,_that.type,_that.account,_that.transferId,_that.card,_that.description);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id')  String? id, @JsonKey(name: 'Amount')  double amount, @JsonKey(name: 'Category')  String? category, @DateOnlyConverter()@JsonKey(name: 'Date')  DateTime date, @JsonKey(name: 'Type')  MovementType type, @JsonKey(name: 'Account')  String account, @JsonKey(name: 'TransferId')  String? transferId, @JsonKey(name: 'Card')  String? card, @JsonKey(name: 'Description')  String? description)?  $default,) {final _that = this;
switch (_that) {
case _Movement() when $default != null:
return $default(_that.id,_that.amount,_that.category,_that.date,_that.type,_that.account,_that.transferId,_that.card,_that.description);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Movement implements Movement {
  const _Movement({@JsonKey(name: '_id') this.id, @JsonKey(name: 'Amount') required this.amount, @JsonKey(name: 'Category') this.category, @DateOnlyConverter()@JsonKey(name: 'Date') required this.date, @JsonKey(name: 'Type') required this.type, @JsonKey(name: 'Account') required this.account, @JsonKey(name: 'TransferId') this.transferId, @JsonKey(name: 'Card') this.card, @JsonKey(name: 'Description') this.description});
  factory _Movement.fromJson(Map<String, dynamic> json) => _$MovementFromJson(json);

@override@JsonKey(name: '_id') final  String? id;
@override@JsonKey(name: 'Amount') final  double amount;
// Optional: transfer-generated movements have no Category (see backend
// AccountService.transfer).
@override@JsonKey(name: 'Category') final  String? category;
@override@DateOnlyConverter()@JsonKey(name: 'Date') final  DateTime date;
@override@JsonKey(name: 'Type') final  MovementType type;
@override@JsonKey(name: 'Account') final  String account;
@override@JsonKey(name: 'TransferId') final  String? transferId;
@override@JsonKey(name: 'Card') final  String? card;
@override@JsonKey(name: 'Description') final  String? description;

/// Create a copy of Movement
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MovementCopyWith<_Movement> get copyWith => __$MovementCopyWithImpl<_Movement>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MovementToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Movement&&(identical(other.id, id) || other.id == id)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.category, category) || other.category == category)&&(identical(other.date, date) || other.date == date)&&(identical(other.type, type) || other.type == type)&&(identical(other.account, account) || other.account == account)&&(identical(other.transferId, transferId) || other.transferId == transferId)&&(identical(other.card, card) || other.card == card)&&(identical(other.description, description) || other.description == description));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,amount,category,date,type,account,transferId,card,description);

@override
String toString() {
  return 'Movement(id: $id, amount: $amount, category: $category, date: $date, type: $type, account: $account, transferId: $transferId, card: $card, description: $description)';
}


}

/// @nodoc
abstract mixin class _$MovementCopyWith<$Res> implements $MovementCopyWith<$Res> {
  factory _$MovementCopyWith(_Movement value, $Res Function(_Movement) _then) = __$MovementCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id') String? id,@JsonKey(name: 'Amount') double amount,@JsonKey(name: 'Category') String? category,@DateOnlyConverter()@JsonKey(name: 'Date') DateTime date,@JsonKey(name: 'Type') MovementType type,@JsonKey(name: 'Account') String account,@JsonKey(name: 'TransferId') String? transferId,@JsonKey(name: 'Card') String? card,@JsonKey(name: 'Description') String? description
});




}
/// @nodoc
class __$MovementCopyWithImpl<$Res>
    implements _$MovementCopyWith<$Res> {
  __$MovementCopyWithImpl(this._self, this._then);

  final _Movement _self;
  final $Res Function(_Movement) _then;

/// Create a copy of Movement
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? amount = null,Object? category = freezed,Object? date = null,Object? type = null,Object? account = null,Object? transferId = freezed,Object? card = freezed,Object? description = freezed,}) {
  return _then(_Movement(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String?,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as DateTime,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as MovementType,account: null == account ? _self.account : account // ignore: cast_nullable_to_non_nullable
as String,transferId: freezed == transferId ? _self.transferId : transferId // ignore: cast_nullable_to_non_nullable
as String?,card: freezed == card ? _self.card : card // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on

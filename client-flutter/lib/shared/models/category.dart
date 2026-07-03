import 'package:freezed_annotation/freezed_annotation.dart';

part 'category.freezed.dart';
part 'category.g.dart';

enum CategoryType {
  @JsonValue('variable')
  variable,
  @JsonValue('fijo')
  fijo,
}

@freezed
abstract class Category with _$Category {
  const factory Category({
    @JsonKey(name: '_id') String? id,
    @JsonKey(name: 'Description') required String description,
    @JsonKey(name: 'Name') required String name,
    @JsonKey(name: 'Tag') required String tag,
    @JsonKey(name: 'Type') required CategoryType type,
    @JsonKey(name: 'Icon') String? icon,
  }) = _Category;

  factory Category.fromJson(Map<String, dynamic> json) =>
      _$CategoryFromJson(json);
}

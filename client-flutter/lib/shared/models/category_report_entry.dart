import 'package:freezed_annotation/freezed_annotation.dart';

import 'category.dart';

part 'category_report_entry.freezed.dart';
part 'category_report_entry.g.dart';

@freezed
abstract class CategoryReportEntry with _$CategoryReportEntry {
  const factory CategoryReportEntry({
    @JsonKey(name: 'Category') required Category category,
    @JsonKey(name: 'Total') required double total,
  }) = _CategoryReportEntry;

  factory CategoryReportEntry.fromJson(Map<String, dynamic> json) =>
      _$CategoryReportEntryFromJson(json);
}

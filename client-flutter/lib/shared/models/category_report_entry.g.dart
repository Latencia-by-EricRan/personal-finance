// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_report_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CategoryReportEntry _$CategoryReportEntryFromJson(Map<String, dynamic> json) =>
    _CategoryReportEntry(
      category: Category.fromJson(json['Category'] as Map<String, dynamic>),
      total: (json['Total'] as num).toDouble(),
    );

Map<String, dynamic> _$CategoryReportEntryToJson(
  _CategoryReportEntry instance,
) =>
    <String, dynamic>{'Category': instance.category, 'Total': instance.total};

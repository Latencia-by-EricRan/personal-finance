// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'movement_summary_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_MovementSummaryResponse _$MovementSummaryResponseFromJson(
  Map<String, dynamic> json,
) => _MovementSummaryResponse(
  month: (json['month'] as num).toInt(),
  year: (json['year'] as num).toInt(),
  summary: MovementSummary.fromJson(json['summary'] as Map<String, dynamic>),
  movements: (json['movements'] as List<dynamic>)
      .map((e) => Movement.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$MovementSummaryResponseToJson(
  _MovementSummaryResponse instance,
) => <String, dynamic>{
  'month': instance.month,
  'year': instance.year,
  'summary': instance.summary,
  'movements': instance.movements,
};

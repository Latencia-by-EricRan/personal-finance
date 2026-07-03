import 'package:json_annotation/json_annotation.dart';

/// Drops time-of-day on purpose: the backend's `Date` fields are date-only
/// `YYYY-MM-DD` strings on the wire, so there is no time component to
/// preserve.
class DateOnlyConverter implements JsonConverter<DateTime, String> {
  const DateOnlyConverter();

  @override
  DateTime fromJson(String json) => DateTime.parse(json);

  @override
  String toJson(DateTime date) {
    final year = date.year.toString().padLeft(4, '0');
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }
}

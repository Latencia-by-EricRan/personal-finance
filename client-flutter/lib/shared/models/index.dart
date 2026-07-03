// Contract note — `toJson()` on models with nested non-primitive fields
// (e.g. `MovementSummaryResponse`, `BudgetStatus`, `CategoryReportEntry`,
// `Movement`): these intentionally skip
// `@JsonSerializable(explicitToJson: true)`, so their generated `toJson()`
// returns a Map whose nested values are raw model instances, not nested
// JSON maps. That output only becomes valid JSON once passed through
// `jsonEncode`, which recursively calls `.toJson()` on any nested object via
// Dart's `_defaultToEncodable` — which is also the real path Dio uses when
// sending a body. Do not treat a bare `toJson()` call on these models as a
// literal `Map` of primitives; always round-trip through `jsonEncode` (see
// `test/shared/models/models_test.dart`'s `_encodedThenDecoded` helper).

export 'account.dart';
export 'api_error_body.dart';
export 'auth_token_response.dart';
export 'budget.dart';
export 'budget_status.dart';
export 'cashflow_report.dart';
export 'category.dart';
export 'category_report_entry.dart';
export 'date_only_converter.dart';
export 'monthly_report_entry.dart';
export 'movement.dart';
export 'movement_summary.dart';
export 'movement_summary_response.dart';
export 'movement_write_request.dart';
export 'recurring.dart';

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/shared/models/index.dart';

// json_serializable's default (non-explicitToJson) output nests raw model
// instances rather than their toJson() maps; that's fine in practice because
// jsonEncode calls toJson() on any nested object automatically, which is how
// Dio actually sends these bodies. Round-tripping through jsonEncode/jsonDecode
// here exercises that same real path instead of comparing raw toJson() maps.
Object? _encodedThenDecoded(Object? value) => jsonDecode(jsonEncode(value));

void main() {
  test('Account round-trips through PascalCase JSON keys', () {
    final json = {
      '_id': 'acc-1',
      'Name': 'Cuenta Sueldo',
      'Type': 'banco',
      'Currency': 'ARS',
      'Icon': 'bank',
      'Archived': false,
    };

    final account = Account.fromJson(json);

    expect(account.id, 'acc-1');
    expect(account.name, 'Cuenta Sueldo');
    expect(account.type, AccountType.banco);
    expect(account.currency, 'ARS');
    expect(account.archived, isFalse);
    expect(account.toJson(), json);
  });

  test('Category round-trips through PascalCase JSON keys', () {
    final json = {
      '_id': 'cat-1',
      'Description': 'Alquiler mensual',
      'Name': 'Alquiler',
      'Tag': 'housing',
      'Type': 'fijo',
      'Icon': 'home',
    };

    final category = Category.fromJson(json);

    expect(category.type, CategoryType.fijo);
    expect(category.toJson(), json);
  });

  test('Movement round-trips and serializes Date as YYYY-MM-DD', () {
    final json = {
      '_id': 'mov-1',
      'Amount': 1500.5,
      'Category': 'cat-1',
      'Date': '2026-07-03',
      'Type': 'egreso',
      'Account': 'acc-1',
      'TransferId': null,
      'Card': null,
      'Description': 'Supermercado',
    };

    final movement = Movement.fromJson(json);

    expect(movement.type, MovementType.egreso);
    expect(movement.date, DateTime(2026, 7, 3));
    expect(movement.toJson(), json);
  });

  test('Movement tolerates a missing Category (transfer-generated)', () {
    final json = {
      '_id': 'mov-2',
      'Amount': 200,
      'Date': '2026-07-01',
      'Type': 'ingreso',
      'Account': 'acc-2',
    };

    final movement = Movement.fromJson(json);

    expect(movement.category, isNull);
  });

  test('Budget round-trips through PascalCase JSON keys', () {
    final json = {
      '_id': 'bud-1',
      'Category': 'cat-1',
      'Month': 7,
      'Year': 2026,
      'Limit': 50000.0,
    };

    final budget = Budget.fromJson(json);

    expect(budget.month, 7);
    expect(budget.toJson(), json);
  });

  test('Recurring round-trips through PascalCase JSON keys', () {
    final json = {
      '_id': 'rec-1',
      'Type': 'egreso',
      'Amount': 9999.0,
      'Category': 'cat-1',
      'Account': 'acc-1',
      'Description': 'Netflix',
      'Card': null,
      'Frequency': 'mensual',
      'DayOfMonth': 5,
      'Active': true,
      'LastRunYearMonth': '2026-06',
    };

    final recurring = Recurring.fromJson(json);

    expect(recurring.frequency, RecurringFrequency.mensual);
    expect(recurring.type, MovementType.egreso);
    expect(recurring.toJson(), json);
  });

  test('MovementSummary round-trips through lowercase JSON keys', () {
    final json = {
      'items': 12,
      'amount': {'income': 200000.0, 'expense': 85000.0},
    };

    final summary = MovementSummary.fromJson(json);

    expect(summary.items, 12);
    expect(summary.amount.income, 200000.0);
    expect(_encodedThenDecoded(summary.toJson()), json);
  });

  test('MovementSummaryResponse round-trips nested movements', () {
    final json = {
      'month': 7,
      'year': 2026,
      'summary': {
        'items': 1,
        'amount': {'income': 0.0, 'expense': 1500.5},
      },
      'movements': [
        {
          '_id': 'mov-1',
          'Amount': 1500.5,
          'Category': 'cat-1',
          'Date': '2026-07-03',
          'Type': 'egreso',
          'Account': 'acc-1',
          'TransferId': null,
          'Card': null,
          'Description': 'Supermercado',
        },
      ],
    };

    final response = MovementSummaryResponse.fromJson(json);

    expect(response.movements, hasLength(1));
    expect(_encodedThenDecoded(response.toJson()), json);
  });

  test('BudgetStatus round-trips with a nested populated Category', () {
    final json = {
      'Category': {
        '_id': 'cat-1',
        'Description': 'Alquiler mensual',
        'Name': 'Alquiler',
        'Tag': 'housing',
        'Type': 'fijo',
        'Icon': 'home',
      },
      'Limit': 50000.0,
      'Spent': 35000.0,
      'Remaining': 15000.0,
      'Percent': 70.0,
    };

    final status = BudgetStatus.fromJson(json);

    expect(status.category.name, 'Alquiler');
    expect(status.percent, 70.0);
    expect(_encodedThenDecoded(status.toJson()), json);
  });

  test('MonthlyReportEntry round-trips', () {
    final json = {'Month': 7, 'Income': 200000.0, 'Expense': 85000.0, 'Net': 115000.0};

    final entry = MonthlyReportEntry.fromJson(json);

    expect(entry.net, 115000.0);
    expect(entry.toJson(), json);
  });

  test('CashflowReport round-trips', () {
    final json = {
      'Month': 7,
      'Year': 2026,
      'Income': 200000.0,
      'Expense': 85000.0,
      'Net': 115000.0,
    };

    final report = CashflowReport.fromJson(json);

    expect(report.year, 2026);
    expect(report.toJson(), json);
  });

  test('CategoryReportEntry round-trips with a nested Category', () {
    final json = {
      'Category': {
        '_id': 'cat-1',
        'Description': 'Alquiler mensual',
        'Name': 'Alquiler',
        'Tag': 'housing',
        'Type': 'fijo',
        'Icon': 'home',
      },
      'Total': 35000.0,
    };

    final entry = CategoryReportEntry.fromJson(json);

    expect(entry.category.name, 'Alquiler');
    expect(_encodedThenDecoded(entry.toJson()), json);
  });

  test('AuthTokenResponse round-trips', () {
    final json = {'token': 'jwt-token', 'expiresIn': '1d'};

    final response = AuthTokenResponse.fromJson(json);

    expect(response.token, 'jwt-token');
    expect(response.toJson(), json);
  });

  test('ApiErrorBody round-trips with errors', () {
    final json = {
      'message': 'Validation failed',
      'errors': ['Email is required'],
    };

    final body = ApiErrorBody.fromJson(json);

    expect(body.errors, ['Email is required']);
    expect(body.toJson(), json);
  });

  test('ApiErrorBody round-trips without errors', () {
    final json = {'message': 'Account not found', 'errors': null};

    final body = ApiErrorBody.fromJson(json);

    expect(body.errors, isNull);
    expect(body.toJson(), json);
  });
}

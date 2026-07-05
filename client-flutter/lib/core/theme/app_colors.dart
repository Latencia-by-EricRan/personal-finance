import 'package:flutter/material.dart';

/// Design tokens for the Norte design system (Nubank-derived, dark-only).
/// Every value here was validated for contrast/CVD separation before being
/// approved — see the design system artifact for the checks.
abstract final class AppColors {
  AppColors._();

  static const ink = Color(0xFF0D0A14);
  static const surface = Color(0xFF1B1626);
  static const surfaceHigh = Color(0xFF241D33);
  static const surfaceHighest = Color(0xFF2E2440);

  static const nuPurple = Color(0xFF820AD1);
  static const nuViolet = Color(0xFFA63FEA);

  static const income = Color(0xFF00D9A6);
  static const expense = Color(0xFFFF5577);
  static const warning = Color(0xFFFFB020);

  static const textPrimary = Color(0xFFF6F3FB);
  static const textSecondary = Color(0xFFB7ADCB);
  static const textMuted = Color(0xFF7C7296);

  /// Fixed-order categorical palette for user-defined categories. Categories
  /// come from the backend as free-form records (Name/Tag/Icon), not a fixed
  /// enum, so colors are assigned by slot index (id/name hash mod length),
  /// never hardcoded to a category name.
  static const categoryPalette = <Color>[
    Color(0xFF5B67F0), // indigo
    Color(0xFF0E8FA8), // teal
    Color(0xFF9C8A1E), // olive
    Color(0xFFE0468B), // magenta
    Color(0xFFB85F35), // terracotta
  ];

  /// Single source of truth for slot assignment — every screen that colors a
  /// category/account by identity must call this, not re-derive the formula,
  /// so the same entity never shows a different color on different screens.
  static Color forKey(String key) =>
      categoryPalette[key.hashCode.abs() % categoryPalette.length];
}

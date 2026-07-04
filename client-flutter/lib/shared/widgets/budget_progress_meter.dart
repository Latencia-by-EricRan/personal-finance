import 'package:flutter/material.dart';

import '../../core/theme/index.dart';

/// Fill color follows the three validated Norte design-system tiers for a
/// budget meter: < 70% spent -> income/mint (good), 70-99% -> warning/amber,
/// >= 100% -> expense/coral (over budget). These exact thresholds/colors
/// were a deliberate, already-approved design decision — do not invent
/// different ones.
class BudgetProgressMeter extends StatelessWidget {
  const BudgetProgressMeter({super.key, required this.percent});

  final double percent;

  /// Single source of truth for the three-tier severity color, shared with
  /// any other widget (e.g. a percent label) that must always agree with
  /// this meter's fill — do not re-implement this threshold elsewhere.
  static Color colorForPercent(double percent) {
    if (percent >= 100) return AppColors.expense;
    if (percent >= 70) return AppColors.warning;
    return AppColors.income;
  }

  Color get _fillColor => colorForPercent(percent);

  @override
  Widget build(BuildContext context) {
    // Visual fill is clamped at 100% width so an over-budget category never
    // visually overflows the bar container; the true percent (e.g. "140%")
    // is still shown separately by the consuming screen via its own label.
    final clampedFraction = (percent / 100).clamp(0.0, 1.0);

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: SizedBox(
        height: 8,
        child: Stack(
          children: [
            Container(color: AppColors.surfaceHighest),
            Align(
              alignment: Alignment.centerLeft,
              child: FractionallySizedBox(
                key: const Key('budget-progress-meter-fill'),
                widthFactor: clampedFraction,
                child: Container(color: _fillColor),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

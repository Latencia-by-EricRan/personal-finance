import 'package:flutter/material.dart';

import '../../core/format/index.dart';
import '../../core/theme/index.dart';
import '../models/index.dart';

class BalanceCard extends StatelessWidget {
  const BalanceCard({super.key, required this.amount});

  final MovementAmountSummary amount;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final net = amount.income - amount.expense;

    return Container(
      key: const Key('balance-card'),
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.nuViolet, AppColors.nuPurple],
        ),
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Disponible este mes',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.85),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            AppFormatters.currencyHero(net),
            style: theme.textTheme.headlineLarge?.copyWith(
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          Divider(color: Colors.white.withValues(alpha: 0.24), height: 1),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _AmountColumn(label: 'Ingresos', value: amount.income),
              ),
              Expanded(
                child: _AmountColumn(label: 'Egresos', value: amount.expense),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AmountColumn extends StatelessWidget {
  const _AmountColumn({required this.label, required this.value});

  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelMedium?.copyWith(
            color: Colors.white.withValues(alpha: 0.7),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          AppFormatters.currency(value),
          style: theme.textTheme.labelLarge?.copyWith(
            color: Colors.white,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }
}

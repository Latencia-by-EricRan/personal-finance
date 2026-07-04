import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/format/index.dart';
import '../../core/theme/index.dart';
import '../../features/accounts/data/index.dart';
import '../models/index.dart';

class MovementTile extends ConsumerWidget {
  const MovementTile({super.key, required this.movement, this.onTap});

  final Movement movement;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final category = movement.category;
    final isIncome = movement.type == MovementType.ingreso;
    final color = isIncome ? AppColors.income : AppColors.expense;
    final sign = isIncome ? '+' : '−';

    final accounts = ref.watch(accountsProvider).value;
    final matchingAccounts = accounts?.where(
      (account) => account.id == movement.account,
    );
    final accountName = (matchingAccounts != null && matchingAccounts.isNotEmpty)
        ? matchingAccounts.first.name
        : null;

    final hasDescription = (movement.description ?? '').isNotEmpty;
    final title = hasDescription
        ? movement.description!
        : (category?.name ?? 'Transferencia');

    final subtitleParts = <String>[
      if (hasDescription && category != null) category.name,
      if (accountName != null) accountName,
    ];

    return ListTile(
      key: Key('movement-tile-${movement.id}'),
      onTap: onTap,
      leading: _CategoryAvatar(category: category),
      title: Text(title, style: theme.textTheme.titleMedium),
      subtitle: subtitleParts.isEmpty
          ? null
          : Text(subtitleParts.join(' · '), style: theme.textTheme.bodySmall),
      trailing: Text(
        '$sign ${AppFormatters.currency(movement.amount)}',
        style: theme.textTheme.labelLarge?.copyWith(
          color: color,
          fontFeatures: const [FontFeature.tabularFigures()],
        ),
      ),
    );
  }
}

class _CategoryAvatar extends StatelessWidget {
  const _CategoryAvatar({required this.category});

  final Category? category;

  @override
  Widget build(BuildContext context) {
    final category = this.category;
    if (category == null) {
      return Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.surfaceHighest,
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: const Icon(Icons.swap_horiz, color: AppColors.textMuted),
      );
    }

    final key = category.id ?? category.tag;
    final color =
        AppColors.categoryPalette[key.hashCode.abs() %
            AppColors.categoryPalette.length];
    final letters = category.name.trim();
    final monogram = (letters.length >= 2
            ? letters.substring(0, 2)
            : letters)
        .toUpperCase();

    return Container(
      width: 44,
      height: 44,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Text(
        monogram,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
    );
  }
}

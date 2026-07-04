import 'package:flutter/material.dart';

class MonthPicker extends StatelessWidget {
  const MonthPicker({
    super.key,
    required this.label,
    required this.onPrevious,
    required this.onNext,
  });

  final String label;
  final VoidCallback onPrevious;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          key: const Key('month-picker-previous'),
          icon: const Icon(Icons.chevron_left),
          onPressed: onPrevious,
        ),
        Text(label, style: theme.textTheme.titleLarge),
        IconButton(
          key: const Key('month-picker-next'),
          icon: const Icon(Icons.chevron_right),
          onPressed: onNext,
        ),
      ],
    );
  }
}

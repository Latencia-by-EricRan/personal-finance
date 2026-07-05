import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../data/index.dart';

class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Categorías'),
        actions: [
          IconButton(
            key: const Key('categories-add-button'),
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/categories/add'),
          ),
        ],
      ),
      body: categoriesAsync.when(
        data: (categories) => categories.isEmpty
            ? const EmptyState(message: 'No hay categorías registradas.')
            : ListView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
                children: [
                  for (final category in categories)
                    _CategoryCard(category: category),
                ],
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => ErrorRetry(
          message: 'No pudimos cargar las categorías. Probá de nuevo.',
          onRetry: () => ref.invalidate(categoriesProvider),
        ),
      ),
    );
  }
}

String categoryTypeLabel(CategoryType type) => switch (type) {
      CategoryType.variable => 'Variable',
      CategoryType.fijo => 'Fijo',
    };

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.category});

  final Category category;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasTag = category.tag.isNotEmpty;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        key: Key('category-card-${category.id}'),
        child: InkWell(
          onTap: () => context.push('/categories/add', extra: category),
          child: ListTile(
            leading: _CategoryAvatar(category: category),
            title: Text(category.name, style: theme.textTheme.titleMedium),
            subtitle: hasTag
                ? Text(category.tag, style: theme.textTheme.bodySmall)
                : null,
            trailing: Text(
              categoryTypeLabel(category.type),
              style: theme.textTheme.labelLarge,
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryAvatar extends StatelessWidget {
  const _CategoryAvatar({required this.category});

  final Category category;

  @override
  Widget build(BuildContext context) {
    final key = category.id ?? category.tag;
    final color = AppColors.forKey(key);
    final letters = category.name.trim();
    final monogram =
        (letters.length >= 2 ? letters.substring(0, 2) : letters).toUpperCase();

    return Container(
      key: Key('category-avatar-${category.id}'),
      width: 44,
      height: 44,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Text(
        monogram,
        style:
            const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
    );
  }
}

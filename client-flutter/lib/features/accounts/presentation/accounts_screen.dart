import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../core/network/index.dart';
import '../../../core/theme/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../data/index.dart';
import 'account_type_label.dart';
import 'providers/index.dart';

class AccountsScreen extends ConsumerStatefulWidget {
  const AccountsScreen({super.key});

  @override
  ConsumerState<AccountsScreen> createState() => _AccountsScreenState();
}

class _AccountsScreenState extends ConsumerState<AccountsScreen> {
  static const _navRoutes = <String>[
    '/',
    '/accounts',
    '/budgets',
    '/recurring',
    '/reports',
  ];

  var _showArchived = false;
  final _restoringIds = <String>{};

  Future<void> _restore(String id) async {
    if (_restoringIds.contains(id)) return;
    setState(() => _restoringIds.add(id));
    try {
      await ref
          .read(accountRepositoryProvider)
          .update(id, archived: false);
      ref.invalidate(accountsProvider);
      ref.invalidate(accountsWithBalanceProvider);
      ref.invalidate(archivedAccountsProvider);
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.message)));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ocurrió un error inesperado. Probá de nuevo.'),
        ),
      );
    } finally {
      if (mounted) setState(() => _restoringIds.remove(id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accountsAsync = ref.watch(accountsWithBalanceProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Cuentas', style: theme.textTheme.headlineSmall),
                  IconButton(
                    key: const Key('accounts-add-button'),
                    icon: const Icon(Icons.add),
                    onPressed: () => context.push('/accounts/add'),
                  ),
                ],
              ),
            ),
            Expanded(
              child: accountsAsync.when(
                data: (accounts) => _AccountsBody(
                  accounts: accounts,
                  showArchived: _showArchived,
                  onToggleArchived: () =>
                      setState(() => _showArchived = !_showArchived),
                  onRestore: _restore,
                  restoringIds: _restoringIds,
                ),
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => ErrorRetry(
                  message: 'No pudimos cargar las cuentas. Probá de nuevo.',
                  onRetry: () {
                    ref.invalidate(accountsProvider);
                    ref.invalidate(accountsWithBalanceProvider);
                  },
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        key: const Key('accounts-transfer-fab'),
        onPressed: () => context.push('/accounts/transfer'),
        child: const Icon(Icons.swap_horiz),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 1,
        onDestinationSelected: (index) {
          if (index == 1) return;
          context.go(_navRoutes[index]);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_rounded),
            label: 'Resumen',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_rounded),
            label: 'Cuentas',
          ),
          NavigationDestination(
            icon: Icon(Icons.pie_chart_rounded),
            label: 'Presupuestos',
          ),
          NavigationDestination(
            icon: Icon(Icons.autorenew_rounded),
            label: 'Recurrentes',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_rounded),
            label: 'Reportes',
          ),
        ],
      ),
    );
  }
}

class _AccountsBody extends ConsumerWidget {
  const _AccountsBody({
    required this.accounts,
    required this.showArchived,
    required this.onToggleArchived,
    required this.onRestore,
    required this.restoringIds,
  });

  final List<AccountWithBalance> accounts;
  final bool showArchived;
  final VoidCallback onToggleArchived;
  final ValueChanged<String> onRestore;
  final Set<String> restoringIds;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final total = accounts.fold<num>(0, (sum, item) => sum + item.balance);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
      children: [
        if (accounts.isEmpty)
          const EmptyState(message: 'No hay cuentas registradas.')
        else ...[
          _TotalNetWorthCard(total: total),
          const SizedBox(height: 20),
          for (final item in accounts) _AccountCard(item: item),
        ],
        const SizedBox(height: 12),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton(
            key: const Key('accounts-show-archived-toggle'),
            onPressed: onToggleArchived,
            child: Text(showArchived ? 'Ocultar archivadas' : 'Ver archivadas'),
          ),
        ),
        if (showArchived)
          _ArchivedAccountsSection(
            onRestore: onRestore,
            restoringIds: restoringIds,
          ),
      ],
    );
  }
}

class _ArchivedAccountsSection extends ConsumerWidget {
  const _ArchivedAccountsSection({
    required this.onRestore,
    required this.restoringIds,
  });

  final ValueChanged<String> onRestore;
  final Set<String> restoringIds;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final archivedAsync = ref.watch(archivedAccountsProvider);

    return archivedAsync.when(
      data: (archived) {
        if (archived.isEmpty) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Text(
              'No hay cuentas archivadas.',
              style: TextStyle(color: AppColors.textMuted),
            ),
          );
        }
        return Opacity(
          opacity: 0.6,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final account in archived)
                ListTile(
                  key: Key('archived-account-${account.id}'),
                  title: Text(account.name),
                  subtitle: Text(accountTypeLabel(account.type)),
                  trailing: TextButton(
                    key: Key('archived-restore-${account.id}'),
                    onPressed: restoringIds.contains(account.id)
                        ? null
                        : () => onRestore(account.id!),
                    child: const Text('Restaurar'),
                  ),
                ),
            ],
          ),
        );
      },
      loading: () => const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (error, stackTrace) => const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Text(
          'No pudimos cargar las cuentas archivadas.',
          style: TextStyle(color: AppColors.textMuted),
        ),
      ),
    );
  }
}

class _TotalNetWorthCard extends StatelessWidget {
  const _TotalNetWorthCard({required this.total});

  final num total;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = total < 0 ? AppColors.expense : AppColors.textPrimary;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Patrimonio total', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 8),
            Text(
              key: const Key('patrimonio-total'),
              AppFormatters.currency(total),
              style: theme.textTheme.headlineSmall?.copyWith(
                color: color,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AccountCard extends StatelessWidget {
  const _AccountCard({required this.item});

  final AccountWithBalance item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final account = item.account;
    final balance = item.balance;
    final color = balance < 0 ? AppColors.expense : AppColors.textPrimary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        key: Key('account-card-${account.id}'),
        child: InkWell(
          onTap: () => context.push('/accounts/add', extra: account),
          child: ListTile(
            leading: _AccountAvatar(account: account),
            title: Text(account.name, style: theme.textTheme.titleMedium),
            subtitle: Text(
              accountTypeLabel(account.type),
              style: theme.textTheme.bodySmall,
            ),
            trailing: Text(
              key: Key('account-balance-${account.id}'),
              AppFormatters.currency(balance),
              style: theme.textTheme.labelLarge?.copyWith(
                color: color,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AccountAvatar extends StatelessWidget {
  const _AccountAvatar({required this.account});

  final Account account;

  @override
  Widget build(BuildContext context) {
    final key = account.id ?? account.name;
    final color =
        AppColors.categoryPalette[key.hashCode.abs() %
            AppColors.categoryPalette.length];
    final letters = account.name.trim();
    final monogram = (letters.length >= 2 ? letters.substring(0, 2) : letters)
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
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

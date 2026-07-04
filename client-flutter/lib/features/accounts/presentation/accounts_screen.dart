import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../core/theme/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../data/index.dart';
import 'providers/index.dart';

String _accountTypeLabel(AccountType type) => switch (type) {
  AccountType.efectivo => 'Efectivo',
  AccountType.banco => 'Cuenta bancaria',
  AccountType.tarjeta => 'Tarjeta de crédito',
};

class AccountsScreen extends ConsumerWidget {
  const AccountsScreen({super.key});

  static const _navRoutes = <String>[
    '/',
    '/accounts',
    '/budgets',
    '/recurring',
    '/reports',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final accountsAsync = ref.watch(accountsWithBalanceProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Cuentas', style: theme.textTheme.headlineSmall),
              ),
            ),
            Expanded(
              child: accountsAsync.when(
                data: (accounts) => _AccountsBody(accounts: accounts),
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

class _AccountsBody extends StatelessWidget {
  const _AccountsBody({required this.accounts});

  final List<AccountWithBalance> accounts;

  @override
  Widget build(BuildContext context) {
    if (accounts.isEmpty) {
      return const EmptyState(message: 'No hay cuentas registradas.');
    }

    final total = accounts.fold<num>(0, (sum, item) => sum + item.balance);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
      children: [
        _TotalNetWorthCard(total: total),
        const SizedBox(height: 20),
        for (final item in accounts) _AccountCard(item: item),
      ],
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
        child: ListTile(
          leading: _AccountAvatar(account: account),
          title: Text(account.name, style: theme.textTheme.titleMedium),
          subtitle: Text(
            _accountTypeLabel(account.type),
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

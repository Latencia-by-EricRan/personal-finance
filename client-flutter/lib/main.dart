import 'package:flutter/material.dart';

import 'core/theme/index.dart';

void main() {
  runApp(const NorteApp());
}

class NorteApp extends StatelessWidget {
  const NorteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Norte',
      theme: AppTheme.dark,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.dark,
      home: const _ThemePreviewScreen(),
    );
  }
}

/// Temporary screen to eyeball the theme end-to-end. Replaced by the real
/// dashboard in Fase 1.
class _ThemePreviewScreen extends StatelessWidget {
  const _ThemePreviewScreen();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Julio 2026', style: theme.textTheme.headlineSmall),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.nuViolet, AppColors.nuPurple],
                ),
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Text(
                r'$122.600,00',
                style: theme.textTheme.headlineLarge?.copyWith(
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Sueldo', style: theme.textTheme.titleMedium),
                    Text(
                      '+ 185.000,00',
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: AppColors.income,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Alquiler', style: theme.textTheme.titleMedium),
                    Text(
                      '− 35.000,00',
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: AppColors.expense,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () {},
              child: const Text('Guardar movimiento'),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.home_rounded), label: 'Resumen'),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_rounded),
            label: 'Cuentas',
          ),
          NavigationDestination(
            icon: Icon(Icons.pie_chart_rounded),
            label: 'Presup.',
          ),
        ],
      ),
    );
  }
}

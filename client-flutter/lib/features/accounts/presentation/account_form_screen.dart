import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';
import '../data/index.dart';
import 'account_type_label.dart';
import 'providers/index.dart';

class AccountFormScreen extends ConsumerStatefulWidget {
  const AccountFormScreen({super.key, this.initial});

  final Account? initial;

  @override
  ConsumerState<AccountFormScreen> createState() => _AccountFormScreenState();
}

class _AccountFormScreenState extends ConsumerState<AccountFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _currencyController = TextEditingController();

  late AccountType _type;
  var _isSubmitting = false;

  bool get _isEditing => widget.initial != null;

  @override
  void initState() {
    super.initState();
    final initial = widget.initial;
    _nameController.text = initial?.name ?? '';
    _currencyController.text = initial?.currency ?? 'ARS';
    _type = initial?.type ?? AccountType.efectivo;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _currencyController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Ingresá un nombre';
    return null;
  }

  String? _validateCurrency(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Ingresá una moneda';
    return null;
  }

  Future<void> _submit() async {
    if (_isSubmitting) return;
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSubmitting = true);
    try {
      final name = _nameController.text.trim();
      final currency = _currencyController.text.trim();
      final repository = ref.read(accountRepositoryProvider);
      if (_isEditing) {
        await repository.update(
          widget.initial!.id!,
          name: name,
          type: _type,
          currency: currency,
        );
      } else {
        await repository.create(name: name, type: _type, currency: currency);
      }

      ref.invalidate(accountsProvider);
      ref.invalidate(accountsWithBalanceProvider);

      if (!mounted) return;
      context.pop();
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
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _confirmArchive() async {
    if (_isSubmitting) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text(
          '¿Archivar esta cuenta? Podés restaurarla después.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Archivar'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    await _archive();
  }

  Future<void> _archive() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await ref.read(accountRepositoryProvider).archive(widget.initial!.id!);

      ref.invalidate(accountsProvider);
      ref.invalidate(accountsWithBalanceProvider);
      ref.invalidate(archivedAccountsProvider);

      if (!mounted) return;
      context.pop();
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
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Editar cuenta' : 'Nueva cuenta'),
        actions: [
          if (_isEditing)
            IconButton(
              key: const Key('account-form-archive-button'),
              icon: const Icon(Icons.archive_outlined),
              onPressed: _isSubmitting ? null : _confirmArchive,
            ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  key: const Key('account-form-name-field'),
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Nombre'),
                  validator: _validateName,
                ),
                const SizedBox(height: 16),
                SegmentedButton<AccountType>(
                  key: const Key('account-form-type-field'),
                  segments: [
                    for (final type in AccountType.values)
                      ButtonSegment(
                        value: type,
                        label: Text(accountTypeLabel(type)),
                      ),
                  ],
                  selected: {_type},
                  onSelectionChanged: (selection) =>
                      setState(() => _type = selection.first),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('account-form-currency-field'),
                  controller: _currencyController,
                  decoration: const InputDecoration(labelText: 'Moneda'),
                  validator: _validateCurrency,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  key: const Key('account-form-save-button'),
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Guardar cuenta'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

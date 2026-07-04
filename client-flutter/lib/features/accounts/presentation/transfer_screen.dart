import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../core/network/index.dart';
import '../../movements/presentation/providers/index.dart';
import '../../../shared/models/index.dart';
import '../data/index.dart';
import 'providers/index.dart';

class TransferScreen extends ConsumerStatefulWidget {
  const TransferScreen({super.key});

  @override
  ConsumerState<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends ConsumerState<TransferScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  late final TextEditingController _dateController;

  String? _fromAccountId;
  String? _toAccountId;
  late DateTime _date;
  var _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _date = DateUtils.dateOnly(DateTime.now());
    _dateController = TextEditingController(
      text: AppFormatters.shortDate(_date),
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _dateController.dispose();
    super.dispose();
  }

  String? _validateFromAccount(String? value) {
    if (value == null) return 'Seleccioná una cuenta de origen';
    return null;
  }

  String? _validateToAccount(String? value) {
    if (value == null) return 'Seleccioná una cuenta de destino';
    return null;
  }

  String? _validateAmount(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Ingresá un monto';
    final parsed = num.tryParse(trimmed.replaceAll(',', '.'));
    if (parsed == null || parsed <= 0) return 'Ingresá un monto válido';
    return null;
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked == null) return;
    setState(() {
      _date = picked;
      _dateController.text = AppFormatters.shortDate(_date);
    });
  }

  Future<void> _submit() async {
    if (_isSubmitting) return;
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (_fromAccountId == _toAccountId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Las cuentas de origen y destino deben ser distintas'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await ref.read(accountRepositoryProvider).transfer(
            from: _fromAccountId!,
            to: _toAccountId!,
            amount: num.parse(
              _amountController.text.trim().replaceAll(',', '.'),
            ),
            date: _date,
            description: _descriptionController.text.trim().isEmpty
                ? null
                : _descriptionController.text.trim(),
          );

      ref.invalidate(accountsProvider);
      ref.invalidate(accountsWithBalanceProvider);
      ref.invalidate(monthSummaryProvider);
      ref.invalidate(dashboardMovementsProvider);

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
    final accountsAsync = ref.watch(accountsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Transferir entre cuentas')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _AccountField(
                  fieldKey: const Key('transfer-form-from-field'),
                  label: 'Desde',
                  accountsAsync: accountsAsync,
                  value: _fromAccountId,
                  onChanged: (value) => setState(() => _fromAccountId = value),
                  validator: _validateFromAccount,
                ),
                const SizedBox(height: 16),
                _AccountField(
                  fieldKey: const Key('transfer-form-to-field'),
                  label: 'Hacia',
                  accountsAsync: accountsAsync,
                  value: _toAccountId,
                  onChanged: (value) => setState(() => _toAccountId = value),
                  validator: _validateToAccount,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('transfer-form-amount-field'),
                  controller: _amountController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(labelText: 'Monto'),
                  validator: _validateAmount,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('transfer-form-date-field'),
                  controller: _dateController,
                  readOnly: true,
                  decoration: const InputDecoration(labelText: 'Fecha'),
                  onTap: _pickDate,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('transfer-form-description-field'),
                  controller: _descriptionController,
                  decoration: const InputDecoration(
                    labelText: 'Descripción (opcional)',
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  key: const Key('transfer-form-submit-button'),
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Confirmar transferencia'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AccountField extends StatelessWidget {
  const _AccountField({
    required this.fieldKey,
    required this.label,
    required this.accountsAsync,
    required this.value,
    required this.onChanged,
    required this.validator,
  });

  final Key fieldKey;
  final String label;
  final AsyncValue<List<Account>> accountsAsync;
  final String? value;
  final ValueChanged<String?> onChanged;
  final FormFieldValidator<String> validator;

  @override
  Widget build(BuildContext context) {
    return accountsAsync.when(
      data: (accounts) => DropdownButtonFormField<String>(
        key: fieldKey,
        initialValue: value,
        decoration: InputDecoration(labelText: label),
        items: [
          for (final account in accounts)
            DropdownMenuItem(value: account.id, child: Text(account.name)),
        ],
        onChanged: onChanged,
        validator: validator,
      ),
      loading: () => DropdownButtonFormField<String>(
        key: fieldKey,
        items: const [],
        onChanged: null,
        decoration: InputDecoration(labelText: label),
      ),
      error: (error, stackTrace) => Text(
        'No pudimos cargar las cuentas.',
        key: Key('${fieldKey.toString()}-error'),
      ),
    );
  }
}

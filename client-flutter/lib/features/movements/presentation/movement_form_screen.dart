import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';
import '../../accounts/data/index.dart';
import '../../categories/data/index.dart';
import '../data/index.dart';
import 'providers/index.dart';

class MovementFormScreen extends ConsumerStatefulWidget {
  const MovementFormScreen({super.key, this.initial});

  final Movement? initial;

  @override
  ConsumerState<MovementFormScreen> createState() =>
      _MovementFormScreenState();
}

class _MovementFormScreenState extends ConsumerState<MovementFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  late final TextEditingController _dateController;

  late MovementType _type;
  String? _categoryId;
  String? _accountId;
  late DateTime _date;
  var _isSubmitting = false;

  bool get _isEditing => widget.initial != null;

  @override
  void initState() {
    super.initState();
    final initial = widget.initial;
    _type = initial?.type ?? MovementType.egreso;
    _categoryId = initial?.category?.id;
    _accountId = initial?.account;
    // The backend only ever stores a date, never a time-of-day (see
    // DateOnlyConverter), so the "now" default is truncated to the calendar
    // day rather than carrying an arbitrary time component through the form.
    _date = initial?.date ?? DateUtils.dateOnly(DateTime.now());
    if (initial != null) _amountController.text = initial.amount.toString();
    _descriptionController.text = initial?.description ?? '';
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

  String? _validateAmount(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Ingresá un monto';
    final parsed = num.tryParse(trimmed.replaceAll(',', '.'));
    if (parsed == null || parsed <= 0) return 'Ingresá un monto válido';
    return null;
  }

  String? _validateCategory(String? value) {
    if (value == null) return 'Seleccioná una categoría';
    return null;
  }

  String? _validateAccount(String? value) {
    if (value == null) return 'Seleccioná una cuenta';
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

    final categoriesAsync = ref.read(categoriesProvider);
    final accountsAsync = ref.read(accountsProvider);
    if (categoriesAsync.hasError || accountsAsync.hasError) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'No se pudieron cargar las categorías o cuentas. Probá de nuevo.',
          ),
        ),
      );
      return;
    }

    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSubmitting = true);
    try {
      final request = MovementWriteRequest(
        type: _type,
        amount: num.parse(_amountController.text.trim().replaceAll(',', '.')),
        category: _categoryId!,
        account: _accountId!,
        date: _date,
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
      );

      final repository = ref.read(movementRepositoryProvider);
      if (_isEditing) {
        await repository.update(widget.initial!.id!, request);
      } else {
        await repository.create(request);
      }

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

  Future<void> _confirmDelete() async {
    if (_isSubmitting) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('¿Eliminar este movimiento?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    await _delete();
  }

  Future<void> _delete() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await ref.read(movementRepositoryProvider).delete(widget.initial!.id!);

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
    final categoriesAsync = ref.watch(categoriesProvider);
    final accountsAsync = ref.watch(accountsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Editar movimiento' : 'Nuevo movimiento'),
        actions: [
          if (_isEditing)
            IconButton(
              key: const Key('movement-form-delete-button'),
              icon: const Icon(Icons.delete_outline),
              onPressed: _isSubmitting ? null : _confirmDelete,
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
                SegmentedButton<MovementType>(
                  key: const Key('movement-form-type-field'),
                  segments: const [
                    ButtonSegment(
                      value: MovementType.egreso,
                      label: Text('Egreso'),
                    ),
                    ButtonSegment(
                      value: MovementType.ingreso,
                      label: Text('Ingreso'),
                    ),
                  ],
                  selected: {_type},
                  onSelectionChanged: (selection) =>
                      setState(() => _type = selection.first),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('movement-form-amount-field'),
                  controller: _amountController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(labelText: 'Monto'),
                  validator: _validateAmount,
                ),
                const SizedBox(height: 16),
                _CategoryField(
                  categoriesAsync: categoriesAsync,
                  value: _categoryId,
                  onChanged: (value) => setState(() => _categoryId = value),
                  validator: _validateCategory,
                ),
                const SizedBox(height: 16),
                _AccountField(
                  accountsAsync: accountsAsync,
                  value: _accountId,
                  onChanged: (value) => setState(() => _accountId = value),
                  validator: _validateAccount,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('movement-form-date-field'),
                  controller: _dateController,
                  readOnly: true,
                  decoration: const InputDecoration(labelText: 'Fecha'),
                  onTap: _pickDate,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('movement-form-description-field'),
                  controller: _descriptionController,
                  decoration: const InputDecoration(
                    labelText: 'Descripción (opcional)',
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  key: const Key('movement-form-save-button'),
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Guardar movimiento'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryField extends StatelessWidget {
  const _CategoryField({
    required this.categoriesAsync,
    required this.value,
    required this.onChanged,
    required this.validator,
  });

  final AsyncValue<List<Category>> categoriesAsync;
  final String? value;
  final ValueChanged<String?> onChanged;
  final FormFieldValidator<String> validator;

  @override
  Widget build(BuildContext context) {
    return categoriesAsync.when(
      data: (categories) => DropdownButtonFormField<String>(
        key: const Key('movement-form-category-field'),
        initialValue: value,
        decoration: const InputDecoration(labelText: 'Categoría'),
        items: [
          for (final category in categories)
            DropdownMenuItem(value: category.id, child: Text(category.name)),
        ],
        onChanged: onChanged,
        validator: validator,
      ),
      loading: () => DropdownButtonFormField<String>(
        key: const Key('movement-form-category-field'),
        items: const [],
        onChanged: null,
        decoration: const InputDecoration(labelText: 'Categoría'),
      ),
      error: (error, stackTrace) => const Text(
        'No pudimos cargar las categorías.',
        key: Key('movement-form-category-error'),
      ),
    );
  }
}

class _AccountField extends StatelessWidget {
  const _AccountField({
    required this.accountsAsync,
    required this.value,
    required this.onChanged,
    required this.validator,
  });

  final AsyncValue<List<Account>> accountsAsync;
  final String? value;
  final ValueChanged<String?> onChanged;
  final FormFieldValidator<String> validator;

  @override
  Widget build(BuildContext context) {
    return accountsAsync.when(
      data: (accounts) => DropdownButtonFormField<String>(
        key: const Key('movement-form-account-field'),
        initialValue: value,
        decoration: const InputDecoration(labelText: 'Cuenta'),
        items: [
          for (final account in accounts)
            DropdownMenuItem(value: account.id, child: Text(account.name)),
        ],
        onChanged: onChanged,
        validator: validator,
      ),
      loading: () => DropdownButtonFormField<String>(
        key: const Key('movement-form-account-field'),
        items: const [],
        onChanged: null,
        decoration: const InputDecoration(labelText: 'Cuenta'),
      ),
      error: (error, stackTrace) => const Text(
        'No pudimos cargar las cuentas.',
        key: Key('movement-form-account-error'),
      ),
    );
  }
}

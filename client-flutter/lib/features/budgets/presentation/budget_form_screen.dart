import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../../categories/data/index.dart';
import '../../movements/presentation/providers/selected_month_provider.dart';
import '../data/index.dart';

class BudgetFormScreen extends ConsumerStatefulWidget {
  const BudgetFormScreen({super.key, this.initial});

  final BudgetStatus? initial;

  @override
  ConsumerState<BudgetFormScreen> createState() => _BudgetFormScreenState();
}

class _BudgetFormScreenState extends ConsumerState<BudgetFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _limitController = TextEditingController();
  final _monthController = TextEditingController();
  final _yearController = TextEditingController();

  String? _categoryId;
  var _isSubmitting = false;

  // Edit-mode id resolution: see `_resolveId` below for why this is needed.
  String? _resolvedId;
  var _resolving = false;
  var _resolveError = false;

  bool get _isEditing => widget.initial != null;

  @override
  void initState() {
    super.initState();
    final initial = widget.initial;
    if (initial != null) {
      _categoryId = initial.category.id;
      _limitController.text = initial.limit.toString();
      _resolveId();
    } else {
      final selected = ref.read(selectedMonthProvider);
      _monthController.text = selected.month.toString();
      _yearController.text = selected.year.toString();
    }
  }

  @override
  void dispose() {
    _limitController.dispose();
    _monthController.dispose();
    _yearController.dispose();
    super.dispose();
  }

  // `BudgetStatus` (the `extra` this screen receives from `BudgetsScreen`) is
  // a computed/joined view returned by `GET /budget/status/:month/:year` — it
  // carries no `_id` and no month/year of its own. The real `Budget` document
  // id (needed for PUT/DELETE) is only available from `GET /budget`, so it
  // must be resolved by matching {Category, Month, Year} against the raw
  // entities there. Month/year are recovered from `selectedMonthProvider`,
  // which is safe because `BudgetsScreen` and this form share the same
  // app-wide provider and `context.push` navigation does not reset it.
  Future<void> _resolveId() async {
    if (_resolving) return;
    setState(() {
      _resolving = true;
      _resolveError = false;
    });
    try {
      final repository = ref.read(budgetRepositoryProvider);
      final selected = ref.read(selectedMonthProvider);
      final budgets = await repository.getAll(limit: 200);

      Budget? match;
      for (final budget in budgets) {
        if (budget.category == _categoryId &&
            budget.month == selected.month &&
            budget.year == selected.year) {
          match = budget;
          break;
        }
      }

      if (match?.id == null) {
        if (!mounted) return;
        setState(() {
          _resolving = false;
          _resolveError = true;
        });
        return;
      }

      if (!mounted) return;
      setState(() {
        _resolvedId = match!.id;
        _monthController.text = selected.month.toString();
        _yearController.text = selected.year.toString();
        _resolving = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _resolving = false;
        _resolveError = true;
      });
    }
  }

  String? _validateCategory(String? value) {
    if (value == null) return 'Seleccioná una categoría';
    return null;
  }

  String? _validateMonth(String? value) {
    final trimmed = value?.trim() ?? '';
    final parsed = int.tryParse(trimmed);
    if (parsed == null || parsed < 1 || parsed > 12) {
      return 'Ingresá un mes válido (1-12)';
    }
    return null;
  }

  String? _validateYear(String? value) {
    final trimmed = value?.trim() ?? '';
    final parsed = int.tryParse(trimmed);
    if (parsed == null || parsed < 2000 || parsed > 2100) {
      return 'Ingresá un año válido';
    }
    return null;
  }

  String? _validateLimit(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Ingresá un límite';
    final parsed = double.tryParse(trimmed.replaceAll(',', '.'));
    if (parsed == null || parsed < 0) return 'Ingresá un límite válido';
    return null;
  }

  Future<void> _submit() async {
    if (_isSubmitting) return;

    if (!_isEditing) {
      final categoriesAsync = ref.read(categoriesProvider);
      if (categoriesAsync.hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'No se pudieron cargar las categorías. Probá de nuevo.',
            ),
          ),
        );
        return;
      }
    }

    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSubmitting = true);
    try {
      final limit = double.parse(
        _limitController.text.trim().replaceAll(',', '.'),
      );
      final repository = ref.read(budgetRepositoryProvider);
      if (_isEditing) {
        await repository.update(_resolvedId!, limit: limit);
      } else {
        await repository.create(
          category: _categoryId!,
          month: int.parse(_monthController.text.trim()),
          year: int.parse(_yearController.text.trim()),
          limit: limit,
        );
      }

      ref.invalidate(budgetStatusProvider);

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
        title: const Text('¿Eliminar este presupuesto?'),
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
      await ref.read(budgetRepositoryProvider).delete(_resolvedId!);

      ref.invalidate(budgetStatusProvider);

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
    final title = _isEditing ? 'Editar presupuesto' : 'Nuevo presupuesto';

    if (_isEditing && _resolving) {
      return Scaffold(
        appBar: AppBar(title: Text(title)),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_isEditing && _resolveError) {
      return Scaffold(
        appBar: AppBar(title: Text(title)),
        body: ErrorRetry(
          message: 'No pudimos cargar este presupuesto. Probá de nuevo.',
          onRetry: _resolveId,
        ),
      );
    }

    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          if (_isEditing)
            IconButton(
              key: const Key('budget-form-delete-button'),
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
                // Category, Month and Year form the backend's unique
                // constraint tuple that identifies this budget and that the
                // resolved id above was matched against — letting any of
                // them change here would silently point the resolved id at
                // the wrong budget, so they're read-only once in edit mode.
                if (_isEditing)
                  TextFormField(
                    key: const Key('budget-form-category-field'),
                    enabled: false,
                    initialValue: widget.initial!.category.name,
                    decoration: const InputDecoration(labelText: 'Categoría'),
                  )
                else
                  _CategoryField(
                    categoriesAsync: categoriesAsync,
                    value: _categoryId,
                    onChanged: (value) => setState(() => _categoryId = value),
                    validator: _validateCategory,
                  ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        key: const Key('budget-form-month-field'),
                        controller: _monthController,
                        enabled: !_isEditing,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Mes'),
                        validator: _isEditing ? null : _validateMonth,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        key: const Key('budget-form-year-field'),
                        controller: _yearController,
                        enabled: !_isEditing,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Año'),
                        validator: _isEditing ? null : _validateYear,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('budget-form-limit-field'),
                  controller: _limitController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(labelText: 'Límite'),
                  validator: _validateLimit,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  key: const Key('budget-form-save-button'),
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Guardar presupuesto'),
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
        key: const Key('budget-form-category-field'),
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
        key: const Key('budget-form-category-field'),
        items: const [],
        onChanged: null,
        decoration: const InputDecoration(labelText: 'Categoría'),
      ),
      error: (error, stackTrace) => const Text(
        'No pudimos cargar las categorías.',
        key: Key('budget-form-category-error'),
      ),
    );
  }
}

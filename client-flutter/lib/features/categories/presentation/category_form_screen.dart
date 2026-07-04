import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/index.dart';
import '../../../shared/models/index.dart';
import '../data/index.dart';

class CategoryFormScreen extends ConsumerStatefulWidget {
  const CategoryFormScreen({super.key, this.initial});

  final Category? initial;

  @override
  ConsumerState<CategoryFormScreen> createState() =>
      _CategoryFormScreenState();
}

class _CategoryFormScreenState extends ConsumerState<CategoryFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _tagController = TextEditingController();
  final _iconController = TextEditingController();

  late CategoryType _type;
  var _isSubmitting = false;

  bool get _isEditing => widget.initial != null;

  // The backend's `POST /category` has no `PUT /category/:id` — it's an
  // upsert that matches an existing category by Tag if present, else by
  // Name. If a resubmit changed BOTH fields at once, neither the old Tag
  // nor the old Name would match this record anymore, so the upsert would
  // silently INSERT a new category instead of updating this one. Locking
  // whichever field this category is actually matched by prevents that
  // silent duplication; the other field stays freely editable.
  bool get _tagIsLocked => _isEditing && widget.initial!.tag.isNotEmpty;
  bool get _nameIsLocked => _isEditing && widget.initial!.tag.isEmpty;

  @override
  void initState() {
    super.initState();
    final initial = widget.initial;
    _nameController.text = initial?.name ?? '';
    _descriptionController.text = initial?.description ?? '';
    _tagController.text = initial?.tag ?? '';
    _iconController.text = initial?.icon ?? '';
    _type = initial?.type ?? CategoryType.variable;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _tagController.dispose();
    _iconController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Ingresá un nombre';
    return null;
  }

  String? _validateDescription(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Ingresá una descripción';
    return null;
  }

  Future<void> _submit() async {
    if (_isSubmitting) return;
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSubmitting = true);
    try {
      final name = _nameController.text.trim();
      final description = _descriptionController.text.trim();
      final tag = _tagController.text.trim();
      final icon = _iconController.text.trim();

      await ref.read(categoryRepositoryProvider).upsert(
            name: name,
            description: description,
            type: _type,
            tag: tag.isEmpty ? null : tag,
            icon: icon.isEmpty ? null : icon,
          );

      ref.invalidate(categoriesProvider);

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
        title: const Text('¿Eliminar esta categoría?'),
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
      await ref.read(categoryRepositoryProvider).delete(widget.initial!.id!);

      ref.invalidate(categoriesProvider);

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
        title: Text(_isEditing ? 'Editar categoría' : 'Nueva categoría'),
        actions: [
          if (_isEditing)
            IconButton(
              key: const Key('category-form-delete-button'),
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
                TextFormField(
                  key: const Key('category-form-name-field'),
                  controller: _nameController,
                  enabled: !_nameIsLocked,
                  decoration: InputDecoration(
                    labelText: 'Nombre',
                    helperText: _nameIsLocked
                        ? 'No se puede cambiar: identifica esta categoría'
                        : null,
                  ),
                  validator: _validateName,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('category-form-description-field'),
                  controller: _descriptionController,
                  decoration: const InputDecoration(labelText: 'Descripción'),
                  validator: _validateDescription,
                ),
                const SizedBox(height: 16),
                SegmentedButton<CategoryType>(
                  key: const Key('category-form-type-field'),
                  segments: const [
                    ButtonSegment(
                      value: CategoryType.variable,
                      label: Text('Variable'),
                    ),
                    ButtonSegment(
                      value: CategoryType.fijo,
                      label: Text('Fijo'),
                    ),
                  ],
                  selected: {_type},
                  onSelectionChanged: (selection) =>
                      setState(() => _type = selection.first),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('category-form-tag-field'),
                  controller: _tagController,
                  enabled: !_tagIsLocked,
                  decoration: InputDecoration(
                    labelText: 'Tag (opcional)',
                    helperText: _tagIsLocked
                        ? 'No se puede cambiar: identifica esta categoría'
                        : null,
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('category-form-icon-field'),
                  controller: _iconController,
                  decoration: const InputDecoration(
                    labelText: 'Icono (opcional)',
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  key: const Key('category-form-save-button'),
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Guardar categoría'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

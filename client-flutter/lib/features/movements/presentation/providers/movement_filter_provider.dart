import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/models/index.dart';

typedef MovementFilterState = ({
  MovementType? type,
  String? category,
  String? account,
});

const _emptyMovementFilter = (type: null, category: null, account: null);

extension MovementFilterStateX on MovementFilterState {
  bool get isEmpty => type == null && category == null && account == null;
}

class MovementFilterNotifier extends Notifier<MovementFilterState> {
  @override
  MovementFilterState build() => _emptyMovementFilter;

  void setType(MovementType? type) =>
      state = (type: type, category: state.category, account: state.account);

  void clearType() => setType(null);

  void setCategory(String? category) =>
      state = (type: state.type, category: category, account: state.account);

  void clearCategory() => setCategory(null);

  void setAccount(String? account) =>
      state = (type: state.type, category: state.category, account: account);

  void clearAccount() => setAccount(null);

  void clearAll() => state = _emptyMovementFilter;
}

final movementFilterProvider =
    NotifierProvider<MovementFilterNotifier, MovementFilterState>(
  MovementFilterNotifier.new,
);

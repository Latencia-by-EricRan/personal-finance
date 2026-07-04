import '../../../shared/models/index.dart';

String accountTypeLabel(AccountType type) => switch (type) {
      AccountType.efectivo => 'Efectivo',
      AccountType.banco => 'Cuenta bancaria',
      AccountType.tarjeta => 'Tarjeta de crédito',
    };

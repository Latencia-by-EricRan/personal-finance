import { Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

import { IMovementFilter, TypeMovement } from '../../../../core';
import { AccountService, CategoryService } from '../../../../../../../../core/reference';

const NO_FILTER = '';

@Component({
  selector: 'app-movement-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './movement-filter.component.html',
  styleUrl: './movement-filter.component.scss',
})
export class MovementFilterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly categorySvc = inject(CategoryService);
  private readonly accountSvc = inject(AccountService);

  readonly TypeMovement = TypeMovement;
  readonly categories = this.categorySvc.categories;
  readonly accounts = this.accountSvc.accounts;

  readonly filterChange = output<IMovementFilter>();

  readonly form = this.fb.group({
    type: this.fb.control<TypeMovement | ''>(NO_FILTER),
    category: this.fb.control<string>(NO_FILTER),
    account: this.fb.control<string>(NO_FILTER),
  });

  constructor() {
    this.categorySvc.ensureLoaded();
    this.accountSvc.ensureLoaded();

    this.form.valueChanges.subscribe((value) => this.emitFilter(value));
  }

  onClear(): void {
    this.form.reset({ type: NO_FILTER, category: NO_FILTER, account: NO_FILTER });
  }

  private emitFilter(value: { type?: TypeMovement | ''; category?: string; account?: string }): void {
    const filter: IMovementFilter = {};

    if (value.type) {
      filter.Type = value.type;
    }
    if (value.category) {
      filter.Category = value.category;
    }
    if (value.account) {
      filter.Account = value.account;
    }

    this.filterChange.emit(filter);
  }
}

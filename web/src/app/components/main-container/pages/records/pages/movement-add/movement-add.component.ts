import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { ICreateMovement, MovementService, TypeMovement } from '../../core';
import { AccountService, CategoryService } from '../../../../../../core/reference';

@Component({
  selector: 'app-movement-add',
  imports: [ReactiveFormsModule, MatButtonToggleModule],
  templateUrl: './movement-add.component.html',
  styleUrl: './movement-add.component.scss',
})
export class MovementAddComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly movementSvc = inject(MovementService);
  private readonly categorySvc = inject(CategoryService);
  private readonly accountSvc = inject(AccountService);
  private readonly router = inject(Router);

  readonly TypeMovement = TypeMovement;
  readonly categories = this.categorySvc.categories;
  readonly accounts = this.accountSvc.accounts;

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    type: this.fb.control<TypeMovement>(TypeMovement.EGRESO, [Validators.required]),
    amount: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    category: this.fb.control<string | null>(null, [Validators.required]),
    account: this.fb.control<string | null>(null, [Validators.required]),
    date: this.fb.control<string>(MovementAddComponent.today(), [Validators.required]),
    description: this.fb.control<string>(''),
  });

  constructor() {
    this.categorySvc.ensureLoaded();
    this.accountSvc.ensureLoaded();
  }

  private static today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.success.set(false);
    this.submitting.set(true);

    const { type, amount, category, account, date, description } = this.form.getRawValue();
    const dto: ICreateMovement = {
      Type: type,
      Amount: amount,
      Category: category ?? '',
      Account: account ?? '',
      Date: date,
      Description: description || undefined,
    };

    this.movementSvc.createMovement(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.form.reset({
          type: TypeMovement.EGRESO,
          amount: 0,
          category: null,
          account: null,
          date: MovementAddComponent.today(),
          description: '',
        });
        this.router.navigate(['/records/summary-by-month']);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo guardar el movimiento. Intentá nuevamente.');
      },
    });
  }
}

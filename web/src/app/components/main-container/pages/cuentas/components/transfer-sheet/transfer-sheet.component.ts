import { Component, inject, output, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { AccountService, ITransfer } from '../../../../../../core/reference';

function sameAccountValidator(group: AbstractControl): ValidationErrors | null {
  const from = group.get('from')?.value;
  const to = group.get('to')?.value;
  return from && to && from === to ? { sameAccount: true } : null;
}

@Component({
  selector: 'app-transfer-sheet',
  imports: [ReactiveFormsModule],
  templateUrl: './transfer-sheet.component.html',
  styleUrl: './transfer-sheet.component.scss',
})
export class TransferSheetComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly accountSvc = inject(AccountService);

  readonly accounts = this.accountSvc.accounts;

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly transferCompleted = output<void>();
  readonly cancelled = output<void>();

  readonly form = this.fb.group(
    {
      from: this.fb.control<string>('', [Validators.required]),
      to: this.fb.control<string>('', [Validators.required]),
      amount: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
      date: this.fb.control<string>(TransferSheetComponent.today(), [Validators.required]),
      description: this.fb.control<string>(''),
    },
    { validators: sameAccountValidator },
  );

  constructor() {
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
    this.submitting.set(true);

    const { from, to, amount, date, description } = this.form.getRawValue();
    const dto: ITransfer = {
      From: from,
      To: to,
      Amount: amount,
      Date: date,
      Description: description || undefined,
    };

    this.accountSvc.transfer(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.form.reset({
          from: '',
          to: '',
          amount: 0,
          date: TransferSheetComponent.today(),
          description: '',
        });
        this.transferCompleted.emit();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo realizar la transferencia. Intentá nuevamente.');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

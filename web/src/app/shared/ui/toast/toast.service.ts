import { Injectable, signal } from '@angular/core';

export type ToastTone = 'default' | 'success' | 'error';

export interface IToast {
  message: string;
  tone: ToastTone;
}

const AUTO_CLEAR_MS = 2500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastSignal = signal<IToast | null>(null);
  readonly toast = this.toastSignal.asReadonly();

  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, tone: ToastTone = 'default'): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }

    this.toastSignal.set({ message, tone });

    this.clearTimer = setTimeout(() => {
      this.toastSignal.set(null);
      this.clearTimer = null;
    }, AUTO_CLEAR_MS);
  }
}

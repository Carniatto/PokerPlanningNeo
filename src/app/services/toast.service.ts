import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  toasts = this.toastsSignal.asReadonly();

  success(message: string, duration = 3000) {
    this.addToast(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.addToast(message, 'error', duration);
  }

  info(message: string, duration = 3000) {
    this.addToast(message, 'info', duration);
  }

  warning(message: string, duration = 3000) {
    this.addToast(message, 'warning', duration);
  }

  private addToast(message: string, type: Toast['type'], duration: number) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    this.toastsSignal.update(toasts => [...toasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  dismiss(id: string) {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}

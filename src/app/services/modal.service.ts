import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSignal = signal<ModalConfig | null>(null);
  activeModal = this.activeModalSignal.asReadonly();

  confirm(title: string, message: string, confirmText?: string, cancelText?: string): Promise<boolean> {
    if (this.activeModalSignal()) {
      this.activeModalSignal()?.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      this.activeModalSignal.set({
        title,
        message,
        confirmText,
        cancelText,
        resolve: (val: boolean) => {
          this.activeModalSignal.set(null);
          resolve(val);
        }
      });
    });
  }
}

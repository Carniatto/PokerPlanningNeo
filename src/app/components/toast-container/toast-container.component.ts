import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../ui/toast/toast.component';

@Component({
  selector: 'neo-toast-container',
  standalone: true,
  imports: [ToastComponent],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <neo-toast [message]="toast.message" [type]="toast.type" (close)="dismiss(toast.id)"></neo-toast>
      }
    </div>
  `,
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }
}

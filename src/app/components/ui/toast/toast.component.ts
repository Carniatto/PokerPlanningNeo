import { Component, input, output } from '@angular/core';

@Component({
  selector: 'neo-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  message = input.required<string>();
  type = input<'success' | 'error' | 'warning' | 'info'>('success');
  close = output<void>();
}

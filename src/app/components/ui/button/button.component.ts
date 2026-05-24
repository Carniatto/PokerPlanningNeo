import { Component, input } from '@angular/core';

@Component({
  selector: 'button[neo-button]',
  standalone: true,
  template: `
    @if (loading()) {
      <span class="btn-spinner"></span>
    }
    <ng-content></ng-content>
  `,
  styleUrl: './button.component.css',
  host: {
    '[class.btn-neo-primary]': 'variant() === "primary"',
    '[class.btn-neo-secondary]': 'variant() === "secondary"',
    '[class.btn-neo]': 'variant() === "outline"',
    '[class.btn-cancel]': 'variant() === "cancel"',
    '[class.loading]': 'loading()',
    '[disabled]': 'disabled() || loading()'
  }
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'cancel'>('primary');
  disabled = input(false);
  loading = input(false);
}

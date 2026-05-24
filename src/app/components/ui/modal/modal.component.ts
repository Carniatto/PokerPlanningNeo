import { Component, input, output } from '@angular/core';

@Component({
  selector: 'neo-modal',
  standalone: true,
  template: `
    <div class="modal-overlay" (click)="onBackdropClick()">
      <div class="modal-content glass-panel" (click)="$event.stopPropagation()">
        <div class="modal-header-glow"></div>
        @if (title()) {
          <h2>{{ title() }}</h2>
        }
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  title = input<string>('');
  dismissible = input(false);
  close = output<void>();

  onBackdropClick() {
    if (this.dismissible()) {
      this.close.emit();
    }
  }
}

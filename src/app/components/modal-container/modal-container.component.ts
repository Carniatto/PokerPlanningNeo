import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  template: `
    @if (modalService.activeModal(); as modal) {
      <div class="modal-overlay" (click)="dismiss(false, modal)">
        <div class="modal-content glass-panel" (click)="$event.stopPropagation()">
          <div class="modal-header-glow"></div>
          <h2>{{ modal.title }}</h2>
          <p>{{ modal.message }}</p>
          <div class="modal-actions">
            <button class="btn-neo-secondary btn-cancel" (click)="dismiss(false, modal)">
              {{ modal.cancelText || 'Cancel' }}
            </button>
            <button class="btn-neo-primary btn-confirm" (click)="dismiss(true, modal)" autofocus>
              {{ modal.confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './modal-container.component.css'
})
export class ModalContainerComponent {
  modalService = inject(ModalService);

  dismiss(value: boolean, modal: any) {
    modal.resolve(value);
  }
}

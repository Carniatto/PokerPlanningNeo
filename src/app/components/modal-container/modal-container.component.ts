import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { ModalComponent } from '../ui/modal/modal.component';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'neo-modal-container',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    @if (modalService.activeModal(); as modal) {
      <neo-modal [title]="modal.title" [dismissible]="true" (close)="dismiss(false, modal)">
        <p>{{ modal.message }}</p>
        <div class="modal-actions">
          <button neo-button variant="cancel" (click)="dismiss(false, modal)">
            {{ modal.cancelText || 'Cancel' }}
          </button>
          <button neo-button variant="primary" (click)="dismiss(true, modal)" autofocus>
            {{ modal.confirmText || 'Confirm' }}
          </button>
        </div>
      </neo-modal>
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

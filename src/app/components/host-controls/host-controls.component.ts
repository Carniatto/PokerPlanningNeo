import { Component, output } from '@angular/core';


@Component({
    selector: 'app-host-controls',
    imports: [],
    template: `
    <div class="host-controls-card">
      <h3>Host Controls</h3>
      <button class="btn-neo-primary btn-control" (click)="onReveal()">REVEAL VOTES</button>
      <button class="btn-neo btn-control" (click)="onReset()">START NEW ROUND</button>
    </div>
  `,
    styleUrl: './host-controls.component.css'
})
export class HostControlsComponent {
  reveal = output<void>();
  reset = output<void>();

  onReveal() {
    this.reveal.emit();
  }

  onReset() {
    this.reset.emit();
  }
}

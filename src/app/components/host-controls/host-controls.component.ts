import { Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-host-controls',
    imports: [IconComponent],
    template: `
    <div class="host-controls-card">
      <h3>Host Controls</h3>
      
      @if (!areCardsRevealed()) {
        <button 
          class="btn-neo-primary btn-control" 
          [disabled]="!hasVotes()"
          (click)="onReveal()"
        >
          REVEAL VOTES
        </button>
      }

      <button 
        class="btn-neo btn-control btn-with-icon" 
        (click)="onReplay()"
      >
        <app-icon name="replay" size="medium" class="btn-icon"></app-icon>
        REPLAY ROUND
      </button>
    </div>
  `,
    styleUrl: './host-controls.component.css'
})
export class HostControlsComponent {
  areCardsRevealed = input<boolean>(false);
  hasVotes = input<boolean>(false);

  reveal = output<void>();
  replay = output<void>();

  onReveal() {
    this.reveal.emit();
  }

  onReplay() {
    this.replay.emit();
  }
}

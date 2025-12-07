import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../game.service';
import { HostControlsComponent } from '../host-controls/host-controls.component';
import { RoundResultComponent } from '../round-result/round-result.component';
import { ParticipantsListComponent } from '../participants-list/participants-list.component';

@Component({
    selector: 'app-room-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        HostControlsComponent,
        RoundResultComponent,
        ParticipantsListComponent
    ],
    template: `
    <aside class="room-sidebar">
      <!-- Host Controls (Top) -->
      @if (isHost()) {
        <app-host-controls (reveal)="reveal.emit()" (reset)="reset.emit()"></app-host-controls>
      }

      <!-- Round Result (Middle - visible when cards revealed) -->
      @if (areCardsRevealed()) {
        <app-round-result 
          [isHost]="isHost()" 
          [players]="players()" 
          (nextRound)="reset.emit()">
        </app-round-result>
      }

      <!-- Participants List (Bottom) -->
      <div class="participants-section">
        <h3>Participants ({{ players().length }})</h3>
        
        <div class="participant-list">
          <app-participants-list 
            [players]="players()" 
            [areCardsRevealed]="areCardsRevealed()"
            [currentUserId]="currentUserId()">
          </app-participants-list>
        </div>
      </div>
      
      <div class="sidebar-footer">
          <ng-content select=".footer-content"></ng-content>
      </div>
    </aside>
  `,
    styleUrl: './room-sidebar.component.css'
})
export class RoomSidebarComponent {
    players = input.required<Player[]>();
    isHost = input(false);
    areCardsRevealed = input(false);
    currentUserId = input<string | undefined>(undefined);

    reveal = output<void>();
    reset = output<void>();
}

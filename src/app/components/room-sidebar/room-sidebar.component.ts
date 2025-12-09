import { Component, input, output, signal } from '@angular/core';
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
      <!-- Collapsible Mobile Section -->
      <div class="participants-section" [class.collapsed]="isCollapsed()">
        <div class="participants-header" (click)="toggleCollapse()">
          <h3>Participants ({{ players().length }})</h3>
          <span class="toggle-icon">{{ isCollapsed() ? '▲' : '▼' }}</span>
        </div>
        
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
  styleUrl: './room-sidebar.component.css',
  host: {
    '[class.host-mode]': 'isHost()'
  }
})
export class RoomSidebarComponent {
  players = input.required<Player[]>();
  isHost = input(false);
  areCardsRevealed = input(false);
  currentUserId = input<string | undefined>(undefined);

  reveal = output<void>();
  reset = output<void>();

  // Collapsible Logic
  // Default to collapsed on mobile? Maybe start expanded or let user decide. 
  // User asked to make it collapsible, usually implies starting open or closed.
  // We'll default to OPEN (false) matching current behavior, user can click to close.
  // OR given space constraints, maybe default closed? Let's default false (open).
  isCollapsed = signal(true); // Actually, "bottom sheet" style usually starts filtered. 
  // Let's start collapsed (true) so it takes less space initially as requested "to avoid scrolling"?
  // Wait, user said "make it collapsible", not "start collapsed". But for "no scroll" usually minimal is best.
  // Let's default to collapsed (true) creates a cleaner look.

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }
}

import { Component, input, output, signal } from '@angular/core';

import { Player } from '../../game.service';
import { RoundResultComponent } from '../round-result/round-result.component';
import { ParticipantsListComponent } from '../participants-list/participants-list.component';

@Component({
    selector: 'app-room-sidebar',
    imports: [RoundResultComponent, ParticipantsListComponent],
    template: `
    <aside class="room-sidebar">

      <!-- Unified session control panel (always visible for host; result-only for players) -->
      @if (isHost()) {
        <app-round-result
          [isHost]="true"
          [players]="players()"
          [areCardsRevealed]="areCardsRevealed()"
          [hasVotes]="hasVotes()"
          [votingValues]="votingValues()"
          [isFromList]="isFromList()"
          [nextTaskName]="nextTaskName()"
          [hasActiveTask]="hasActiveTask()"
          [confirmedEstimate]="confirmedEstimate()"
          (confirmedEstimateChange)="confirmedEstimateChange.emit($event)"
          (reveal)="reveal.emit()"
          (replay)="replay.emit()"
          (saveAndContinue)="saveAndContinue.emit()"
          (skip)="skip.emit()">
        </app-round-result>
      } @else if (areCardsRevealed()) {
        <!-- Player view: show results only when revealed -->
        <app-round-result
          [isHost]="false"
          [players]="players()"
          [areCardsRevealed]="true"
          [hasVotes]="hasVotes()"
          [hasActiveTask]="hasActiveTask()">
        </app-round-result>
      }

      <!-- Participants List -->
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
  hasVotes = input(false);
  currentUserId = input<string | undefined>(undefined);
  votingValues = input<string[]>(['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕']);
  isFromList = input<boolean>(false);
  nextTaskName = input<string | null>(null);
  hasActiveTask = input<boolean>(false);
  confirmedEstimate = input<string>('');

  reveal = output<void>();
  replay = output<void>();
  saveAndContinue = output<void>();
  skip = output<void>();
  confirmedEstimateChange = output<string>();

  isCollapsed = signal(true);

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }
}

import { Component, input } from '@angular/core';

import { Player } from '../../game.service';

@Component({
    selector: 'app-player-card',
    imports: [],
    template: `
    <div class="player-card">
      <div class="player-avatar-wrapper">
        <div class="player-avatar">
          @if (player().avatarUrl) {
            <img [src]="player().avatarUrl" [alt]="player().name">
          } @else {
            <span>{{ player().name.charAt(0) }}</span>
          }
        </div>
        
        <!-- Status Indicator (Hidden if revealed and voted) -->
        @if (!isRevealed() || !player().vote) {
          <div class="status-indicator" 
               [class.voted]="player().status === 'Voted'"
               [class.waiting]="player().status === 'Waiting...'">
            {{ player().status === 'Voted' ? '✓' : '•' }}
          </div>
        }

        <!-- Revealed Vote Value -->
        @if (isRevealed() && player().vote) {
          <div class="revealed-value" [class]="'revealed-value ' + getVoteColorClass(player().vote)">
            {{ player().vote }}
          </div>
        }
      </div>
      <span class="player-name">{{ player().name }}</span>
      <span class="player-status" [class.dimmed]="player().status === 'Not Participating'">
        {{ player().status }}
      </span>
    </div>
  `,
    styleUrl: './player-card.component.css'
})
export class PlayerCardComponent {
  player = input.required<Player>();
  isRevealed = input(false);

  getVoteColorClass(vote?: string | null): string {
    if (!vote) return '';
    if (['0', '1', '2', '3'].includes(vote)) return 'vote-small';
    if (['5', '8'].includes(vote)) return 'vote-medium';
    if (['13', '21'].includes(vote)) return 'vote-large';
    if (vote === '☕') return 'vote-coffee';
    return 'vote-unknown';
  }
}

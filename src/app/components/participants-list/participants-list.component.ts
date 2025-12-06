import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../game.service';

@Component({
  selector: 'app-participants-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="participants-container">
      @for (player of players(); track player.id) {
        <div class="participant-row" 
             [class.current-user]="player.id === currentUserId()"
             [class.has-voted]="player.vote">
          
          <div class="avatar-container">
            <div class="avatar">
              @if (player.avatarUrl) {
                <img [src]="player.avatarUrl" [alt]="player.name">
              } @else {
                {{ getInitials(player.name) }}
              }
            </div>
          </div>

          <div class="player-info">
             <span class="name">
                {{ player.name }} 
                @if (player.id === currentUserId()) { <span class="you-tag">(You)</span> }
             </span>
          </div>

          <div class="vote-indicator">
            @if (player.vote) {
               @if (areCardsRevealed()) {
                 <span class="vote-value">{{ player.vote }}</span>
               } @else {
                 <span class="vote-hidden">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                 </span>
               }
            } @else {
               <!-- Removed folding indicator (3 dots) as requested -->
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './participants-list.component.css'
})
export class ParticipantsListComponent {
  players = input.required<Player[]>();
  areCardsRevealed = input(false);
  currentUserId = input<string | undefined>(undefined);

  getInitials(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }
}

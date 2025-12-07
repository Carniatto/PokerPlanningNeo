import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Player, GameService } from '../../game.service';

@Component({
  selector: 'app-participants-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
             @if (editingUserId() === player.id) {
               <div class="edit-name-group">
                 <input type="text" 
                        [(ngModel)]="editNameValue" 
                        (keyup.enter)="saveName(player.id)"
                        (blur)="saveName(player.id)"
                        class="edit-name-input"
                        autofocus>
               </div>
             } @else {
               <span class="name" (click)="enableEdit(player)">
                  {{ player.name }} 
                  @if (player.id === currentUserId()) { 
                    <span class="you-tag">(You)</span> 
                    <button class="btn-edit" (click)="enableEdit(player); $event.stopPropagation()">✏️</button>
                  }
               </span>
             }
          </div>

          <div class="vote-indicator">
            @if (player.vote) {
               @if (areCardsRevealed()) {
                 @if (player.vote === '☕') {
                   <div class="vote-icon-wrapper">
                     <svg class="vote-svg" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id="listNeonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e879f9;stop-opacity:1" />
                          </linearGradient>
                        </defs>
                        <g transform="translate(50, 70) scale(0.85) translate(-2.5, 0)">
                           <path d="M -25,-10 L -25,20 Q -25,40 0,40 Q 25,40 25,20 L 25,-10 Z" class="cup-body" />
                           <path d="M 25,0 Q 40,0 40,15 Q 40,30 25,30" class="cup-handle" />
                           <g class="steam">
                             <path d="M -15,-20 Q -10,-30 -15,-40" />
                             <path d="M 0,-20 Q 5,-30 0,-40" />
                             <path d="M 15,-20 Q 20,-30 15,-40" />
                           </g>
                        </g>
                     </svg>
                   </div>
                 } @else {
                   <span class="vote-value">{{ player.vote }}</span>
                 }
               } @else {
                 <span class="vote-hidden">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                 </span>
               }
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './participants-list.component.css'
})
export class ParticipantsListComponent {
  private gameService = inject(GameService);
  private route = inject(ActivatedRoute);

  players = input.required<Player[]>();
  areCardsRevealed = input(false);
  currentUserId = input<string | undefined>(undefined);

  editingUserId = signal<string | null>(null);
  editNameValue = '';

  getInitials(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  enableEdit(player: Player) {
    if (player.id === this.currentUserId()) {
      this.editNameValue = player.name;
      this.editingUserId.set(player.id);
    }
  }

  async saveName(playerId: string) {
    if (this.editingUserId() !== playerId) return;

    const newName = this.editNameValue.trim();
    const roomId = this.route.snapshot.paramMap.get('id'); // Get ID from parent route? Wait, this is a child component.
    // The route params might be available if using Router in a way that inherits, but safest is to get roomId from gameService or pass it in.
    // Let's use GameService's currentRoomId.
    const activeRoomId = this.gameService.currentRoomId();

    if (newName && activeRoomId && newName !== '') {
      try {
        await this.gameService.updatePlayerName(activeRoomId, playerId, newName);
      } catch (err) {
        console.error('Failed to update name', err);
      }
    }
    this.editingUserId.set(null);
  }
}

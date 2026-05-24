import { Component, input, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Player, GameService } from '../../game.service';
import { IconComponent } from '../icon/icon.component';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'neo-participants-list',
    imports: [FormsModule, IconComponent],
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
                        class="edit-name-input"
                        autofocus>
                 <button class="btn-confirm" (click)="saveName(player.id)" title="Save">
                    <neo-icon name="check" size="medium"></neo-icon>
                 </button>
               </div>
             } @else {
               <span class="name" (click)="enableEdit(player)">
                  <span class="name-text">{{ player.name }}</span>
                  @if (player.id === currentUserId()) { 
                    <span class="you-tag">(You)</span> 
                    <button class="btn-edit" (click)="enableEdit(player); $event.stopPropagation()" title="Edit Name">
                        <neo-icon name="edit" size="small"></neo-icon>
                    </button>
                  }
                  @if (isPlayerHost(player.id)) {
                    <span class="host-tag">Host</span>
                  } @else if (isUserHost() && player.id !== currentUserId()) {
                    <button class="btn-promote" (click)="promoteToHost(player.id); $event.stopPropagation()" title="Promote to Host">
                      + Host
                    </button>
                  }
               </span>
             }
          </div>

          <div class="vote-indicator">
            @if (player.vote) {
               @if (areCardsRevealed()) {
                 @if (player.vote === '☕') {
                   <div class="vote-icon-wrapper">
                     <neo-icon name="coffee" size="full"></neo-icon>
                   </div>
                 } @else {
                   <span class="vote-value">{{ player.vote }}</span>
                 }
               } @else {
                 <span class="vote-hidden">
                    <neo-icon name="vote-hidden" size="medium"></neo-icon>
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
  private modalService = inject(ModalService);

  players = input.required<Player[]>();
  areCardsRevealed = input(false);
  currentUserId = input<string | undefined>(undefined);

  editingUserId = signal<string | null>(null);
  editNameValue = '';

  isUserHost = this.gameService.isHost;

  isPlayerHost(playerId: string): boolean {
    const room = this.gameService.currentRoomData();
    if (!room) return false;
    return room.hostId === playerId || !!(room.hostIds && room.hostIds.includes(playerId));
  }

  async promoteToHost(playerId: string) {
    const roomId = this.gameService.currentRoomId();
    if (roomId) {
      const confirmed = await this.modalService.confirm(
        'Promote to Host',
        'Are you sure you want to promote this user to Host? They will share all host controls.',
        'Promote',
        'Cancel'
      );
      if (confirmed) {
        await this.gameService.promoteToHost(roomId, playerId);
      }
    }
  }


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

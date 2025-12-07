import { Component, inject, OnInit, signal, effect, computed, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { PlayerCardComponent } from '../components/player-card/player-card.component';
import { VotingCardComponent } from '../components/voting-card/voting-card.component';
import { TaskDescriptionComponent } from '../components/task-description/task-description.component';
import { RoomHeaderComponent } from '../components/room-header/room-header.component';
import { RoomSidebarComponent } from '../components/room-sidebar/room-sidebar.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PlayerCardComponent,
    VotingCardComponent,
    TaskDescriptionComponent,
    RoomHeaderComponent,
    RoomSidebarComponent
  ],
  template: `
    @if (isLoading()) {
      <div class="loading-container">
        <div class="loader"></div>
        <p>Connecting to Room...</p>
      </div>
    } @else {
      <!-- HOST VIEW -->
      @if (isHost()) {
        <div class="dashboard-container host-theme">
          <!-- Main Content (Left) -->
          <main class="main-content">
            <app-room-header [roomId]="roomId || ''" 
                            [isHost]="true"
                            (endSession)="leaveRoom()" 
                            (copyLink)="copyInviteLink()">
            </app-room-header>

            <app-task-description></app-task-description>

            <section class="players-section">
              <h2>Players</h2>
              <div class="players-grid">
                @for (player of players(); track player.id) {
                  <app-player-card [player]="player" [isRevealed]="areCardsRevealed()"></app-player-card>
                }
              </div>
            </section>
            
            <section class="deck-section">
                <h2>Your Deck</h2>
                <div class="cards-row">
                    @for (value of votingValues; track value) {
                      <app-voting-card 
                        class="host-voting-card"
                        [value]="value" 
                        [selected]="selectedValue() === value"
                        (select)="selectVote($event)"
                        size="small">
                      </app-voting-card>
                    }
                </div>
            </section>
          </main>

          <!-- Right Column: Host Sidebar (Direct child of flex container) -->
          <app-room-sidebar 
            [isHost]="true" 
            [players]="sortedPlayers()" 
            [areCardsRevealed]="areCardsRevealed()"
            [currentUserId]="currentUser()?.uid"
            (reveal)="revealVotes()"
            (reset)="startNewRound()">
          </app-room-sidebar>
        </div>
      }

      <!-- PLAYER VIEW -->
      @if (!isHost()) {
        <div class="player-layout">
          <div class="player-content-wrapper">
            <!-- Main Voting Area -->
            <main class="voting-area">
              <app-room-header [roomId]="roomId || ''" 
                              [isHost]="false"
                              (endSession)="leaveRoom()" 
                              (copyLink)="copyInviteLink()">
              </app-room-header>

              <div class="task-header">
                <h1>Estimating: Design the user authentication flow</h1>
                @if (areCardsRevealed()) {
                  <p class="status-text">The votes are revealed!</p>
                } @else {
                  <p class="status-text">Select your estimate.</p>
                }
              </div>

              <div class="voting-grid">
                @for (value of votingValues; track value) {
                  <app-voting-card 
                                  [value]="value" 
                                  [selected]="selectedValue() === value"
                                  (select)="selectVote($event)">
                  </app-voting-card>
                }
              </div>
            </main>

            <!-- Right Sidebar -->
            <!-- Right Sidebar -->
            <app-room-sidebar 
               [isHost]="false"
               [players]="sortedPlayers()" 
               [areCardsRevealed]="areCardsRevealed()"
               [currentUserId]="currentUser()?.uid">
               <div class="footer-content">
                  <div class="sidebar-footer" style="margin-top: auto;">
                     <button class="btn-leave-room" (click)="leaveRoom()">Leave Room</button>
                  </div>
               </div>
            </app-room-sidebar>
          </div>
        </div>
      }

      <!-- Name Prompt Modal -->
      @if (showNamePrompt()) {
        <div class="modal-overlay">
          <div class="modal-content">
            <h2>Enter Your Name</h2>
            <p>Please enter your name to join the room.</p>
            <input type="text" [value]="nameInput()" (input)="nameInput.set($any($event.target).value)" (keyup.enter)="submitName()" placeholder="Your Name" autofocus name="name">
            <button (click)="submitName()" [disabled]="!nameInput()">Join Room</button>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    /* Shared & Host Styles */
    .dashboard-container {
      display: flex;
      height: 100vh;
      background-color: #0a192f;
      overflow: hidden;
    }

    /* Main Content */
    .main-content { flex: 1; padding: 2rem 3rem; overflow-y: auto; }
        
    .room-sidebar {
      width: 320px;
      background-color: #020c1b;
      border-left: 1px solid var(--border-glass, #1e2d3d);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .players-grid { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    
    .deck-section { margin-top: 3rem; }
    .cards-row { 
      display: flex; 
      gap: 0.75rem; 
      flex-wrap: wrap;
    }
    
    .host-voting-card {
      width: 50px;
      /* Height is auto determined by aspect-ratio 2/3 in component */
    }

    /* PLAYER VIEW SPECIFIC STYLES */
    .player-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #0a192f;
    }

    .player-content-wrapper {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .voting-area {
      flex: 1;
      padding: 3rem;
      overflow-y: auto;
    }

    .task-header { margin-bottom: 3rem; }
    .task-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .status-text { color: #8892b0; } 

    .voting-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1.5rem;
      max-width: 800px;
    }


    .participants-section h3 {
      font-size: 0.9rem;
      color: #a8b2d1;
      margin-bottom: 1.5rem;
    }

    .participant-list { display: flex; flex-direction: column; gap: 1rem; }
    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(2, 12, 27, 0.85); z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(8px);
    }

    .modal-content {
      background: rgba(17, 34, 64, 0.75);
      padding: 2.5rem; 
      border-radius: 1rem;
      width: 90%; max-width: 420px;
      border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .modal-content::before {
      content: '';
      position: absolute; top: 0; left: 0; width: 100%; height: 2px;
      background: linear-gradient(90deg, var(--neon-blue, #00f3ff), var(--neon-purple, #bc13fe));
    }

    .modal-content h2 { 
      margin-bottom: 1rem; 
      color: white; 
      font-size: 1.8rem;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }
    
    .modal-content p { 
      color: #a8b2d1; 
      margin-bottom: 2rem; 
      font-size: 1rem;
      line-height: 1.5;
    }
    
    .modal-content input {
      width: 100%; 
      padding: 1rem; 
      margin-bottom: 1.5rem;
      background-color: rgba(2, 12, 27, 0.6); 
      border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      border-radius: 0.5rem; 
      color: white; 
      outline: none;
      font-size: 1.1rem;
      transition: all 0.2s ease;
    }
    
    .modal-content input:focus { 
      border-color: var(--neon-blue, #00f3ff);
      box-shadow: 0 0 15px rgba(0, 243, 255, 0.1);
      background-color: rgba(2, 12, 27, 0.8);
    }
    
    .modal-content button {
      width: 100%; 
      padding: 1rem; 
      background: linear-gradient(135deg, var(--neon-blue, #00f3ff), var(--neon-purple, #bc13fe));
      color: white; 
      border: none; 
      border-radius: 0.5rem; 
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer; 
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
    }
    
    .modal-content button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .modal-content button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
    }

    .modal-content button:not(:disabled):active {
      transform: translateY(0);
    }

    /* Loading Styles */
    .loading-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #0a192f;
      color: #8892b0;
      gap: 1rem;
    }
    .loader {
      width: 48px;
      height: 48px;
      border: 5px solid #112240;
      border-bottom-color: var(--neon-blue, #00f3ff);
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
    @keyframes rotation {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class RoomComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);

  roomId: string | null = null;

  // Signals from Service
  players = this.gameService.players;
  isHost = this.gameService.isHost;
  currentUser = this.gameService.currentUser;
  areCardsRevealed = this.gameService.areCardsRevealed;

  // Sorted Players (Current user first)
  sortedPlayers = computed(() => {
    const players = this.players();
    const user = this.currentUser();
    if (!user) return players;

    const myIndex = players.findIndex(p => p.id === user.uid);
    if (myIndex === -1) return players;

    // Create a new array with current user at the top
    const me = players[myIndex];
    const others = players.filter(p => p.id !== user.uid);
    return [me, ...others];
  });

  // Player View State
  votingValues = ['0', '1', '2', '3', '5', '8', '13', '20', '?', '☕'];
  selectedValue = signal<string | null>(null);

  // Name Prompt State
  showNamePrompt = signal(true);
  nameInput = signal('');

  // Loading State
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const roomData = this.gameService.currentRoomData();
      const user = this.currentUser();
      const roomId = this.gameService.currentRoomId();

      // We only stop loading when we have attempted to join a room (ID is set)
      // and we have a user (auth resolved)
      // and we have received a response for the room data (even if null)
      // BUT: GameService init signals are null. 
      // We know loading is done when we have both user and roomData (if room exists).

      if (user && roomData) {
        const me = roomData.players.find(p => p.id === user.uid);
        this.showNamePrompt.set(!me);
        this.isLoading.set(false);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id');

    if (!this.roomId) {
      this.router.navigate(['/']);
      return;
    }

    // Attempt to rejoin if we have an ID but no subscription
    if (!this.gameService.currentRoomId()) {
      this.gameService.joinRoom(this.roomId);
    }
  }


  async leaveRoom() {
    if (this.roomId && this.currentUser()) { // Check current user
      await this.gameService.leaveRoom(this.roomId, this.currentUser()!.uid);
    }
    this.router.navigate(['/']);
  }

  async submitName() {
    const name = this.nameInput();
    if (!name || !this.roomId) return;

    try {
      await this.gameService.joinRoom(this.roomId, name);
      this.showNamePrompt.set(false);
    } catch (error) {
      console.error('Error joining room with name:', error);
    }
  }

  selectVote(value: string) {
    this.selectedValue.set(value);
    this.gameService.vote(value);
  }

  revealVotes() {
    this.gameService.revealCards(true);
  }

  startNewRound() {
    this.gameService.revealCards(false);
    this.gameService.resetVotes();
    this.selectedValue.set(null);
  }

  @HostListener('window:beforeunload')
  async onBeforeUnload() {
    await this.leaveRoom();
  }

  ngOnDestroy() {
    this.leaveRoom();
  }

  copyInviteLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Invite link copied to clipboard!');
    });
  }
}

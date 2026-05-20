import { Component, inject, OnInit, signal, effect, computed, OnDestroy, HostListener } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { VotingCardComponent } from '../components/voting-card/voting-card.component';
import { TaskDescriptionComponent } from '../components/task-description/task-description.component';
import { RoomHeaderComponent } from '../components/room-header/room-header.component';
import { RoomSidebarComponent } from '../components/room-sidebar/room-sidebar.component';

@Component({
    selector: 'app-room',
    imports: [
    FormsModule,
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
                            [roomName]="currentRoomName()"
                            (roomNameChange)="onRoomNameChange($event)"
                            (nameBlur)="saveRoomName()"
                            (endSession)="leaveRoom()" 
                            (copyLink)="copyInviteLink()">
            </app-room-header>

            <app-task-description 
                [isHost]="true"
                [story]="currentStory()"
                (storyChange)="onStoryChange($event)"
                (storyBlur)="saveCurrentStory()">
            </app-task-description>

            @if (!areCardsRevealed()) {
              <section class="deck-section">
                  <h2>Your Deck</h2>
                  <div class="voting-grid">
                      @for (value of votingValues; track value) {
                        <app-voting-card 
                          [value]="value" 
                          [selected]="selectedValue() === value"
                          (select)="selectVote($event)">
                        </app-voting-card>
                      }
                  </div>
              </section>
            }
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
                              [roomName]="currentRoomName()"
                              (endSession)="leaveRoom()" 
                              (copyLink)="copyInviteLink()">
              </app-room-header>

              <app-task-description 
                  [isHost]="false"
                  [story]="currentStory()">
              </app-task-description>

              <div class="task-header">
                @if (areCardsRevealed()) {
                  <p class="status-text">The votes are revealed!</p>
                } @else {
                  <p class="status-text">Select your estimate.</p>
                }
              </div>

              @if (!areCardsRevealed()) {
                <div class="voting-grid">
                  @for (value of votingValues; track value) {
                    <app-voting-card 
                                    [value]="value" 
                                    [selected]="selectedValue() === value"
                                    (select)="selectVote($event)">
                    </app-voting-card>
                  }
                </div>
              }
            </main>

            <!-- Right Sidebar -->
            <app-room-sidebar 
               [isHost]="false"
               [players]="sortedPlayers()" 
               [areCardsRevealed]="areCardsRevealed()"
               [currentUserId]="currentUser()?.uid">

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
      <!-- Session Ended Overlay -->
      @if (sessionEnded()) {
        <div class="modal-overlay session-ended-overlay">
          <div class="modal-content">
            <h2>Session Ended</h2>
            <p>The host has ended the session.</p>
            <div class="countdown-circle">
                <span class="countdown-number">{{ redirectCountdown() }}</span>
                <span class="countdown-label">seconds</span>
            </div>
            <p class="redirect-text">Redirecting to home...</p>
            <button (click)="forceLeave()">Leave Now</button>
          </div>
        </div>
      }
    }
  `,
    styles: [`
    /* Session Ended Specifics */
    .session-ended-overlay {
        background-color: rgba(2, 12, 27, 0.95);
        z-index: 10000;
    }
    
    .countdown-circle {
        width: 100px; height: 100px;
        border-radius: 50%;
        border: 3px solid var(--neon-blue, #00f3ff);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        margin: 0 auto 1.5rem auto;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.3);
        animation: pulse 1s infinite alternate;
    }
    
    .countdown-number {
        font-size: 2.5rem; font-weight: bold;
        color: white;
    }
    
    .countdown-label {
        font-size: 0.8rem; color: #a8b2d1;
    }
    
    .redirect-text {
        font-style: italic;
    }

    @keyframes pulse {
        0% { box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); }
        100% { box-shadow: 0 0 25px rgba(0, 243, 255, 0.6); }
    }

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
    .status-text { color: #8892b0; font-size: 1.2rem; } 

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

    /* MOBILE RESPONSIVENESS */
    @media (max-width: 768px) {
      .dashboard-container {
        flex-direction: column;
        height: calc(100dvh - 64px); /* Subtract Global Header Height */
        overflow-y: auto; /* Host view scroll container */
        overflow-x: hidden;
        padding-bottom: 0px; 
        box-sizing: border-box; 
      }

      .player-layout {
        height: calc(100dvh - 64px);
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0; /* Removing global padding to match host strategy */
        box-sizing: border-box;
      }
      
      .voting-area {
        display: contents;
      }
      
      .main-content {
          display: contents;
      }
      
      .player-content-wrapper {
         flex-direction: column;
         display: contents;
      }

      /* Reordering Logic */
      app-room-header { order: 10; margin-bottom: 0 !important; }
      app-task-description { order: 15; } /* Moved above controls */
      app-host-controls { order: 20; }
      
      /* Host Players Grid - Hidden on Mobile */
      .players-section { 
          display: none !important;
          order: 40;
      } 
      
      .deck-section { order: 50; } 
      
      /* Player View Specifics */
      .task-header { order: 35; } 
      .voting-grid { 
          order: 40; 
          /* flex: 1; Removed to prevent nested scrolling */
          /* overflow-y: auto; Removed - let parent scroll */
          /* min-height: 0; Removed */
      }

      /* Adjustments for Mobile - Compact Density */
      
      /* PLAYER VIEW: Inside .voting-area */
      .player-layout app-room-header { 
        padding: 1rem 1rem 0 1rem; /* Match Host Header */
        display: block; 
        flex: none;
        margin-bottom: 0.25rem;
      }
      
      .player-layout app-task-description {
         padding: 0 1rem;
         display: block; 
         flex: none;
      }

      .task-header {
        padding: 0 1rem;
        margin-bottom: 0.25rem; /* Reduced from 0.5rem */
        flex: none;
      }
      
      /* HOST VIEW: Direct children of container (needs own padding) */
      .host-theme app-room-header {
          padding: 1rem 1rem 0 1rem;
          display: block;
          flex: none;
          margin-bottom: 0.25rem;
      }
      
      .host-theme app-task-description {
          padding: 0 1rem;
          display: block;
          flex: none;
      }

      /* Compact Grids - 3 Rows of 4 (4-4-2) */
      .voting-grid {
        padding: 0 1rem 1rem 1rem; /* Consistent side padding */
        grid-template-columns: repeat(4, 1fr); 
        gap: 0.5rem;
        align-content: start;
        justify-items: start; /* Match cards-row */
      }

      .voting-grid > app-voting-card {
          width: 100%;
          min-width: 0;
      }
      
      .deck-section {
          padding: 0 1rem; /* Removed top padding */
          margin-top: 0 !important; /* Removed top margin */
          flex: none;
      }
      
      .deck-section h2 {
          display: none; /* Hide 'Your Deck' on mobile */
      }
      
      .players-grid {
          justify-content: center;
          gap: 0.5rem;
      }
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

  // Local signals for editable fields
  currentRoomName = signal<string>('');
  currentStory = signal<string>('');

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
  votingValues = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

  // Computed selected value from server state (Single Source of Truth)
  selectedValue = computed(() => {
    const user = this.currentUser();
    const players = this.players();
    if (!user || !players) return null;
    const me = players.find(p => p.id === user.uid);
    return me?.vote || null;
  });

  // Name Prompt State
  showNamePrompt = signal(true);
  nameInput = signal('');

  // Loading State
  isLoading = signal(true);

  // Auto-Join State
  isAutoJoining = signal(false);

  constructor() {
    effect(() => {
      const roomData = this.gameService.currentRoomData();
      const user = this.currentUser();

      // We only stop loading when we have both user and roomData (if room exists).
      // Also prevent modal flash if we are deliberately leaving
      if (roomData) {
        // Sync Room Name and Story
        // Only update signal if it's different to avoid loops if we add two-way binding or cause re-renders
        // But since these are signals, setting same value is fine.
        // IMPORTANT: If user is editing, we might not want to overwrite their local state immediately from server 
        // if there's lag, but generally for this app, server wins or we rely on them not typing while someone else does (Host only).
        // Since only Host edits, and there's 1 host, we can safely sync from server.
        // Ideally we check if document is active element, but simple approach first.

        if (roomData.roomName !== undefined) {
          this.currentRoomName.set(roomData.roomName);
        }
        if (roomData.currentStory !== undefined) {
          this.currentStory.set(roomData.currentStory);
        }

        // Check for Session End
        if (roomData.status === 'ended' && !this.sessionEnded()) {
          // If I am host, I should have already left or triggered this. 
          // But if I am a player, or a host in another tab, trigger the end-game flow.
          // If I initiated the end (isLeaving=true), I ignore this update (likely component destroyed already).
          if (!this.isLeaving && !this.isHost()) {
            this.triggerSessionEndedSequence();
          }
          // If I am host and see 'ended', and haven't left yet (maybe another host ended it? unlikely in this logic but possible),
          // perform leave immediately.
          if (!this.isLeaving && this.isHost()) {
            this.leaveRoom();
          }
        }
      }

      if (user && roomData && !this.isLeaving) {
        const me = roomData.players.find(p => p.id === user.uid);

        if (me) {
          // User is in the room -> Done.
          this.isAutoJoining.set(false);
          this.showNamePrompt.set(false);
          this.isLoading.set(false);
        } else if (!this.isAutoJoining() && !this.sessionEnded()) { // Only show name prompt if session NOT ended
          // User NOT in room and NOT auto-joining -> Show Prompt.
          this.showNamePrompt.set(true);
          this.isLoading.set(false);
        }
        // If isAutoJoining() is true and !me, we STAY LOADING (waiting for write to reflect).
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id');

    if (!this.roomId) {
      this.router.navigate(['/']);
      return;
    }

    // Prefill name from localStorage and Auto-Join
    const savedName = localStorage.getItem('POKER_USER_NAME');
    if (savedName) {
      this.nameInput.set(savedName);
    }

    // Attempt to join/rejoin
    if (!this.gameService.currentRoomId()) {
      if (savedName) {
        this.isAutoJoining.set(true); // Suppress modal, show loader

        // Fallback timeout in case auto-join stalls
        setTimeout(() => {
          if (this.isAutoJoining()) {
            console.warn('Auto-join timed out, showing prompt.');
            this.isAutoJoining.set(false);
            // Effect will pick this up: isAutoJoining false + !me -> show prompt.
          }
        }, 4000);
      }

      this.gameService.joinRoom(this.roomId, savedName || undefined)
        .catch(err => {
          console.error('Join room failed', err);
          this.isAutoJoining.set(false);
        });
    }
  }

  // Flag to handle manual leave vs page unload
  isLeaving = false;

  // Session End Logic
  sessionEnded = signal(false);
  redirectCountdown = signal(10);
  private countdownInterval: any;

  async leaveRoom() {
    // Guard against multiple calls (e.g. double clicks or effect triggers)
    if (this.isLeaving) return;

    // Safety timeout to prevent getting stuck in loading state
    const loadingTimeout = setTimeout(() => {
      if (this.isLoading()) {
        console.warn('Leave room timed out, forcing navigation.');
        this.router.navigate(['/']);
      }
    }, 5000); // 5 seconds max

    // If Host, trigger End Session for everyone
    if (this.isHost()) {
      const roomState = this.gameService.currentRoomData();

      // If session is already ended, skip confirmation
      if (roomState?.status !== 'ended') {
        if (confirm('Are you sure you want to end the session? This will disconnect all players.')) {
          this.isLeaving = true;
          this.isLoading.set(true);

          try {
            await this.gameService.endSession(this.roomId!);
            // Host has already cleared players. 
            // Just clean up local state and leave.
            this.gameService.cleanupLocalGameState();
            clearTimeout(loadingTimeout);
            this.router.navigate(['/']);
            return;
          } catch (e) {
            console.error('Failed to end session', e);
            // Continue to standard leave logic if endSession failed totally
          }
        } else {
          clearTimeout(loadingTimeout);
          return; // Cancelled
        }
      }
    }

    this.isLeaving = true;
    this.isLoading.set(true);

    if (this.roomId && this.currentUser()) {
      try {
        await this.gameService.leaveRoom(this.roomId, this.currentUser()!.uid);
      } catch (e) {
        console.error('Error leaving room', e);
      }
    }
    clearTimeout(loadingTimeout);
    this.router.navigate(['/']);
  }

  triggerSessionEndedSequence() {
    this.sessionEnded.set(true);
    this.showNamePrompt.set(false); // Ensure modal is gone

    this.countdownInterval = setInterval(() => {
      const current = this.redirectCountdown();
      if (current > 0) {
        this.redirectCountdown.set(current - 1);
      } else {
        this.forceLeave();
      }
    }, 1000);
  }

  forceLeave() {
    clearInterval(this.countdownInterval);
    this.isLeaving = true;
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
    // Optimistic updates handled by server latency or could add local override later.
    // For now, rely on server source of truth to ensure reset works perfectly.
    this.gameService.vote(value);
  }

  revealVotes() {
    this.gameService.revealCards(true);
  }

  startNewRound() {
    this.gameService.resetVotes();
    // selectedValue auto-updates via computed
  }

  // --- Header & Story Editing Methods ---

  onRoomNameChange(newName: string) {
    this.currentRoomName.set(newName);
  }

  async saveRoomName() {
    if (!this.roomId || !this.isHost()) return;
    const name = this.currentRoomName().trim();
    if (name) {
      await this.gameService.updateRoomName(this.roomId, name);
    }
  }

  onStoryChange(newStory: string) {
    this.currentStory.set(newStory);
  }

  async saveCurrentStory() {
    if (!this.roomId || !this.isHost()) return;
    const story = this.currentStory();
    // Allow empty story to clear it
    await this.gameService.updateCurrentStory(this.roomId, story);
  }


  @HostListener('window:beforeunload')
  async onBeforeUnload() {
    if (!this.isLeaving && this.roomId && this.currentUser()) {
      await this.gameService.setPlayerStatus(this.roomId, this.currentUser()!.uid, 'Disconnected');
    }
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
    // Check isLeaving to avoid overwriting clean exit with "Disconnected"
    if (!this.isLeaving && this.roomId && this.currentUser()) {
      this.gameService.setPlayerStatus(this.roomId, this.currentUser()!.uid, 'Disconnected');
    }
    // Always clear local subscription/ID when component is destroyed so we re-init correctly on return
    this.gameService.cleanupLocalGameState();
  }

  copyInviteLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      // You might want a toast notification here instead of alert
      // alert('Invite link copied to clipboard!'); 
      console.log('Invite link copied');
    });
  }
}

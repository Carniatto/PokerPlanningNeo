import { Component, inject, OnInit, signal, effect, computed, OnDestroy, HostListener } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { ModalService } from '../services/modal.service';
import { ToastService } from '../services/toast.service';

import { VotingCardComponent } from '../components/voting-card/voting-card.component';
import { TaskDescriptionComponent } from '../components/task-description/task-description.component';
import { RoomHeaderComponent } from '../components/room-header/room-header.component';
import { RoomSidebarComponent } from '../components/room-sidebar/room-sidebar.component';
import { TaskListComponent } from '../components/task-list/task-list.component';

@Component({
  selector: 'app-room',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    VotingCardComponent,
    TaskDescriptionComponent,
    RoomHeaderComponent,
    RoomSidebarComponent,
    TaskListComponent
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
            <div class="main-content-inner">
              <app-room-header [roomId]="roomId || ''" 
                              [isHost]="true"
                              [roomName]="currentRoomName()"
                              [title]="areCardsRevealed() ? 'Revealed Results' : ''"
                              (roomNameChange)="onRoomNameChange($event)"
                              (nameBlur)="saveRoomName()"
                              (endSession)="leaveRoom()" 
                              (copyLink)="copyInviteLink()">
              </app-room-header>

              <app-task-description 
                  [isHost]="true"
                  [story]="currentStory()"
                  [tasks]="currentRoomTasks()"
                  [isFromList]="isCurrentStoryFromList()"
                  (storyChange)="onStoryChange($event)"
                  (storyBlur)="saveCurrentStory()">
              </app-task-description>

              <div class="voting-and-tasks-container">
                <div class="voting-cards-column">
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
                  } @else {
                    <!-- FINAL VOTES GRID -->
                    <section class="final-votes-section">
                      <div class="final-votes-header">
                        <h2>Final Votes</h2>
                      </div>
                      
                      <div class="grouped-cards-grid">
                        @for (group of groupedVotes(); track group.vote) {
                          <div class="final-vote-card-wrapper">
                            <div class="grouped-vote-card" [class]="getVoteClass(group.vote)">
                              <div class="vote-value-text">{{ group.vote || '-' }}</div>
                            </div>
                            <div class="avatar-stack">
                              @for (player of group.players.slice(0, 4); track player.id) {
                                <span class="stacked-avatar"
                                      [class.is-host]="isPlayerHost(player.id)"
                                      [class.is-current]="player.id === currentUser()?.uid"
                                      [attr.data-tooltip]="player.name">
                                  {{ getInitials(player.name) }}
                                </span>
                              }
                              @if (group.players.length > 4) {
                                <span class="overflow-count">+{{ group.players.length - 4 }}</span>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </section>
                  }
                </div>

                <div class="tasks-column">
                  <app-task-list
                    [roomId]="roomId || ''"
                    [isHost]="true"
                    [tasks]="currentRoomTasks()"
                    [currentStory]="currentStory()"
                    [currentTaskId]="currentTaskId()"
                    (selectTask)="selectTaskForEstimation($event)">
                  </app-task-list>
                </div>
              </div>

              <ng-container *ngTemplateOutlet="emulatorTemplate"></ng-container>
            </div>
          </main>

          <!-- Right Column: Host Sidebar (Direct child of flex container) -->
          <app-room-sidebar 
            [isHost]="true" 
            [players]="sortedPlayers()" 
            [areCardsRevealed]="areCardsRevealed()"
            [hasVotes]="hasVotes()"
            [currentUserId]="currentUser()?.uid"
            [votingValues]="votingValues"
            [isFromList]="isCurrentStoryFromList()"
            [nextTaskName]="nextTask()?.description || null"
            [hasActiveTask]="!!currentStory()"
            [confirmedEstimate]="confirmedEstimate()"
            (confirmedEstimateChange)="confirmedEstimate.set($event)"
            (reveal)="onRevealVotes()"
            (replay)="replayRound()"
            (saveAndContinue)="saveAndContinue()"
            (skip)="skipTask()">
          </app-room-sidebar>
        </div>
      }

      <!-- PLAYER VIEW -->
      @if (!isHost()) {
        <div class="player-layout">
          <div class="player-content-wrapper">
            <!-- Main Voting Area -->
            <main class="voting-area">
              <div class="main-content-inner">
                <app-room-header [roomId]="roomId || ''" 
                                [isHost]="false"
                                [roomName]="currentRoomName()"
                                [title]="areCardsRevealed() ? 'Revealed Results' : ''"
                                (endSession)="leaveRoom()" 
                                (copyLink)="copyInviteLink()">
                </app-room-header>

                <app-task-description 
                    [isHost]="false"
                    [story]="currentStory()"
                    [tasks]="currentRoomTasks()"
                    [isFromList]="isCurrentStoryFromList()">
                </app-task-description>

                <div class="voting-and-tasks-container">
                  <div class="voting-cards-column">
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
                    } @else {
                      <!-- FINAL VOTES GRID -->
                      <section class="final-votes-section">
                        <div class="final-votes-header">
                          <h2>Final Votes</h2>
                          <span class="average-badge">Average: {{ averageVote() }}</span>
                        </div>
                        
                        <div class="grouped-cards-grid">
                          @for (group of groupedVotes(); track group.vote) {
                            <div class="final-vote-card-wrapper">
                              <div class="grouped-vote-card" [class]="getVoteClass(group.vote)">
                                <div class="vote-value-text">{{ group.vote || '-' }}</div>
                              </div>
                              <div class="avatar-stack">
                                @for (player of group.players.slice(0, 4); track player.id) {
                                  <span class="stacked-avatar"
                                        [class.is-host]="isPlayerHost(player.id)"
                                        [class.is-current]="player.id === currentUser()?.uid"
                                        [attr.data-tooltip]="player.name">
                                    {{ getInitials(player.name) }}
                                  </span>
                                }
                                @if (group.players.length > 4) {
                                  <span class="overflow-count">+{{ group.players.length - 4 }}</span>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      </section>
                    }
                  </div>

                  <div class="tasks-column">
                    <app-task-list
                      [roomId]="roomId || ''"
                      [isHost]="false"
                      [tasks]="currentRoomTasks()"
                      [currentStory]="currentStory()"
                      [currentTaskId]="currentTaskId()"
                      (selectTask)="selectTaskForEstimation($event)">
                    </app-task-list>
                  </div>
                </div>

                <ng-container *ngTemplateOutlet="emulatorTemplate"></ng-container>
              </div>
            </main>

            <!-- Right Sidebar -->
            <app-room-sidebar 
               [isHost]="false"
               [players]="sortedPlayers()" 
               [areCardsRevealed]="areCardsRevealed()"
               [hasVotes]="hasVotes()"
               [currentUserId]="currentUser()?.uid"
               [hasActiveTask]="!!currentStory()">
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

      <!-- Emulator Template -->
      <ng-template #emulatorTemplate>
        <section class="emulator-panel glass-panel">
          <div class="emulator-header" (click)="toggleEmulator()">
            <div class="emulator-title-wrapper">
              <svg class="emulator-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: var(--neon-blue, #00f3ff);">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <h3>Local Player Emulator</h3>
              <span class="emulator-badge">Dev Tool</span>
            </div>
            <button class="btn-toggle-emulator">
              {{ isEmulatorExpanded() ? '▼ Collapse' : '▲ Expand' }}
            </button>
          </div>

          @if (isEmulatorExpanded()) {
            <div class="emulator-content">
              <div class="emulator-actions-top">
                <button class="btn-emulator-action" (click)="addQuickMockPlayers(5)">
                  + Add 5 Mock Players
                </button>
                <button class="btn-emulator-action btn-secondary" [disabled]="mockPlayers().length === 0" (click)="voteAllMockPlayersRandomly()">
                  🎲 Vote Randomly
                </button>
                <button class="btn-emulator-action btn-secondary" [disabled]="mockPlayers().length === 0" (click)="clearAllMockPlayerVotes()">
                  🧹 Clear Votes
                </button>
                <button class="btn-emulator-action btn-danger" [disabled]="mockPlayers().length === 0" (click)="removeAllMockPlayers()">
                  🗑️ Remove All
                </button>
              </div>

              <div class="mock-players-grid">
                @for (player of mockPlayers(); track player.id) {
                  <div class="mock-player-row">
                    <span class="mock-player-name">{{ player.name }}</span>
                    
                    <div class="mock-player-vote-actions">
                      <select [ngModel]="player.vote || ''" 
                              (ngModelChange)="submitMockVote(player.id, $event)"
                              class="mock-vote-select">
                        <option value="">No vote</option>
                        @for (val of votingValues; track val) {
                          <option [value]="val">{{ val }}</option>
                        }
                      </select>
                      <button class="btn-mock-delete" (click)="removeMockPlayer(player.id)" title="Remove player">
                        ✕
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="emulator-empty-state">
                    No mock players. Click "+ Add 5 Mock Players" to simulate a real estimation session!
                  </div>
                }
              </div>
            </div>
          }
        </section>
      </ng-template>
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
      width: 100%;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 2rem 3rem;
      overflow-y: auto;
      max-width: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    
    .main-content-inner {
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }

    .players-section, .deck-section {
      width: 100%;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 2rem;
    }

    .players-grid, .cards-row {
      justify-content: flex-start;
      width: 100%;
    }
        
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
      width: 100%;
      max-width: 100%;
    }

    .voting-area {
      flex: 1;
      padding: 3rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .task-header {
      width: 100%;
      max-width: 100%;
      text-align: left;
      margin-bottom: 3rem;
    }
    .status-text { color: #8892b0; font-size: 1.2rem; } 

    .voting-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1.5rem;
      width: 100%;
      max-width: 100%;
      justify-content: start;
    }

    .voting-and-tasks-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
    }

    .voting-cards-column {
      width: 100%;
    }

    .tasks-column {
      width: 100%;
    }

    /* WFHD AND ULTRAWIDE OPTIMIZATIONS (2560px and up) */
    @media (min-width: 2560px) {
      .main-content { padding: 3rem 5rem; }
      .voting-area { padding: 4rem 5rem; }
      .main-content-inner { max-width: 1800px; }
      .voting-grid, .final-votes-section { max-width: 1800px; }
      .final-votes-header h2, .deck-section h2 { font-size: 1.8rem; }

      .voting-and-tasks-container {
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 7fr);
        gap: 3rem;
        align-items: start;
      }
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
      
      .main-content-inner {
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
      
      .voting-and-tasks-container {
          order: 50;
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

    /* Final Votes Styles */
    .final-votes-section {
      width: 100%;
      max-width: 100%;
      margin-bottom: 2.5rem;
    }

    .final-votes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .final-votes-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: white;
    }

    .average-badge {
      background: rgba(34, 211, 238, 0.1);
      border: 1px solid rgba(34, 211, 238, 0.3);
      color: var(--neon-cyan);
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.5px;
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.1);
    }

    .grouped-cards-grid {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
      justify-content: flex-start;
      width: 100%;
    }

    .final-vote-card-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 110px;
    }

    .grouped-vote-card {
      background: rgba(17, 34, 64, 0.4);
      backdrop-filter: blur(12px);
      border: 2px solid var(--border-glass);
      border-radius: 12px;
      width: 110px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .grouped-vote-card:hover {
      transform: translateY(-5px);
    }

    .vote-small {
      border-color: rgba(96, 165, 250, 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(96, 165, 250, 0.15);
    }
    .vote-small .vote-value-text {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
    }

    .vote-medium {
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(168, 85, 247, 0.15);
    }
    .vote-medium .vote-value-text {
      color: #c084fc;
      text-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
    }

    .vote-large {
      border-color: rgba(249, 115, 22, 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(249, 115, 22, 0.15);
    }
    .vote-large .vote-value-text {
      color: #fb923c;
      text-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
    }

    .vote-xlarge {
      border-color: rgba(244, 63, 94, 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(244, 63, 94, 0.15);
    }
    .vote-xlarge .vote-value-text {
      color: #f43f5e;
      text-shadow: 0 0 10px rgba(244, 63, 94, 0.3);
    }

    .vote-special {
      border-color: rgba(217, 70, 239, 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(217, 70, 239, 0.15);
    }
    .vote-special .vote-value-text {
      color: #d946ef;
      text-shadow: 0 0 10px rgba(217, 70, 239, 0.3);
    }

    .vote-none {
      border: 2px dashed rgba(255, 255, 255, 0.15);
    }
    .vote-none .vote-value-text {
      color: rgba(255, 255, 255, 0.25);
    }

    .vote-value-text {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1;
    }

    .vote-player-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      margin-top: 0.75rem;
      width: 100%;
    }

    .player-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #1e293b;
      border: 1px solid #475569;
      color: #cbd5e1;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .player-avatar.is-host {
      background: #581c87;
      border-color: #a855f7;
      color: #f3e8ff;
    }

    .player-avatar.is-current {
      border-color: #22d3ee;
      box-shadow: 0 0 6px rgba(34, 211, 238, 0.4);
    }

    .player-name {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(100% - 24px);
    }

    /* ===== Avatar Stack (Grouped Votes) ===== */
    .avatar-stack {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      margin-top: 0.75rem;
      /* negative margin creates overlap effect */
    }

    .stacked-avatar {
      position: relative;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid #0a192f;
      color: #cbd5e1;
      font-size: 0.6rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: -8px;
      cursor: default;
      transition: transform 0.2s ease, z-index 0s;
      z-index: 1;
    }

    .stacked-avatar:first-child {
      margin-left: 0;
    }

    .stacked-avatar:hover {
      transform: translateY(-4px) scale(1.15);
      z-index: 10;
    }

    /* CSS Tooltip via data-tooltip attribute */
    .stacked-avatar::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(2, 12, 27, 0.92);
      color: #e2e8f0;
      font-size: 0.72rem;
      font-weight: 500;
      white-space: nowrap;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 100;
    }

    .stacked-avatar:hover::after {
      opacity: 1;
    }

    .stacked-avatar.is-host {
      background: #581c87;
      border-color: #a855f7;
      color: #f3e8ff;
    }

    .stacked-avatar.is-current {
      border-color: #22d3ee;
      box-shadow: 0 0 6px rgba(34, 211, 238, 0.4);
    }

    .overflow-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.15);
      color: #94a3b8;
      font-size: 0.6rem;
      font-weight: 700;
      margin-left: -8px;
      flex-shrink: 0;
    }

    /* Emulator Styles */
    .emulator-panel {
      margin-top: 3rem;
      width: 100%;
      border-radius: 12px;
      background: rgba(17, 34, 64, 0.4);
      border: 1px dashed rgba(0, 243, 255, 0.3);
      padding: 1rem 1.5rem;
      box-sizing: border-box;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .emulator-panel:hover {
      background: rgba(17, 34, 64, 0.5);
      border-color: rgba(0, 243, 255, 0.5);
      box-shadow: 0 0 15px rgba(0, 243, 255, 0.05);
    }

    .emulator-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .emulator-title-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .emulator-title-wrapper h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .emulator-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0, 243, 255, 0.15);
      color: var(--neon-blue, #00f3ff);
      border: 1px solid rgba(0, 243, 255, 0.3);
    }

    .btn-toggle-emulator {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .btn-toggle-emulator:hover {
      color: white;
      background: rgba(255, 255, 255, 0.05);
    }

    .emulator-content {
      margin-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .emulator-actions-top {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .btn-emulator-action {
      background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
      border: 1px solid rgba(0, 243, 255, 0.4);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-emulator-action:not(:disabled):hover {
      background: linear-gradient(135deg, rgba(0, 243, 255, 0.3), rgba(188, 19, 254, 0.3));
      border-color: rgba(0, 243, 255, 0.6);
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.15);
      transform: translateY(-1px);
    }

    .btn-emulator-action.btn-secondary {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
    }

    .btn-emulator-action.btn-secondary:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .btn-emulator-action.btn-danger {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .btn-emulator-action.btn-danger:not(:disabled):hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
      color: white;
    }

    .btn-emulator-action:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .mock-players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.75rem;
    }

    .mock-player-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .mock-player-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.08);
    }

    .mock-player-name {
      font-size: 0.9rem;
      color: #e2e8f0;
      font-weight: 500;
    }

    .mock-player-vote-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mock-vote-select {
      background: #020c1b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
      outline: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mock-vote-select:focus {
      border-color: var(--neon-blue, #00f3ff);
    }

    .btn-mock-delete {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 4px 6px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .btn-mock-delete:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .emulator-empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 1.5rem;
      color: #64748b;
      font-size: 0.9rem;
      border: 1px dashed rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
  `]
})
export class RoomComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);


  roomId: string | null = null;

  // Signals from Service
  players = this.gameService.players;
  isHost = this.gameService.isHost;
  currentUser = this.gameService.currentUser;
  areCardsRevealed = this.gameService.areCardsRevealed;

  currentRoomTasks = computed(() => this.gameService.currentRoomData()?.tasks || []);
  /** The task ID that is currently active for estimation (stored in Firestore) */
  currentTaskId = computed(() => this.gameService.currentRoomData()?.currentTaskId || null);
  hasVotes = computed(() => {
    return this.players().some(p => p.vote !== undefined && p.vote !== null);
  });

  // Local signals for editable fields
  currentRoomName = signal<string>('');
  currentStory = signal<string>('');

  // ── Estimation flow signals ──

  /** True when the current story text exactly matches a task in the list */
  isCurrentStoryFromList = computed(() => {
    const story = this.currentStory().trim();
    if (!story) return false;
    return this.currentRoomTasks().some(t => t.description.trim() === story);
  });

  /** Index of the currently active task within the sorted task list (by ID when available) */
  currentTaskIndex = computed(() => {
    const taskId = this.currentTaskId();
    const tasks = this.currentRoomTasks();
    if (taskId) {
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) return idx;
    }
    // fallback: match by description
    const story = this.currentStory().trim();
    if (!story) return -1;
    return tasks.findIndex(t => t.description.trim() === story);
  });

  /** The next task in the list that has not yet been estimated, or null if none */
  nextTask = computed(() => {
    const tasks = this.currentRoomTasks();
    const idx = this.currentTaskIndex();
    if (idx === -1) {
      // No active task from list – pick the first unestimated one
      return tasks.find(t => !t.finalEstimate) || null;
    }
    // Walk forward from the current task and find the next unestimated one
    for (let i = idx + 1; i < tasks.length; i++) {
      if (!tasks[i].finalEstimate) return tasks[i];
    }
    return null;
  });

  /** The host-confirmed estimate value (pre-filled with Fibonacci coercion when cards reveal) */
  confirmedEstimate = signal<string>('');

  /** Coerce an average to the nearest value available in the active deck (rounds up on tie) */
  getClosestVotingValue(avg: number): string {
    const numericOptions = this.votingValues
      .map(v => Number(v))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    if (numericOptions.length === 0) return String(Math.round(avg));

    let closest = numericOptions[0];
    let minDiff = Math.abs(avg - closest);
    for (let i = 1; i < numericOptions.length; i++) {
      const diff = Math.abs(avg - numericOptions[i]);
      // On exact tie, prefer the larger value (safety margin)
      if (diff < minDiff || (diff === minDiff && numericOptions[i] > closest)) {
        minDiff = diff;
        closest = numericOptions[i];
      }
    }
    return String(closest);
  }

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

  selectedValue = computed(() => {
    const user = this.currentUser();
    const players = this.players();
    if (!user || !players) return null;
    const me = players.find(p => p.id === user.uid);
    return me?.vote || null;
  });

  averageVote = computed(() => {
    const votes = this.players()
      .map(p => p.vote)
      .filter(v => v !== undefined && v !== null && v !== '?' && v !== '☕')
      .map(v => Number(v))
      .filter(n => !isNaN(n));
    if (votes.length === 0) return '-';
    return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
  });

  groupedVotes = computed(() => {
    const players = this.players();
    const groups: { [key: string]: typeof players } = {};
    players.forEach(p => {
      if (p.vote !== undefined && p.vote !== null) {
        const v = String(p.vote);
        if (!groups[v]) {
          groups[v] = [];
        }
        groups[v].push(p);
      }
    });

    const specialValues = ['?', '☕'];

    return Object.entries(groups)
      .map(([vote, groupPlayers]) => ({
        vote,
        count: groupPlayers.length,
        players: groupPlayers
      }))
      .sort((a, b) => {
        const aIsSpecial = specialValues.includes(a.vote);
        const bIsSpecial = specialValues.includes(b.vote);
        // Specials always go to the end
        if (aIsSpecial && !bIsSpecial) return 1;
        if (!aIsSpecial && bIsSpecial) return -1;
        if (aIsSpecial && bIsSpecial) return a.vote.localeCompare(b.vote);
        // Both numeric — ascending order
        return Number(a.vote) - Number(b.vote);
      });
  });

  getVoteClass(voteValue: string | number | undefined | null): string {
    if (voteValue === undefined || voteValue === null || voteValue === '') return 'vote-none';
    const n = Number(voteValue);
    if (isNaN(n)) return 'vote-special';
    if (n <= 1) return 'vote-small';
    if (n <= 3) return 'vote-medium';
    if (n <= 8) return 'vote-large';
    return 'vote-xlarge';
  }

  getInitials(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  isPlayerHost(playerId: string): boolean {
    const room = this.gameService.currentRoomData();
    if (!room) return false;
    return room.hostId === playerId || !!(room.hostIds && room.hostIds.includes(playerId));
  }

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
        const confirmed = await this.modalService.confirm(
          'End Session',
          'Are you sure you want to end the session? This will disconnect all players.',
          'End Session',
          'Cancel'
        );
        if (confirmed) {
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

  onRevealVotes() {
    // Coerce average to nearest deck value and pre-fill confirmedEstimate
    const votes = this.players()
      .map(p => p.vote)
      .filter(v => v !== undefined && v !== null && v !== '?' && v !== '☕')
      .map(v => Number(v))
      .filter(n => !isNaN(n));

    if (votes.length > 0) {
      const avg = votes.reduce((a, b) => a + b, 0) / votes.length;
      this.confirmedEstimate.set(this.getClosestVotingValue(avg));
    } else {
      this.confirmedEstimate.set('');
    }

    this.gameService.revealCards(true);
  }

  revealVotes() {
    this.gameService.revealCards(true);
  }

  startNewRound() {
    this.gameService.resetVotes();
    // selectedValue auto-updates via computed
  }

  replayRound() {
    this.gameService.resetVotes();
  }

  /**
   * Save the confirmed estimate for the current story and automatically advance
   * to the next unestimated task in the list, or clear the story if none remain.
   * Uses the host's confirmedEstimate signal (pre-filled with Fibonacci coercion).
   */
  async saveAndContinue() {
    if (!this.roomId) return;

    const storyDesc = this.currentStory().trim();
    const finalEstimate = this.confirmedEstimate();

    await this.gameService.estimateNewTask(this.roomId, storyDesc, finalEstimate, this.currentTaskId());

    const next = this.nextTask();
    if (next) {
      await this.gameService.updateCurrentStory(this.roomId, next.description, next.id);
    }
  }

  async skipTask() {
    if (!this.roomId) return;
    await this.gameService.resetVotes();
    const next = this.nextTask();
    if (next) {
      await this.gameService.updateCurrentStory(this.roomId, next.description, next.id);
    } else {
      await this.gameService.updateCurrentStory(this.roomId, '', null);
    }
  }

  async selectTaskForEstimation(task: any) {
    if (!this.roomId) return;
    if (task) {
      await this.gameService.updateCurrentStory(this.roomId, task.description, task.id);
    } else {
      await this.gameService.updateCurrentStory(this.roomId, '', null);
    }
    this.gameService.resetVotes();
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

  isEmulatorExpanded = signal<boolean>(false);

  mockPlayers = computed(() => {
    return this.players().filter(p => p.id.startsWith('mock-'));
  });

  toggleEmulator() {
    this.isEmulatorExpanded.set(!this.isEmulatorExpanded());
  }

  async addQuickMockPlayers(count: number) {
    if (!this.roomId) return;
    const names = ['Developer 💻', 'Designer 🎨', 'QA Engineer 🔍', 'Product Owner 👑', 'Scrum Master ⏱️', 'Architect 🏛️', 'Security Specialist 🛡️', 'Database Admin 🗄️'];
    const shuffle = [...names].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
      const name = shuffle[i % shuffle.length] + ' ' + (this.mockPlayers().length + 1);
      await this.gameService.addMockPlayer(this.roomId, name);
    }
  }

  async removeMockPlayer(mockId: string) {
    if (!this.roomId) return;
    await this.gameService.removeMockPlayer(this.roomId, mockId);
  }

  async removeAllMockPlayers() {
    if (!this.roomId) return;
    for (const player of this.mockPlayers()) {
      await this.gameService.removeMockPlayer(this.roomId, player.id);
    }
  }

  async submitMockVote(mockId: string, vote: string) {
    if (!this.roomId) return;
    const voteVal = vote === '' ? null : vote;
    await this.gameService.submitMockVote(this.roomId, mockId, voteVal);
  }

  async voteAllMockPlayersRandomly() {
    if (!this.roomId) return;
    for (const player of this.mockPlayers()) {
      const randomVote = this.votingValues[Math.floor(Math.random() * this.votingValues.length)];
      await this.gameService.submitMockVote(this.roomId, player.id, randomVote);
    }
  }

  async clearAllMockPlayerVotes() {
    if (!this.roomId) return;
    for (const player of this.mockPlayers()) {
      await this.gameService.submitMockVote(this.roomId, player.id, null);
    }
  }

  copyInviteLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('Invite link copied to clipboard!');
    });
  }
}

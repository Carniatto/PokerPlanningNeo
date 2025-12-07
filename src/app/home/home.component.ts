import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      
      @if (errorMessage) {
        <div class="error-banner">
          <span class="material-icons">error_outline</span>
          <span>{{ errorMessage }}</span>
          <button class="close-btn" (click)="clearError()">
             <span class="material-icons">close</span>
          </button>
        </div>
      }

      <div class="hero-text">
        <h1>Welcome to the Planning<br><span class="text-gradient">Lobby</span></h1>
        <p>Enter your name to get started, then create a new room or<br>join an existing one.</p>
      </div>

      <div class="card glass-panel">
        <div class="form-group">
          <label>Your Name</label>
          <input type="text" name="name" [(ngModel)]="userName" placeholder="Enter Your Name" autocomplete="off">
        </div>

        <button class="btn-neo-primary" (click)="createRoom()" [disabled]="!userName">
          Create New Room
        </button>

        <div class="divider">
          <span>OR</span>
        </div>

        <div class="form-group">
          <label>Room Code</label>
          <input type="text" [(ngModel)]="roomCode" placeholder="Enter Room Code" autocomplete="off">
        </div>

        <button class="btn-neo" (click)="joinRoom()" [disabled]="!userName || !roomCode">
          Join Room
        </button>
      </div>
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  userName = '';
  roomCode = '';
  errorMessage: string | null = null;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);

  ngOnInit() {
    const savedName = localStorage.getItem('POKER_USER_NAME');
    if (savedName) {
      this.userName = savedName;
    }

    // Check for errors
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'room_not_found') {
        this.errorMessage = "The room you tried to access does not exist.";
        this.roomCode = ''; // Clear the input
        // Auto-clear after 5 seconds
        setTimeout(() => this.clearError(), 5000);
      }
    });
  }

  clearError() {
    this.errorMessage = null;
    // Clear query param without navigation reload
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { error: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  async createRoom() {
    if (!this.userName) return;

    try {
      const roomId = await this.gameService.createRoom(this.userName);
      this.router.navigate(['/room', roomId]);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  }

  async joinRoom() {
    if (!this.userName || !this.roomCode) return;

    try {
      await this.gameService.joinRoom(this.roomCode, this.userName);
      this.router.navigate(['/room', this.roomCode]);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }
}

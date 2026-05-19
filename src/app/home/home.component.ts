import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, Field, FormField } from '@angular/forms/signals';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, FormField],
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
          <input type="text" [formField]="homeForm.name" placeholder="Enter Your Name" autocomplete="off">
        </div>

        <button class="btn-neo-primary" (click)="createRoom()" [disabled]="formModel().name === ''">
          Create New Room
        </button>

        <div class="divider">
          <span>OR</span>
        </div>

        <div class="form-group">
          <label>Room Code</label>
          <input type="text" [formField]="homeForm.roomCode" placeholder="Enter Room Code" autocomplete="off">
        </div>

        <button class="btn-neo" (click)="joinRoom()" [disabled]="formModel().name === '' || formModel().roomCode === ''">
          Join Room
        </button>
      </div>
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  formModel = signal({
    name: '',
    roomCode: ''
  });
  homeForm = form(this.formModel);

  errorMessage: string | null = null;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);

  ngOnInit() {
    const savedName = localStorage.getItem('POKER_USER_NAME');
    if (savedName) {
      this.formModel.update(v => ({ ...v, name: savedName }));
    }

    // Check for errors
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'room_not_found') {
        this.errorMessage = "The room you tried to access does not exist.";
        this.formModel.update(v => ({ ...v, roomCode: '' })); // Clear the input
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
    const name = this.formModel().name;
    if (!name) return;

    try {
      const roomId = await this.gameService.createRoom(name);
      this.router.navigate(['/room', roomId]);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  }

  async joinRoom() {
    const { name, roomCode } = this.formModel();
    if (!name || !roomCode) return;

    try {
      await this.gameService.joinRoom(roomCode, name);
      this.router.navigate(['/room', roomCode]);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }
}

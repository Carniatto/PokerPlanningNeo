import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { GameService } from '../../game.service';

@Component({
  selector: 'neo-timer',
  imports: [],
  template: `
    <div class="timer-container" [class.active]="isActive()">
      @if (isActive()) {
        <div class="timer-display" [class.warning]="timeLeft() <= 10">
          <span class="timer-icon">⏳</span>
          <span class="time">{{ formattedTime() }}</span>
          @if (isHost()) {
            <button (click)="stopTimer()" class="btn-timer-stop" title="Stop Timer">✕</button>
          }
        </div>
      } @else if (isHost()) {
        <div class="timer-controls">
          <span class="timer-label">Timebox:</span>
          <button (click)="startTimer(30)" class="btn-timer-preset">30s</button>
          <button (click)="startTimer(60)" class="btn-timer-preset">1m</button>
          <button (click)="startTimer(90)" class="btn-timer-preset">1.5m</button>
        </div>
      }
    </div>
  `,
  styleUrl: './timer.component.css'
})
export class TimerComponent implements OnDestroy {
  private gameService = inject(GameService);
  
  isHost = this.gameService.isHost;
  roomId = this.gameService.currentRoomId;
  roomData = this.gameService.currentRoomData;
  
  timeLeft = signal<number>(0);
  private timerInterval?: any;

  isActive = computed(() => {
    const data = this.roomData();
    return !!(data && data.timerEndsAt && data.timerEndsAt > Date.now());
  });

  formattedTime = computed(() => {
    const totalSecs = this.timeLeft();
    if (totalSecs <= 0) return '0:00';
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  });

  constructor() {
    effect(() => {
      const data = this.roomData();
      if (data && data.timerEndsAt) {
        this.startLocalCountdown(data.timerEndsAt);
      } else {
        this.clearLocalCountdown();
      }
    });
  }

  private startLocalCountdown(endsAt: number) {
    this.clearLocalCountdown();
    const update = () => {
      const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      this.timeLeft.set(remaining);
      if (remaining <= 0) {
        this.clearLocalCountdown();
      }
    };
    update();
    this.timerInterval = setInterval(update, 1000);
  }

  private clearLocalCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.timeLeft.set(0);
  }

  async startTimer(seconds: number) {
    const id = this.roomId();
    if (id) {
      await this.gameService.setTimer(id, seconds);
    }
  }

  async stopTimer() {
    const id = this.roomId();
    if (id) {
      await this.gameService.setTimer(id, null);
    }
  }

  ngOnDestroy() {
    this.clearLocalCountdown();
  }
}

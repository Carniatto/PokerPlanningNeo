import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="content-header">
      <div class="title-section">
        <h1>Project Phoenix - Sprint 1</h1>
        <div class="room-info">
          <span class="room-code">Room Code: <strong>{{ roomId() }}</strong></span>
          <a href="javascript:void(0)" (click)="onCopyLink()" class="invite-link">🔗 Copy Invite Link</a>
        </div>
      </div>
      @if (isHost()) {
        <button class="btn-end-session" (click)="onEndSession()">End Session</button>
      } @else {
        <button class="btn-end-session" (click)="onEndSession()">Leave Room</button>
      }
    </header>
  `,
  styleUrl: './room-header.component.css'
})
export class RoomHeaderComponent {
  roomId = input.required<string>();
  isHost = input<boolean>(false);
  endSession = output<void>();
  copyLink = output<void>();

  onEndSession() {
    this.endSession.emit();
  }

  onCopyLink() {
    this.copyLink.emit();
  }
}

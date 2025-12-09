import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="content-header">
      <div class="title-section">
        @if (isHost()) {
          <div class="editable-title-wrapper">
             <input class="editable-title" 
                   [ngModel]="roomName()" 
                   (ngModelChange)="onNameChange($event)"
                   (blur)="onNameBlur()"
                   (keyup.enter)="onNameBlur()"
                   placeholder="Enter Room Name">
              <span class="edit-icon">✎</span>
          </div>
        } @else {
          <h1>{{ roomName() || 'Planning Session' }}</h1>
        }
        <div class="room-info">
          <span class="room-code">Room Code: <strong>{{ roomId() }}</strong></span>
          <a href="javascript:void(0)" (click)="onCopyLink()" class="invite-link">
            <span class="link-icon">🔗</span>
            <span class="link-text">Copy Invite Link</span>
          </a>
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
  roomName = input<string>(''); // Received from parent

  roomNameChange = output<string>(); // Emit changes to parent
  endSession = output<void>();
  copyLink = output<void>();

  onEndSession() {
    this.endSession.emit();
  }

  onCopyLink() {
    this.copyLink.emit();
  }

  onNameChange(newName: string) {
    // Just emit, parent handles debouncing or immediate save if desired
    // But for Firestore partial updates, we usually save on blur to avoid too many writes
    // We can emit immediate updates for local UI responsiveness if parent handles it
    // Let's assume parent updates local signal immediately, and saves on debounce or we handle save signal separate
    // Simpler approach: update local UI via parent signal, save on blur.
    // So we emit the change so parent syncs local state.
    this.roomNameChange.emit(newName);
  }

  // Optional: distinct event for "done editing" if we want to save then
  // For now, let's just rely on the change event or add a specific "save" output if needed.
  // Actually, standard pattern: Parent holds state. We emit changes. Parent decides when to save.
  // But to avoid writing to DB on every keystroke, we might need a separate "save" event or handle it in parent.
  // Let's stick to emitting changes, but maybe the parent should debounce?
  // Use case: Real-time typing vs explicit save.
  // Let's emit a 'nameBlur' event for the save trigger.

  nameBlur = output<void>();

  onNameBlur() {
    this.nameBlur.emit();
  }
}

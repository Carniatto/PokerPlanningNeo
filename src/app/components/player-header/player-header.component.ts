import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="player-header">
      <div class="header-actions">
        <button class="btn-icon">🔔</button>
        <div class="user-avatar-small">{{ userName().charAt(0) }}</div>
      </div>
    </header>
  `,
  styleUrl: './player-header.component.css'
})
export class PlayerHeaderComponent {
  userName = input.required<string>();
}

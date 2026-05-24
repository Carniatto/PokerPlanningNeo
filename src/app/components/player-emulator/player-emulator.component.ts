import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../game.service';

@Component({
  selector: 'neo-player-emulator',
  imports: [FormsModule],
  templateUrl: './player-emulator.component.html',
  styleUrl: './player-emulator.component.css'
})
export class PlayerEmulatorComponent {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);

  roomId = this.route.snapshot.paramMap.get('id');
  players = this.gameService.players;

  votingValues = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];
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
}

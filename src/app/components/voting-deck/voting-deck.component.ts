import { Component, inject, computed } from '@angular/core';
import { GameService } from '../../game.service';
import { VotingCardComponent } from '../voting-card/voting-card.component';

@Component({
  selector: 'neo-voting-deck',
  imports: [VotingCardComponent],
  templateUrl: './voting-deck.component.html',
  styleUrl: './voting-deck.component.css'
})
export class VotingDeckComponent {
  private gameService = inject(GameService);

  isHost = this.gameService.isHost;
  players = this.gameService.players;
  currentUser = this.gameService.currentUser;
  areCardsRevealed = this.gameService.areCardsRevealed;

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
        if (aIsSpecial && !bIsSpecial) return 1;
        if (!aIsSpecial && bIsSpecial) return -1;
        if (aIsSpecial && bIsSpecial) return a.vote.localeCompare(b.vote);
        return Number(a.vote) - Number(b.vote);
      });
  });

  selectVote(value: string) {
    this.gameService.vote(value);
  }

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
}

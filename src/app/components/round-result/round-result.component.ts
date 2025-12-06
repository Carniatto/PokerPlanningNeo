import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../game.service';

@Component({
  selector: 'app-round-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="round-result-card glass-panel-inset">
      @if (consensus()) {
          <div class="particles-container">
            <div class="particle p1"></div>
            <div class="particle p2"></div>
            <div class="particle p3"></div>
            <div class="particle p4"></div>
            <div class="particle p5"></div>
          </div>
      }
      
      <h3>Round Result</h3>
      <div class="result-value" [class.consensus]="consensus()">
        {{ stats().consensus }}
      </div> 
      
      <div class="result-stats">
        <div class="stat">
          <span class="label">Avg</span>
          <span class="value">{{ stats().average }}</span>
        </div>
        <div class="stat">
          <span class="label">Min</span>
          <span class="value">{{ stats().min }}</span>
        </div>
        <div class="stat">
          <span class="label">Max</span>
          <span class="value">{{ stats().max }}</span>
        </div>
      </div>
      
      @if (isHost()) {
          <button class="btn-primary" (click)="onNextRound()">Start Next Round</button>
      }
    </div>
  `,
  styles: [`
    .round-result-card {
      background: linear-gradient(rgba(17, 34, 64, 0.95), rgba(17, 34, 64, 0.95)) padding-box,
                  linear-gradient(135deg, #22d3ee 0%, #e879f9 100%) border-box;
      border: 2px solid transparent;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      margin-top: auto;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), 
                  0 0 20px rgba(34, 211, 238, 0.2), /* Cyan glow */
                  0 0 40px rgba(232, 121, 249, 0.1); /* Pink glow */
    }

    h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .result-value {
      font-size: 5rem;
      font-weight: 900;
      margin: 1rem 0 2rem;
      background: linear-gradient(to right, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
      transition: all 0.5s ease;
    }

    .result-value.consensus {
      background: linear-gradient(135deg, #22d3ee 0%, #e879f9 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5));
      transform: scale(1.1);
      animation: pulse-glow 2s infinite;
    }

    @keyframes pulse-glow {
      0% { filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5)); }
      50% { filter: drop-shadow(0 0 30px rgba(232, 121, 249, 0.6)); }
      100% { filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5)); }
    }

    .result-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat .label {
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat .value {
      font-weight: 700;
      font-size: 1.2rem;
      color: white;
    }

    .btn-primary {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.2s;
      font-size: 1rem;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }

    /* --- Simple Particle Effects --- */
    .particles-container {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none;
        z-index: 0;
    }

    .particle {
        position: absolute;
        width: 6px; height: 6px;
        background: #3b82f6;
        border-radius: 50%;
        opacity: 0;
    }

    .p1 { top: 50%; left: 50%; animation: particle-explode-1 1s ease-out forwards; }
    .p2 { top: 50%; left: 50%; animation: particle-explode-2 1.2s ease-out forwards; }
    .p3 { top: 50%; left: 50%; animation: particle-explode-3 0.8s ease-out forwards; }
    .p4 { top: 50%; left: 50%; animation: particle-explode-4 1.1s ease-out forwards; }
    .p5 { top: 50%; left: 50%; animation: particle-explode-5 0.9s ease-out forwards; }

    @keyframes particle-explode-1 { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(-100px, -100px); opacity: 0; } }
    @keyframes particle-explode-2 { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(100px, -80px); opacity: 0; } }
    @keyframes particle-explode-3 { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(-80px, 100px); opacity: 0; } }
    @keyframes particle-explode-4 { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(80px, 80px); opacity: 0; } }
    @keyframes particle-explode-5 { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(0px, -120px); opacity: 0; } }
  `]
})
export class RoundResultComponent {
  isHost = input(false);
  players = input.required<Player[]>();
  nextRound = output<void>();

  stats = computed(() => {
    const votes = this.players()
      .map(p => p.vote)
      .filter(v => v !== undefined && v !== null && v !== '?' && v !== '☕')
      .map(v => Number(v))
      .filter(n => !isNaN(n));

    if (votes.length === 0) {
      return { average: '-', min: '-', max: '-', consensus: '?' };
    }

    const sum = votes.reduce((a, b) => a + b, 0);
    const avg = (sum / votes.length).toFixed(1);
    const min = Math.min(...votes);
    const max = Math.max(...votes);

    // Consensus: Only if all players (numeric votes) have the same value
    const allSame = votes.every(v => v === votes[0]);
    const consensus = allSame ? votes[0] : avg;

    return { average: avg, min, max, consensus };
  });

  consensus = computed(() => {
    const votes = this.players()
      .map(p => p.vote)
      .filter(v => v !== undefined && v !== null && v !== '?' && v !== '☕')
      .map(v => Number(v))
      .filter(n => !isNaN(n));

    if (votes.length < 2) return false;
    return votes.every(v => v === votes[0]);
  });

  onNextRound() {
    this.nextRound.emit();
  }
}

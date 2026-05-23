import { Component, input, output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { Player } from '../../game.service';

/**
 * Unified session control panel for the host sidebar.
 * Replaces the old host-controls + round-result split.
 *
 * States:
 *   • Voting (areCardsRevealed=false) – shows live vote count, Reveal Votes CTA, Replay link
 *   • Results (areCardsRevealed=true)  – shows stats, estimate chip-picker, Save & Continue CTA
 */
@Component({
  selector: 'app-round-result',
  imports: [FormsModule, IconComponent],
  template: `
    <div [class]="cardClass()">

      @if (consensus() && areCardsRevealed()) {
        <div class="particles-container">
          <div class="particle p1"></div>
          <div class="particle p2"></div>
          <div class="particle p3"></div>
          <div class="particle p4"></div>
          <div class="particle p5"></div>
        </div>
      }

      <!-- ── STATE: VOTING IN PROGRESS ── -->
      @if (!areCardsRevealed()) {
        <div class="voting-state">
          <div class="voting-header">
            <span class="state-label">Voting in progress</span>
            <span class="vote-count">{{ votedCount() }} / {{ players().length }}</span>
          </div>

          <!-- Mini player dots -->
          <div class="player-dots">
            @for (p of players(); track p.id) {
              <div
                class="player-dot"
                [class.voted]="p.vote !== null && p.vote !== undefined"
                [attr.title]="p.name"
              ></div>
            }
          </div>

          @if (isHost()) {
            <button
              class="btn-reveal"
              [disabled]="!hasVotes()"
              (click)="reveal.emit()"
            >
              REVEAL VOTES
            </button>

            <button class="btn-link replay-link" (click)="replay.emit()">
              <app-icon name="replay" size="small" class="btn-icon"></app-icon>
              Replay Round
            </button>
          }
        </div>
      }

      <!-- ── STATE: RESULTS ── -->
      @if (areCardsRevealed()) {
        <div class="results-state">
          <div class="result-value-wrap">
            <span class="result-label">Result</span>
            <div class="result-value" [class.consensus]="consensus()">
              {{ stats().consensus }}
            </div>
          </div>

          <div class="result-stats">
            <div class="stat">
              <span class="label">Avg</span>
              <span class="value">{{ stats().average }}</span>
            </div>
            <div class="stat">
              <span class="label">Spread</span>
              <span class="value">{{ stats().spread }}</span>
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

          @if (isHost() && hasActiveTask()) {
            <!-- Confirmation chip-picker -->
            <div class="host-confirmation-area">
              <label class="confirm-label">Confirm Estimate</label>
              <div class="select-row">
                @for (val of numericVotingValues(); track val) {
                  <button
                    class="estimate-chip"
                    [class.selected]="confirmedEstimate() === val"
                    (click)="onChipClick(val)"
                  >{{ val }}</button>
                }
                <button
                  class="estimate-chip estimate-chip-none"
                  [class.selected]="confirmedEstimate() === ''"
                  (click)="onChipClick('')"
                >—</button>
              </div>

              <button class="btn-save-continue" (click)="saveAndContinue.emit()">
                {{ primaryButtonText() }}
              </button>

              <div class="host-action-links">
                <button class="btn-link" (click)="replay.emit()">Replay Round</button>
                @if (isFromList()) {
                  <span class="link-divider">|</span>
                  <button class="btn-link btn-danger-link" (click)="skip.emit()">Skip Task</button>
                }
              </div>
            </div>
          } @else if (isHost()) {
            <button class="btn-save-continue btn-neutral" (click)="replay.emit()">
              Start Next Round
            </button>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Base card ── */
    :host { display: block; }

    .round-result-card {
      background: linear-gradient(rgba(17, 34, 64, 0.95), rgba(17, 34, 64, 0.95)) padding-box,
                  linear-gradient(135deg, #94a3b8 0%, #475569 100%) border-box;
      border: 2px solid transparent;
      border-radius: 16px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      transition: background 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .round-result-card.gap-none {
      background: linear-gradient(rgba(17, 34, 64, 0.95), rgba(17, 34, 64, 0.95)) padding-box,
                  linear-gradient(135deg, #22d3ee 0%, #e879f9 100%) border-box;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1),
                  0 0 20px rgba(34, 211, 238, 0.2),
                  0 0 40px rgba(232, 121, 249, 0.1);
    }
    .round-result-card.gap-small {
      background: linear-gradient(rgba(17, 34, 64, 0.95), rgba(17, 34, 64, 0.95)) padding-box,
                  linear-gradient(135deg, #10b981 0%, #059669 100%) border-box;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(16, 185, 129, 0.2);
    }
    .round-result-card.gap-medium {
      background: linear-gradient(rgba(17, 34, 64, 0.95), rgba(17, 34, 64, 0.95)) padding-box,
                  linear-gradient(135deg, #f59e0b 0%, #d97706 100%) border-box;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(245, 158, 11, 0.2);
    }
    .round-result-card.gap-large {
      background: linear-gradient(rgba(17, 34, 64, 0.95), rgba(17, 34, 64, 0.95)) padding-box,
                  linear-gradient(135deg, #ef4444 0%, #dc2626 100%) border-box;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(239, 68, 68, 0.3);
    }

    /* ── Voting state ── */
    .voting-state {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .voting-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .state-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.45);
      font-weight: 600;
    }

    .vote-count {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--neon-blue, #00f3ff);
    }

    .player-dots {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      padding: 0.25rem 0;
    }

    .player-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .player-dot.voted {
      background: var(--neon-blue, #00f3ff);
      border-color: var(--neon-blue, #00f3ff);
      box-shadow: 0 0 6px rgba(0, 243, 255, 0.6);
    }

    .btn-reveal {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, var(--neon-blue, #00f3ff) 0%, var(--neon-purple, #bc13fe) 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-reveal:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }

    .btn-reveal:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 243, 255, 0.35);
    }

    .replay-link {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      justify-content: center;
      font-size: 0.78rem;
      margin-top: -0.25rem;
    }

    .btn-icon {
      width: 14px;
      height: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
    }

    /* ── Results state ── */
    .results-state {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: center;
    }

    .result-value-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .result-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.45);
    }

    .result-value {
      font-size: 4rem;
      font-weight: 900;
      background: linear-gradient(to right, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
      transition: all 0.5s ease;
      line-height: 1;
    }

    .result-value.consensus {
      background: linear-gradient(135deg, #22d3ee 0%, #e879f9 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5));
      transform: scale(1.05);
      animation: pulse-glow 2s infinite;
    }

    @keyframes pulse-glow {
      0%   { filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5)); }
      50%  { filter: drop-shadow(0 0 30px rgba(232, 121, 249, 0.6)); }
      100% { filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5)); }
    }

    .result-stats {
      display: flex;
      justify-content: space-around;
      padding: 1rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .stat .label {
      font-size: 0.72rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat .value {
      font-weight: 700;
      font-size: 1.1rem;
      color: white;
    }

    /* ── Confirmation area ── */
    .host-confirmation-area {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .confirm-label {
      display: block;
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.45);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.1rem;
    }

    .select-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      justify-content: center;
    }

    .estimate-chip {
      padding: 0.28rem 0.6rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .estimate-chip:hover {
      border-color: var(--neon-blue, #00f3ff);
      color: var(--neon-blue, #00f3ff);
      background: rgba(0, 243, 255, 0.08);
    }

    .estimate-chip.selected {
      background: rgba(0, 243, 255, 0.2);
      border-color: var(--neon-blue, #00f3ff);
      color: var(--neon-blue, #00f3ff);
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.25);
    }

    .estimate-chip-none { color: rgba(255, 255, 255, 0.3); }
    .estimate-chip-none.selected {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.5);
      box-shadow: none;
    }

    .btn-save-continue {
      width: 100%;
      padding: 0.8rem;
      background: linear-gradient(135deg, var(--neon-blue, #00f3ff) 0%, var(--neon-purple, #bc13fe) 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.875rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      transition: all 0.2s;
    }

    .btn-save-continue:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 243, 255, 0.35);
    }

    .btn-save-continue:active { transform: translateY(0); }

    .btn-save-continue.btn-neutral {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .host-action-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.6rem;
    }

    .link-divider {
      color: rgba(255, 255, 255, 0.2);
      font-size: 0.85rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.78rem;
      cursor: pointer;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      transition: color 0.2s;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .btn-link:hover { color: rgba(255, 255, 255, 0.8); }
    .btn-danger-link:hover { color: #f87171; }

    /* ── Particles ── */
    .particles-container {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0;
    }
    .particle {
      position: absolute; width: 6px; height: 6px;
      background: #3b82f6; border-radius: 50%; opacity: 0;
    }
    .p1 { top: 50%; left: 50%; animation: pe1 1s ease-out forwards; }
    .p2 { top: 50%; left: 50%; animation: pe2 1.2s ease-out forwards; }
    .p3 { top: 50%; left: 50%; animation: pe3 0.8s ease-out forwards; }
    .p4 { top: 50%; left: 50%; animation: pe4 1.1s ease-out forwards; }
    .p5 { top: 50%; left: 50%; animation: pe5 0.9s ease-out forwards; }
    @keyframes pe1 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-100px,-100px);opacity:0} }
    @keyframes pe2 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(100px,-80px);opacity:0} }
    @keyframes pe3 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-80px,100px);opacity:0} }
    @keyframes pe4 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(80px,80px);opacity:0} }
    @keyframes pe5 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(0,-120px);opacity:0} }

    @media (max-width: 768px) {
      .round-result-card { padding: 1rem; border-radius: 12px; }
      .result-value { font-size: 3rem; }
      .estimate-chip { padding: 0.25rem 0.5rem; font-size: 0.78rem; }
    }
  `]
})
export class RoundResultComponent {
  isHost = input(false);
  players = input.required<Player[]>();
  areCardsRevealed = input(false);
  hasVotes = input(false);
  votingValues = input<string[]>(['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕']);
  isFromList = input<boolean>(false);
  nextTaskName = input<string | null>(null);
  hasActiveTask = input<boolean>(false);
  confirmedEstimate = input<string>('');

  saveAndContinue = output<void>();
  skip = output<void>();
  replay = output<void>();
  reveal = output<void>();
  confirmedEstimateChange = output<string>();

  onChipClick(val: string) {
    this.confirmedEstimateChange.emit(val);
  }

  numericVotingValues = computed(() =>
    this.votingValues().filter(v => v !== '?' && v !== '☕')
  );

  votedCount = computed(() =>
    this.players().filter(p => p.vote !== null && p.vote !== undefined).length
  );

  primaryButtonText = computed(() => {
    if (this.isFromList()) {
      return this.nextTaskName() ? 'Save & Estimate Next' : 'Save Estimate';
    }
    return 'Save & Start New';
  });

  cardClass = computed(() => {
    if (!this.areCardsRevealed()) return 'round-result-card';
    return 'round-result-card ' + this.stats().gapClass;
  });

  stats = computed(() => {
    const votes = this.players()
      .map(p => p.vote)
      .filter(v => v !== undefined && v !== null && v !== '?' && v !== '☕')
      .map(v => Number(v))
      .filter(n => !isNaN(n));

    if (votes.length === 0) {
      return { average: '-', min: '-', max: '-', spread: '-', consensus: '?', gapClass: 'gap-unknown' };
    }

    const sum = votes.reduce((a, b) => a + b, 0);
    const avg = (sum / votes.length).toFixed(1);
    const min = Math.min(...votes);
    const max = Math.max(...votes);
    const spread = max - min;

    let gapClass = 'gap-small';
    if (spread === 0) gapClass = 'gap-none';
    else if (spread <= 2) gapClass = 'gap-small';
    else if (spread <= 5) gapClass = 'gap-medium';
    else gapClass = 'gap-large';

    const allSame = votes.every(v => v === votes[0]);
    const consensus = allSame ? votes[0] : avg;

    return { average: avg, min, max, spread, consensus, gapClass };
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
}

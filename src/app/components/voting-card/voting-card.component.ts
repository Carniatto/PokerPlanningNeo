import { Component, input, output, computed } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-voting-card',
    imports: [IconComponent],
    template: `
    <div [class]="'vote-card ' + voteClass()" 
         [class.selected]="selected()"
         [class.small]="size() === 'small'"
         (click)="onSelect()">
        
        @if (value() === '☕') {
          <div class="icon-wrapper" 
               [style.--coffee-stroke]="selected() ? 'var(--card-color)' : 'rgba(255, 255, 255, 0.35)'">
             <app-icon name="coffee" size="full"></app-icon>
          </div>
        } @else {
          <svg class="card-content" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#e879f9;stop-opacity:1" />
                </linearGradient>
              </defs>
              <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" class="svg-value">
                {{ value() }}
              </text>
          </svg>
        }
    </div>
  `,
    styleUrl: './voting-card.component.css'
})
export class VotingCardComponent {
  value = input.required<string>();
  size = input<'normal' | 'small'>('normal');
  selected = input(false);
  select = output<string>();

  voteClass = computed(() => {
    const val = this.value();
    if (val === undefined || val === null || val === '') return 'vote-none';
    const n = Number(val);
    if (isNaN(n)) return 'vote-special';
    if (n <= 1) return 'vote-small';
    if (n <= 3) return 'vote-medium';
    if (n <= 8) return 'vote-large';
    return 'vote-xlarge';
  });

  onSelect() {
    this.select.emit(this.value());
  }
}

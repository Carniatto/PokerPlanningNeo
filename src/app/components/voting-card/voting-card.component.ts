import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-voting-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="vote-card" 
         [class.selected]="selected()"
         [class.small]="size() === 'small'"
         (click)="onSelect()">
        
        @if (value() === '☕') {
          <div class="icon-wrapper" 
               [style.--coffee-stroke]="selected() ? null : 'rgba(255, 255, 255, 0.3)'">
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

  onSelect() {
    this.select.emit(this.value());
  }
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voting-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vote-card" 
         [class.selected]="selected()"
         (click)="onSelect()">
      <svg class="card-content" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e879f9;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        @if (value() === '☕') {
          <g class="svg-icon" transform="translate(50, 70) scale(0.85) translate(-2.5, 0)">
             <!-- Cup Body -->
             <path d="M -25,-10 L -25,20 Q -25,40 0,40 Q 25,40 25,20 L 25,-10 Z" 
                   class="cup-body" />
             <!-- Handle -->
             <path d="M 25,0 Q 40,0 40,15 Q 40,30 25,30" 
                   class="cup-handle" />
             <!-- Steam -->
             <g class="steam">
               <path d="M -15,-20 Q -10,-30 -15,-40" />
               <path d="M 0,-20 Q 5,-30 0,-40" />
               <path d="M 15,-20 Q 20,-30 15,-40" />
             </g>
          </g>
        } @else {
          <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" class="svg-value">
            {{ value() }}
          </text>
        }
      </svg>
    </div>
  `,
  styleUrl: './voting-card.component.css'
})
export class VotingCardComponent {
  value = input.required<string>();
  selected = input(false);
  select = output<string>();

  onSelect() {
    this.select.emit(this.value());
  }
}

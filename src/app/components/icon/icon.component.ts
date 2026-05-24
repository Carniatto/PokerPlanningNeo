import { Component, input } from '@angular/core';


@Component({
    selector: 'neo-icon',
    imports: [],
    template: `
    <div class="icon-container" [class]="size()" [style.--coffee-gradient]="'url(#neonGradient-' + uniqueId + ')'">
      @switch (name()) {
        @case ('edit') {
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
             <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
           </svg>
        }
        @case ('check') {
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="20 6 9 17 4 12"></polyline>
           </svg>
        }
        @case ('vote-hidden') {
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
             <polyline points="20 6 9 17 4 12"></polyline>
           </svg>
        }
        @case ('coffee') {
           <svg class="coffee-svg" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient [id]="'neonGradient-' + uniqueId" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#e879f9;stop-opacity:1" />
                </linearGradient>
              </defs>
              <g transform="translate(50, 70) scale(0.85) translate(-2.5, 0)">
                 <path d="M -25,-10 L -25,20 Q -25,40 0,40 Q 25,40 25,20 L 25,-10 Z M 25,0 Q 40,0 40,15 Q 40,30 25,30" class="cup-outline" />
                 <g class="steam">
                   <path d="M -15,-20 Q -10,-30 -15,-40" />
                   <path d="M 0,-20 Q 5,-30 0,-40" />
                   <path d="M 15,-20 Q 20,-30 15,-40" />
                 </g>
              </g>
           </svg>
        }
        @case ('plus') {
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <line x1="12" y1="5" x2="12" y2="19"></line>
             <line x1="5" y1="12" x2="19" y2="12"></line>
           </svg>
        }
        @case ('replay') {
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="23 4 23 10 17 10"></polyline>
             <polyline points="1 20 1 14 7 14"></polyline>
             <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
           </svg>
        }
      }
    </div>
  `,
    styles: [`
    :host { display: inline-block; vertical-align: middle; }
    .icon-container { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    
    /* Sizes */
    .small { width: 14px; height: 14px; }
    .medium { width: 16px; height: 16px; }
    .large { width: 24px; height: 24px; }
    .full { width: 100%; height: 100%; }

    svg { width: 100%; height: 100%; }

    /* Coffee Animation & Styles */

    .cup-outline, .steam path {
        fill: none;
        stroke: var(--coffee-stroke, var(--coffee-gradient));
        stroke-width: 8px; /* Adjusted relative to SVG viewbox */
    }
    .cup-outline {
        filter: drop-shadow(0 0 2px rgba(217, 70, 239, 0.5));
        stroke-linecap: round;
    }
    .steam path {
        stroke-width: 6px;
        stroke-linecap: round;
        filter: drop-shadow(0 0 2px rgba(217, 70, 239, 0.5));
    }
  `]
})
export class IconComponent {
  name = input.required<'edit' | 'check' | 'coffee' | 'vote-hidden' | 'plus' | 'replay'>();
  size = input<'small' | 'medium' | 'large' | 'full'>('full');

  // Unique ID for gradients to prevent ID collisions
  uniqueId = Math.random().toString(36).substr(2, 9);
}

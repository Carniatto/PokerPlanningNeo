import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';

interface Slide {
  title: string;
  description: string;
  imagePath: string;
}

@Component({
    selector: 'app-how-it-works',
    imports: [RouterLink],
    template: `
    <div class="how-it-works-container">
      <!-- Close Button -->
      <button class="close-btn" routerLink="/">
        <span class="material-icons">close</span>
      </button>

      <!-- Main Content Area -->
      <div class="carousel-viewport">
        <div class="slides-wrapper" [style.transform]="'translateX(-' + (currentSlide * 100) + '%)'">
          @for (slide of slides; track slide.title) {
            <div class="slide">
              <div class="split-card glass-card">
                <!-- Left: Visual -->
                <div class="visual-pane">
                  <div class="glow-effect"></div>
                  <img [src]="slide.imagePath" [alt]="slide.title" class="slide-image">
                </div>

                <!-- Right: Content -->
                <div class="content-pane">
                  <h2 class="slide-title">{{ slide.title }}</h2>
                  <p class="slide-description">{{ slide.description }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Navigation Controls -->
      <div class="navigation-overlay">
        <button class="nav-btn prev" (click)="prev()" [disabled]="currentSlide === 0">
          <span class="material-icons">arrow_back_ios_new</span>
        </button>

        <button class="nav-btn next" (click)="next()" [disabled]="currentSlide === slides.length - 1">
          <span class="material-icons">arrow_forward_ios</span>
        </button>
      </div>

      <!-- Pagination Dots -->
      <div class="indicators">
        @for (slide of slides; track slide.title; let i = $index) {
          <button class="dot" [class.active]="i === currentSlide" (click)="goTo(i)"></button>
        }
      </div>
    </div>
  `,
    styleUrl: './how-it-works.component.css'
})
export class HowItWorksComponent {
  currentSlide = 0;

  slides: Slide[] = [
    {
      title: 'The Goal',
      description: 'Reach consensus on the complexity of a task. It\'s about the discussion, not just the number.',
      imagePath: 'assets/images/how-it-works/goal.png'
    },
    {
      title: '1. Discuss',
      description: 'The Product Owner reads the user story. The team asks questions to clarify requirements and risks.',
      imagePath: 'assets/images/how-it-works/discuss.png'
    },
    {
      title: '2. Estimate',
      description: 'Each team member privately selects a card representing their estimate of effort. No peeking!',
      imagePath: 'assets/images/how-it-works/estimate.png'
    },
    {
      title: '3. Reveal',
      description: 'When everyone is ready, all cards are revealed simultaneously. This avoids anchoring bias.',
      imagePath: 'assets/images/how-it-works/reveal.png'
    },
    {
      title: '4. Converge',
      description: 'Discuss outliers. Why is it an 8 or a 2? Re-vote until the team agrees on the size.',
      imagePath: 'assets/images/how-it-works/converge.png'
    }
  ];

  next() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    }
  }

  prev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goTo(index: number) {
    this.currentSlide = index;
  }
}

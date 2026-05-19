import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IntroComponent } from './intro/intro.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, IntroComponent, RouterLink, RouterLinkActive],
    template: `
    <app-intro></app-intro>
    <div class="app-container">
      <header class="app-header">
        <a class="logo" routerLink="/">
          <img src="assets/logo.svg" alt="Poker Planning Neo" width="28" height="28">
          <span class="brand-text">Poker Planning <img src="assets/neo-logo.svg" alt="NEO" class="neo-brand-logo"></span>
        </a>
        <nav class="header-nav">
          <a routerLink="/about" routerLinkActive="active">About</a>
          <a routerLink="/how-it-works" routerLinkActive="active">How it Works</a>
        </nav>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <p>&copy; 2025 Poker Planning Neo. All rights reserved.</p>
      </footer>
    </div>
  `,
    styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-dark);
    }

    .app-header {
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      background-color: transparent; /* Transparent as per lobby image */
      z-index: 10;
    }

    @media (max-width: 768px) {
      .app-header {
        padding: 0 1rem;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      color: var(--text-main);
      text-decoration: none;
      cursor: pointer;
    }

    .brand-text {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .neo-brand-logo {
      height: 24px;
      vertical-align: middle;
      filter: drop-shadow(0 0 5px rgba(34, 211, 238, 0.5));
    }

    .header-nav {
      display: flex;
      gap: 2rem;
    }

    .header-nav a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .header-nav a:hover {
      color: var(--text-main);
    }

    @media (max-width: 768px) {
       .header-nav {
         display: none;
       }
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .app-footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
       .app-footer {
          display: none;
       }
    }
  `]
})
export class AppComponent { }

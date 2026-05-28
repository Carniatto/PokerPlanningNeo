import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IntroComponent } from './intro/intro.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ModalContainerComponent } from './components/modal-container/modal-container.component';
import { ChangelogComponent } from './components/changelog/changelog.component';
import { ChangelogService } from './services/changelog.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, IntroComponent, RouterLink, RouterLinkActive, ToastContainerComponent, ModalContainerComponent, ChangelogComponent],
    template: `
    <app-intro></app-intro>
    <neo-toast-container></neo-toast-container>
    <neo-modal-container></neo-modal-container>
    <neo-changelog></neo-changelog>
    <div class="app-container">

      <header class="app-header">
        <a class="logo" routerLink="/">
          <img src="assets/logo.svg" alt="Poker Planning Neo" width="28" height="28">
          <span class="brand-text">Poker Planning <img src="assets/neo-logo.svg" alt="NEO" class="neo-brand-logo"></span>
        </a>
        <div class="header-actions">
          <nav class="header-nav">
            <a routerLink="/about" routerLinkActive="active">About</a>
            <a routerLink="/how-it-works" routerLinkActive="active">How it Works</a>
          </nav>
          <button class="version-badge-btn" (click)="openChangelog()" title="View release history">
            v{{ changelogService.latestVersion }}
            @if (changelogService.hasNewUpdates()) {
              <span class="badge-dot"></span>
            }
          </button>
        </div>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <div class="footer-links">
          <a routerLink="/privacy">Privacy Policy</a>
          <span class="separator">|</span>
          <a routerLink="/terms">Terms of Service</a>
        </div>
        <p>&copy; 2026 Tundra Cube. All rights reserved.</p>
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 2rem;
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

    .version-badge-btn {
      background: rgba(34, 211, 238, 0.08);
      border: 1px solid rgba(34, 211, 238, 0.2);
      color: var(--neon-cyan);
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
    }

    .version-badge-btn:hover {
      background: rgba(34, 211, 238, 0.15);
      border-color: var(--neon-cyan);
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
      transform: translateY(-1px);
    }

    .version-badge-btn:active {
      transform: translateY(0);
    }

    .badge-dot {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 8px;
      height: 8px;
      background-color: var(--neon-pink);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--neon-pink);
      animation: pulse 1.5s infinite alternate;
    }

    @keyframes pulse {
      from {
        transform: scale(0.9);
        box-shadow: 0 0 4px var(--neon-pink);
      }
      to {
        transform: scale(1.2);
        box-shadow: 0 0 10px var(--neon-pink);
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
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .footer-links {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: var(--neon-cyan);
    }

    .separator {
      color: var(--text-muted);
      opacity: 0.5;
    }

    @media (max-width: 768px) {
       .app-footer {
          display: none;
       }
    }
  `]
})
export class AppComponent implements OnInit {
  changelogService = inject(ChangelogService);

  ngOnInit() {
    // Auto-open the popup if there are new features since their last visit
    if (this.changelogService.hasNewUpdates()) {
      setTimeout(() => {
        this.changelogService.openUpdates();
      }, 800);
    }
  }

  openChangelog() {
    this.changelogService.openHistory();
  }
}


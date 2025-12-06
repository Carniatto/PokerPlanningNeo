import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <div class="content-wrapper">
        <section class="hero-section">
          <h1>About Poker Planning <span class="neon-text">Neo</span></h1>
          <p class="lead">
            Poker Planner Neo is a modern, real-time estimation tool designed to help remote agile teams 
            collaborate effectively and have fun while planning their sprints.
          </p>
        </section>

        <section class="info-section">
          <h2>What is Poker Planning?</h2>
          <p>
            Planning Poker (also known as Scrum Poker) is a consensus-based, gamified technique for estimating, 
            mostly used to estimate effort or relative size of development goals in software development.
          </p>
          <div class="benefits-grid">
            <div class="benefit-card">
              <span class="icon">🎯</span>
              <h3>Accurate Estimates</h3>
              <p>By hiding votes until everyone has played, we avoid anchoring bias and ensure independent thinking.</p>
            </div>
            <div class="benefit-card">
              <span class="icon">🗣️</span>
              <h3>Better Discussions</h3>
              <p>Outliers trigger conversations, helping the team uncover hidden complexities or misunderstandings.</p>
            </div>
            <div class="benefit-card">
              <span class="icon">⚡</span>
              <h3>Fast & Fun</h3>
              <p>Gamification makes the estimation process more engaging and faster than traditional methods.</p>
            </div>
          </div>
        </section>

        <section class="creator-section">
          <h2>Meet the Creator</h2>
          <div class="creator-card">
            <div class="avatar-wrapper">
              <img src="assets/creator-avatar.png" alt="Matt Carniatto">
            </div>
            <div class="creator-info">
              <h3>Matt Carniatto</h3>
              <p class="role">Lead Developer & Architect</p>
              <p class="bio">
                Matt is a passionate builder who loves creating scalable Angular apps and empowering the community. 
                At Lighthouse, he leads developers to build amazing products and grow their careers. 
                He created Poker Planner Neo to bring joy and efficiency to team estimation.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrl: './about.component.css'
})
export class AboutComponent { }

import { Component } from '@angular/core';

@Component({
    selector: 'app-privacy',
    imports: [],
    template: `
    <div class="legal-container">
      <div class="content-wrapper">
        <section class="hero-section">
          <h1>Privacy <span class="neon-text">Policy</span></h1>
          <p class="lead">Last Updated: May 28, 2026</p>
        </section>

        <section class="info-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Poker Planning Neo (the "App"), a service provided by <strong>Tundra Cube</strong> ("we", "us", or "our"). 
            We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard 
            your information when you use our App.
          </p>

          <h2>2. Data Collection and Usage</h2>
          <p>
            We prioritize data minimization. The App collects and stores only the data strictly necessary for the core 
            collaborative estimation features:
          </p>
          <ul>
            <li><strong>Room Data:</strong> When you create or join an estimation session (room), we store the room name, host ID, active estimation items, and votes in our database (Firebase Firestore) to sync state in real-time.</li>
            <li><strong>Player Information:</strong> To display players in a room, we store the display name, status (e.g., active or disconnected), and selected avatar URL you choose. This information is associated with a temporary Firebase Authentication identifier.</li>
            <li><strong>Jira Integration:</strong> When you connect your Atlassian account, your OAuth 2.0 access and refresh tokens are stored <strong>strictly client-side</strong> in your browser's local storage. Our servers and functions never persist your credentials. We only store synchronized Jira issue keys, summaries, and URLs inside the room data in Firestore.</li>
          </ul>

          <h2>3. Data Retention and Deletion</h2>
          <p>
            We believe in prompt data disposal:
          </p>
          <ul>
            <li>Rooms that have been inactive for more than 24 hours (zombie rooms) are automatically deleted by our cleanup system.</li>
            <li>Rooms that become empty (all players disconnected or left) are automatically deleted immediately.</li>
            <li>You can clear your Jira credentials from your browser at any time by selecting the "Disconnect" button in the Jira integration settings.</li>
          </ul>

          <h2>4. Third-Party Services</h2>
          <p>
            We use Firebase (a Google service) for hosting, authentication, database storage, and backend functions. 
            When interacting with Jira, the App communicates with Atlassian's APIs. These services are subject to their 
            own privacy policies. We do not sell, rent, or trade your personal information.
          </p>

          <h2>5. Personal Data Declaration</h2>
          <p>
            We declare that our App does not store, copy, or cache personal user references (such as Atlassian AccountIDs) 
            in our backend systems for longer than 24 hours. All OAuth authorization data remains under the user's sole control 
            via browser storage.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at: 
            <a href="mailto:woolly.tundracube@gmail.com" class="neon-link">woolly.tundracube@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  `,
    styleUrl: './privacy.component.css'
})
export class PrivacyComponent {}

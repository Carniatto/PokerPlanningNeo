import { Component } from '@angular/core';

@Component({
    selector: 'app-terms',
    imports: [],
    template: `
    <div class="legal-container">
      <div class="content-wrapper">
        <section class="hero-section">
          <h1>Terms of <span class="neon-text">Service</span></h1>
          <p class="lead">Last Updated: May 28, 2026</p>
        </section>

        <section class="info-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the hosted version of Poker Planning Neo (the "App") at <code>pokerplanningneo.web.app</code>, a service provided by <strong>Tundra Cube</strong> ("we", "us", or "our"), 
            you agree to be bound by these Terms of Service. If you do not agree, you may not use the hosted service. However, because the App is open-source, you are welcome to inspect, fork, or self-host your own instance under our license terms.
          </p>

          <h2>2. Use of the App</h2>
          <p>
            You agree to use the App only for lawful purposes related to team estimation and sprint planning:
          </p>
          <ul>
            <li>You are responsible for any names or task details you enter into the App.</li>
            <li>You agree not to attempt to disrupt or interfere with the security, performance, or integrity of the hosted App or its backend services.</li>
            <li>You understand that the App is provided "as is" and "as available". We make no warranties of any kind regarding its availability, uptime, or suitability for your specific purposes.</li>
          </ul>

          <h2>3. Jira Integration</h2>
          <p>
            The App provides integration features with Atlassian Jira using OAuth 2.0. By using this integration, you authorize 
            the App to request details from your Jira instances (such as issues, summaries, and points) and update those items 
            on your behalf. All credentials (OAuth access and refresh tokens) are stored <strong>only in your browser's local storage</strong>. We do not store or inspect these credentials on our servers.
          </p>

          <h2>4. Open Source and Licensing</h2>
          <p>
            The source code for the App is open-source and publicly hosted on GitHub under the 
            <a href="https://github.com/TundraCube" class="neon-link" target="_blank" rel="noopener">Tundra Cube</a> organization. 
            You can audit the code, contribute to its development, or report issues directly in the repository.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Tundra Cube shall not be liable for any direct, indirect, incidental, 
            consequential, or special damages arising out of or in connection with your use or inability to use the App, even 
            if we have been advised of the possibility of such damages.
          </p>

          <h2>6. Termination</h2>
          <p>
            We reserve the right to modify, suspend, or terminate the App or your access to it at any time, with or without notice, 
            for any reason, including violation of these terms.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            For any support inquiries or questions regarding these Terms, please contact us at: 
            <a href="mailto:woolly.tundracube@gmail.com" class="neon-link">woolly.tundracube@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  `,
    styleUrl: './terms.component.css'
})
export class TermsComponent {}

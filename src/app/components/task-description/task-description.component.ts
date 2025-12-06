import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="task-section">
      <h2>Current Task Under Estimation</h2>
      <div class="task-description-card">
        <p>
          As a user, I want to be able to log in with my email and password so that I can
          access my account securely. The login form should include fields for email and
          password, a 'Remember Me' checkbox, and a 'Forgot Password' link.
        </p>
      </div>
    </section>
  `,
  styleUrl: './task-description.component.css'
})
export class TaskDescriptionComponent { }

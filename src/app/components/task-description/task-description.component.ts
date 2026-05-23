import { Component, input, output, signal, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-task-description',
    imports: [FormsModule],
    template: `
    <section class="task-section">
      <h2>Current Task Under Estimation</h2>
      
      @if (isFromList() && !isEditing()) {
        <!-- READ-ONLY ACTIVE TASK CARD (task from list, host view) -->
        <div class="active-task-card">
          <div class="active-task-header">
            <span class="in-progress-badge">⚡ In Progress</span>
            @if (isHost()) {
              <button class="btn-edit-toggle" (click)="isEditing.set(true)" title="Override description">
                Edit
              </button>
            }
          </div>
          <div class="active-task-body">
            <div class="check-badge-wrapper">
              <svg class="check-svg-neo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="task-content">
              <p [innerHTML]="getParsedStoryHtml(story() || 'Waiting for host to set the task...')"
                 [class.placeholder-text]="!story()"></p>
            </div>
          </div>
        </div>
      } @else {
        <!-- EDITABLE TEXTAREA (custom one-off OR edit override mode) -->
        <div class="task-description-card-neo" [class.editable]="isHost()">
          <div class="check-badge-wrapper">
            <svg class="check-svg-neo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="task-content">
            @if (isHost()) {
                <div class="textarea-header">
                  @if (isEditing() && isFromList()) {
                    <button class="btn-edit-toggle" (click)="cancelEdit()" title="Cancel override">
                      ← Back to Card
                    </button>
                  }
                </div>
                <textarea 
                    class="story-input"
                    [ngModel]="story()"
                    (ngModelChange)="onStoryChange($event)"
                    (blur)="onStoryBlur()"
                    rows="1"
                    placeholder="add here the current task to be estimated">
                </textarea>
                @if (hasLink()) {
                  <div class="host-links-preview">
                    @for (link of detectedLinks(); track link) {
                      <a [href]="link" target="_blank" rel="noopener noreferrer" class="jira-link-badge">
                        🔗 Open Jira/Link
                      </a>
                    }
                  </div>
                }
            } @else {
                <p [class.placeholder-text]="!story()" [innerHTML]="getParsedStoryHtml(story() || 'Waiting for host to set the task...')">
                </p>
            }
          </div>
        </div>
      }
    </section>
  `,
    styleUrl: './task-description.component.css'
})
export class TaskDescriptionComponent {
  story = input<string>('');
  isHost = input<boolean>(false);
  /** True when the active story description matches a task in the list */
  isFromList = input<boolean>(false);

  storyChange = output<string>();
  storyBlur = output<void>();

  /** Local signal to toggle edit-override mode */
  isEditing = signal(false);

  private sanitizer = inject(DomSanitizer);

  onStoryChange(newStory: string) {
    this.storyChange.emit(newStory);
  }

  onStoryBlur() {
    this.storyBlur.emit();
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  getParsedStoryHtml(text: string): SafeHtml {
    if (!text) return '';
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parsed = escaped.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="jira-link">${url}</a>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  }

  hasLink() {
    const s = this.story();
    if (!s) return false;
    return /(https?:\/\/[^\s]+)/g.test(s);
  }

  detectedLinks(): string[] {
    const s = this.story();
    if (!s) return [];
    const matches = s.match(/(https?:\/\/[^\s]+)/g);
    return matches ? Array.from(new Set(matches)) : [];
  }
}

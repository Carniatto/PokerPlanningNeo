import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-description',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="task-section">
      <h2>Current Task Under Estimation</h2>
      <div class="task-description-card" [class.editable]="isHost()">
        @if (isHost()) {
            <textarea 
                class="story-input"
                [ngModel]="story()"
                (ngModelChange)="onStoryChange($event)"
                (blur)="onStoryBlur()"
                placeholder="add here the current task to be estimated">
            </textarea>
        } @else {
            <p [class.placeholder-text]="!story()">
                {{ story() || 'Waiting for host to set the task...' }}
            </p>
        }
      </div>
    </section>
  `,
  styleUrl: './task-description.component.css'
})
export class TaskDescriptionComponent {
  story = input<string>('');
  isHost = input<boolean>(false);
  storyChange = output<string>();

  // Emit blur event for saving
  storyBlur = output<void>();

  onStoryChange(newStory: string) {
    this.storyChange.emit(newStory);
  }

  onStoryBlur() {
    this.storyBlur.emit();
  }
}

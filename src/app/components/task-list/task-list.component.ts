import { Component, input, output, signal, inject, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Task, GameService } from '../../game.service';

@Component({
  selector: 'app-task-list',
  imports: [FormsModule],
  template: `
    <div class="task-list-container glass-panel">
      <div class="list-header">
        <h3>Task List</h3>
        @if (isHost()) {
          <div class="add-task-form">
            <input 
              type="text" 
              [(ngModel)]="newTaskDescription" 
              (keyup.enter)="addTask()"
              placeholder="Jira URL or Task description..." 
              class="add-task-input"
            />
            <button (click)="addTask()" class="btn-add" [disabled]="!newTaskDescription().trim()">
              Add Task
            </button>
          </div>
        }
      </div>

      <div class="table-wrapper">
        @if (tasks().length === 0) {
          <div class="empty-state">
            <p>No tasks in the list yet.</p>
          </div>
        } @else {
          <table class="tasks-table">
            <thead>
              <tr>
                <th class="col-desc">TASK ID / NAME</th>
                <th class="col-estimate text-right">ESTIMATE</th>
                @if (isHost()) {
                  <th class="col-actions">Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (task of tasks(); track task.id) {
                <tr [class.active]="isActive(task)">
                  <td class="task-desc">
                    @if (isActive(task)) {
                      <span class="estimating-badge">⚡ Estimating</span>
                    }
                    <span [innerHTML]="getParsedDescription(task.description)"></span>
                  </td>

                  <td class="col-estimate text-right">
                    @if (isHost()) {
                      <input 
                        type="text"
                        [ngModel]="task.finalEstimate || ''" 
                        (ngModelChange)="updateEstimate(task.id, $event)"
                        class="estimate-input"
                        [class]="getEstimateColorClass(task.finalEstimate || '')"
                        placeholder="-"
                        maxlength="5"
                      />
                    } @else {
                      <span class="estimate-value-neo" [class]="getEstimateColorClass(task.finalEstimate || '')">
                        {{ task.finalEstimate || '-' }}
                      </span>
                    }
                  </td>
                  @if (isHost()) {
                    <td class="col-actions">
                      <div class="actions-group">
                        <button 
                          (click)="selectForEstimation(task)" 
                          class="btn-action btn-estimate"
                          title="Set as Active Task"
                        >
                          Estimate
                        </button>
                        <button 
                          (click)="deleteTask(task.id)" 
                          class="btn-action btn-delete"
                          title="Remove Task"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  roomId = input.required<string>();
  isHost = input<boolean>(false);
  tasks = input<Task[]>([]);
  currentStory = input<string>('');
  /** ID of the task currently being estimated — preferred over description matching */
  currentTaskId = input<string | null>(null);

  selectTask = output<Task>();

  newTaskDescription = signal('');
  estimateOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

  getEstimateColorClass(value: string): string {
    if (!value) return 'estimate-none';
    const n = Number(value);
    if (isNaN(n)) return 'estimate-special';
    if (n <= 1) return 'estimate-small';
    if (n <= 3) return 'estimate-medium';
    if (n <= 8) return 'estimate-large';
    return 'estimate-xlarge';
  }

  private gameService = inject(GameService);
  private sanitizer = inject(DomSanitizer);

  isActive(task: Task): boolean {
    const id = this.currentTaskId();
    return !!id && task.id === id;
  }

  getParsedDescription(text: string): SafeHtml {
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

  async addTask() {
    const desc = this.newTaskDescription().trim();
    if (!desc) return;
    try {
      await this.gameService.addTask(this.roomId(), desc);
      this.newTaskDescription.set('');
    } catch (e) {
      console.error('Failed to add task', e);
    }
  }

  async deleteTask(taskId: string) {
    if (confirm('Are you sure you want to remove this task?')) {
      try {
        await this.gameService.deleteTask(this.roomId(), taskId);
      } catch (e) {
        console.error('Failed to delete task', e);
      }
    }
  }

  async updateEstimate(taskId: string, estimate: string) {
    try {
      await this.gameService.updateTaskEstimate(this.roomId(), taskId, estimate);
    } catch (e) {
      console.error('Failed to update task estimate', e);
    }
  }

  selectForEstimation(task: Task) {
    this.selectTask.emit(task);
  }
}

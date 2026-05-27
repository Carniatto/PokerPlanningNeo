import { Component, input, output, signal, inject, computed, OnInit, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { JiraAuthService } from '../../services/jira-auth.service';
import { JiraApiService } from '../../services/jira-api.service';
import { firstValueFrom } from 'rxjs';
import { Task, GameService } from '../../game.service';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'neo-task-list',
  imports: [FormsModule],
  template: `
    <div class="task-list-container glass-panel">
      <div class="list-header-row">
        <div class="list-title-area">
          <h3>Task List</h3>
          @if (isHost()) {
            <div class="jira-auth-wrapper">
               @if (jiraAuth.accessToken()) {
                   <div class="jira-connected-badge" (click)="showJiraSettings.set(!showJiraSettings())">
                      <span class="dot-green"></span> Jira Connected ▾
                   </div>
                   @if (showJiraSettings()) {
                       <div class="jira-settings-popover glass-panel">
                           <h4>Jira Settings</h4>
                           <label>Target Site</label>
                           <select [ngModel]="selectedJiraSite()" (ngModelChange)="updateJiraSite($event)">
                               @for (site of jiraSites(); track site.id) {
                                   <option [value]="site.id">{{ site.name }}</option>
                               }
                           </select>
                           <label>Story Points Field ID</label>
                           <input type="text" [ngModel]="jiraSpField()" (ngModelChange)="updateJiraSpField($event)">
                           <button class="btn-danger-sm" (click)="disconnectJira()">Disconnect</button>
                       </div>
                   }
               } @else {
                   <button class="btn-jira-connect" (click)="jiraAuth.login()">
                      🔗 Connect Jira
                   </button>
               }
            </div>
          }
        </div>
        @if (isHost()) {
          <div class="add-task-form-wrapper">
            <div class="add-task-form">
              <input 
                type="text" 
                [(ngModel)]="newTaskDescription" 
                (keyup.enter)="addTask()"
                placeholder="Jira URL/key [description] or plain task..." 
                class="add-task-input"
              />
              <button (click)="addTask()" class="btn-add" [disabled]="!newTaskDescription().trim()">
                Add Task
              </button>
            </div>
            @if (showFeatureTip()) {
              <div class="feature-tip-popover glass-panel">
                <div class="tip-header">
                  <span>💡 Tip: Add Jira URL + Description</span>
                  <button class="btn-close-tip" (click)="dismissFeatureTip()">×</button>
                </div>
                <p>You can now paste a Jira link or key followed by a space and a custom description, like:</p>
                <code>COA-3502 My custom task description</code>
                <p>We'll extract the Jira link and use your text as the fallback summary!</p>
              </div>
            }
          </div>
        }
      </div>

      <div class="table-wrapper">
        @if (tasks().length === 0 && loadingTasks().length === 0) {
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
              @for (lTask of loadingTasks(); track lTask.id) {
                <tr class="loading-row">
                  <td class="task-desc">
                    <div class="jira-task-badge-wrapper">
                        <a [href]="lTask.jiraUrl" target="_blank" class="jira-key-badge" (click)="$event.stopPropagation()">
                            {{ lTask.jiraKey }}
                        </a>
                        <span class="jira-summary skeleton-text"></span>
                    </div>
                  </td>
                  <td class="col-estimate text-right">
                    <span class="estimate-value-neo estimate-none">-</span>
                  </td>
                  @if (isHost()) {
                    <td class="col-actions">
                    </td>
                  }
                </tr>
              }
              @for (task of tasks(); track task.id) {
                <tr [class.active]="isActive(task)" 
                    (click)="isHost() ? (isActive(task) ? selectForEstimation(null) : selectForEstimation(task)) : null" 
                    [class.clickable]="isHost()">
                  <td class="task-desc">
                    @if (task.jiraKey) {
                        <div class="jira-task-badge-wrapper">
                            <a [href]="task.jiraUrl" target="_blank" class="jira-key-badge" (click)="$event.stopPropagation()">
                                {{ task.jiraKey }}
                            </a>
                            <span class="jira-summary" [class.skeleton-text]="refreshingTasks().has(task.id)" [title]="task.jiraSummary">
                                {{ refreshingTasks().has(task.id) ? '' : task.jiraSummary }}
                            </span>
                        </div>
                    } @else {
                        <span [innerHTML]="getParsedDescription(task.description)"></span>
                    }
                  </td>

                  <td class="col-estimate text-right">
                    @if (isHost()) {
                      <input 
                        type="text"
                        [ngModel]="task.finalEstimate || ''" 
                        (ngModelChange)="updateEstimate(task.id, $event)"
                        (click)="$event.stopPropagation()"
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
                        @if (task.jiraKey && jiraAuth.accessToken()) {
                          <button 
                            class="btn-action btn-refresh" 
                            title="Refresh from Jira" 
                            (click)="refreshJiraSummary(task); $event.stopPropagation()"
                          >
                            ↻
                          </button>
                        }
                        <button 
                          (click)="deleteTask(task.id); $event.stopPropagation()" 
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
        
        @if (isHost() && hasSyncableJiraTasks()) {
            <div class="bulk-sync-wrapper">
                <button class="btn-neo-primary btn-sync-all" (click)="syncAllJiraTasks()" [disabled]="isSyncingAll()">
                    {{ isSyncingAll() ? 'Syncing...' : 'Sync All Estimates to Jira' }}
                </button>
            </div>
        }
      </div>
    </div>
  `,
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  roomId = input.required<string>();
  isHost = input<boolean>(false);
  tasks = input<Task[]>([]);
  currentStory = input<string>('');
  /** ID of the task currently being estimated — preferred over description matching */
  currentTaskId = input<string | null>(null);

  selectTask = output<Task | null>();

  newTaskDescription = signal('');
  loadingTasks = signal<{ id: string, jiraKey: string, jiraUrl: string }[]>([]);
  refreshingTasks = signal<Set<string>>(new Set());
  estimateOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

  jiraAuth = inject(JiraAuthService);
  jiraApi = inject(JiraApiService);
  private gameService = inject(GameService);
  private sanitizer = inject(DomSanitizer);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);

  jiraSites = signal<any[]>([]);
  selectedJiraSite = signal<string>(localStorage.getItem('JIRA_SELECTED_SITE') || '');
  jiraSpField = signal<string>(localStorage.getItem('JIRA_SP_FIELD') || 'customfield_10016');
  showJiraSettings = signal(false);
  isSyncingAll = signal(false);
  showFeatureTip = signal(localStorage.getItem('NEO_TASK_INPUT_TIP_SEEN') !== 'true');

  constructor() {
    effect(() => {
      const sites = this.jiraSites();
      const current = this.selectedJiraSite();
      if (sites.length > 0 && !current) {
        this.updateJiraSite(sites[0].id);
      }
    });
  }

  ngOnInit() {
    if (this.isHost() && this.jiraAuth.accessToken()) {
      this.loadJiraSites();
    }
  }

  loadJiraSites() {
    this.jiraApi.getAccessibleResources().subscribe({
        next: (data) => {
            this.jiraSites.set(data);
        },
        error: (err) => {
            console.error('Failed to load Jira sites', err);
            if (err?.status === 401) {
                // Token was cleared by the API service — UI will revert to "Connect Jira"
                this.toastService.warning('Jira session expired. Please reconnect.');
            } else {
                this.toastService.error('Could not load Jira sites. Check your connection.');
            }
        }
    });
  }

  updateJiraSite(siteId: string) {
    this.selectedJiraSite.set(siteId);
    localStorage.setItem('JIRA_SELECTED_SITE', siteId);
  }

  updateJiraSpField(field: string) {
    this.jiraSpField.set(field);
    localStorage.setItem('JIRA_SP_FIELD', field);
  }

  disconnectJira() {
    this.jiraAuth.logout();
    this.showJiraSettings.set(false);
  }

  dismissFeatureTip() {
    localStorage.setItem('NEO_TASK_INPUT_TIP_SEEN', 'true');
    this.showFeatureTip.set(false);
  }

  getEstimateColorClass(value: string): string {
    if (!value) return 'estimate-none';
    const n = Number(value);
    if (isNaN(n)) return 'estimate-special';
    if (n <= 1) return 'estimate-small';
    if (n <= 3) return 'estimate-medium';
    if (n <= 8) return 'estimate-large';
    return 'estimate-xlarge';
  }



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
    const parsed = escaped.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="jira-link">${url}</a>`);
    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  }

  getParsedIssueKey(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    const browseMatch = trimmed.match(/\/browse\/([A-Za-z0-9]+-[0-9]+)/);
    if (browseMatch && browseMatch[1]) return browseMatch[1].toUpperCase();
    const keyMatch = trimmed.match(/^([A-Za-z0-9]+-[0-9]+)$/);
    if (keyMatch && keyMatch[1]) return keyMatch[1].toUpperCase();
    return '';
  }

  parseTaskInput(input: string): { jiraKey: string; jiraUrl: string; remainingText: string } {
    const trimmed = input.trim();
    let jiraKey = '';
    let jiraUrl = '';
    let remainingText = trimmed;

    // 1. Check if there is a Jira URL in the input (e.g. contains "/browse/KEY-123")
    const browseMatch = trimmed.match(/(https?:\/\/[^\s]*\/browse\/([A-Za-z0-9]+-[0-9]+)[^\s]*)/i);
    if (browseMatch) {
      jiraUrl = browseMatch[1];
      jiraKey = browseMatch[2].toUpperCase();
      // Remove the URL from the description
      remainingText = trimmed.replace(jiraUrl, '').replace(/\s+/g, ' ').trim();
    } else {
      // 2. Check if the first word/token matches a Jira key pattern (e.g. KEY-123)
      const firstSpaceIdx = trimmed.indexOf(' ');
      const firstToken = firstSpaceIdx !== -1 ? trimmed.substring(0, firstSpaceIdx).trim() : trimmed;
      const keyMatch = firstToken.match(/^([A-Za-z0-9]+-[0-9]+)$/);
      if (keyMatch) {
        jiraKey = keyMatch[1].toUpperCase();
        remainingText = firstSpaceIdx !== -1 ? trimmed.substring(firstSpaceIdx + 1).trim() : '';
      }
    }

    return { jiraKey, jiraUrl, remainingText };
  }

  async addTask() {
    const rawInput = this.newTaskDescription().trim();
    if (!rawInput) return;

    const parsed = this.parseTaskInput(rawInput);

    // Check for duplicates
    if (parsed.jiraKey) {
      if (this.tasks().some(t => t.jiraKey === parsed.jiraKey)) {
        this.toastService.warning('This story is already in the list!');
        this.newTaskDescription.set('');
        return;
      }
    } else {
      if (this.tasks().some(t => t.description.toLowerCase() === rawInput.toLowerCase())) {
        this.toastService.warning('This task is already in the list!');
        this.newTaskDescription.set('');
        return;
      }
    }

    let jiraMeta: any = undefined;

    if (parsed.jiraKey) {
      const loadingId = Math.random().toString(36).substring(7);
      let cloudId = this.selectedJiraSite();
      
      const urlToUse = parsed.jiraUrl || rawInput.split(' ')[0];
      if (urlToUse.includes('.atlassian.net')) {
        const match = urlToUse.match(/https?:\/\/([^/]+)/);
        if (match && match[1]) {
          const domain = match[1].toLowerCase();
          const matchingSite = this.jiraSites().find(s => s.url.toLowerCase().includes(domain));
          if (matchingSite) cloudId = matchingSite.id;
        }
      }

      const defaultDomain = urlToUse.includes('.atlassian.net') ? urlToUse.match(/https?:\/\/([^/]+)/)?.[1] || 'domain.atlassian.net' : 'domain.atlassian.net';
      const jiraUrl = parsed.jiraUrl || `https://${this.jiraSites().find(s => s.id === cloudId)?.url || defaultDomain}/browse/${parsed.jiraKey}`;

      jiraMeta = {
        jiraKey: parsed.jiraKey,
        jiraSummary: parsed.remainingText || (this.jiraAuth.accessToken() ? 'Failed to fetch summary' : 'Log in to fetch summary'),
        jiraUrl
      };

      if (this.jiraAuth.accessToken()) {
        this.loadingTasks.update(lt => [...lt, { id: loadingId, jiraKey: parsed.jiraKey, jiraUrl }]);
        this.newTaskDescription.set('');

        try {
          if (cloudId) {
            const issue: any = await firstValueFrom(this.jiraApi.getIssue(cloudId, parsed.jiraKey));
            jiraMeta.jiraSummary = issue.fields?.summary || parsed.remainingText || 'No summary';
          }
        } catch (e: any) {
          console.error('Failed to auto-fetch Jira details', e);
          if (e?.status === 401) {
            this.toastService.error('Your Jira token might be expired. Please click Jira Connected -> Disconnect, and connect again.');
          }
        } finally {
          this.loadingTasks.update(lt => lt.filter(t => t.id !== loadingId));
        }
      } else {
        this.newTaskDescription.set('');
      }
    } else {
      this.newTaskDescription.set('');
    }

    try {
      const finalDesc = jiraMeta ? `${jiraMeta.jiraKey}: ${jiraMeta.jiraSummary}` : rawInput;
      await this.gameService.addTask(this.roomId(), finalDesc, jiraMeta);
    } catch (e) {
      console.error('Failed to add task', e);
    }
  }

  async deleteTask(taskId: string) {
    const confirmed = await this.modalService.confirm(
      'Remove Task',
      'Are you sure you want to remove this task?',
      'Remove',
      'Cancel'
    );
    if (confirmed) {
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

  selectForEstimation(task: Task | null) {
    this.selectTask.emit(task);
  }

  async refreshJiraSummary(task: Task) {
    if (!this.selectedJiraSite() || !task.jiraKey) return;
    this.refreshingTasks.update(s => new Set(s).add(task.id));
    try {
      const issue: any = await firstValueFrom(this.jiraApi.getIssue(this.selectedJiraSite(), task.jiraKey));
      const newSummary = issue.fields?.summary;
      if (newSummary && newSummary !== task.jiraSummary) {
        await this.gameService.updateTaskSummary(this.roomId(), task.id, newSummary);
      }
    } catch (e) {
      console.error('Failed to refresh summary', e);
    } finally {
      this.refreshingTasks.update(s => {
        const next = new Set(s);
        next.delete(task.id);
        return next;
      });
    }
  }

  isInvalidSyncEstimate(est?: string): boolean {
    if (!est) return true;
    const n = Number(est);
    return isNaN(n);
  }

  async syncIndividualTask(task: Task) {
    if (this.isInvalidSyncEstimate(task.finalEstimate) || !task.jiraKey || !this.selectedJiraSite()) return;
    try {
      await this.gameService.updateTaskJiraSyncStatus(this.roomId(), task.id, 'pending');
      await firstValueFrom(this.jiraApi.updateIssueStoryPoints(this.selectedJiraSite(), task.jiraKey, this.jiraSpField(), Number(task.finalEstimate)) as any);
      await this.gameService.updateTaskJiraSyncStatus(this.roomId(), task.id, 'synced');
    } catch (e: any) {
      console.error('Failed to sync to Jira', e);
      const errorBody = e?.error;
      const msg = errorBody?.errorMessages?.join(', ') || JSON.stringify(errorBody?.errors) || e.message || 'Unknown error';
      this.toastService.error(`Jira Sync Failed for ${task.jiraKey}: ${msg}`);
      await this.gameService.updateTaskJiraSyncStatus(this.roomId(), task.id, 'failed');
    }
  }

  hasSyncableJiraTasks(): boolean {
    return this.tasks().some(t => t.jiraKey && !this.isInvalidSyncEstimate(t.finalEstimate) && t.jiraSyncStatus !== 'synced');
  }

  async syncAllJiraTasks() {
    this.isSyncingAll.set(true);
    const syncableTasks = this.tasks().filter(t => t.jiraKey && !this.isInvalidSyncEstimate(t.finalEstimate) && t.jiraSyncStatus !== 'synced');
    for (const task of syncableTasks) {
      await this.syncIndividualTask(task);
    }
    this.isSyncingAll.set(false);
  }
}

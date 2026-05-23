import { Component, input, output, signal, inject, computed, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Task, GameService } from '../../game.service';
import { FormsModule } from '@angular/forms';
import { JiraAuthService } from '../../services/jira-auth.service';
import { JiraApiService } from '../../services/jira-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-task-list',
  imports: [FormsModule],
  template: `
    <div class="task-list-container glass-panel">
      <div class="list-header-row">
        <div class="list-title-area">
          <h3>Session History</h3>
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
                    @if (task.jiraKey) {
                        <div class="jira-task-badge-wrapper">
                            <a [href]="task.jiraUrl" target="_blank" class="jira-key-badge">
                                {{ task.jiraKey }}
                            </a>
                            <span class="jira-summary" [title]="task.jiraSummary">{{ task.jiraSummary }}</span>
                            @if (isHost() && jiraAuth.accessToken()) {
                                <button class="btn-icon-refresh" title="Refresh from Jira" (click)="refreshJiraSummary(task)">
                                    ↻
                                </button>
                            }
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
                        @if (task.jiraKey) {
                            <button 
                              (click)="syncIndividualTask(task)"
                              class="btn-action btn-sync"
                              title="Sync Story Points to Jira"
                              [disabled]="isInvalidSyncEstimate(task.finalEstimate)"
                            >
                              @if (task.jiraSyncStatus === 'pending') { ☁️ Sync }
                              @else if (task.jiraSyncStatus === 'synced') { ✅ Synced }
                              @else if (task.jiraSyncStatus === 'failed') { ⚠️ Error }
                              @else { ☁️ Sync }
                            </button>
                        }
                        <button 
                          (click)="selectForEstimation(task)" 
                          class="btn-action btn-estimate"
                          title="Set as Active Task"
                          [disabled]="isActive(task)"
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

  selectTask = output<Task>();

  newTaskDescription = signal('');
  estimateOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

  jiraAuth = inject(JiraAuthService);
  jiraApi = inject(JiraApiService);
  private gameService = inject(GameService);
  private sanitizer = inject(DomSanitizer);

  jiraSites = signal<any[]>([]);
  selectedJiraSite = signal<string>(localStorage.getItem('JIRA_SELECTED_SITE') || '');
  jiraSpField = signal<string>(localStorage.getItem('JIRA_SP_FIELD') || 'customfield_10016');
  showJiraSettings = signal(false);
  isSyncingAll = signal(false);

  ngOnInit() {
    if (this.isHost() && this.jiraAuth.accessToken()) {
        this.loadJiraSites();
    }
  }

  loadJiraSites() {
    this.jiraApi.getAccessibleResources().subscribe({
        next: (data) => {
            this.jiraSites.set(data);
            if (data.length > 0 && !this.selectedJiraSite()) {
                this.updateJiraSite(data[0].id);
            }
        },
        error: (err) => console.error('Failed to load Jira sites', err)
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
    return this.currentStory().trim() === task.description.trim();
  }

  getParsedDescription(text: string): SafeHtml {
    if (!text) return '';
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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

  async addTask() {
    const desc = this.newTaskDescription().trim();
    if (!desc) return;
    
    let jiraMeta: any = undefined;
    const jiraKey = this.getParsedIssueKey(desc);
    
    if (jiraKey && this.jiraAuth.accessToken()) {
        try {
            let cloudId = this.selectedJiraSite();
            if (desc.includes('.atlassian.net')) {
                const match = desc.match(/https?:\/\/([^/]+)/);
                if (match && match[1]) {
                    const domain = match[1].toLowerCase();
                    const matchingSite = this.jiraSites().find(s => s.url.toLowerCase().includes(domain));
                    if (matchingSite) cloudId = matchingSite.id;
                }
            }
            if (cloudId) {
               const issue: any = await firstValueFrom(this.jiraApi.getIssue(cloudId, jiraKey));
               jiraMeta = {
                   jiraKey: issue.key,
                   jiraSummary: issue.fields?.summary || 'No summary',
                   jiraUrl: desc.startsWith('http') ? desc : `https://${this.jiraSites().find(s => s.id === cloudId)?.url || 'domain.atlassian.net'}/browse/${issue.key}`
               };
            }
        } catch(e) {
            console.error('Failed to auto-fetch Jira details', e);
        }
    }
    
    try {
      const finalDesc = jiraMeta ? `${jiraMeta.jiraKey}: ${jiraMeta.jiraSummary}` : desc;
      await this.gameService.addTask(this.roomId(), finalDesc, jiraMeta);
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

  async refreshJiraSummary(task: Task) {
      if (!this.selectedJiraSite() || !task.jiraKey) return;
      try {
          const issue: any = await firstValueFrom(this.jiraApi.getIssue(this.selectedJiraSite(), task.jiraKey));
          const newSummary = issue.fields?.summary;
          if (newSummary && newSummary !== task.jiraSummary) {
              await this.gameService.updateTaskSummary(this.roomId(), task.id, newSummary);
          }
      } catch(e) {
          console.error('Failed to refresh summary', e);
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
      } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown error';
          await this.gameService.updateTaskJiraSyncStatus(this.roomId(), task.id, 'failed', errorMsg);
          console.error('Sync failed', e);
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

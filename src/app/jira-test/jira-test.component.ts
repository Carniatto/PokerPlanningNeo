import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JiraAuthService } from '../services/jira-auth.service';
import { JiraApiService } from '../services/jira-api.service';

@Component({
    selector: 'app-jira-test',
    standalone: true,
    imports: [FormsModule, RouterLink],
    template: `
        <div class="container">
            <header>
                <a routerLink="/" class="back-link">← Back to App</a>
                <h1>Jira Integration Sandbox</h1>
                <p class="subtitle">Securely verify authentication, fetch issues by URL, and test story point pushing.</p>
            </header>

            <main class="grid">
                <!-- Section 1: Authentication State -->
                <section class="card auth-card">
                    <h2>1. Authentication State</h2>
                    @if (authService.authError()) {
                        <div class="error-box" style="margin-top: 0; margin-bottom: 16px;">
                            <strong>Authentication Failed:</strong> {{ authService.authError() }}
                        </div>
                    }
                    @if (authService.accessToken()) {
                        <div class="status-indicator success">
                            <span class="dot"></span> Connected to Atlassian
                        </div>
                        <div class="token-preview">
                            <strong>Token Preview:</strong>
                            <code>{{ authService.accessToken()?.substring(0, 15) }}...</code>
                        </div>
                        <button class="btn btn-danger" (click)="authService.logout()">Disconnect</button>
                    } @else {
                        <div class="status-indicator error">
                            <span class="dot"></span> Disconnected
                        </div>
                        <p>You must authenticate with your Atlassian account to fetch or update Jira issues.</p>
                        <button class="btn btn-primary" (click)="authService.login()">Login with Jira</button>
                    }
                </section>

                <!-- Section 2: Site Selection -->
                <section class="card sites-card">
                    <h2>2. Target Site Select</h2>
                    @if (authService.accessToken()) {
                        @if (loadingSites()) {
                            <p>Loading accessible resources...</p>
                        } @else {
                            @if (sites().length > 0) {
                                <div class="form-group">
                                    <label for="site-select">Select Jira Site</label>
                                    <select id="site-select" [(ngModel)]="selectedCloudId">
                                        @for (site of sites(); track site.id) {
                                            <option [value]="site.id">{{ site.name }} ({{ site.url }})</option>
                                        }
                                    </select>
                                </div>
                                <button class="btn btn-secondary" (click)="loadSites()">Refresh Sites</button>
                            } @else {
                                <p class="warning">No accessible Jira sites found for this user.</p>
                                <button class="btn btn-secondary" (click)="loadSites()">Retry</button>
                            }
                        }
                    } @else {
                        <p class="placeholder-text">Authenticate first to see accessible sites.</p>
                    }
                </section>

                <!-- Section 3: Fetch Jira Issue -->
                <section class="card issue-card">
                    <h2>3. Fetch Jira Issue Details</h2>
                    <div class="form-group">
                        <label for="issue-url">Jira Issue URL or Key</label>
                        <input 
                            id="issue-url" 
                            type="text" 
                            placeholder="e.g., https://my-site.atlassian.net/browse/PROJ-123 or PROJ-123" 
                            [(ngModel)]="issueInput"
                            (ngModelChange)="onUrlChange()"
                        />
                    </div>
                    
                    <button 
                        class="btn btn-primary" 
                        [disabled]="!selectedCloudId || !issueInput || loadingIssue()" 
                        (click)="fetchIssue()"
                    >
                        @if (loadingIssue()) { Fetching... } @else { Fetch Issue Summary }
                    </button>

                    @if (issueError()) {
                        <div class="error-box">{{ issueError() }}</div>
                    }

                    @if (issueDetails()) {
                        <div class="details-box">
                            <h3>{{ issueDetails().key }}: {{ issueDetails().fields?.summary }}</h3>
                            <p><strong>Status:</strong> {{ issueDetails().fields?.status?.name }}</p>
                            <p><strong>Current Story Points:</strong> {{ getStoryPointsValue() ?? 'Not Set' }}</p>
                        </div>
                    }
                </section>

                <!-- Section 4: Push Story Points -->
                <section class="card push-card">
                    <h2>4. Push Story Points</h2>
                    <div class="form-group">
                        <label for="custom-field">Story Points Field ID</label>
                        <input 
                            id="custom-field" 
                            type="text" 
                            placeholder="e.g., customfield_10016" 
                            [(ngModel)]="customFieldId"
                        />
                        <span class="help-text">Usually <code>customfield_10016</code> (Jira standard custom field).</span>
                    </div>

                    <div class="form-group">
                        <label for="points-value">Story Points Estimate</label>
                        <input 
                            id="points-value" 
                            type="number" 
                            placeholder="e.g., 5" 
                            [(ngModel)]="storyPointsEstimate"
                        />
                    </div>

                    <button 
                        class="btn btn-success" 
                        [disabled]="!selectedCloudId || !getParsedIssueKey() || storyPointsEstimate === null || updatingPoints()" 
                        (click)="pushStoryPoints()"
                    >
                        @if (updatingPoints()) { Pushing... } @else { Push Story Points to Jira }
                    </button>

                    @if (pushSuccess()) {
                        <div class="success-box">Story Points successfully updated in Jira!</div>
                    }
                    @if (pushError()) {
                        <div class="error-box">{{ pushError() }}</div>
                    }
                </section>
            </main>
        </div>
    `,
    styles: [`
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #e2e8f0;
            min-height: 100vh;
            background: radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 100%);
        }

        header {
            margin-bottom: 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 24px;
        }

        .back-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
            display: inline-block;
            margin-bottom: 16px;
        }

        .back-link:hover {
            color: #60a5fa;
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 8px 0;
            background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .subtitle {
            color: #94a3b8;
            font-size: 1.1rem;
            margin: 0;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
            gap: 24px;
        }

        .card {
            background: rgba(30, 41, 59, 0.5);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        h2 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #f1f5f9;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 12px;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            margin-bottom: 16px;
            padding: 8px 12px;
            border-radius: 8px;
            width: fit-content;
        }

        .status-indicator.success {
            background: rgba(16, 185, 129, 0.1);
            color: #34d399;
        }

        .status-indicator.error {
            background: rgba(239, 68, 68, 0.1);
            color: #f87171;
        }

        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: currentColor;
            box-shadow: 0 0 8px currentColor;
        }

        .token-preview {
            background: rgba(15, 23, 42, 0.6);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }

        code {
            font-family: monospace;
            color: #f43f5e;
            background: rgba(244, 63, 94, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
        }

        .form-group {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #94a3b8;
        }

        input, select {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 10px 14px;
            color: #f1f5f9;
            font-family: inherit;
            font-size: 0.95rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        input:focus, select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
        }

        .help-text {
            font-size: 0.75rem;
            color: #64748b;
        }

        .btn {
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            width: 100%;
            margin-top: auto;
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-primary {
            background: #3b82f6;
            color: #ffffff;
        }
        .btn-primary:not(:disabled):hover {
            background: #2563eb;
            box-shadow: 0 0 12px rgba(37, 99, 235, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #f1f5f9;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .btn-secondary:not(:disabled):hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .btn-success {
            background: #10b981;
            color: #ffffff;
        }
        .btn-success:not(:disabled):hover {
            background: #059669;
            box-shadow: 0 0 12px rgba(5, 150, 105, 0.4);
        }

        .btn-danger {
            background: #ef4444;
            color: #ffffff;
        }
        .btn-danger:not(:disabled):hover {
            background: #dc2626;
            box-shadow: 0 0 12px rgba(220, 38, 38, 0.4);
        }

        .error-box {
            margin-top: 16px;
            padding: 12px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            color: #f87171;
            font-size: 0.9rem;
        }

        .success-box {
            margin-top: 16px;
            padding: 12px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 8px;
            color: #34d399;
            font-size: 0.9rem;
        }

        .details-box {
            margin-top: 20px;
            padding: 16px;
            background: rgba(15, 23, 42, 0.4);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .details-box h3 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 12px 0;
            color: #ffffff;
        }

        .details-box p {
            font-size: 0.875rem;
            margin: 6px 0;
            color: #cbd5e1;
        }

        .placeholder-text {
            color: #64748b;
            font-style: italic;
            margin: 0;
        }
    `]
})
export class JiraTestComponent implements OnInit {
    authService = inject(JiraAuthService);
    jiraApi = inject(JiraApiService);

    sites = signal<any[]>([]);
    loadingSites = signal(false);
    selectedCloudId = '';

    issueInput = '';
    parsedKey = '';

    loadingIssue = signal(false);
    issueDetails = signal<any>(null);
    issueError = signal<string | null>(null);

    customFieldId = 'customfield_10016';
    storyPointsEstimate: number | null = null;
    updatingPoints = signal(false);
    pushSuccess = signal(false);
    pushError = signal<string | null>(null);

    ngOnInit() {
        if (this.authService.accessToken()) {
            this.loadSites();
        }
    }

    loadSites() {
        this.loadingSites.set(true);
        this.jiraApi.getAccessibleResources().subscribe({
            next: (data) => {
                this.sites.set(data);
                if (data.length > 0) {
                    this.selectedCloudId = data[0].id;
                }
                this.loadingSites.set(false);
            },
            error: (err) => {
                console.error('Error loading sites:', err);
                this.loadingSites.set(false);
            }
        });
    }

    onUrlChange() {
        this.pushSuccess.set(false);
        this.pushError.set(null);
        this.issueError.set(null);

        const issueKey = this.getParsedIssueKey();
        this.parsedKey = issueKey;

        if (this.issueInput.includes('.atlassian.net')) {
            const match = this.issueInput.match(/https?:\/\/([^/]+)/);
            if (match && match[1]) {
                const domain = match[1].toLowerCase();
                const matchingSite = this.sites().find(s => s.url.toLowerCase().includes(domain));
                if (matchingSite) {
                    this.selectedCloudId = matchingSite.id;
                }
            }
        }
    }

    getParsedIssueKey(): string {
        const input = this.issueInput.trim();
        if (!input) return '';

        const browseMatch = input.match(/\/browse\/([A-Za-z0-9]+-[0-9]+)/);
        if (browseMatch && browseMatch[1]) {
            return browseMatch[1].toUpperCase();
        }

        const keyMatch = input.match(/^([A-Za-z0-9]+-[0-9]+)$/);
        if (keyMatch && keyMatch[1]) {
            return keyMatch[1].toUpperCase();
        }

        return '';
    }

    fetchIssue() {
        const key = this.getParsedIssueKey();
        if (!key) {
            this.issueError.set('Could not parse a valid issue key (e.g. PROJ-123) from input.');
            return;
        }

        this.loadingIssue.set(true);
        this.issueDetails.set(null);
        this.issueError.set(null);

        this.jiraApi.getIssue(this.selectedCloudId, key).subscribe({
            next: (data) => {
                this.issueDetails.set(data);
                this.loadingIssue.set(false);

                const points = data.fields?.[this.customFieldId];
                if (points !== undefined) {
                    this.storyPointsEstimate = points;
                }
            },
            error: (err) => {
                console.error('Error fetching issue:', err);
                this.issueError.set(`Failed to fetch issue: ${err.message || 'Unknown error'}`);
                this.loadingIssue.set(false);
            }
        });
    }

    getStoryPointsValue(): number | null {
        const details = this.issueDetails();
        if (!details || !details.fields) return null;
        return details.fields[this.customFieldId] ?? null;
    }

    pushStoryPoints() {
        const key = this.getParsedIssueKey();
        if (!key) return;

        if (this.storyPointsEstimate === null) {
            this.pushError.set('Please enter a valid story point estimation value.');
            return;
        }

        this.updatingPoints.set(true);
        this.pushSuccess.set(false);
        this.pushError.set(null);

        this.jiraApi.updateIssueStoryPoints(
            this.selectedCloudId, 
            key, 
            this.customFieldId, 
            this.storyPointsEstimate
        ).subscribe({
            next: () => {
                this.pushSuccess.set(true);
                this.updatingPoints.set(false);
                this.fetchIssue();
            },
            error: (err) => {
                console.error('Error pushing story points:', err);
                this.pushError.set(`Failed to push story points: ${err.message || 'Unknown error'}`);
                this.updatingPoints.set(false);
            }
        });
    }
}

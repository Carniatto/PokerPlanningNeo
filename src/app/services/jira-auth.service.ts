import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class JiraAuthService {
    private http = inject(HttpClient);

    accessToken = signal<string | null>(localStorage.getItem('JIRA_ACCESS_TOKEN'));
    refreshToken = signal<string | null>(localStorage.getItem('JIRA_REFRESH_TOKEN'));
    authError = signal<string | null>(null);

    constructor() {}

    login() {
        this.authError.set(null);
        const scopes = 'read:jira-work read:jira-user write:jira-work';
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('JIRA_OAUTH_STATE', state);

        const authUrl = `https://auth.atlassian.com/authorize?` +
            `audience=api.atlassian.com&` +
            `client_id=${environment.jiraClientId}&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `redirect_uri=${encodeURIComponent(environment.jiraRedirectUri)}&` +
            `state=${state}&` +
            `response_type=code&` +
            `prompt=consent`;

        window.location.href = authUrl;
    }

    exchangeToken(code: string): Promise<void> {
        this.authError.set(null);
        const url = `${environment.functionsBaseUrl}/exchangeToken`;
        return new Promise((resolve, reject) => {
            this.http.post<any>(url, {
                code,
                clientId: environment.jiraClientId,
                redirectUri: environment.jiraRedirectUri
            }).subscribe({
                next: (data) => {
                    if (data.access_token) {
                        this.setToken(data.access_token, data.refresh_token || null);
                        resolve();
                    } else {
                        reject(new Error('No access token returned'));
                    }
                },
                error: (err) => reject(err)
            });
        });
    }

    setToken(access: string | null, refresh: string | null = null) {
        this.accessToken.set(access);
        this.refreshToken.set(refresh);
        if (access) {
            localStorage.setItem('JIRA_ACCESS_TOKEN', access);
        } else {
            localStorage.removeItem('JIRA_ACCESS_TOKEN');
        }
        if (refresh) {
            localStorage.setItem('JIRA_REFRESH_TOKEN', refresh);
        } else {
            localStorage.removeItem('JIRA_REFRESH_TOKEN');
        }
    }

    logout() {
        this.setToken(null, null);
    }
}

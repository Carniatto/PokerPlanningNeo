import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JiraAuthService } from './jira-auth.service';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class JiraApiService {
    private http = inject(HttpClient);
    private auth = inject(JiraAuthService);

    private getProxyHeaders(targetUrl: string): HttpHeaders {
        const token = this.auth.accessToken();
        if (!token) {
            throw new Error('No access token available');
        }
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'X-Target-Url': targetUrl
        });
    }

    private proxyRequest<T>(method: string, targetUrl: string, body?: any): Observable<T> {
        const url = `${environment.functionsBaseUrl}/jiraApiProxy`;
        try {
            const headers = this.getProxyHeaders(targetUrl);
            if (method === 'GET') {
                return this.http.get<T>(url, { headers });
            } else if (method === 'POST') {
                return this.http.post<T>(url, body, { headers });
            } else if (method === 'PUT') {
                return this.http.put<T>(url, body, { headers });
            } else if (method === 'DELETE') {
                return this.http.delete<T>(url, { headers });
            }
            return throwError(() => new Error(`Unsupported method: ${method}`));
        } catch (err) {
            return throwError(() => err);
        }
    }

    getAccessibleResources(): Observable<any[]> {
        return this.proxyRequest<any[]>('GET', 'https://api.atlassian.com/oauth/token/accessible-resources');
    }

    getJiraProfile(cloudId: string): Observable<any> {
        return this.proxyRequest<any>('GET', `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`);
    }

    searchIssues(cloudId: string, jql: string): Observable<any> {
        const targetUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search?jql=${encodeURIComponent(jql)}`;
        return this.proxyRequest<any>('GET', targetUrl);
    }

    getIssue(cloudId: string, issueKey: string): Observable<any> {
        const targetUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`;
        return this.proxyRequest<any>('GET', targetUrl);
    }

    updateIssueStoryPoints(cloudId: string, issueKey: string, storyPointsField: string, value: number): Observable<any> {
        const targetUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`;
        const body = {
            fields: {
                [storyPointsField]: value
            }
        };
        return this.proxyRequest<any>('PUT', targetUrl, body);
    }
}

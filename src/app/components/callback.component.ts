import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JiraAuthService } from '../services/jira-auth.service';

@Component({
    selector: 'app-callback',
    standalone: true,
    template: `
        <div class="callback-container">
            <div class="loader"></div>
            <p>Authenticating with Jira, please wait...</p>
        </div>
    `,
    styles: [`
        .callback-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: 'Outfit', sans-serif;
            background: radial-gradient(circle at 50% 50%, #1e1e38 0%, #0c0c1e 100%);
            color: #ffffff;
        }
        .loader {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #0052cc;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
            box-shadow: 0 0 15px rgba(0, 82, 204, 0.5);
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        p {
            font-size: 1.1rem;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }
    `]
})
export class CallbackComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private jiraAuth = inject(JiraAuthService);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const code = params['code'];
            const state = params['state'];
            const savedState = localStorage.getItem('JIRA_OAUTH_STATE');

            if (savedState && state !== savedState) {
                const errMsg = 'State mismatch. Potential CSRF attack.';
                console.error(errMsg);
                this.jiraAuth.authError.set(errMsg);
                this.router.navigate(['/jira-test']);
                return;
            }
            localStorage.removeItem('JIRA_OAUTH_STATE');

            if (code) {
                this.jiraAuth.exchangeToken(code)
                    .then(() => {
                        console.log('Jira authentication successful!');
                        this.router.navigate(['/jira-test']);
                    })
                    .catch(err => {
                        console.error('Jira authentication failed:', err);
                        // Extract a user-friendly error message
                        let details = 'Unknown error occurred during token exchange.';
                        if (err.error) {
                            details = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
                        } else if (err.message) {
                            details = err.message;
                        }
                        this.jiraAuth.authError.set(`Jira Token Exchange Failed: ${details}`);
                        this.router.navigate(['/jira-test']);
                    });
            } else {
                const errMsg = 'No authorization code found in URL';
                console.error(errMsg);
                this.jiraAuth.authError.set(errMsg);
                this.router.navigate(['/jira-test']);
            }
        });
    }
}

import { Component, inject, OnInit, signal } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-intro',
    imports: [],
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {
    showIntro = signal(true);
    private router = inject(Router);

    ngOnInit() {
        // Check local storage
        if (localStorage.getItem('hasSeenIntro') === 'true') {
            this.showIntro.set(false);
            return;
        }

        // If we are deep linking to a room, don't show intro
        // We need to wait for navigation to complete to know the URL
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            const url = event.url;
            if (url.includes('/room/') || url.includes('/how-it-works') || url.includes('/about')) {
                this.showIntro.set(false);
                // Optionally mark as seen if they deep link? Maybe not.
            }
        });
    }

    enterApp() {
        localStorage.setItem('hasSeenIntro', 'true');
        this.showIntro.set(false);
    }
}

import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { AboutComponent } from './about/about.component';
import { roomGuard } from './guards/room.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'how-it-works', loadComponent: () => import('./how-it-works/how-it-works.component').then(m => m.HowItWorksComponent) },
    { path: 'room/:id', component: RoomComponent, canActivate: [roomGuard] },
    { path: 'auth/callback', loadComponent: () => import('./components/callback.component').then(m => m.CallbackComponent) },
    { path: 'privacy', loadComponent: () => import('./privacy/privacy.component').then(m => m.PrivacyComponent) },
    { path: 'terms', loadComponent: () => import('./terms/terms.component').then(m => m.TermsComponent) },
    { path: 'jira-test', loadComponent: () => import('./jira-test/jira-test.component').then(m => m.JiraTestComponent) },
    { path: '**', redirectTo: '' }
];


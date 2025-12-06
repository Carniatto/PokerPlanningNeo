import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'how-it-works', loadComponent: () => import('./how-it-works/how-it-works.component').then(m => m.HowItWorksComponent) },
    { path: 'room/:id', component: RoomComponent },
    { path: '**', redirectTo: '' }
];

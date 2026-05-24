import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideFirestore(() => {
            const firestore = getFirestore();
            if (isDevMode()) {
                connectFirestoreEmulator(firestore, 'localhost', 50000);
            }
            return firestore;
        }),
        provideAuth(() => {
            const auth = getAuth();
            if (isDevMode()) {
                connectAuthEmulator(auth, 'http://localhost:9099');
            }
            return auth;
        })
    ]
};

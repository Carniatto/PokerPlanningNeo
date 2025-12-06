import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';

import { routes } from './app.routes';

const firebaseConfig = {
    apiKey: "REDACTED_API_KEY",
    authDomain: "pokerplanningneo.firebaseapp.com",
    projectId: "pokerplanningneo",
    storageBucket: "pokerplanningneo.firebasestorage.app",
    messagingSenderId: "REDACTED_MESSAGING_SENDER_ID",
    appId: "REDACTED_APP_ID",
    measurementId: "REDACTED_MEASUREMENT_ID"
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
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

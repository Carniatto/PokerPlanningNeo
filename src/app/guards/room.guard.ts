import { inject, Injector, runInInjectionContext } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export const roomGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router);
    const firestore = inject(Firestore);
    const injector = inject(Injector);

    const roomId = route.paramMap.get('id');

    if (!roomId) {
        return router.createUrlTree(['/']);
    }

    try {
        const roomRef = runInInjectionContext(injector, () => doc(firestore, 'rooms', roomId));
        const docSnap = await runInInjectionContext(injector, () => getDoc(roomRef));

        if (docSnap.exists()) {
            return true;
        } else {
            // Redirect to home with a query param to show a banner
            return router.createUrlTree(['/'], { queryParams: { error: 'room_not_found' } });
        }
    } catch (error) {
        console.error("Error accessing room:", error);
        // In case of error (e.g. offline), safer to redirect than hang
        return router.createUrlTree(['/']);
    }
};

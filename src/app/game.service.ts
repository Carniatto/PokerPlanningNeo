import { Injectable, inject, signal, effect } from '@angular/core';
import { Firestore, doc, docData, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, getDoc } from '@angular/fire/firestore';
import { Auth, signInAnonymously, user, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';

export interface Player {
    id: string;
    name: string;
    status: 'Voted' | 'Waiting...' | 'Not Participating' | 'Disconnected';
    vote?: string | null;
    avatarUrl?: string;
}

export interface Room {
    hostId: string;
    areCardsRevealed: boolean;
    players: Player[];
    roomName?: string;
    currentStory?: string;
    createdAt?: number;
    lastActiveAt?: number;
    currentPlayerId?: string;
    status?: 'active' | 'ended';
}

const STORAGE_KEY = 'POKER_USER_NAME';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);
    private router = inject(Router);

    currentUser = signal<User | null>(null);
    currentRoomId = signal<string | null>(null);
    currentRoomData = signal<Room | null>(null);

    // Derived signals
    players = signal<Player[]>([]);
    isHost = signal<boolean>(false);
    areCardsRevealed = signal<boolean>(false);

    private roomSubscription?: Subscription;

    constructor() {
        console.log('GameService initialized');
        // Monitor Auth State
        user(this.auth).subscribe(user => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            this.currentUser.set(user);
            if (!user) {
                console.log('No user, attempting anonymous sign-in...');
                signInAnonymously(this.auth).then(() => {
                    console.log('Anonymous sign-in successful');
                }).catch(error => {
                    console.error('Anonymous sign-in failed:', error);
                });
            }
        });

        // Effect to update derived signals when room data changes
        effect(() => {
            const roomData = this.currentRoomData();
            const user = this.currentUser();

            if (roomData) {
                this.players.set(roomData.players || []);
                this.areCardsRevealed.set(roomData.areCardsRevealed);
                if (user) {
                    this.isHost.set(roomData.hostId === user.uid);
                }
            } else {
                this.players.set([]);
                this.isHost.set(false);
                this.areCardsRevealed.set(false);
            }
        }, { allowSignalWrites: true });
    }

    async createRoom(userName: string) {
        console.log('createRoom called with:', userName);
        localStorage.setItem(STORAGE_KEY, userName);

        try {
            let user = this.currentUser();
            if (!user) {
                console.log('User not logged in, waiting for auth...');
                const credential = await signInAnonymously(this.auth);
                user = credential.user;
                console.log('Signed in (explicitly).');
            }

            if (!user) {
                console.error('Authentication failed: currentUser is null after sign-in attempt');
                throw new Error('Authentication failed');
            }

            const roomId = this.generateRoomId();
            console.log('Generated Room ID:', roomId);
            const roomRef = doc(this.firestore, 'rooms', roomId);

            const hostPlayer: Player = {
                id: user.uid,
                name: userName,
                status: 'Waiting...',
                vote: null
            };

            const now = Date.now();
            const newRoom: Room = {
                hostId: user.uid,
                areCardsRevealed: false,
                players: [hostPlayer],
                roomName: 'New Planning Session',
                currentStory: '',
                status: 'active',
                createdAt: now,
                lastActiveAt: now
            };

            console.log('Setting document in Firestore...');
            await setDoc(roomRef, newRoom);
            console.log('Document set. Joining room...');
            await this.joinRoom(roomId);
            return roomId;
        } catch (error) {
            console.error('Error in GameService.createRoom:', error);
            throw error;
        }
    }

    async joinRoom(roomId: string, userName?: string) {
        let user = this.currentUser();
        if (!user) {
            const credential = await signInAnonymously(this.auth);
            user = credential.user;
        }

        if (!user) throw new Error('Authentication failed');

        this.currentRoomId.set(roomId);

        // Persist name if provided
        if (userName) {
            localStorage.setItem(STORAGE_KEY, userName);
        }

        // Subscribe to room updates
        const roomRef = doc(this.firestore, 'rooms', roomId);
        this.roomSubscription?.unsubscribe();

        this.roomSubscription = docData(roomRef).subscribe((data: any) => {
            if (data) {
                this.currentRoomData.set(data as Room);
            } else {
                // Room might have been deleted or doesn't exist
                this.currentRoomData.set(null);
            }
        });

        // Add or Update player in the room
        if (userName) {
            // We need to fetch the latest state to check duplications
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                const roomData = roomSnap.data() as Room;
                const existingPlayer = roomData.players.find(p => p.id === user!.uid);

                if (existingPlayer) {
                    // Update existing player (Name, Active Status)
                    const updatedPlayers = roomData.players.map(p => {
                        if (p.id === user!.uid) {
                            return { ...p, name: userName, status: 'Waiting...' as const };
                        }
                        return p;
                    });
                    await updateDoc(roomRef, {
                        players: updatedPlayers,
                        lastActiveAt: Date.now()
                    });
                } else {
                    // Add new player
                    const player: Player = {
                        id: user.uid,
                        name: userName,
                        status: 'Waiting...',
                        vote: null
                    };
                    await updateDoc(roomRef, {
                        players: arrayUnion(player),
                        lastActiveAt: Date.now()
                    });
                }
            }
        }
    }

    async leaveRoom(roomId: string, userId: string) {
        const roomRef = doc(this.firestore, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
            const roomData = roomSnap.data() as Room;
            const updatedPlayers = roomData.players.filter(p => p.id !== userId);

            await updateDoc(roomRef, {
                players: updatedPlayers,
                lastActiveAt: Date.now()
            });

            // Clear local state
            this.currentRoomId.set(null);
            this.currentRoomData.set(null);
            this.roomSubscription?.unsubscribe();
        }
    }

    cleanupLocalGameState() {
        this.roomSubscription?.unsubscribe();
        this.currentRoomId.set(null);
        this.currentRoomData.set(null);
    }

    async setPlayerStatus(roomId: string, userId: string, status: Player['status']) {
        const roomRef = doc(this.firestore, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
            const roomData = roomSnap.data() as Room;
            const updatedPlayers = roomData.players.map(p => {
                if (p.id === userId) {
                    return { ...p, status };
                }
                return p;
            });

            await updateDoc(roomRef, {
                players: updatedPlayers,
                lastActiveAt: Date.now()
            });
        }
    }

    async updatePlayerName(roomId: string, userId: string, newName: string) {
        const roomRef = doc(this.firestore, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
            const roomData = roomSnap.data() as Room;
            const updatedPlayers = roomData.players.map(p => {
                if (p.id === userId) {
                    return { ...p, name: newName };
                }
                return p;
            });

            await updateDoc(roomRef, {
                players: updatedPlayers,
                lastActiveAt: Date.now()
            });
            localStorage.setItem(STORAGE_KEY, newName);
        }
    }

    async updateRoomName(roomId: string, name: string) {
        const roomRef = doc(this.firestore, 'rooms', roomId);
        await updateDoc(roomRef, {
            roomName: name,
            lastActiveAt: Date.now()
        });
    }

    async updateCurrentStory(roomId: string, story: string) {
        const roomRef = doc(this.firestore, 'rooms', roomId);
        await updateDoc(roomRef, {
            currentStory: story,
            lastActiveAt: Date.now()
        });
    }

    async endSession(roomId: string) {
        const roomRef = doc(this.firestore, 'rooms', roomId);
        await updateDoc(roomRef, {
            status: 'ended',
            players: [], // Remove all players
            lastActiveAt: Date.now()
        });
    }

    private async addPlayerToRoom(roomId: string, player: Player) {
        const roomRef = doc(this.firestore, 'rooms', roomId);
        await updateDoc(roomRef, {
            players: arrayUnion(player),
            lastActiveAt: Date.now()
        });
    }

    async vote(voteValue: string) {
        const roomId = this.currentRoomId();
        const user = this.currentUser();
        const roomData = this.currentRoomData();

        if (!roomId || !user || !roomData) return;

        const updatedPlayers = roomData.players.map(p => {
            if (p.id === user.uid) {
                return { ...p, vote: voteValue, status: 'Voted' as const };
            }
            return p;
        });

        const roomRef = doc(this.firestore, 'rooms', roomId);
        await updateDoc(roomRef, {
            players: updatedPlayers,
            lastActiveAt: Date.now()
        });
    }

    async revealCards(reveal: boolean) {
        const roomId = this.currentRoomId();
        if (!roomId) return;
        const roomRef = doc(this.firestore, 'rooms', roomId);
        await updateDoc(roomRef, {
            areCardsRevealed: reveal,
            lastActiveAt: Date.now()
        });
    }

    async resetVotes() {
        const roomId = this.currentRoomId();
        const roomData = this.currentRoomData();
        if (!roomId || !roomData) return;

        const updatedPlayers = roomData.players.map(p => ({
            ...p,
            vote: null,
            status: 'Waiting...' as const
        }));

        const roomRef = doc(this.firestore, 'rooms', roomId);
        await updateDoc(roomRef, {
            players: updatedPlayers,
            areCardsRevealed: false,
            lastActiveAt: Date.now()
        });
    }

    private generateRoomId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}

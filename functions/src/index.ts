import * as admin from "firebase-admin";
import * as corsLib from "cors";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "europe-west1" });

const cors = corsLib({ origin: true });
const JIRA_CLIENT_SECRET = defineSecret("JIRA_CLIENT_SECRET");

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const cleanZombieRooms = onSchedule("every 24 hours", async (event) => {
    const now = Date.now();
    const cutoff = now - TWENTY_FOUR_HOURS_MS;

    const roomsRef = admin.firestore().collection("rooms");
    const snapshot = await roomsRef.where("lastActiveAt", "<", cutoff).get();

    if (snapshot.empty) {
        console.log("No zombie rooms found.");
        return;
    }

    const batch = admin.firestore().batch();
    let deleteCount = 0;

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
    });

    await batch.commit();
    console.log(`Deleted ${deleteCount} zombie rooms.`);
});

// Manual trigger for testing
export const cleanZombieRoomsManual = onRequest(async (req, res) => {
    const now = Date.now();
    // For manual testing, we might want a shorter cutoff or just use the same logic
    // Using 24 hours for consistency, but logic can be adjusted for testing.
    const cutoff = now - TWENTY_FOUR_HOURS_MS;

    const roomsRef = admin.firestore().collection("rooms");
    const snapshot = await roomsRef.where("lastActiveAt", "<", cutoff).get();

    if (snapshot.empty) {
        res.send("No zombie rooms found.");
        return;
    }

    const batch = admin.firestore().batch();
    let deleteCount = 0;

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
    });

    await batch.commit();
    res.send(`Deleted ${deleteCount} zombie rooms.`);
});

export const cleanEmptyRooms = onDocumentUpdated("rooms/{roomId}", async (event) => {
    const change = event.data;
    if (!change) return;

    const newData = change.after.data();
    if (!newData) return; // Document deleted

    const roomId = event.params.roomId;
    const players = newData.players || [];

    // Check for "Disconnected" players
    const disconnectedPlayers = players.filter((p: any) => p.status === 'Disconnected');

    if (disconnectedPlayers.length > 0) {
        console.log(`Found ${disconnectedPlayers.length} disconnected players in room ${roomId}. Waiting 20s...`);
        // Wait 20s
        await new Promise(resolve => setTimeout(resolve, 20000));

        // Re-fetch
        const currentDoc = await change.after.ref.get();
        if (!currentDoc.exists) return;

        const currentData = currentDoc.data();
        const currentPlayers = currentData?.players || [];

        // Filter out players who are STILL disconnected
        // (If they refreshed, their status would be 'Waiting...' or joined again)
        // Note: The logic assumes the client sets them back to 'Waiting...' on join. 
        // If they stay 'Disconnected', they get removed.
        const playersToRemove = disconnectedPlayers.filter((dp: any) => {
            const currentPlayerState = currentPlayers.find((cp: any) => cp.id === dp.id);
            return currentPlayerState && currentPlayerState.status === 'Disconnected';
        });

        if (playersToRemove.length > 0) {
            console.log(`Removing ${playersToRemove.length} players who are still Disconnected.`);
            const updatedPlayers = currentPlayers.filter((cp: any) =>
                !playersToRemove.some((pr: any) => pr.id === cp.id)
            );

            // If checking players removals results in empty room, it will trigger this function again recursively (or we can handle it here)
            // But let's just update for now. 
            // If updatedPlayers is empty, the NEXT trigger will see empty array and delete the room.
            if (updatedPlayers.length === 0) {
                console.log("Room became empty after removing disconnected users. Deleting room.");
                await change.after.ref.delete();
            } else {
                await change.after.ref.update({ players: updatedPlayers });
            }
            return;
        }
    }

    // Existing "Empty Room" logic (fallback if room is truly empty [])
    if (players.length === 0) {
        console.log(`Room ${roomId} is empty. Deleting...`);
        await change.after.ref.delete();
    }
});

// ============================================================================
// Jira Integration Endpoints
// ============================================================================

export const exchangeToken = onRequest({ secrets: [JIRA_CLIENT_SECRET] }, (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const { code, clientId, redirectUri } = req.body;

        if (!code || !clientId || !redirectUri) {
            res.status(400).send('Missing required parameters');
            return;
        }

        try {
            const secretValue = JIRA_CLIENT_SECRET.value();
            const response = await fetch('https://auth.atlassian.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: secretValue,
                    code: code,
                    redirect_uri: redirectUri
                })
            });

            if (!response.ok) {
                const err = await response.text();
                console.error('Error exchanging token:', err);
                res.status(response.status).send(err);
                return;
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('Internal Error in exchangeToken:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

export const jiraApiProxy = onRequest((req, res) => {
    cors(req, res, async () => {
        // Only allow specific methods if necessary, or pass through everything
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            res.status(401).send('Missing Authorization header');
            return;
        }

        const targetUrl = req.header('X-Target-Url');
        if (!targetUrl || !targetUrl.startsWith('https://api.atlassian.com/')) {
            res.status(400).send('Invalid or missing X-Target-Url header');
            return;
        }

        try {
            // Forward the request to Jira
            const fetchOptions: RequestInit = {
                method: req.method,
                headers: {
                    'Authorization': authHeader,
                    'Accept': req.header('Accept') || 'application/json',
                    'Content-Type': req.header('Content-Type') || 'application/json'
                }
            };

            // Only attach body if method is not GET/HEAD
            if (req.method !== 'GET' && req.method !== 'HEAD' && req.rawBody) {
                fetchOptions.body = req.rawBody;
            }

            const response = await fetch(targetUrl, fetchOptions);

            const data = await response.text();
            
            // Forward the status and headers back to the client
            res.status(response.status).send(data);
        } catch (error) {
            console.error('Error proxying request to Jira:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

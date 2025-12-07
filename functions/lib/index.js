"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanEmptyRooms = exports.cleanZombieRoomsManual = exports.cleanZombieRooms = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
exports.cleanZombieRooms = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    const now = Date.now();
    const cutoff = now - TWENTY_FOUR_HOURS_MS;
    const roomsRef = admin.firestore().collection("rooms");
    const snapshot = await roomsRef.where("lastActiveAt", "<", cutoff).get();
    if (snapshot.empty) {
        console.log("No zombie rooms found.");
        return null;
    }
    const batch = admin.firestore().batch();
    let deleteCount = 0;
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
    });
    await batch.commit();
    console.log(`Deleted ${deleteCount} zombie rooms.`);
    return null;
});
// Manual trigger for testing
exports.cleanZombieRoomsManual = functions.https.onRequest(async (req, res) => {
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
exports.cleanEmptyRooms = functions.firestore.document("rooms/{roomId}").onUpdate(async (change, context) => {
    const newData = change.after.data();
    if (!newData)
        return null; // Document deleted
    const players = newData.players || [];
    // Check for "Disconnected" players
    const disconnectedPlayers = players.filter((p) => p.status === 'Disconnected');
    if (disconnectedPlayers.length > 0) {
        console.log(`Found ${disconnectedPlayers.length} disconnected players in room ${context.params.roomId}. Waiting 20s...`);
        // Wait 20s
        await new Promise(resolve => setTimeout(resolve, 20000));
        // Re-fetch
        const currentDoc = await change.after.ref.get();
        if (!currentDoc.exists)
            return null;
        const currentData = currentDoc.data();
        const currentPlayers = (currentData === null || currentData === void 0 ? void 0 : currentData.players) || [];
        // Filter out players who are STILL disconnected
        // (If they refreshed, their status would be 'Waiting...' or joined again)
        // Note: The logic assumes the client sets them back to 'Waiting...' on join. 
        // If they stay 'Disconnected', they get removed.
        const playersToRemove = disconnectedPlayers.filter((dp) => {
            const currentPlayerState = currentPlayers.find((cp) => cp.id === dp.id);
            return currentPlayerState && currentPlayerState.status === 'Disconnected';
        });
        if (playersToRemove.length > 0) {
            console.log(`Removing ${playersToRemove.length} players who are stil Disconnected.`);
            const updatedPlayers = currentPlayers.filter((cp) => !playersToRemove.some((pr) => pr.id === cp.id));
            // If checking players removals results in empty room, it will trigger this function again recursively (or we can handle it here)
            // But let's just update for now. 
            // If updatedPlayers is empty, the NEXT trigger will see empty array and delete the room.
            if (updatedPlayers.length === 0) {
                console.log("Room became empty after removing disconnected users. Deleting room.");
                await change.after.ref.delete();
            }
            else {
                await change.after.ref.update({ players: updatedPlayers });
            }
            return null;
        }
    }
    // Existing "Empty Room" logic (fallback if room is truly empty [])
    if (players.length === 0) {
        console.log(`Room ${context.params.roomId} is empty. Deleting...`);
        await change.after.ref.delete();
    }
    return null;
});
//# sourceMappingURL=index.js.map
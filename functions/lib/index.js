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
    if (players.length === 0) {
        console.log(`Room ${context.params.roomId} is empty. Waiting 20s grace period...`);
        // Grace period for refresh/reconnection
        await new Promise(resolve => setTimeout(resolve, 20000));
        // Re-fetch the latest state
        const currentDoc = await change.after.ref.get();
        if (!currentDoc.exists)
            return null; // Already deleted
        const currentData = currentDoc.data();
        const currentPlayers = (currentData === null || currentData === void 0 ? void 0 : currentData.players) || [];
        if (currentPlayers.length === 0) {
            console.log(`Room ${context.params.roomId} still empty after grace period. Deleting...`);
            await change.after.ref.delete();
        }
        else {
            console.log(`Room ${context.params.roomId} recovered (player joined). Aborting delete.`);
        }
    }
    return null;
});
//# sourceMappingURL=index.js.map
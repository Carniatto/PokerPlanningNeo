import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const cleanZombieRooms = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
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
export const cleanZombieRoomsManual = functions.https.onRequest(async (req, res) => {
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

export const cleanEmptyRooms = functions.firestore.document("rooms/{roomId}").onUpdate(async (change, context) => {
    const newData = change.after.data();
    if (!newData) return null; // Document deleted

    const players = newData.players || [];
    if (players.length === 0) {
        console.log(`Room ${context.params.roomId} is empty. Deleting...`);
        await change.after.ref.delete();
    }
    return null;
});

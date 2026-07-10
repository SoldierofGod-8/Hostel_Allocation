const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

const db = getFirestore();
const auth = getAuth();

exports.allocateRoom = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { hostelId, roomId } = request.data;
  const userId = request.auth.uid;

  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();

  if (!roomDoc.exists) {
    throw new HttpsError("not-found", "Room not found.");
  }

  const roomData = roomDoc.data();
  if (roomData.occupiedBeds >= roomData.totalBeds) {
    throw new HttpsError("failed-precondition", "Room is full.");
  }

  const existingAllocation = await db.collection("allocations")
    .where("userId", "==", userId)
    .where("hostelId", "==", hostelId)
    .get();

  if (!existingAllocation.empty) {
    throw new HttpsError("already-exists", "You already have a room in this hostel.");
  }

  await db.collection("allocations").add({
    userId,
    hostelId,
    roomId,
    allocatedAt: new Date(),
    status: "active",
  });

  await roomRef.update({
    occupiedBeds: roomData.occupiedBeds + 1,
  });

  return { success: true, message: "Room allocated successfully." };
});

exports.onUserCreated = async (event) => {
  const user = event.data;
  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    role: "student",
    createdAt: new Date(),
  });
};

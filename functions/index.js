const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.releaseExpiredReservations = onSchedule("every 1 mins", async (event) => {
  const now = admin.firestore.Timestamp.now();
  console.log(`Running reservation cleanup task at: ${now.toDate().toISOString()}`);

  try {
    const expiredQuery = await db.collection("allocations")
      .where("status", "==", "reserved")
      .where("reservedUntil", "<", now)
      .get();

    if (expiredQuery.empty) {
      console.log("No expired reservations found.");
      return;
    }

    console.log(`Found ${expiredQuery.size} expired reservations. Processing restoration batch...`);
    const batch = db.batch();

    for (const docSnapshot of expiredQuery.docs) {
      const data = docSnapshot.data();
      const roomId = data.roomPath.split("/")[1];

      const bedRef = db.doc(`rooms/${roomId}/beds/${data.bedId}`);
      const roomRef = db.doc(`rooms/${roomId}`);
      const userRef = db.doc(`users/${data.studentId}`);
      const allocationRef = docSnapshot.ref;

      batch.update(bedRef, {
        isReserved: false,
        reservedBy: null,
        reservedAt: null
      });

      batch.update(roomRef, {
        occupiedBeds: admin.firestore.FieldValue.increment(-1),
        status: "available"
      });

      batch.update(userRef, {
        currentAllocationId: null
      });

      batch.delete(allocationRef);
    }

    await batch.commit();
    console.log(`Successfully restored ${expiredQuery.size} bedspaces back to active inventory.`);
  } catch (error) {
    console.error("Fatal error during automated restoration run: ", error);
  }
});

exports.confirmBursarPayment = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed. Use POST." });
  }

  const { studentId, paymentReference } = req.body;

  if (!studentId || !paymentReference) {
    return res.status(400).send({ error: "Missing required fields: studentId, paymentReference" });
  }

  try {
    const userRef = db.collection("users").doc(studentId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).send({ error: "Student profile not found." });
    }

    const userData = userSnap.data();
    const allocationId = userData.currentAllocationId;

    if (!allocationId) {
      return res.status(400).send({ error: "This student does not hold any active reservations." });
    }

    const allocationRef = db.collection("allocations").doc(allocationId);
    const allocationSnap = await allocationRef.get();

    if (!allocationSnap.exists) {
      return res.status(404).send({ error: "Target allocation lease document not found." });
    }

    const allocationData = allocationSnap.data();

    if (allocationData.status !== "reserved") {
      return res.status(400).send({ error: `Allocation lease is already ${allocationData.status}` });
    }

    const roomId = allocationData.roomPath.split("/")[1];
    const bedRef = db.doc(`rooms/${roomId}/beds/${allocationData.bedId}`);
    const roomRef = db.doc(`rooms/${roomId}`);

    const batch = db.batch();

    batch.update(allocationRef, {
      status: "active",
      paymentConfirmedAt: admin.firestore.Timestamp.now(),
      paymentRef: paymentReference
    });

    batch.update(bedRef, {
      isConfirmed: true
    });

    batch.update(roomRef, {
      confirmedBeds: admin.firestore.FieldValue.increment(1)
    });

    await batch.commit();

    console.log(`Room allocation finalized successfully for student: ${studentId}`);
    return res.status(200).send({
      success: true,
      message: "Payment verified. Accommodation booking completed successfully!"
    });

  } catch (error) {
    console.error("Payment confirmation routine failed: ", error);
    return res.status(500).send({ error: error.message });
  }
});

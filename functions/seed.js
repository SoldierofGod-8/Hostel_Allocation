const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const HOSTELS = [
  {
    id: "male_hostel_a",
    name: "Hall of Justice (Hostel A)",
    genderAllowed: "male",
    totalRooms: 400
  },
  {
    id: "female_hostel_b",
    name: "Hall of Grace (Hostel B)",
    genderAllowed: "female",
    totalRooms: 400
  }
];

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function seedDatabase() {
  console.log("Starting database seeding operation...");

  try {
    for (const hostel of HOSTELS) {
      console.log(`Writing hostel document: ${hostel.name}`);
      await db.collection("hostels").doc(hostel.id).set({
        name: hostel.name,
        genderAllowed: hostel.genderAllowed,
        totalRooms: hostel.totalRooms,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const operations = [];

    for (const hostel of HOSTELS) {
      console.log(`Generating room metadata for ${hostel.name}...`);

      for (let roomNum = 101; roomNum <= 500; roomNum++) {
        const roomId = `${hostel.id}_room_${roomNum}`;
        const roomRef = db.collection("rooms").doc(roomId);

        const isTwoBed = roomNum % 2 === 0;
        const totalBeds = isTwoBed ? 2 : 4;

        operations.push({
          ref: roomRef,
          data: {
            roomNumber: roomNum.toString(),
            hostelId: hostel.id,
            floor: 1,
            genderAllowed: hostel.genderAllowed,
            roomType: totalBeds,
            totalBeds: totalBeds,
            occupiedBeds: 0,
            confirmedBeds: 0,
            status: "available",
            lockedBy: null,
            lockExpiry: null
          },
          type: "set"
        });

        for (let bedIndex = 1; bedIndex <= totalBeds; bedIndex++) {
          const bedLabel = String.fromCharCode(64 + bedIndex);
          const bedId = `bed_${bedIndex}`;
          const bedRef = db.collection("rooms").doc(roomId).collection("beds").doc(bedId);

          operations.push({
            ref: bedRef,
            data: {
              bedLabel: `Bed ${bedLabel}`,
              isReserved: false,
              isConfirmed: false,
              reservedBy: null,
              reservedAt: null
            },
            type: "set"
          });
        }
      }
    }

    console.log(`\nGenerated ${operations.length} document operations in memory.`);
    console.log("Splitting operations into safe transaction batches of 500...");

    const batches = chunkArray(operations, 450);
    let batchCounter = 1;

    for (const batchQueue of batches) {
      const writeBatch = db.batch();

      for (const op of batchQueue) {
        if (op.type === "set") {
          writeBatch.set(op.ref, op.data);
        }
      }

      console.log(`Writing batch ${batchCounter} of ${batches.length}...`);
      await writeBatch.commit();
      batchCounter++;
    }

    console.log("\nSeeding completed successfully! 800 Rooms and 2,400 Bedspaces are now online.");
    process.exit(0);

  } catch (error) {
    console.error("Seeding execution failed: ", error);
    process.exit(1);
  }
}

seedDatabase();

import { db } from "../firebaseConfig";
import { doc, setDoc, collection, getDocs, query, where, Timestamp } from "firebase/firestore";

const HOSTELS = [
  { id: "male_hostel_a", name: "Block A (Male)", gender: "male", wings: [{ label: "A1", floors: 5 }, { label: "A2", floors: 5 }], roomsPerFloor: 20 },
  { id: "male_hostel_b", name: "Block B (Male)", gender: "male", wings: [{ label: "B1", floors: 5 }, { label: "B2", floors: 5 }], roomsPerFloor: 20 },
  { id: "female_hostel_c", name: "Block C (Female)", gender: "female", wings: [{ label: "C1", floors: 5 }, { label: "C2", floors: 5 }], roomsPerFloor: 20 },
  { id: "female_hostel_d", name: "Block D (Female)", gender: "female", wings: [{ label: "D1", floors: 5 }, { label: "D2", floors: 5 }], roomsPerFloor: 20 },
];

const DEMO_USERS = [
  {
    uid: "stud_alex_99",
    name: "Alex Ngozi",
    email: "alex.n@university.edu",
    matric: "ADUN/2022/1234",
    role: "student",
    gender: "male",
    academicLevel: 400,
    isEligible: true,
    currentAllocationId: null,
  },
  {
    uid: "stud_grace_88",
    name: "Grace Okonkwo",
    email: "grace.o@university.edu",
    matric: "ADUN/2023/5678",
    role: "student",
    gender: "female",
    academicLevel: 300,
    isEligible: true,
    currentAllocationId: null,
  },
];

function generateRooms(hostelId, gender, wingLabel, floor, roomCount, roomType) {
  const rooms = [];
  const startNum = floor * 100 + 1;
  for (let i = 0; i < roomCount; i++) {
    const roomNumber = `${wingLabel}-${startNum + i}`;
    const occupiedBeds = Math.random() < 0.3
      ? Math.floor(Math.random() * roomType)
      : 0;

    rooms.push({
      hostelId,
      wing: wingLabel,
      floor,
      roomNumber: String(roomNumber),
      roomType,
      totalBeds: roomType,
      occupiedBeds,
      genderAllowed: gender,
      status: occupiedBeds >= roomType ? "full" : "available",
      createdAt: Timestamp.now(),
    });
  }
  return rooms;
}

function generateBeds(roomType) {
  const beds = [];
  const labels = roomType === 2 ? ["A", "B"] : ["A", "B", "C", "D"];
  for (const label of labels) {
    beds.push({
      bedLabel: `Bed ${label}`,
      isReserved: false,
      reservedBy: null,
      reservedAt: null,
    });
  }
  return beds;
}

export async function seedHostelData() {
  let totalRooms = 0;
  let totalBeds = 0;

  for (const hostel of HOSTELS) {
    const existingRooms = await getDocs(
      query(collection(db, "rooms"), where("hostelId", "==", hostel.id))
    );

    if (existingRooms.size > 0) {
      console.log(`Rooms already exist for ${hostel.name}, skipping...`);
      continue;
    }

    for (const wing of hostel.wings) {
      for (let floor = 1; floor <= wing.floors; floor++) {
        const roomType = floor <= 1 ? 2 : 4;
        const rooms = generateRooms(hostel.id, hostel.gender, wing.label, floor, hostel.roomsPerFloor, roomType);

        for (const roomData of rooms) {
          const roomRef = doc(collection(db, "rooms"));
          await setDoc(roomRef, roomData);
          totalRooms++;

          const beds = generateBeds(roomData.roomType);
          for (const bedData of beds) {
            const bedRef = doc(collection(db, "rooms", roomRef.id, "beds"));
            await setDoc(bedRef, bedData);
            totalBeds++;
          }
        }
      }
    }
  }

  for (const profile of DEMO_USERS) {
    const userRef = doc(db, "users", profile.uid);
    await setDoc(userRef, profile, { merge: true });
    console.log(`Demo user ${profile.name} synced.`);
  }

  console.log(`Seeding complete: ${totalRooms} rooms, ${totalBeds} beds created.`);
  return { totalRooms, totalBeds };
}

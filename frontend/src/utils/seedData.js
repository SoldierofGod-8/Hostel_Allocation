import { db } from "../firebaseConfig";
import { doc, setDoc, collection, getDocs, query, where, Timestamp } from "firebase/firestore";

const HOSTELS = [
  { id: "male_hostel_a", name: "Block A (Male)", gender: "male", wings: [{ label: "A1", floors: 2 }, { label: "A2", floors: 1 }] },
  { id: "male_hostel_b", name: "Block B (Male)", gender: "male", wings: [{ label: "B1", floors: 1 }, { label: "B2", floors: 1 }] },
  { id: "female_hostel_c", name: "Block C (Female)", gender: "female", wings: [{ label: "C1", floors: 2 }, { label: "C2", floors: 1 }] },
  { id: "female_hostel_d", name: "Block D (Female)", gender: "female", wings: [{ label: "D1", floors: 1 }, { label: "D2", floors: 1 }] },
];

function generateRooms(hostelId, gender, wingLabel, floor, roomCount, roomType) {
  const rooms = [];
  const startNum = floor * 100 + 1;
  for (let i = 0; i < roomCount; i++) {
    const roomNumber = startNum + i;
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
        const rooms = generateRooms(hostel.id, hostel.gender, wing.label, floor, 4, roomType);

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

    const studentProfiles = [
      {
        uid: `stud_sample_${hostel.gender}_1`,
        name: hostel.gender === "male" ? "Alex Ngozi" : "Grace Okonkwo",
        gender: hostel.gender,
        isEligible: true,
      },
      {
        uid: `stud_sample_${hostel.gender}_2`,
        name: hostel.gender === "male" ? "Michael Obi" : "Sarah Adeyemi",
        gender: hostel.gender,
        isEligible: true,
      },
      {
        uid: `stud_sample_${hostel.gender}_3`,
        name: hostel.gender === "male" ? "David Olu" : "Esther Nnamdi",
        gender: hostel.gender,
        isEligible: false,
      },
    ];

    for (const profile of studentProfiles) {
      const userRef = doc(db, "users", profile.uid);
      await setDoc(
        userRef,
        {
          uid: profile.uid,
          name: profile.name,
          email: `${profile.name.toLowerCase().replace(/\s+/g, ".")}@university.edu`,
          role: "student",
          gender: profile.gender,
          academicLevel: Math.floor(Math.random() * 4 + 1) * 100,
          isEligible: profile.isEligible,
          currentAllocationId: null,
        },
        { merge: true }
      );
    }
  }

  console.log(`Seeding complete: ${totalRooms} rooms, ${totalBeds} beds created.`);
  return { totalRooms, totalBeds };
}

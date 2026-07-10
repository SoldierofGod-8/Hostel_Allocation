import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  runTransaction,
  Timestamp,
  getDocs,
} from "firebase/firestore";

const MAX_ATTEMPTS = 3;
const WINDOW_HOURS = 24;
const LOCK_MINUTES = 5;

export function subscribeToUser(uid, onData) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) onData(snap.data());
  });
}

export function subscribeToRooms(hostelId, gender, onData, onError) {
  const q = query(
    collection(db, "rooms"),
    where("hostelId", "==", hostelId),
    where("genderAllowed", "==", gender)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const rooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      rooms.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber));
      onData(rooms);
    },
    onError
  );
}

export async function fetchBeds(roomId) {
  const snap = await getDocs(collection(db, "rooms", roomId, "beds"));
  const beds = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  beds.sort((a, b) => a.bedLabel.localeCompare(b.bedLabel));
  return beds;
}

export function isAbuseBlocked(userData) {
  if (!userData?.abuseBlockUntil) return false;
  const blockExpiry = userData.abuseBlockUntil.toDate?.() || new Date(userData.abuseBlockUntil);
  return blockExpiry > new Date();
}

export function getAbuseBlockTimeRemaining(userData) {
  if (!isAbuseBlocked(userData)) return null;
  const blockExpiry = userData.abuseBlockUntil.toDate?.() || new Date(userData.abuseBlockUntil);
  return Math.max(0, Math.floor((blockExpiry - new Date()) / 1000 / 60));
}

export function getRecentAttemptCount(userData) {
  if (!userData?.reservationAttempts) return 0;
  const cutoff = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);
  return userData.reservationAttempts.filter((ts) => {
    const d = ts.toDate?.() || new Date(ts);
    return d > cutoff;
  }).length;
}

export async function reserveBed({ student, selectedRoom, bedId, hostelId }) {
  const roomRef = doc(db, "rooms", selectedRoom.id);
  const bedRef = doc(db, `rooms/${selectedRoom.id}/beds`, bedId);
  const allocationRef = doc(collection(db, "allocations"));
  const userRef = doc(db, "users", student.uid);

  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    const bedDoc = await transaction.get(bedRef);
    const userDoc = await transaction.get(userRef);

    if (!roomDoc.exists() || !bedDoc.exists() || !userDoc.exists()) {
      throw new Error("Data not found");
    }

    const roomData = roomDoc.data();
    const bedData = bedDoc.data();
    const userData = userDoc.data();

    if (!userData.isEligible) {
      throw new Error("Complete your university fees payment first.");
    }
    if (userData.currentAllocationId) {
      throw new Error("You already have an active reservation.");
    }

    if (isAbuseBlocked(userData)) {
      const remaining = getAbuseBlockTimeRemaining(userData);
      throw new Error(`Too many reservation attempts. Room selection blocked for ${remaining} more minutes.`);
    }

    const recentAttempts = getRecentAttemptCount(userData);
    if (recentAttempts >= MAX_ATTEMPTS) {
      const blockUntil = new Date(Date.now() + WINDOW_HOURS * 60 * 60 * 1000);
      transaction.update(userRef, {
        abuseBlockUntil: Timestamp.fromDate(blockUntil),
      });
      throw new Error(`You have exceeded ${MAX_ATTEMPTS} reservation attempts in ${WINDOW_HOURS} hours. Room selection is blocked for 24 hours.`);
    }

    if (bedData.isReserved) {
      throw new Error("This bed was just claimed by another student.");
    }
    if (roomData.occupiedBeds >= roomData.totalBeds) {
      throw new Error("Room is full.");
    }

    const now = new Date();
    const expiryTime = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);

    transaction.update(bedRef, {
      isReserved: true,
      reservedBy: student.uid,
      reservedAt: Timestamp.fromDate(now),
    });

    const nextCount = roomData.occupiedBeds + 1;
    transaction.update(roomRef, {
      occupiedBeds: nextCount,
      status: nextCount >= roomData.totalBeds ? "full" : "available",
    });

    transaction.set(allocationRef, {
      studentId: student.uid,
      studentName: student.name,
      hostelId,
      roomPath: `rooms/${selectedRoom.id}`,
      bedId,
      academicYear: "2026/2027",
      status: "reserved",
      reservedUntil: Timestamp.fromDate(expiryTime),
    });

    const attempts = userData.reservationAttempts || [];
    attempts.push(Timestamp.fromDate(now));

    transaction.update(userRef, {
      currentAllocationId: allocationRef.id,
      reservationAttempts: attempts,
    });
  });

  return `Reservation locked for ${LOCK_MINUTES} minutes. Complete payment to confirm.`;
}

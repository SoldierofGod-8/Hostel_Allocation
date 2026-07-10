import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  runTransaction,
  Timestamp,
  getDocs
} from "firebase/firestore";
import { sampleStudent, seedMockStudent } from "../mockAuth";
import { Building2, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Lock } from "lucide-react";

export default function HostelBooking() {
  const [student, setStudent] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [filterHostel, setFilterHostel] = useState("male_hostel_a");
  const [filterType, setFilterType] = useState("all");
  const [bookingStatus, setBookingStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedMockStudent();
    const unsubUser = onSnapshot(doc(db, "users", sampleStudent.uid), (docSnap) => {
      if (docSnap.exists()) {
        setStudent(docSnap.data());
      }
    });
    return () => unsubUser();
  }, []);

  useEffect(() => {
    if (!student) return;

    const roomsQuery = query(
      collection(db, "rooms"),
      where("hostelId", "==", filterHostel),
      where("genderAllowed", "==", student.gender)
    );

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filtered = filterType === "all"
        ? roomsData
        : roomsData.filter(r => r.roomType === parseInt(filterType));

      filtered.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber));
      setRooms(filtered);
    }, (error) => {
      console.error("Error fetching rooms: ", error);
    });

    return () => unsubscribe();
  }, [student, filterHostel, filterType]);

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    setBeds([]);

    const bedsRef = collection(db, "rooms", room.id, "beds");
    const snapshot = await getDocs(bedsRef);
    const bedsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    bedsData.sort((a, b) => a.bedLabel.localeCompare(b.bedLabel));
    setBeds(bedsData);
  };

  const handleReserveBed = async (bedId) => {
    if (!student || !selectedRoom) return;
    setLoading(true);
    setBookingStatus("Processing reservation...");

    const roomRef = doc(db, "rooms", selectedRoom.id);
    const bedRef = doc(db, `rooms/${selectedRoom.id}/beds`, bedId);
    const allocationRef = doc(collection(db, "allocations"));
    const userRef = doc(db, "users", student.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        const bedDoc = await transaction.get(bedRef);
        const userDoc = await transaction.get(userRef);

        if (!roomDoc.exists() || !bedDoc.exists() || !userDoc.exists()) {
          throw new Error("Initialization data missing!");
        }

        const roomData = roomDoc.data();
        const bedData = bedDoc.data();
        const userData = userDoc.data();

        if (!userData.isEligible) {
          throw new Error("Account blocked: Please complete your university fees payment first.");
        }
        if (userData.currentAllocationId) {
          throw new Error("You already hold an active reservation or allocation!");
        }
        if (bedData.isReserved) {
          throw new Error("This specific bedspace was claimed by another student!");
        }
        if (roomData.occupiedBeds >= roomData.totalBeds) {
          throw new Error("This room is already occupied!");
        }

        const now = new Date();
        const expiryTime = new Date(now.getTime() + 5 * 60 * 1000);

        transaction.update(bedRef, {
          isReserved: true,
          reservedBy: student.uid,
          reservedAt: Timestamp.fromDate(now)
        });

        const nextOccupiedCount = roomData.occupiedBeds + 1;
        transaction.update(roomRef, {
          occupiedBeds: nextOccupiedCount,
          status: nextOccupiedCount === roomData.totalBeds ? "full" : "available"
        });

        transaction.set(allocationRef, {
          studentId: student.uid,
          studentName: student.name,
          hostelId: filterHostel,
          roomPath: `rooms/${selectedRoom.id}`,
          bedId: bedId,
          academicYear: "2026/2027",
          status: "reserved",
          reservedUntil: Timestamp.fromDate(expiryTime)
        });

        transaction.update(userRef, {
          currentAllocationId: allocationRef.id
        });
      });

      setBookingStatus("Reservation Successful! Your bed is held for 5 minutes. Please complete payment confirmation.");
      setSelectedRoom(null);
    } catch (err) {
      console.error(err);
      setBookingStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Building2 className="text-indigo-400 h-8 w-8" />
            University Hostel Allocation Portal
          </h1>
          <p className="text-slate-400 mt-1">Real-time seat selection & instant reservation lock</p>
        </div>

        {student && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4 shadow-xl">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{student.name}</span>
                <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  Lvl {student.academicLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                {student.isEligible ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <ShieldCheck className="h-3 w-3" /> Eligible for Allocation
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <AlertTriangle className="h-3 w-3" /> Unpaid Fees Blocked
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Select Hostel</label>
                <select
                  value={filterHostel}
                  onChange={(e) => { setFilterHostel(e.target.value); setSelectedRoom(null); }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="male_hostel_a">Hall of Justice (Hostel A - Male)</option>
                  <option value="female_hostel_b">Hall of Grace (Hostel B - Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Room Type</label>
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setSelectedRoom(null); }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Room Sizes</option>
                  <option value="2">2-Bed Executive</option>
                  <option value="4">4-Bed Standard</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block"></span> Partially Full
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500 inline-block"></span> Full / Delisted
              </span>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              Rooms Layout Grid
              <span className="text-xs font-normal text-slate-400">({rooms.length} matches found)</span>
            </h2>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {rooms.map((room) => {
                const isFull = room.occupiedBeds >= room.totalBeds;
                const isPartial = room.occupiedBeds > 0 && !isFull;

                let cardColor = "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
                if (isFull) {
                  cardColor = "bg-rose-500/10 border-rose-500/20 text-rose-400 cursor-not-allowed opacity-50";
                } else if (isPartial) {
                  cardColor = "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300";
                }

                return (
                  <button
                    key={room.id}
                    disabled={isFull}
                    onClick={() => handleSelectRoom(room)}
                    className={`border rounded-xl p-3 text-center transition-all flex flex-col justify-between items-center ${cardColor} ${
                      selectedRoom?.id === room.id ? "ring-2 ring-indigo-500 scale-95" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-400 mb-1">Rm</span>
                    <span className="text-lg font-black tracking-tight">{room.roomNumber}</span>
                    <span className="text-[10px] mt-1 font-medium bg-black/20 px-1.5 py-0.5 rounded">
                      {room.occupiedBeds}/{room.totalBeds}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-700">
              Room Inspector
            </h2>

            {selectedRoom ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">ROOM NUMBER</span>
                    <span className="text-xl font-black text-indigo-400">Room {selectedRoom.roomNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold block">ROOM SIZE</span>
                    <span className="text-sm font-semibold text-white">{selectedRoom.roomType}-Bed Unit</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Select An Available Bedspace</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {beds.map((bed) => {
                      const taken = bed.isReserved;
                      return (
                        <button
                          key={bed.id}
                          disabled={taken || loading}
                          onClick={() => handleReserveBed(bed.id)}
                          className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                            taken
                              ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                              : "bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-white hover:border-indigo-500"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {taken ? <Lock className="h-4 w-4 text-rose-500" /> : <div className="h-2 w-2 rounded-full bg-emerald-400"></div>}
                            <span className="text-sm font-semibold">{bed.bedLabel}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {taken ? "Locked" : "Select"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <HelpCircle className="h-12 w-12 mx-auto text-slate-600 mb-3 stroke-[1.5]" />
                <p className="text-sm font-medium">Please click any available Room card on the grid layout map to load its bed configuration panel.</p>
              </div>
            )}
          </div>

          {bookingStatus && (
            <div className={`p-4 border rounded-xl flex items-start gap-3 shadow-md animate-pulse-slow ${
              bookingStatus.startsWith("Error")
                ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                : bookingStatus.startsWith("Reservation Successful")
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
            }`}>
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">
                {bookingStatus}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

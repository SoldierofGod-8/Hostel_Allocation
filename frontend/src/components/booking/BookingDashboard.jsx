import React, { useState, useEffect } from "react";
import { Database, CheckCircle, AlertTriangle } from "lucide-react";
import ProgressStepper from "./ProgressStepper";
import FiltersPanel from "./FiltersPanel";
import RoomGrid from "./RoomGrid";
import RoomDetails from "./RoomDetails";
import { subscribeToUser, subscribeToRooms, fetchBeds, reserveBed } from "../../services/firestore";

export default function BookingDashboard({ user }) {
  const [student, setStudent] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [filterHostel, setFilterHostel] = useState(
    user?.gender === "female" ? "female_hostel_c" : "male_hostel_a"
  );
  const [filterType, setFilterType] = useState("all");
  const [bookingStatus, setBookingStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSeedPanel, setShowSeedPanel] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToUser(user.uid, (data) => {
      setStudent(data);
      if (data.gender === "female") {
        setFilterHostel("female_hostel_c");
      }
    });
  }, [user]);

  useEffect(() => {
    if (!student) return;
    return subscribeToRooms(filterHostel, student.gender, (data) => {
      const filtered =
        filterType === "all"
          ? data
          : data.filter((r) => r.roomType === parseInt(filterType));
      setRooms(filtered);
    });
  }, [student, filterHostel, filterType]);

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    setBeds([]);
    const beds = await fetchBeds(room.id);
    setBeds(beds);
  };

  const handleReserveBed = async (bedId) => {
    if (!student || !selectedRoom) return;
    setLoading(true);
    setBookingStatus("Processing...");
    try {
      const msg = await reserveBed({ student, selectedRoom, bedId, hostelId: filterHostel });
      setBookingStatus(msg);
      setSelectedRoom(null);
    } catch (err) {
      setBookingStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const freeRooms = rooms.filter((r) => r.occupiedBeds < r.totalBeds).length;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Select Your Room</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Browse available blocks and select a bed space to continue your application.
          </p>
        </div>
        <button
          onClick={() => setShowSeedPanel(!showSeedPanel)}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-neutral rounded font-body-md text-body-md text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
        >
          <Database className="h-4 w-4" />
          {showSeedPanel ? "Close" : "Seed Data"}
        </button>
      </div>

      <ProgressStepper currentStep={2} />

      {showSeedPanel && <SeedDataPanel onClose={() => setShowSeedPanel(false)} />}

      {student && !student.isEligible && (
        <div className="bg-error-container border border-error-red/30 rounded p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-error-red shrink-0" />
          <p className="font-body-md text-body-md text-on-error-container font-medium">
            Account blocked: Please complete your university fees payment first.
          </p>
        </div>
      )}

      {freeRooms === 0 && rooms.length > 0 && (
        <div className="bg-warning-amber/10 border border-warning-amber/30 rounded p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning-amber shrink-0" />
          <p className="font-body-md text-body-md text-on-surface font-medium">
            All rooms in this block are full. Try a different block.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start h-full pb-8">
        <FiltersPanel
          filterHostel={filterHostel}
          setFilterHostel={(v) => { setFilterHostel(v); setSelectedRoom(null); }}
          filterType={filterType}
          setFilterType={(v) => { setFilterType(v); setSelectedRoom(null); }}
          rooms={rooms}
          gender={student?.gender}
        />
        <RoomGrid
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
        />
        <RoomDetails
          selectedRoom={selectedRoom}
          beds={beds}
          loading={loading}
          onReserveBed={handleReserveBed}
        />
      </div>

      {bookingStatus && (
        <div
          className={`p-4 border rounded flex items-start gap-3 shadow-sm ${
            bookingStatus.startsWith("Error")
              ? "bg-error-container border-error-red/30"
              : "bg-success-green/10 border-success-green/30"
          }`}
        >
          <CheckCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
            bookingStatus.startsWith("Error") ? "text-error-red" : "text-success-green"
          }`} />
          <p className={`font-body-md text-body-md font-medium ${
            bookingStatus.startsWith("Error") ? "text-on-error-container" : "text-success-green"
          }`}>
            {bookingStatus}
          </p>
        </div>
      )}
    </>
  );
}

function SeedDataPanel({ onClose }) {
  const [status, setStatus] = useState("");
  const [seeding, setSeeding] = useState(false);

  const seedAllData = async () => {
    setSeeding(true);
    setStatus("Seeding database...");
    try {
      const { seedHostelData } = await import("../../utils/seedData");
      await seedHostelData();
      setStatus("Sample data created! Rooms, beds, and profiles are ready.");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-primary-fixed/20 border border-primary/20 rounded p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title-md text-title-md text-primary flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Seed Panel
        </h3>
        <button onClick={onClose} className="text-on-surface-variant hover:text-primary text-sm font-medium">
          Close
        </button>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-4">
        Populate Firestore with sample rooms, beds, and student profiles for both Male and Female hostels.
      </p>
      <button
        onClick={seedAllData}
        disabled={seeding}
        className="bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {seeding ? (
          <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Seeding...</>
        ) : (
          <><Database className="h-4 w-4" /> Seed Sample Data</>
        )}
      </button>
      {status && (
        <p className={`mt-4 font-body-md text-body-md font-medium ${
          status.startsWith("Error") ? "text-error-red" : "text-success-green"
        }`}>
          {status}
        </p>
      )}
    </div>
  );
}

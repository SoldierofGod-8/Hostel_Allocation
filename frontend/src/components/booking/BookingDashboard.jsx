import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Star, ShieldCheck, Clock } from "lucide-react";
import ProgressStepper from "./ProgressStepper";
import FiltersPanel from "./FiltersPanel";
import RoomGrid from "./RoomGrid";
import RoomDetails from "./RoomDetails";
import {
  subscribeToUser,
  subscribeToRooms,
  fetchBeds,
  reserveBed,
  isAbuseBlocked,
  getAbuseBlockTimeRemaining,
  getRecentAttemptCount,
} from "../../services/firestore";

export default function BookingDashboard({ user, onNavigate }) {
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
      if (onNavigate) onNavigate("Payments");
    } catch (err) {
      setBookingStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const freeRooms = rooms.filter((r) => r.occupiedBeds < r.totalBeds).length;
  const blocked = isAbuseBlocked(student);
  const blockMinutes = getAbuseBlockTimeRemaining(student);
  const recentAttempts = getRecentAttemptCount(student);

  return (
    <>
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Select Your Room</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Browse available blocks and select a bed space to continue your application.
        </p>
      </div>

      <ProgressStepper currentStep={2} />

      {student?.academicLevel === 400 && student?.isEligible && !blocked && (
        <div className="bg-secondary-container/20 border border-secondary-container/50 rounded p-4 flex items-center gap-3">
          <Star className="h-5 w-5 text-secondary shrink-0 fill-current" />
          <div>
            <p className="font-title-md text-title-md text-secondary">Priority Access Active</p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              As a 400-level student, you have early access to room selection. Choose your preferred room before general allocation opens.
            </p>
          </div>
        </div>
      )}

      {student?.academicLevel && student.academicLevel < 400 && student?.isEligible && !blocked && (
        <div className="bg-primary-fixed/20 border border-primary/20 rounded p-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-title-md text-title-md text-primary">Standard Access</p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              400-level students have early access priority. Rooms marked with a star are reserved for final-year students during the priority window.
            </p>
          </div>
        </div>
      )}

      {blocked && (
        <div className="bg-error-container border border-error-red/30 rounded p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-error-red shrink-0" />
          <div>
            <p className="font-title-md text-title-md text-on-error-container font-medium">
              Room Selection Blocked
            </p>
            <p className="font-body-md text-body-md text-on-error-container">
              You have exceeded the maximum of 3 reservation attempts in 24 hours without completing payment.
              Room selection is blocked for <strong>{blockMinutes} more minutes</strong>.
            </p>
          </div>
        </div>
      )}

      {!blocked && recentAttempts >= 2 && (
        <div className="bg-warning-amber/10 border border-warning-amber/30 rounded p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning-amber shrink-0" />
          <div>
            <p className="font-title-md text-title-md text-on-surface">Reservation Warning</p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              You have used {recentAttempts} of 3 allowed reservation attempts in the last 24 hours.
              Complete payment after reserving to avoid being blocked.
            </p>
          </div>
        </div>
      )}

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

      {blocked ? (
        <div className="bg-surface border border-border-neutral rounded p-12 text-center">
          <Clock className="h-16 w-16 mx-auto text-error-red/40 mb-4" />
          <h3 className="font-title-md text-title-md text-on-surface mb-2">Access Restricted</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
            You cannot view or reserve rooms while your account is blocked.
            Please wait {blockMinutes} minutes or contact support.
          </p>
        </div>
      ) : (
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
      )}

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

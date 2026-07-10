import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Bed, Building2, Calendar, Clock, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle, CreditCard, FileText } from "lucide-react";
import ProgressStepper from "./ProgressStepper";

export default function MyBooking({ user, onNavigate }) {
  const [allocation, setAllocation] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.currentAllocationId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const allocSnap = await getDoc(doc(db, "allocations", user.currentAllocationId));
        if (!allocSnap.exists()) {
          setError("Allocation record not found.");
          setLoading(false);
          return;
        }
        const allocData = allocSnap.data();
        setAllocation(allocData);

        if (allocData.roomPath) {
          const roomSnap = await getDoc(doc(db, allocData.roomPath));
          if (roomSnap.exists()) setRoom(roomSnap.data());
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.currentAllocationId) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">My Booking</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">View your current hostel allocation.</p>
        </div>
        <ProgressStepper currentStep={4} />
        <div className="bg-surface border border-border-neutral rounded p-12 text-center">
          <Bed className="h-16 w-16 mx-auto text-outline-variant mb-4" />
          <h3 className="font-title-md text-title-md text-on-surface mb-2">No Active Booking</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
            You have not reserved any bed space yet. Browse available rooms and secure your accommodation.
          </p>
          <button
            onClick={() => onNavigate("Room Selection")}
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors"
          >
            Browse Rooms <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container border border-error-red/30 rounded p-6 flex items-center gap-4">
        <AlertTriangle className="h-8 w-8 text-error-red shrink-0" />
        <p className="font-body-lg text-body-lg text-on-error-container">{error}</p>
      </div>
    );
  }

  const isExpired = allocation.reservedUntil?.toDate?.() < new Date();
  const expiryDate = allocation.reservedUntil?.toDate?.();
  const timeLeft = expiryDate
    ? Math.max(0, Math.floor((expiryDate - new Date()) / 1000 / 60))
    : null;

  const status = allocation.status;
  const hasPaymentProof = !!allocation.paymentProof;
  const isConfirmed = status === "confirmed";

  const getStep = () => {
    if (isConfirmed) return 4;
    if (hasPaymentProof) return 4;
    if (status === "reserved") return 2;
    return 2;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Confirmation</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Your booking and payment status.</p>
      </div>

      <ProgressStepper currentStep={getStep()} />

      <div className="bg-surface border border-border-neutral rounded p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-neutral">
          <div className={`h-10 w-10 rounded flex items-center justify-center ${
            isConfirmed ? "bg-success-green/10" : isExpired ? "bg-error-red/10" : "bg-warning-amber/10"
          }`}>
            {isConfirmed ? (
              <CheckCircle className="h-5 w-5 text-success-green" />
            ) : (
              <ShieldCheck className={`h-5 w-5 ${isExpired ? "text-error-red" : "text-warning-amber"}`} />
            )}
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Booking Status</p>
            <p className={`font-title-md text-title-md ${
              isConfirmed ? "text-success-green" : isExpired ? "text-error-red" : "text-warning-amber"
            }`}>
              {isConfirmed ? "Confirmed" : hasPaymentProof ? "Payment Under Review" : isExpired ? "Reservation Expired" : "Reserved"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary/60" />
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Hostel</p>
              <p className="font-title-md text-title-md text-primary capitalize">
                {allocation.hostelId?.replace(/_/g, " ") || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Bed className="h-8 w-8 text-primary/60" />
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Room / Bed</p>
              <p className="font-title-md text-title-md text-primary">
                {room?.roomNumber || "—"} / {allocation.bedId || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary/60" />
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Session</p>
              <p className="font-title-md text-title-md text-primary">{allocation.academicYear || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary/60" />
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Reserved Until</p>
              <p className="font-title-md text-title-md text-primary">
                {status === "reserved" && timeLeft !== null ? `${timeLeft} min${timeLeft !== 1 ? "s" : ""}` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {status === "reserved" && !isExpired && !hasPaymentProof && (
        <div className="bg-warning-amber/10 border border-warning-amber/30 rounded p-6">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="h-5 w-5 text-warning-amber" />
            <p className="font-title-md text-title-md text-on-surface">Payment Required</p>
          </div>
          <p className="font-body-md text-body-md text-on-surface mb-4">
            This bed is reserved for you. Please proceed to <strong>Payments</strong> to upload your proof of payment before the timer expires.
          </p>
          <button
            onClick={() => onNavigate("Payments")}
            className="inline-flex items-center gap-2 bg-warning-amber text-white font-title-md text-title-md rounded px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Go to Payments <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {hasPaymentProof && !isConfirmed && (
        <div className="bg-primary-fixed/20 border border-primary/20 rounded p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <p className="font-title-md text-title-md text-primary">Payment Proof Submitted</p>
          </div>
          <div className="space-y-2 mb-4">
            <p className="font-body-md text-body-md text-on-surface">
              <strong>File:</strong> {allocation.paymentProof}
            </p>
            {allocation.paymentSubmittedAt && (
              <p className="font-body-md text-body-md text-on-surface-variant">
                <strong>Submitted:</strong> {allocation.paymentSubmittedAt.toDate?.().toLocaleString() || "—" }
              </p>
            )}
          </div>
          <div className="bg-surface-bright border border-border-neutral rounded p-4">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your payment is being reviewed. You will receive confirmation within 24 hours. You may close this page.
            </p>
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className="bg-success-green/10 border border-success-green/30 rounded p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-5 w-5 text-success-green" />
            <p className="font-title-md text-title-md text-success-green">Booking Confirmed</p>
          </div>
          <p className="font-body-md text-body-md text-on-surface">
            Your accommodation has been confirmed. Welcome to your new home!
          </p>
        </div>
      )}

      {isExpired && (
        <div className="bg-error-container border border-error-red/30 rounded p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-error-red" />
            <p className="font-title-md text-title-md text-on-error-container">Reservation Expired</p>
          </div>
          <p className="font-body-md text-body-md text-on-surface mb-4">
            Your reservation has expired. Please select a new room.
          </p>
          <button
            onClick={() => onNavigate("Room Selection")}
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors"
          >
            Select New Room <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

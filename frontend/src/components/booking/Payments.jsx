import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { CreditCard, ShieldCheck, ArrowRight, Building2, Upload, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import ProgressStepper from "./ProgressStepper";

const FEE_STRUCTURE = [
  { label: "Accommodation Fee (Per Session)", amount: "NGN 85,000" },
  { label: "Utility & Maintenance Levy", amount: "NGN 12,000" },
  { label: "Caution Deposit (Refundable)", amount: "NGN 10,000" },
  { label: "Portal Service Charge", amount: "NGN 3,000" },
];

function CountdownTimer({ expiresAt, onExpired }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const expiry = expiresAt?.toDate?.() || new Date(expiresAt);

    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));

      if (diff <= 0) {
        setTimeLeft("00:00");
        setExpired(true);
        if (onExpired) onExpired();
        clearInterval(intervalRef.current);
        return;
      }

      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setTimeLeft(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalRef.current);
  }, [expiresAt, onExpired]);

  const totalSecs = timeLeft ? parseInt(timeLeft.split(":")[0]) * 60 + parseInt(timeLeft.split(":")[1]) : 0;
  const isUrgent = totalSecs <= 120 && totalSecs > 0;

  return (
    <div className={`rounded p-5 border ${
      expired
        ? "bg-error-container border-error-red/30"
        : isUrgent
          ? "bg-warning-amber/10 border-warning-amber/40"
          : "bg-primary-fixed/20 border-primary/20"
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          expired
            ? "bg-error-red/10"
            : isUrgent
              ? "bg-warning-amber/10"
              : "bg-primary/10"
        }`}>
          <Clock className={`h-5 w-5 ${
            expired ? "text-error-red" : isUrgent ? "text-warning-amber" : "text-primary"
          }`} />
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {expired ? "Reservation Expired" : "Time Remaining"}
          </p>
          <p className={`font-headline-lg text-headline-lg ${
            expired ? "text-error-red" : isUrgent ? "text-warning-amber" : "text-primary"
          }`}>
            {expired ? "EXPIRED" : timeLeft}
          </p>
        </div>
      </div>
      {!expired && (
        <p className={`font-body-sm text-body-sm ${isUrgent ? "text-on-surface" : "text-on-surface-variant"}`}>
          Your room lock will expire in <strong>{timeLeft}</strong>. Complete payment before then or the bed will be released.
        </p>
      )}
      {expired && (
        <p className="font-body-md text-body-md text-on-error-container">
          Your reservation has expired. The bed has been released back to the pool.
        </p>
      )}
    </div>
  );
}

export default function Payments({ user, onNavigate }) {
  const [proofFile, setProofFile] = useState(null);
  const [proofName, setProofName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [allocation, setAllocation] = useState(null);
  const [expired, setExpired] = useState(false);

  const total = FEE_STRUCTURE.reduce((sum, item) => {
    const num = parseInt(item.amount.replace(/[^0-9]/g, ""));
    return sum + num;
  }, 0);

  useEffect(() => {
    if (!user?.currentAllocationId) return;
    const fetchAllocation = async () => {
      const snap = await getDoc(doc(db, "allocations", user.currentAllocationId));
      if (snap.exists()) setAllocation({ id: snap.id, ...snap.data() });
    };
    fetchAllocation();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofName(file.name);
      setStatus("");
    }
  };

  const handleSubmitProof = async () => {
    if (!proofFile || !allocation) return;
    setUploading(true);
    setStatus("Uploading proof of payment...");
    try {
      await updateDoc(doc(db, "allocations", allocation.id), {
        paymentProof: proofName,
        paymentSubmittedAt: Timestamp.now(),
        status: "payment_submitted",
      });
      setStatus("Payment proof submitted successfully! Redirecting to confirmation...");
      setTimeout(() => {
        if (onNavigate) onNavigate("My Booking");
      }, 1500);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCountdownExpired = () => {
    setExpired(true);
  };

  if (!user?.currentAllocationId) {
    return (
      <>
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Payment</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Complete your accommodation payment to confirm your allocation.
          </p>
        </div>
        <ProgressStepper currentStep={3} />
        <div className="bg-surface border border-border-neutral rounded p-12 text-center">
          <ShieldCheck className="h-16 w-16 mx-auto text-outline-variant mb-4" />
          <h3 className="font-title-md text-title-md text-on-surface mb-2">No Active Reservation</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
            You need to reserve a room first before making payment.
          </p>
          <button
            onClick={() => onNavigate("Room Selection")}
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors"
          >
            Reserve a Room <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Payment</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          View fee structure and upload your proof of payment.
        </p>
      </div>

      <ProgressStepper currentStep={3} />

      {allocation?.reservedUntil && (
        <CountdownTimer expiresAt={allocation.reservedUntil} onExpired={handleCountdownExpired} />
      )}

      {expired && (
        <div className="bg-error-container border border-error-red/30 rounded p-6">
          <p className="font-body-md text-body-md text-on-error-container mb-4">
            Your reservation has expired. The bed has been released. You may select a new room.
          </p>
          <button
            onClick={() => onNavigate("Room Selection")}
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors"
          >
            Select New Room <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {!expired && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border-neutral rounded p-6">
            <h3 className="font-title-md text-title-md text-primary mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Fee Breakdown
            </h3>
            <div className="space-y-4">
              {FEE_STRUCTURE.map((item) => (
                <div key={item.label} className="flex justify-between items-center pb-3 border-b border-border-neutral last:border-0">
                  <span className="font-body-md text-body-md text-on-surface">{item.label}</span>
                  <span className="font-title-md text-title-md text-primary">{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="font-title-md text-title-md text-primary">Total</span>
                <span className="font-headline-md text-headline-md text-primary">NGN {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary text-on-primary rounded p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-8 w-8 opacity-80" />
                <div>
                  <h3 className="font-title-md text-title-md">Payment Instructions</h3>
                  <p className="font-body-md text-body-md text-primary-fixed-dim">Complete your allocation</p>
                </div>
              </div>
              <ol className="space-y-3 font-body-md text-body-md text-primary-fixed-dim list-decimal list-inside">
                <li>Generate payment invoice via the portal.</li>
                <li>Pay at any designated bank branch.</li>
                <li>Upload payment receipt for verification.</li>
                <li>Receive confirmation within 24 hours.</li>
              </ol>
            </div>

            <div className="bg-surface border border-border-neutral rounded p-6">
              <h3 className="font-title-md text-title-md text-primary mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" /> Proof of Payment
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                Upload your payment receipt or bank teller to confirm your allocation.
              </p>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-neutral rounded cursor-pointer hover:border-primary transition-colors bg-surface-bright">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 mb-2 text-outline-variant" />
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {proofName || "Click to upload receipt"}
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
              </label>

              <button
                onClick={handleSubmitProof}
                disabled={!proofFile || uploading}
                className="mt-4 w-full bg-success-green text-white font-title-md text-title-md rounded px-6 py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" /> Submit Proof of Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div
          className={`p-4 border rounded flex items-start gap-3 shadow-sm ${
            status.startsWith("Error")
              ? "bg-error-container border-error-red/30"
              : "bg-success-green/10 border-success-green/30"
          }`}
        >
          {status.startsWith("Error") ? (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-error-red" />
          ) : (
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-success-green" />
          )}
          <p className={`font-body-md text-body-md font-medium ${
            status.startsWith("Error") ? "text-on-error-container" : "text-success-green"
          }`}>
            {status}
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { ShieldCheck, AlertTriangle, Bed, Building2, ArrowRight, Star } from "lucide-react";

export default function DashboardHome({ user, onNavigate }) {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.currentAllocationId) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "allocations", user.currentAllocationId)).then((snap) => {
      if (snap.exists()) setAllocation(snap.data());
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Dashboard</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}
        </p>
      </div>

      {user?.academicLevel === 400 && (
        <div className="bg-secondary-container/20 border border-secondary-container/50 rounded p-4 flex items-center gap-3">
          <Star className="h-5 w-5 text-secondary shrink-0 fill-current" />
          <p className="font-body-md text-body-md text-on-surface font-medium">
            <strong className="text-secondary">Priority Access:</strong> As a 400-level student, you have early access to room selection.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border-neutral rounded p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Status</p>
              <p className={`font-title-md text-title-md ${user?.isEligible ? "text-success-green" : "text-error-red"}`}>
                {user?.isEligible ? "Eligible" : "Blocked"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-neutral rounded p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <Bed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Allocation</p>
              <p className="font-title-md text-title-md text-primary">
                {loading ? "..." : allocation ? `Room ${allocation.roomPath?.split("/")[1] || "N/A"}` : "None"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-neutral rounded p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Level</p>
              <p className="font-title-md text-title-md text-primary">{user?.academicLevel || "—"} Level</p>
            </div>
          </div>
        </div>
      </div>

      {user?.isEligible && !allocation && (
        <div className="bg-primary-fixed/20 border border-primary/20 rounded p-6 flex items-center justify-between">
          <div>
            <h3 className="font-title-md text-title-md text-primary">Ready to book your room?</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Browse available bed spaces and secure your accommodation for the session.
            </p>
          </div>
          <button
            onClick={() => onNavigate("Room Selection")}
            className="flex items-center gap-2 bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors"
          >
            Select Room <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {!user?.isEligible && (
        <div className="bg-error-container border border-error-red/30 rounded p-6 flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-error-red shrink-0" />
          <div>
            <h3 className="font-title-md text-title-md text-on-error-container">Account Blocked</h3>
            <p className="font-body-md text-body-md text-on-error-container/80">
              Please complete your university fees payment to access hostel allocation.
            </p>
          </div>
        </div>
      )}

      {allocation && (
        <div className="bg-success-green/10 border border-success-green/30 rounded p-6">
          <h3 className="font-title-md text-title-md text-success-green flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Current Allocation
          </h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Room</p>
              <p className="font-title-md text-title-md text-primary">{allocation.roomPath?.split("/")[1] || "—"}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Bed</p>
              <p className="font-title-md text-title-md text-primary">{allocation.bedId || "—"}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Status</p>
              <p className="font-title-md text-title-md text-success-green capitalize">{allocation.status || "—"}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Session</p>
              <p className="font-title-md text-title-md text-primary">{allocation.academicYear || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

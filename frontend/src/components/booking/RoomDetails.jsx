import React from "react";
import { Bed, CheckCircle, Lock, ArrowRight, DoorOpen } from "lucide-react";

export default function RoomDetails({ selectedRoom, beds, loading, onReserveBed }) {
  if (!selectedRoom) {
    return (
      <aside className="w-full lg:w-[320px] shrink-0">
        <div className="bg-surface border border-border-neutral rounded p-6 text-center">
          <DoorOpen className="h-16 w-16 mx-auto text-outline-variant mb-4" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            Select a room to view bed spaces
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
      <div className="bg-primary text-on-primary rounded p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-headline-md text-headline-md">Room {selectedRoom.roomNumber}</h4>
              <p className="font-body-md text-body-md text-primary-fixed-dim">
                Block &bull; {selectedRoom.roomType}-Bed Standard
              </p>
            </div>
            <DoorOpen className="h-8 w-8 opacity-80" />
          </div>

          <div className="space-y-3 mt-6">
            <p className="font-title-md text-title-md border-b border-primary-fixed-dim/30 pb-2 mb-3">
              Bed Spaces
            </p>
            {beds.length === 0 ? (
              <p className="font-body-md text-body-md text-primary-fixed-dim">Loading beds...</p>
            ) : (
              beds.map((bed) => {
                const taken = bed.isReserved;
                return (
                  <div
                    key={bed.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      taken
                        ? "bg-surface-tint/30 border border-primary-fixed-dim/20"
                        : "bg-white text-primary border-2 border-secondary-container shadow-sm cursor-pointer"
                    }`}
                    onClick={() => !taken && !loading && onReserveBed(bed.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5" />
                      <span className={`font-body-md text-body-md ${taken ? "" : "font-title-md text-title-md"}`}>
                        {bed.bedLabel}
                      </span>
                    </div>
                    {taken ? (
                      <Lock className="h-5 w-5 text-error-red" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success-green" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border-neutral rounded p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="font-body-md text-body-md text-on-surface-variant">Fee (Per Session):</span>
          <span className="font-headline-md text-headline-md text-primary">NGN 85,000</span>
        </div>
        <button
          disabled={!beds.length || loading}
          onClick={() => {
            const available = beds.find((b) => !b.isReserved);
            if (available) onReserveBed(available.id);
          }}
          className="w-full py-3 px-4 bg-primary text-on-primary rounded font-title-md text-title-md hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Reserve Bed"}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}

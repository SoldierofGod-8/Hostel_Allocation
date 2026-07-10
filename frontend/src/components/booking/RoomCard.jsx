import React from "react";
import { CheckCircle, AlertTriangle, Ban } from "lucide-react";

export default function RoomCard({ room, isSelected, onSelect }) {
  const isFull = room.occupiedBeds >= room.totalBeds;
  const isPartial = room.occupiedBeds > 0 && !isFull;
  const available = room.totalBeds - room.occupiedBeds;

  let statusColor = "success-green";
  let StatusIcon = CheckCircle;
  let statusText = `${available}/${room.totalBeds} Available`;

  if (isFull) {
    statusColor = "error-red";
    StatusIcon = Ban;
    statusText = "Full";
  } else if (isPartial) {
    statusColor = "warning-amber";
    StatusIcon = AlertTriangle;
    statusText = `${available}/${room.totalBeds} Available`;
  }

  return (
    <button
      onClick={() => !isFull && onSelect(room)}
      disabled={isFull}
      className={`border rounded-lg p-4 text-left transition-all group relative overflow-hidden ${
        isFull
          ? "bg-surface-container-low opacity-70 cursor-not-allowed border-border-neutral"
          : isSelected
          ? "border-2 border-primary bg-primary-fixed/5 shadow-[0_0_15px_rgba(0,17,58,0.1)] cursor-pointer"
          : "border-border-neutral hover:border-primary cursor-pointer bg-surface"
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-bl ${
          isFull ? "bg-error-red/10" : isPartial ? "bg-warning-amber/10" : "bg-success-green/10"
        }`}
      >
        <StatusIcon className={`h-[18px] w-[18px] text-${statusColor}`} />
      </div>

      <div className={`font-headline-md text-headline-md mb-1 ${
        isFull ? "text-outline" : "text-primary group-hover:text-info-blue"
      }`}>
        {room.roomNumber}
      </div>
      <div className="font-body-md text-body-md text-on-surface-variant mb-3">
        {room.roomType}-Bed Standard
      </div>
      <div className={`inline-flex items-center px-2 py-1 rounded font-label-sm text-label-sm bg-${statusColor}/10 text-${statusColor}`}>
        {statusText}
      </div>
    </button>
  );
}

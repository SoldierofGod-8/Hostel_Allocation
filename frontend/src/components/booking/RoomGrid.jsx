import React from "react";
import RoomCard from "./RoomCard";

export default function RoomGrid({ rooms, selectedRoom, onSelectRoom }) {
  return (
    <div className="flex-1 w-full bg-surface border border-border-neutral rounded p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-title-md text-title-md text-primary">
          Block Rooms
        </h3>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Showing {rooms.length} Rooms
        </span>
      </div>
      {rooms.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            No rooms match your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isSelected={selectedRoom?.id === room.id}
              onSelect={onSelectRoom}
            />
          ))}
        </div>
      )}
    </div>
  );
}

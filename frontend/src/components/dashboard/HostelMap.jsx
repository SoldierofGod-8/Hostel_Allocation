import React from "react";
import { Map, Building2, Bed } from "lucide-react";

const BLOCKS = [
  {
    name: "Block A (Male)",
    rooms: "24 Rooms",
    floors: 3,
    type: "2-Bed & 4-Bed",
    color: "bg-primary",
  },
  {
    name: "Block B (Male)",
    rooms: "16 Rooms",
    floors: 2,
    type: "2-Bed & 4-Bed",
    color: "bg-primary",
  },
  {
    name: "Block C (Female)",
    rooms: "24 Rooms",
    floors: 3,
    type: "2-Bed & 4-Bed",
    color: "bg-primary/70",
  },
  {
    name: "Block D (Female)",
    rooms: "16 Rooms",
    floors: 2,
    type: "2-Bed & 4-Bed",
    color: "bg-primary/70",
  },
];

const FLOOR_PLANS = [
  { label: "Ground Floor", rooms: "101–104", color: "bg-success-green/20 border-success-green/30 text-success-green" },
  { label: "First Floor", rooms: "105–108", color: "bg-success-green/20 border-success-green/30 text-success-green" },
  { label: "Second Floor", rooms: "109–112", color: "bg-warning-amber/20 border-warning-amber/30 text-warning-amber" },
  { label: "Third Floor", rooms: "113–116", color: "bg-error-red/20 border-error-red/30 text-error-red" },
];

export default function HostelMap() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Hostel Map</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Overview of hostel blocks and room layout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOCKS.map((block) => (
          <div key={block.name} className="bg-surface border border-border-neutral rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded flex items-center justify-center ${block.color}`}>
                <Building2 className="h-5 w-5 text-on-primary" />
              </div>
              <div>
                <h3 className="font-title-md text-title-md text-primary">{block.name}</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{block.rooms} &bull; {block.floors} Floors &bull; {block.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FLOOR_PLANS.map((floor) => (
                <div key={floor.label} className={`border rounded p-3 ${floor.color}`}>
                  <p className="font-label-sm text-label-sm uppercase">{floor.label}</p>
                  <p className="font-title-md text-title-md">{floor.rooms}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border-neutral rounded p-6">
        <h3 className="font-title-md text-title-md text-primary mb-4 flex items-center gap-2">
          <Map className="h-5 w-5" /> Legend
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success-green" />
            <span className="font-body-md text-body-md">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning-amber" />
            <span className="font-body-md text-body-md">Limited Availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-error-red" />
            <span className="font-body-md text-body-md">Fully Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-primary" />
            <span className="font-body-md text-body-md">2-Bed / 4-Bed Rooms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

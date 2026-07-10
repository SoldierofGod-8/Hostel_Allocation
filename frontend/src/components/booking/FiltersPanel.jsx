import React from "react";
import { Filter } from "lucide-react";

const HOSTELS = {
  male: [
    { value: "male_hostel_a", label: "Block A (Male)" },
    { value: "male_hostel_b", label: "Block B (Male)" },
  ],
  female: [
    { value: "female_hostel_c", label: "Block C (Female)" },
    { value: "female_hostel_d", label: "Block D (Female)" },
  ],
};

export default function FiltersPanel({
  filterHostel,
  setFilterHostel,
  filterType,
  setFilterType,
  rooms,
  gender,
}) {
  const freeRooms = rooms.filter((r) => r.occupiedBeds < r.totalBeds).length;
  const fullRooms = rooms.filter((r) => r.occupiedBeds >= r.totalBeds).length;
  const hostels = HOSTELS[gender] || HOSTELS.male;

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-surface border border-border-neutral rounded p-5 flex flex-col gap-5 sticky top-0">
      <h3 className="font-title-md text-title-md text-primary border-b border-border-neutral pb-2 flex items-center gap-2">
        <Filter className="h-5 w-5" />
        Filters
      </h3>

      <div className="flex flex-col gap-2">
        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          Hostel Block
        </label>
        <select
          value={filterHostel}
          onChange={(e) => setFilterHostel(e.target.value)}
          className="w-full bg-surface border border-border-neutral rounded p-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          {hostels.map((h) => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          Room Type
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="roomType"
            checked={filterType === "all"}
            onChange={() => setFilterType("all")}
            className="rounded-full border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
            All Types
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="roomType"
            checked={filterType === "2"}
            onChange={() => setFilterType("2")}
            className="rounded-full border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
            2-Bed Standard
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="roomType"
            checked={filterType === "4"}
            onChange={() => setFilterType("4")}
            className="rounded-full border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
            4-Bed Standard
          </span>
        </label>
      </div>

      <div className="mt-auto pt-4 border-t border-border-neutral flex flex-col gap-2">
        <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Legend</p>
        <div className="flex items-center gap-2 font-label-sm text-label-sm">
          <div className="w-3 h-3 rounded-full bg-success-green" />
          <span>Available ({freeRooms})</span>
        </div>
        <div className="flex items-center gap-2 font-label-sm text-label-sm">
          <div className="w-3 h-3 rounded-full bg-warning-amber" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-2 font-label-sm text-label-sm">
          <div className="w-3 h-3 rounded-full bg-error-red" />
          <span>Full ({fullRooms})</span>
        </div>
      </div>
    </aside>
  );
}

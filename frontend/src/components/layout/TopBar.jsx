import React from "react";
import { Bell, HelpCircle, Star } from "lucide-react";

const TABS = ["Dashboard", "Room Selection", "My Booking", "Payments"];

export default function TopBar({ student, activeTab, onTabChange }) {
  const initials = student?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <header className="bg-surface border-b border-border-neutral flex justify-between items-center w-full px-base md:px-gutter mx-auto h-16 shrink-0 sticky top-0 z-30">
      <nav className="hidden md:flex items-end h-full gap-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`font-title-md text-title-md cursor-pointer active:opacity-70 flex items-center h-full pt-1 border-b-2 transition-colors ${
              activeTab === tab
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant hover:text-primary border-transparent hover:border-outline-variant"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="md:hidden font-title-md text-title-md text-primary font-bold">
        {activeTab}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Lvl {student?.academicLevel || "—"}
          </span>
          {student?.academicLevel === 400 && (
            <Star className="h-4 w-4 text-secondary fill-current" />
          )}
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary bg-primary flex items-center justify-center cursor-pointer">
          <span className="text-on-primary text-xs font-bold">{initials}</span>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { Bell, HelpCircle } from "lucide-react";

const TABS = [
  { label: "Dashboard", href: "#", active: false },
  { label: "Room Selection", href: "#", active: true },
  { label: "My Booking", href: "#", active: false },
  { label: "Payments", href: "#", active: false },
];

export default function TopBar({ student }) {
  const initials = student?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <header className="bg-surface border-b border-border-neutral flex justify-between items-center w-full px-base md:px-gutter mx-auto h-16 shrink-0 sticky top-0 z-30">
      <nav className="hidden md:flex items-end h-full gap-8">
        {TABS.map((tab) => (
          <a
            key={tab.label}
            href={tab.href}
            className={`font-title-md text-title-md cursor-pointer active:opacity-70 flex items-center h-full pt-1 border-b-2 transition-colors ${
              tab.active
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant hover:text-primary border-transparent hover:border-outline-variant"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </nav>

      <div className="md:hidden font-title-md text-title-md text-primary font-bold">
        Room Selection
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary bg-primary flex items-center justify-center cursor-pointer">
          <span className="text-on-primary text-xs font-bold">{initials}</span>
        </div>
      </div>
    </header>
  );
}

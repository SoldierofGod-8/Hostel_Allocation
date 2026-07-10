import React from "react";
import { LayoutDashboard, Map, FileText, Wrench, User, Database, LifeBuoy, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", tab: "Dashboard" },
  { icon: Map, label: "Hostel Map", tab: "Hostel Map" },
  { icon: FileText, label: "Application", tab: "Room Selection" },
  { icon: Wrench, label: "Maintenance", tab: "Maintenance" },
  { icon: User, label: "Profile", tab: "Profile" },
];

export default function Sidebar({ onLogout, activeTab, onNavigate, onSeedToggle }) {
  return (
    <aside className="bg-surface-container h-screen w-sidebar-width fixed left-0 top-0 flex flex-col border-r border-border-neutral z-40">
      <div className="px-6 py-6 border-b border-border-neutral flex items-center gap-4">
        <img src="logo.png" alt="ADUN Logo" className="h-10 w-10 rounded object-contain shrink-0" />
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary truncate leading-tight">ADUN Portal</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant truncate">Hostel Management System</p>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.tab)}
              className={`flex items-center px-6 py-4 w-full gap-4 transition-all text-left ${
                isActive
                  ? "text-primary font-bold border-r-4 border-primary bg-primary-fixed-dim/10"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-title-md text-title-md">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-neutral">
        <button
          onClick={onSeedToggle}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded font-title-md text-title-md hover:bg-primary-container transition-colors"
        >
          <Database className="h-5 w-5" />
          Seed Data
        </button>
        <div className="mt-4 flex flex-col gap-1">
          <button className="flex items-center px-2 py-2 gap-3 text-on-surface-variant hover:bg-surface-container-high rounded transition-all font-body-md text-body-md w-full text-left">
            <Settings className="h-[20px] w-[20px]" />
            Settings
          </button>
          <button
            onClick={onLogout}
            className="flex items-center px-2 py-2 gap-3 text-error-red hover:bg-error-container rounded transition-all font-body-md text-body-md w-full text-left"
          >
            <LogOut className="h-[20px] w-[20px]" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

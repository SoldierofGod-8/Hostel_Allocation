import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DashboardHome from "../dashboard/DashboardHome";
import BookingDashboard from "../booking/BookingDashboard";
import MyBooking from "../booking/MyBooking";
import Payments from "../booking/Payments";
import HostelMap from "../dashboard/HostelMap";
import Maintenance from "../dashboard/Maintenance";
import Profile from "../dashboard/Profile";
import SeedDataPanel from "../common/SeedDataPanel";

export default function AppLayout({ student, onLogout }) {
  const [activeTab, setActiveTab] = useState("Room Selection");
  const [showSeed, setShowSeed] = useState(false);

  const renderPage = () => {
    if (showSeed) return <SeedDataPanel />;
    switch (activeTab) {
      case "Dashboard":
        return <DashboardHome user={student} onNavigate={setActiveTab} />;
      case "Room Selection":
        return <BookingDashboard user={student} />;
      case "My Booking":
        return <MyBooking user={student} onNavigate={setActiveTab} />;
      case "Payments":
        return <Payments user={student} onNavigate={setActiveTab} />;
      case "Hostel Map":
        return <HostelMap />;
      case "Maintenance":
        return <Maintenance />;
      case "Profile":
        return <Profile user={student} />;
      default:
        return <BookingDashboard user={student} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased">
      <Sidebar
        onLogout={onLogout}
        activeTab={showSeed ? null : activeTab}
        onNavigate={(tab) => { setShowSeed(false); setActiveTab(tab); }}
        onSeedToggle={() => setShowSeed((v) => !v)}
      />
      <main className="ml-sidebar-width flex-1 flex flex-col h-full min-h-screen">
        <TopBar student={student} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 overflow-y-auto p-base md:p-gutter flex flex-col gap-6 max-w-container-max mx-auto w-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout({ student, onLogout, children }) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased">
      <Sidebar onLogout={onLogout} userName={student?.name} />
      <main className="ml-sidebar-width flex-1 flex flex-col h-full min-h-screen">
        <TopBar student={student} />
        <div className="flex-1 overflow-y-auto p-base md:p-gutter flex flex-col gap-6 max-w-container-max mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

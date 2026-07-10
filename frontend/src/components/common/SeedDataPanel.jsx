import React, { useState } from "react";
import { Database, CheckCircle } from "lucide-react";

export default function SeedDataPanel() {
  const [status, setStatus] = useState("");
  const [seeding, setSeeding] = useState(false);

  const seedAllData = async () => {
    setSeeding(true);
    setStatus("Seeding database...");
    try {
      const { seedHostelData } = await import("../../utils/seedData");
      const result = await seedHostelData();
      setStatus(`${result.totalRooms} rooms and ${result.totalBeds} beds created across all blocks. Demo user profiles synced.`);
    } catch (err) {
      setStatus(`Error: ${err.message}. Check Firestore rules in firestore.rules.`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-primary-fixed/20 border border-primary/20 rounded p-5">
      <div className="flex items-center gap-3 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-title-md text-title-md text-primary">Database Seed Panel</h3>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-4">
        Populate Firestore with sample rooms, beds, and demo student profiles for all hostel blocks (A, B, C, D).
        Existing data will not be overwritten.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={seedAllData}
          disabled={seeding}
          className="bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {seeding ? (
            <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Seeding...</>
          ) : (
            <><Database className="h-4 w-4" /> Seed Sample Data</>
          )}
        </button>
      </div>
      {status && (
        <div className={`mt-4 p-3 border rounded flex items-start gap-2 ${
          status.startsWith("Error")
            ? "bg-error-container border-error-red/30"
            : "bg-success-green/10 border-success-green/30"
        }`}>
          <CheckCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
            status.startsWith("Error") ? "text-error-red" : "text-success-green"
          }`} />
          <p className={`font-body-md text-body-md font-medium ${
            status.startsWith("Error") ? "text-on-error-container" : "text-success-green"
          }`}>
            {status}
          </p>
        </div>
      )}
    </div>
  );
}

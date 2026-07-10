import React from "react";
import { User, Mail, Hash, GraduationCap, ShieldCheck, Building2, Calendar } from "lucide-react";

export default function Profile({ user }) {
  const details = [
    { icon: User, label: "Full Name", value: user?.name || "—" },
    { icon: Hash, label: "Matric Number", value: user?.matric || "—" },
    { icon: Mail, label: "Email", value: user?.email || "—" },
    { icon: GraduationCap, label: "Academic Level", value: user?.academicLevel ? `${user.academicLevel} Level` : "—" },
    { icon: Building2, label: "Gender Hostel", value: user?.gender === "male" ? "Male Hostel" : "Female Hostel" },
    { icon: Calendar, label: "Session", value: "2026/2027" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Profile</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Your account details and hostel information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border-neutral rounded p-6 text-center">
            <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-on-primary font-headline-lg text-headline-lg font-bold">
                {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
              </span>
            </div>
            <h3 className="font-title-md text-title-md text-primary">{user?.name || "Student"}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{user?.matric || "—"}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm">
              <ShieldCheck className="h-4 w-4" />
              {user?.isEligible ? "Eligible for Allocation" : "Blocked"}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface border border-border-neutral rounded p-6">
            <h3 className="font-title-md text-title-md text-primary mb-4">Account Information</h3>
            <div className="space-y-4">
              {details.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="flex items-center gap-4 pb-4 border-b border-border-neutral last:border-0">
                    <div className="h-10 w-10 rounded bg-primary/5 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary/60" />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">{d.label}</p>
                      <p className="font-title-md text-title-md text-primary">{d.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

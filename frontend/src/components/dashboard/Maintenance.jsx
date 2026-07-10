import React, { useState } from "react";
import { Wrench, AlertTriangle, CheckCircle } from "lucide-react";

const ISSUE_TYPES = [
  " Plumbing (Leakage)",
  " Electrical (Faulty Socket/Switch)",
  " Furniture (Broken Bed/Chair/Desk)",
  " Structural (Cracked Wall/Window)",
  " Pest Control",
  " Cleaning / Sanitation",
  " Other",
];

export default function Maintenance() {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueType || !description.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIssueType("");
      setDescription("");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Maintenance</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Report an issue or fault in your hostel room.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border-neutral rounded p-6">
          <h3 className="font-title-md text-title-md text-primary mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Report an Issue
          </h3>

          {submitted ? (
            <div className="bg-success-green/10 border border-success-green/30 rounded p-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-success-green mb-3" />
              <p className="font-title-md text-title-md text-success-green">Report Submitted</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Maintenance has been notified. Reference will be sent to your email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  required
                  className="w-full h-11 px-4 border border-border-neutral rounded bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md"
                >
                  <option value="">Select issue type...</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-4 py-3 border border-border-neutral rounded bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-primary text-on-primary font-title-md text-title-md rounded hover:bg-primary-container transition-colors"
              >
                Submit Report
              </button>
            </form>
          )}
        </div>

        <div className="bg-warning-amber/5 border border-warning-amber/20 rounded p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-warning-amber shrink-0 mt-0.5" />
            <div>
              <h3 className="font-title-md text-title-md text-primary">Maintenance Guidelines</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Report only genuine faults. Emergency issues (fire, flooding, electrical sparks)
                should be reported immediately to the hostel porter.
              </p>
              <ul className="mt-4 space-y-2 font-body-md text-body-md text-on-surface-variant list-disc list-inside">
                <li>Response time: 24–48 hours for non-emergency.</li>
                <li>Include your room number and block in the description.</li>
                <li>Do not attempt DIY repairs on electrical faults.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

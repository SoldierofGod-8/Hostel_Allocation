import React from "react";
import { CreditCard, ShieldCheck, ArrowRight, Building2 } from "lucide-react";

const FEE_STRUCTURE = [
  { label: "Accommodation Fee (Per Session)", amount: "NGN 85,000" },
  { label: "Utility & Maintenance Levy", amount: "NGN 12,000" },
  { label: "Caution Deposit (Refundable)", amount: "NGN 10,000" },
  { label: "Portal Service Charge", amount: "NGN 3,000" },
];

export default function Payments({ user, onNavigate }) {
  const total = FEE_STRUCTURE.reduce((sum, item) => {
    const num = parseInt(item.amount.replace(/[^0-9]/g, ""));
    return sum + num;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Payments</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          View fee structure and manage your accommodation payments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border-neutral rounded p-6">
          <h3 className="font-title-md text-title-md text-primary mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Fee Breakdown
          </h3>
          <div className="space-y-4">
            {FEE_STRUCTURE.map((item) => (
              <div key={item.label} className="flex justify-between items-center pb-3 border-b border-border-neutral last:border-0">
                <span className="font-body-md text-body-md text-on-surface">{item.label}</span>
                <span className="font-title-md text-title-md text-primary">{item.amount}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="font-title-md text-title-md text-primary">Total</span>
              <span className="font-headline-md text-headline-md text-primary">NGN {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-primary text-on-primary rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-8 w-8 opacity-80" />
              <div>
                <h3 className="font-title-md text-title-md">Payment Instructions</h3>
                <p className="font-body-md text-body-md text-primary-fixed-dim">Complete your allocation</p>
              </div>
            </div>
            <ol className="space-y-3 font-body-md text-body-md text-primary-fixed-dim list-decimal list-inside">
              <li>Generate payment invoice via the portal.</li>
              <li>Pay at any designated bank branch.</li>
              <li>Upload payment receipt for verification.</li>
              <li>Receive confirmation within 24 hours.</li>
            </ol>
          </div>

          {!user?.currentAllocationId && (
            <div className="bg-surface border border-border-neutral rounded p-6 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto text-outline-variant mb-3" />
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                You need to reserve a room first before making payment.
              </p>
              <button
                onClick={() => onNavigate("Room Selection")}
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-title-md text-title-md rounded px-6 py-3 hover:bg-primary-container transition-colors"
              >
                Reserve a Room <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {user?.currentAllocationId && (
            <div className="bg-success-green/10 border border-success-green/30 rounded p-6">
              <p className="font-body-md text-body-md text-success-green font-medium">
                You have an active reservation. Proceed to make payment to confirm your allocation.
              </p>
              <button className="mt-4 w-full bg-success-green text-white font-title-md text-title-md rounded px-6 py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Pay Now <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

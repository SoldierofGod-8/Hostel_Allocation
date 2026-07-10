import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Eligibility", step: 1 },
  { label: "Selection", step: 2 },
  { label: "Payment", step: 3 },
  { label: "Confirm", step: 4 },
];

export default function ProgressStepper({ currentStep = 2 }) {
  return (
    <div className="bg-surface border border-border-neutral rounded p-4 flex items-center justify-between w-full relative">
      <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-outline-variant -z-10 -translate-y-1/2" />
      {STEPS.map((s) => {
        const isCompleted = s.step < currentStep;
        const isCurrent = s.step === currentStep;

        let circleClass = "bg-surface text-outline border-2 border-outline-variant";
        if (isCompleted) circleClass = "bg-primary text-on-primary";
        if (isCurrent) circleClass = "bg-secondary-container text-on-secondary-container border-2 border-secondary-container";

        let labelClass = "text-outline-variant";
        if (isCompleted) labelClass = "text-primary";
        if (isCurrent) labelClass = "text-secondary font-bold";

        return (
          <div key={s.step} className="flex flex-col items-center gap-2 bg-surface px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}>
              {isCompleted ? (
                <Check className="h-[18px] w-[18px]" />
              ) : (
                <span className="font-title-md text-title-md leading-none">{s.step}</span>
              )}
            </div>
            <span className={`font-label-sm text-label-sm uppercase whitespace-nowrap ${labelClass}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

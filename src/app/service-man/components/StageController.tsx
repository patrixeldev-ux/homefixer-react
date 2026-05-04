"use client";

/**
 * StageController
 * ---------------
 * Floating action panel that shows the current journey stage and
 * provides the primary CTA button for advancing to the next stage.
 *
 * Stages:
 *  TO_CUSTOMER  → "Start Journey" button
 *  TO_VENDOR    → "Go to Vendor" button
 *  COMPLETE     → "Complete Service" button
 */

import type { JourneyStage } from "../../../hooks/useServicemanTracking";
import { FiNavigation, FiShoppingBag, FiCheckCircle } from "react-icons/fi";

interface StageControllerProps {
  stage: JourneyStage;
  hasVendor: boolean;
  completing: boolean;
  onStartJourney: () => void;
  onGoToVendor: () => void;
  onComplete: () => void;
}

// ─── Stage config ──────────────────────────────────────────────────────────────

const STAGE_CONFIG = {
  TO_CUSTOMER: {
    label: "Stage 1 of 3",
    title: "Heading to Customer",
    description: "Navigate to the customer's location to inspect the issue.",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  TO_VENDOR: {
    label: "Stage 2 of 3",
    title: "Heading to Vendor",
    description: "Pick up the required materials from the vendor.",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  COMPLETE: {
    label: "Stage 3 of 3",
    title: "Service Complete",
    description: "Great work! The service has been marked as done.",
    badge: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
};

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepDots({ stage }: { stage: JourneyStage }) {
  const steps: JourneyStage[] = ["TO_CUSTOMER", "TO_VENDOR", "COMPLETE"];
  const currentIdx = steps.indexOf(stage);

  return (
    <div className="flex items-center gap-2 mb-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < currentIdx
                ? "bg-green-500"
                : i === currentIdx
                ? STAGE_CONFIG[stage].dot + " scale-125"
                : "bg-gray-300"
            }`}
          />
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-6 rounded-full transition-all duration-500 ${
                i < currentIdx ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function StageController({
  stage,
  hasVendor,
  completing,
  onStartJourney,
  onGoToVendor,
  onComplete,
}: StageControllerProps) {
  const cfg = STAGE_CONFIG[stage];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
      {/* Stage badge + dots */}
      <div className="flex items-center justify-between mb-1">
        <StepDots stage={stage} />
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Title + description */}
      <h3 className="font-bold text-gray-900 text-base">{cfg.title}</h3>
      <p className="text-gray-500 text-sm mt-0.5 mb-4">{cfg.description}</p>

      {/* CTA Buttons */}
      {stage === "TO_CUSTOMER" && (
        <button
          onClick={onStartJourney}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
        >
          <FiNavigation size={18} />
          Start Journey
        </button>
      )}

      {stage === "TO_VENDOR" && (
        <div className="space-y-2">
          {hasVendor ? (
            <button
              onClick={onGoToVendor}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-200"
            >
              <FiShoppingBag size={18} />
              Go to Vendor
            </button>
          ) : (
            <div className="w-full py-3.5 bg-gray-100 text-gray-400 font-semibold rounded-xl text-center text-sm">
              ⏳ Waiting for vendor assignment…
            </div>
          )}
          <button
            onClick={onComplete}
            disabled={completing}
            className="w-full py-3 border border-green-200 bg-green-50 hover:bg-green-100 disabled:opacity-50 text-green-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <FiCheckCircle size={16} />
            {completing ? "Completing…" : "Skip vendor — Mark Complete"}
          </button>
        </div>
      )}

      {stage === "COMPLETE" && (
        <div className="w-full py-3.5 bg-green-50 border border-green-200 text-green-700 font-bold rounded-xl text-center flex items-center justify-center gap-2">
          <FiCheckCircle size={18} />
          Service Completed ✓
        </div>
      )}
    </div>
  );
}

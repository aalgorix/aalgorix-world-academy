"use client";

import { useState } from "react";

import type { HubAiContext, StudentHubPayload } from "@/lib/student/hub/types";

import { AcademicCanvas } from "./academic-canvas";
import { AiStudyBuddy } from "./ai-study-buddy";
import { LiveCountdownTicker } from "./live-countdown-ticker";

type OperationsInteractiveStackProps = {
  payload: Pick<
    StudentHubPayload,
    "courses" | "assignments" | "vaultItems" | "liveSession" | "aiContext"
  >;
};

export function OperationsInteractiveStack({ payload }: OperationsInteractiveStackProps) {
  const [aiContext, setAiContext] = useState<HubAiContext>(payload.aiContext);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <>
      <LiveCountdownTicker session={payload.liveSession} />
      <AcademicCanvas
        courses={payload.courses}
        assignments={payload.assignments}
        vaultItems={payload.vaultItems}
        initialAiContext={payload.aiContext}
        onAiContextChange={setAiContext}
      />
      <AiStudyBuddy
        context={aiContext}
        open={aiPanelOpen}
        onOpenChange={setAiPanelOpen}
      />
    </>
  );
}

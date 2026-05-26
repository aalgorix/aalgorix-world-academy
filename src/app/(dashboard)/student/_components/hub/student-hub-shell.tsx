"use client";

import { useState } from "react";

import type { HubAiContext, StudentHubPayload } from "@/lib/student/hub/types";

import { AcademicCanvas } from "./academic-canvas";
import { AiStudyBuddy } from "./ai-study-buddy";
import { ChatChannelsPanel } from "./chat-channels-panel";
import { LiveCountdownTicker } from "./live-countdown-ticker";
import { NoticeboardPanel } from "./noticeboard-panel";
import { TelemetryMetricsRow } from "./telemetry-metrics-row";
import { WelcomeHeader } from "./welcome-header";

type StudentHubShellProps = {
  payload: StudentHubPayload;
};

export function StudentHubShell({ payload }: StudentHubShellProps) {
  const [aiContext, setAiContext] = useState<HubAiContext>(payload.aiContext);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <div className="flex min-h-full text-slate-900">
      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1">
            <div
              id="hub-overview"
              className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:p-6"
            >
              <WelcomeHeader
                displayName={payload.displayName}
                batchCode={payload.batchCode}
                todayLabel={payload.todayLabel}
                revisionCount={payload.revisionCount}
              />
              <TelemetryMetricsRow telemetry={payload.telemetry} />
              <LiveCountdownTicker session={payload.liveSession} />
              <AcademicCanvas
                courses={payload.courses}
                assignments={payload.assignments}
                vaultItems={payload.vaultItems}
                initialAiContext={payload.aiContext}
                onAiContextChange={setAiContext}
              />

              <div className="space-y-4 lg:hidden">
                <NoticeboardPanel
                  announcements={payload.announcements}
                  newsCards={payload.newsCards}
                />
                <ChatChannelsPanel
                  cohortMessages={payload.cohortMessages}
                  teacherContacts={payload.teacherContacts}
                  teacherThreads={payload.teacherThreads}
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-[#fafafa] p-4 lg:flex">
          <NoticeboardPanel
            announcements={payload.announcements}
            newsCards={payload.newsCards}
          />
          <ChatChannelsPanel
            cohortMessages={payload.cohortMessages}
            teacherContacts={payload.teacherContacts}
            teacherThreads={payload.teacherThreads}
          />
        </aside>
      </div>

      <AiStudyBuddy
        context={aiContext}
        open={aiPanelOpen}
        onOpenChange={setAiPanelOpen}
      />
    </div>
  );
}

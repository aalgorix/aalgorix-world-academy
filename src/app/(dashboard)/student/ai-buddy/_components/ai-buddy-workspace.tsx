"use client";

import { useState } from "react";

import type {
  AiBuddyActiveSelection,
  AiBuddyWorkspacePayload,
} from "@/lib/student/ai-buddy/types";

import { ContentSelectorSidebar } from "./content-selector-sidebar";
import { StudyConversationCanvas } from "./study-conversation-canvas";

type AiBuddyWorkspaceProps = {
  payload: AiBuddyWorkspacePayload;
};

export function AiBuddyWorkspace({ payload }: AiBuddyWorkspaceProps) {
  const [selection, setSelection] = useState<AiBuddyActiveSelection | null>(
    payload.defaultSelection,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid min-h-[520px] grid-cols-1 md:min-h-[600px] md:grid-cols-[minmax(260px,320px)_1fr]">
        <ContentSelectorSidebar
          courses={payload.courses}
          activeSelection={selection}
          onSelect={setSelection}
        />
        <StudyConversationCanvas
          selection={selection}
          displayName={payload.displayName}
        />
      </div>
    </div>
  );
}

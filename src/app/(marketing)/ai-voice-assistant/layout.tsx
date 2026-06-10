import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Voice Assistant | Aalgorix World Academy",
  description:
    "Talk to our AI voice assistant about admissions, courses, homeschooling, AI programs, and student support.",
};

export default function AiVoiceAssistantLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

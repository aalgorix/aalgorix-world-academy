import type { Metadata } from "next";
import type { ReactNode } from "react";

import { FloatingVideoBanner } from "./floating-video-banner";
import { MarketingFooter } from "./marketing-footer";

export const metadata: Metadata = {
  title: "Aalgorix World Academy | Elite Online Schooling & University Pathways",
  description: "Six internationally accredited Curriculum tracks tailored for homeschooling families, elite student-athletes, and global expatriates. Experience live specialist masterclasses, verified mentor mapping, and accelerated academic success tracking.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-white text-slate-900">
      {children}
      <MarketingFooter />
      <FloatingVideoBanner />
    </div>
  );
}

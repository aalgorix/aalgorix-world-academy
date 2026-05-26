"use client";

import { useEffect, useState } from "react";

import type { HubNewsCard } from "@/lib/student/hub/types";

type CurrentAffairsCarouselProps = {
  newsCards: HubNewsCard[];
};

export function CurrentAffairsCarousel({ newsCards }: CurrentAffairsCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (newsCards.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % newsCards.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [newsCards.length]);

  const card = newsCards[index];

  return (
    <section
      aria-label="Current affairs and academy news"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Current affairs feed
      </h2>
      {card ? (
        <a
          href={card.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block overflow-hidden rounded-xl border border-slate-200 transition-all duration-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
        >
          <div className={`bg-gradient-to-br ${card.imageGradient} px-4 py-5 text-white`}>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
              {card.category}
            </span>
            <p className="mt-2 text-sm font-extrabold leading-snug">{card.title}</p>
          </div>
          <p className="px-4 py-3 text-xs leading-relaxed text-slate-600">{card.summary}</p>
        </a>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Curated educational news and global affairs blocks will appear here.
        </p>
      )}
    </section>
  );
}

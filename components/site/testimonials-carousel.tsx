"use client";

import { useState } from "react";

interface Testimonial {
  id: string;
  clientName: string;
  rating: number;
  text: string;
}

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  if (testimonials.length === 0) return null;

  const t = testimonials[index];
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + testimonials.length) % testimonials.length);

  return (
    <section id="depoimentos" className="bg-ak-black-soft border-y border-white/10">
      <div className="max-w-3xl mx-auto px-4 py-20 sm:py-28 text-center">
        <span className="font-heading text-xs uppercase tracking-[0.3em] text-ak-red-glow">Quem já alugou</span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ak-silver-light mt-2 mb-10">
          Depoimentos
        </h2>

        <div className="bg-ak-black-card border border-white/10 rounded-md p-8 sm:p-10">
          <p className="text-amber-400 text-lg mb-4">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</p>
          <p className="text-ak-silver-light text-lg italic">&ldquo;{t.text}&rdquo;</p>
          <p className="font-heading font-semibold text-ak-red-glow mt-6">{t.clientName}</p>
        </div>

        {testimonials.length > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => go(-1)}
              className="h-9 w-9 rounded-full border border-white/15 text-ak-silver-dark hover:text-white hover:border-white/40 transition-colors"
              aria-label="Depoimento anterior"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              className="h-9 w-9 rounded-full border border-white/15 text-ak-silver-dark hover:text-white hover:border-white/40 transition-colors"
              aria-label="Próximo depoimento"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

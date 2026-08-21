"use client"

import { useReveal } from "@/lib/motion/use-reveal"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "left" | "center"
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: SectionHeadingProps) {
  const ref = useReveal<HTMLDivElement>("rise")

  return (
    <div
      ref={ref}
      data-reveal
      className={
        align === "center"
          ? "max-w-3xl mx-auto text-center mb-14 md:mb-20"
          : "max-w-3xl mb-14 md:mb-20"
      }
    >
      {eyebrow && (
        <p className="type-label text-[0.68rem] text-amber mb-5">{eyebrow}</p>
      )}
      <h2 className="type-display text-[clamp(2.25rem,7vw,4.5rem)] text-fg">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-6 text-base md:text-lg text-fg-muted leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

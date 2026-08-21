interface SectionHeadingProps {
  /** Sobrelinha curta em caixa alta, para situar a seção. */
  eyebrow?: string
  title: string
  subtitle?: string
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl mb-10 md:mb-14">
      {eyebrow && (
        <p className="type-label text-xs text-brand-deep mb-3">{eyebrow}</p>
      )}
      <h2 className="type-display text-[clamp(2rem,5.5vw,3.25rem)] text-fg">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

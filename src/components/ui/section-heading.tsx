"use client"

import { motion } from "framer-motion"

interface SectionHeadingProps {
  title: string
  subtitle?: string
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      className="text-center mb-12 md:mb-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-[2px] w-12 rounded-full bg-primary" />
      {subtitle && (
        <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

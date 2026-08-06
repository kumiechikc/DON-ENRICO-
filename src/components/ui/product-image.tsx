"use client"

import { useState } from "react"
import Image from "next/image"
import { UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

export function ProductImage({ src, alt, className, sizes, priority }: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {showFallback ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#1C1C1C_0%,#241812_60%,#2E1A0E_100%)]"
          role="img"
          aria-label={alt}
        >
          <UtensilsCrossed className="w-8 h-8 text-primary/40" strokeWidth={1.5} />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

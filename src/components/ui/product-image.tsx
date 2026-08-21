import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  /**
   * Caminho da foto em public/. Enquanto o cliente não envia as fotos, fica
   * indefinido e o bloco cai no espaço reservado da marca — em vez de fingir
   * que há uma foto ali.
   */
  src?: string
  alt: string
  className?: string
  sizes?: string
  /** Marca a imagem do topo da página, que não deve ser adiada. */
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw",
  priority = false,
}: ProductImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-2 border border-border",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
        />
      ) : (
        /*
         * Espaço reservado, não conteúdo: puramente decorativo e escondido de
         * leitores de tela, para ninguém anunciar uma foto que não existe.
         */
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="type-display text-[clamp(1.5rem,4vw,2.25rem)] text-border-strong/45 select-none">
            Don Enrico
          </span>
        </div>
      )}
    </div>
  )
}

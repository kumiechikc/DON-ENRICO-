import { acharFoto } from "@/lib/media/fotos"
import { arquivoPublico } from "@/lib/caminho-publico"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  /**
   * Id no manifesto de `fotos.ts`. Enquanto a linha não tiver foto registrada,
   * fica indefinido e o bloco cai no espaço reservado da marca — em vez de
   * fingir que há uma foto ali.
   */
  foto?: string
  className?: string
  sizes?: string
  /** Marca a imagem do topo da página, que não deve ser adiada. */
  priority?: boolean
}

/*
 * `<img>` cru, e não `next/image`.
 *
 * O site é exportado estático com `images: { unoptimized: true }`, e nesse modo
 * o `next/image` não gera `srcset` nenhum: ele emite uma tag com uma única
 * origem, do tamanho grande, e o celular baixa o arquivo de desktop inteiro.
 * Aqui isso custava o dobro — 116 KB contra 58 KB na foto do box.
 *
 * Escrevendo a tag à mão, as duas larguras entram no `srcset` e o navegador
 * escolhe. O que se perde do `next/image` é o `basePath` automático, e para
 * isso já existe o `arquivoPublico()`, que é o mesmo caminho que os clipes
 * usam.
 */
export function ProductImage({
  foto: id,
  className,
  sizes = "(min-width: 1024px) 45vw, 92vw",
  priority = false,
}: ProductImageProps) {
  const foto = id ? acharFoto(id) : undefined

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-2 border border-border",
        className
      )}
    >
      {foto ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={arquivoPublico(foto.arquivo)}
          srcSet={
            `${arquivoPublico(foto.arquivoEstreito)} ${foto.larguraEstreita}w, ` +
            `${arquivoPublico(foto.arquivo)} ${foto.largura}w`
          }
          sizes={sizes}
          alt={foto.descricao}
          width={foto.largura}
          height={foto.altura}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
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

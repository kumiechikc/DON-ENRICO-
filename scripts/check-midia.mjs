#!/usr/bin/env node
/**
 * Conferência estática da mídia em movimento, sem navegador.
 *
 *   npm run check:midia
 *
 * Serve para dar resposta em um segundo logo depois de comprimir um clipe ou
 * preparar uma tira. A parte que precisa de navegador — com movimento reduzido
 * nada é baixado e nenhuma sequência avança — roda dentro de `npm run check`.
 */
import { checkMidiaEstatica, checkSequenciasEstatica } from "./checks/midia.mjs"

const blocos = [
  ["Clipes de vídeo", await checkMidiaEstatica()],
  ["Sequências de quadros", await checkSequenciasEstatica()],
]

let total = 0
for (const [titulo, { failures, notes }] of blocos) {
  const regua = "─".repeat(Math.max(4, 50 - titulo.length))
  process.stdout.write(`\n── ${titulo} ${regua}\n`)
  notes.forEach((n) => process.stdout.write(`   ${n}\n`))
  failures.forEach((f) => process.stdout.write(`   ✗ ${f}\n`))
  total += failures.length
}

process.stdout.write(`\n${"═".repeat(56)}\n`)
process.stdout.write(
  total === 0 ? "Sem problemas na mídia.\n" : `${total} problema(s).\n`
)
process.exit(total === 0 ? 0 : 1)

#!/usr/bin/env node
/**
 * Conferência estática dos clipes, sem navegador.
 *
 *   npm run check:midia
 *
 * Serve para dar resposta em um segundo logo depois de comprimir um clipe. A
 * parte que precisa de navegador (com movimento reduzido, nenhum vídeo é
 * baixado) roda dentro de `npm run check`.
 */
import { checkMidiaEstatica } from "./checks/midia.mjs"

const { failures, notes } = await checkMidiaEstatica()

process.stdout.write("\n── Clipes de vídeo ────────────────────────────────\n")
notes.forEach((n) => process.stdout.write(`   ${n}\n`))
failures.forEach((f) => process.stdout.write(`   ✗ ${f}\n`))

process.stdout.write(`\n${"═".repeat(56)}\n`)
if (failures.length === 0) {
  process.stdout.write("Sem problemas nos clipes.\n")
} else {
  process.stdout.write(`${failures.length} problema(s).\n`)
}
process.exit(failures.length === 0 ? 0 : 1)

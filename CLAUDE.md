# CLAUDE.md — DON ENRICO Website Design Stack

This repository is a **ready-to-use environment that makes Claude Code good at website
design**. When you (Claude) do any UI, web page, landing page, component, or visual-polish
work in a project that uses this stack, follow the workflow below. It combines a *knowledge*
layer (what to build), a *taste* layer (making it distinctive), and a *feedback* layer
(actually seeing the rendered result and fixing it).

## The design loop (follow in order)

1. **PLAN with data — `ui-ux-pro-max`.** Before writing markup, get a concrete design
   system. Run the generator, then pull specifics per surface:
   ```bash
   python3 src/ui-ux-pro-max/scripts/search.py "<product> <industry> <keywords>" --design-system -p "Project"
   python3 src/ui-ux-pro-max/scripts/search.py "<query>" --domain style|color|typography|ux|landing|web-vitals
   ```
   Use it for: product-type patterns, color tokens, font pairings, UX anti-patterns,
   landing structure, and Core Web Vitals budgets. Treat its output as the source of truth
   for tokens (color, type, spacing).

2. **COMMIT to an aesthetic — `frontend-design`.** Do not sample the safe center of the
   training distribution. Answer four questions first — *purpose, tone, constraints,
   differentiation* — pick ONE tone and execute it precisely. Avoid the three AI-slop
   defaults (cream + serif + terracotta; near-black + acid accent; hairline broadsheet)
   unless the brief explicitly asks. Spend boldness in **one** signature element; keep the
   rest quiet.

3. **BUILD.** Implement with the chosen tokens. Match the surrounding code's conventions.
   For component-driven stacks, use the **shadcn** MCP to search/add components instead of
   hand-rolling primitives. Use **21st.dev Magic MCP** (`21st`) to generate custom React
   components from prompts, and **shadcn-ui MCP** (`@jpisnice`) for browsing blocks,
   themes, and extended component metadata.

4. **SEE IT — Playwright / Chrome DevTools MCP.** You are not done when the code compiles.
   Open the page in a real browser, screenshot it, read the console, exercise interactive
   states (hover, focus, open menus, submit forms), and resize the viewport. Fix what you
   see — z-index, animation timing, layout shift, overflow. This feedback loop is the whole
   point of the stack; a change you have not looked at is not finished.

5. **REVIEW — `/design-review` (the `design-review` subagent).** Before you call a UI change
   complete, run the design-review subagent. It drives Playwright across mobile to ultrawide
   viewports, checks WCAG 2.1 AA (contrast, focus order, keyboard traps), responsive
   integrity, and interaction states, and returns ranked findings. Fix Blocker/High
   findings before finishing. Also run `/web-design-guidelines` against UI files for a
   compliance check against Vercel's Web Interface Guidelines.

## Quality floor (never ship below this)

- **Responsive:** no horizontal scroll at 375 / 768 / 1024 / 1440 px; content reflows, not shrinks.
- **Accessible:** visible `:focus-visible` on every interactive element; WCAG AA contrast
  (4.5:1 text, 3:1 large text / UI); semantic landmarks; labelled controls; `prefers-reduced-motion` respected.
- **Performant:** stable layout (no CLS from unsized media/fonts), lazy-load below-fold
  images, `font-display: swap`, avoid render-blocking. Check against the `web-vitals` domain.
- **Intentional copy:** active voice, sentence case, name things by what users recognize.

## What's wired in this repo

| Layer | Tool | Where |
|-------|------|-------|
| Knowledge | `ui-ux-pro-max` skill | `.claude/skills/ui-ux-pro-max` + `src/ui-ux-pro-max/` |
| Taste | `frontend-design` skill | install via `/plugin install frontend-design@anthropics/claude-code` |
| Component gen | `shadcn` MCP (official) | `.mcp.json` |
| Component gen | `shadcn-ui` MCP (@jpisnice — blocks, themes) | `.mcp.json` |
| Component gen | `21st` MCP (21st.dev Magic — AI component gen) | `.mcp.json` (needs API key) |
| Visual feedback | `@playwright/mcp` + `chrome-devtools-mcp` | `.mcp.json` |
| Design review | `/design-review` command | `.claude/commands/design-review.md` |
| Design planning | `/design-plan` command | `.claude/commands/design-plan.md` |
| Web guidelines | `web-design-guidelines` skill (Vercel) | `.claude/skills/web-design-guidelines` |
| Accessibility | `a11y-debugging` skill (Chrome DevTools) | `.claude/skills/a11y-debugging` |
| Performance | `debug-optimize-lcp` skill (Chrome DevTools) | `.claude/skills/debug-optimize-lcp` |
| Memory | `memory-leak-debugging` skill (Chrome DevTools) | `.claude/skills/memory-leak-debugging` |
| Standalone audit | `scripts/design-audit.mjs` (multi-viewport screenshots) | `scripts/`, CI in `.github/workflows` |

## Available skills

| Skill | Purpose |
|-------|---------|
| `ui-ux-pro-max` | 84 UI styles, 192 color palettes, 74 font pairings, 98 UX guidelines, 25 chart types |
| `design` | Design guidelines and principles |
| `design-system` | Design system token architecture and component specs |
| `brand` | Branding and identity guidelines |
| `ui-styling` | UI styling patterns and techniques |
| `banner-design` | Banner and hero design patterns |
| `slides` | Presentation and slide design |
| `web-design-guidelines` | Vercel Web Interface Guidelines compliance review |
| `chrome-devtools` | Chrome DevTools usage for debugging |
| `a11y-debugging` | Accessibility debugging with DevTools |
| `debug-optimize-lcp` | Largest Contentful Paint optimization |
| `memory-leak-debugging` | Memory leak detection and fixing |
| `troubleshooting` | General web troubleshooting |

See `docs/STACK.md` for why each tool is here, `docs/SETUP.md` to install, and
`docs/WORKFLOW.md` for a worked end-to-end example.

## Notes

- The `ui-ux-pro-max` data and scripts live at `src/ui-ux-pro-max/`. Run searches with:
  `python3 src/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`
- The **21st.dev Magic MCP** needs an API key from https://21st.dev/mcp — set it in
  `.mcp.json` under `env.API_KEY_21ST`, or in your shell environment. See `docs/SETUP.md`.
- The **frontend-design** skill is an Anthropic plugin. Install it inside Claude Code with:
  `/plugin install frontend-design@anthropics/claude-code`

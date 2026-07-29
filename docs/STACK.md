# The Stack — why each tool is here

AI design fails in three predictable ways. Each layer of this stack fixes one.

| Failure mode | Fix | Tool |
|--------------|-----|------|
| Generic, templated look ("AI slop") | Force an aesthetic commitment | `frontend-design` |
| Vague, inconsistent tokens & patterns | Ground decisions in a real database | `ui-ux-pro-max` |
| Never sees the result, ships broken UI | Give the agent eyes | Playwright / Chrome DevTools MCP |
| Reinventing primitives | Pull proven components | shadcn + shadcn-ui + 21st MCP |
| "Looks fine to me" self-assessment | Independent, rigorous review | `design-review` + `web-design-guidelines` |

## Knowledge — `ui-ux-pro-max`

A searchable design-intelligence toolkit: **84 UI styles, 192 color palettes, 74 font
pairings, 98 UX guidelines, 25 chart types, a Core Web Vitals dataset, and 22 tech stacks**,
plus a design-system generator that turns a product brief into concrete tokens. It's the
answer to "what should this actually look like, and what are the anti-patterns?"

- Repo: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Data & scripts: `src/ui-ux-pro-max/`
- Use: `python3 src/ui-ux-pro-max/scripts/search.py "<brief>" --design-system` and `--domain <domain>`

## Taste — `frontend-design` (official Anthropic)

~50 lines of markdown that stop Claude from sampling the safe center of its training data. It
forces four decisions — *purpose, tone, constraints, differentiation* — before any CSS, names
three "AI-slop" defaults to avoid, and pushes boldness into a single signature element.

- Repo: https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design
- Install: `/plugin install frontend-design@anthropics/claude-code`

`ui-ux-pro-max` decides *what's correct*; `frontend-design` decides *what's distinctive*. Use both.

## Components — shadcn MCP (official)

Browse, search, and install shadcn/ui components (and other registries) by natural language,
instead of hand-rolling accessible primitives. Best for React/Next/Vue/Svelte projects.

- Docs: https://ui.shadcn.com/docs/mcp
- Command: `npx shadcn@latest mcp`

## Components — shadcn-ui MCP (@jpisnice, extended)

Extended shadcn/ui MCP server with additional features: blocks browsing, tweakcn theme
customization, repository browsing, and detailed component metadata including demos and
installation instructions. Supports React, Vue, Svelte, and React Native.

- Repo: https://github.com/Jpisnice/shadcn-ui-mcp-server
- Package: `@jpisnice/shadcn-ui-mcp-server`

## Components — 21st.dev Magic MCP

AI-powered component generation from natural language prompts. Search a curated component
catalog, get design inspiration, and generate ready-to-use React components with animations.
Think of it as "v0 in your editor".

- Site: https://21st.dev/mcp
- Repo: https://github.com/21st-dev/magic-mcp
- Requires API key (see `docs/SETUP.md`)

## Visual feedback — Playwright MCP + Chrome DevTools MCP

The single biggest lever. Claude connects to a **real Chromium**, navigates, clicks, resizes,
screenshots, reads the console, and takes an accessibility snapshot — so it can catch and fix
its own z-index bugs, animation-timing errors, overflow, and layout shift. Chrome DevTools MCP
adds deep performance/network/CLS profiling.

- Playwright MCP: https://github.com/microsoft/playwright-mcp
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp

**Bundled Chrome DevTools skills:**
- `chrome-devtools` — core browser automation workflow
- `a11y-debugging` — accessibility auditing with Lighthouse
- `debug-optimize-lcp` — Largest Contentful Paint optimization
- `memory-leak-debugging` — JavaScript memory leak diagnosis
- `troubleshooting` — MCP connection troubleshooting

## Design review — `web-design-guidelines` (Vercel)

Reviews UI code against the Vercel Web Interface Guidelines — a comprehensive set of rules
covering accessibility, performance, UX patterns, and design quality. Fetches the latest
rules from the source repo before each review.

- Source: https://github.com/vercel-labs/web-interface-guidelines
- Trigger: "review my UI", "check accessibility", "audit design"

## Automated review — `/design-review` command

A review workflow that drives a real browser via Playwright across 6 viewport tiers
(360px to 1920px), checks WCAG 2.1 AA compliance, responsive integrity, and interaction
states, and returns ranked findings. Invoke with `/design-review <url>`. The heuristic
subset also runs headless in CI via `scripts/design-audit.mjs`.

## Optional add-ons

- **Figma Dev Mode MCP** — read a frame's tokens/layout to generate matching code, and push
  Claude-built UI back to the canvas as editable layers. Needs the Figma desktop app + Dev Mode.
  https://help.figma.com/hc/en-us/articles/39888612464151

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Banca Simplificada — AI Skills

## MANDATORY: Read skills before writing ANY code

Before modifying or creating ANY file, read the relevant skill documents in `.gemini/skills/`:

| # | Skill | When to read |
|---|-------|-------------|
| 01 | `01-stack-overview.md` | Before installing packages or choosing libraries |
| 02 | `02-project-structure.md` | Before creating files/folders |
| 03 | `03-design-system.md` | Before styling anything |
| 04 | `04-nextjs16-patterns.md` | Before using ANY Next.js API |
| 05 | `05-shadcn-components.md` | Before creating UI components |
| 06 | `06-layout-patterns.md` | Before creating layouts or pages |
| 07 | `07-icons-catalog.md` | Before adding icons |
| 08 | `08-quality-checklist.md` | Before marking any task as done |

## Critical Rules

1. **params and searchParams are Promises in Next.js 16** — Always `await` them
2. **Server Components by default** — Only add `'use client'` for interactivity
3. **Only lucide-react for icons** — Never mix icon libraries
4. **Only shadcn/ui for components** — Import from `@/components/ui/`
5. **Always check `node_modules/next/dist/docs/`** for up-to-date Next.js 16 APIs
6. **Every page follows**: PageHeader → Stats (optional) → Content
7. **Every dynamic route needs**: `loading.tsx` with matching skeletons

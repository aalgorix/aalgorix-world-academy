<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:docs-update-rules -->
# Documentation maintenance rule

After **every significant code change** (new page, new component, schema change, dependency addition, bug fix, refactor), you MUST update both:

1. `docs/MASTER_DOCUMENTATION.md` — Update: header "Last Updated" date, completion %, completion matrix (§2.3), folder tree (§6.1), feature inventory (§9), dashboard pages table (§13.3), technical debt (§21), missing features (§22), roadmap (§24), and CTO scores (§28.2) as applicable.
2. `docs/PROJECT_STATUS.md` — Update: document version, last updated date, status line, directory tree (§3), completed milestones (§2.x), roadmap table (§5), and verification checklist (Appendix A) as applicable.

Both documents must always accurately reflect the **current state of the codebase**, not a past state.
<!-- END:docs-update-rules -->

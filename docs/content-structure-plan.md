# Content Structure Plan

Last checked against staging with the WordPress REST API on 2026-05-10. Local fixture model last updated on 2026-05-11.

Architecture note: the recommended implementation direction is a real block theme with purpose-built custom blocks, not a classic PHP shell. See `docs/theme-architecture-migration.md` for the current theme architecture plan.

## Current State

- The homepage is now a theme-composed reader experience, not normal page content.
- Staging previously had published pages `about`, `projects`, `blog`, `about-2`, and `home`.
- `about` is the canonical author chapter. `about-2` appears to be a duplicate.
- `projects` is a normal page made from Columns and card-style inline block styles.
- Published writing is standard Posts. There are four current posts.
- No project custom post type exists yet.

The main structural problem is that project entries are embedded inside a single Page layout. That makes them easy to edit visually once, but hard for the theme to reuse cleanly in the table of contents, homepage chapter, archives, feeds, or future project detail pages.

## Recommended Model

Use WordPress content types by editorial job:

- **Posts**: essays and occasional writing.
- **Pages**: stable narrative chapters such as About, Blog, Contact/Coda, and a future Currently/Now page.
- **Projects**: a dedicated `dsg_project` post type registered by a small site-core plugin, not by the theme.

The project post type should use normal WordPress editing for the body, plus a few structured fields:

- `project_url`: canonical external URL.
- `project_summary`: one-sentence homepage/archive summary.
- `project_area`: taxonomy for groups such as Automattic, Side Projects, AI, Experiments.
- `project_status`: active, archived, paused, or historical.
- `project_featured`: boolean for homepage inclusion.
- `menu_order`: manual ordering within featured projects.

## Theme Behavior

The theme should keep rendering the site as a book, but pull content from structured sources:

- Cover: site title/tagline and static edition metadata.
- Contents: links to sections that actually exist.
- About chapter: pulls the `about` page.
- Selected Works chapter: queries featured `dsg_project` posts, ordered by `menu_order`.
- Essays chapter: queries recent Posts.
- Coda chapter: pulls a small Contact/Coda page instead of hard-coded template copy.

Until `dsg_project` exists, the theme uses a `dsg/projects-chapter` dynamic block as a bridge. It reads the current `projects` page block structure, extracts the section headings and project cards, and renders them as a stable reader list on the homepage. This keeps the editor manageable while avoiding the card/grid markup in the front-page reading flow.

## Local Fixture Content

The local `npm run env:seed` workflow creates dummy content for the target theme behavior, not a mirror of production.

Current fixtures include:

- Pages: `about`, `projects`, and `coda`.
- Basic essay flow posts: reader interface notes and structured-project notes.
- `reader-block-kitchen-sink`: headings, lists, quote, pullquote, details, buttons, separator, verse, inline code.
- `reader-media-and-embed-fixture`: image, gallery, captions, and embed placeholder.
- `reader-data-and-code-fixture`: long inline code, code block, table, and long tokens.
- `reader-wide-block-fixture`: wide Cover, wide Media & Text, full-width Group band, then normal prose.

Use these fixtures to develop the intended block UX and reader styling. Use synced staging/live content as regression data only.

## Migration Status

Done:

- Registered editor-facing reader blocks for the homepage sections.
- Cleaned up the homepage template so users edit reader sections instead of raw HTML.
- Added repeatable fixture content for the target reader UX.
- Added reader styling coverage for common core post blocks.

Remaining:

1. Add a sibling `dsg-site-core` plugin for durable site content types.
2. Register `dsg_project`, `project_area`, and the project meta fields.
3. Migrate each current card from the Projects page into a Project post via REST.
4. Replace the Projects page fallback with structured project queries.
5. Set duplicate/legacy pages such as `about-2` and old `home` to draft after confirming nothing links to them.

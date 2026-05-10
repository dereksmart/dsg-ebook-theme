# Theme Architecture Migration Plan

Last updated: 2026-05-10.

## Decision

Move the theme from a Full Site Editing block-theme shell toward a classic/hybrid PHP theme.

The theme should keep using Gutenberg for normal writing and page content, but the book shell itself should be owned by the theme: PHP templates, structured content queries, theme settings, and purpose-built editor surfaces instead of Site Editor template editing.

## Why

The current block-theme implementation renders well on the frontend, but it is not easy to manage in the backend.

- The Site Editor exposes raw Custom HTML blocks for structural UI such as the header, cover metadata, table of contents, ornaments, and footer.
- Dynamic theme-only blocks such as `dsg/page-chapter` and `dsg/projects-chapter` are frontend render helpers, not mature editor blocks.
- The design is highly custom and dynamic, so exposing the shell as editable block markup makes the theme feel fragile and technical.
- Users should edit content sources, not implementation scaffolding.

## What We Keep From Gutenberg

Gutenberg is still valuable for content authoring.

- Essays and pages can stay as normal Posts and Pages.
- Authors still get headings, lists, quotes, embeds, media, and block patterns.
- Editor styles can make writing approximate the final reading experience.
- Inline formats such as footnotes, highlights, and definitions can remain block-editor tooling.
- Content remains portable WordPress block content instead of becoming theme-specific fields everywhere.

## What We Stop Relying On

The theme should not depend on Full Site Editing as the primary management UI.

- No Site Editor dependency for header, footer, homepage shell, or single-post chrome.
- No raw Custom HTML blocks for structural theme UI.
- No custom dynamic blocks in templates unless they have real editor UX and are worth maintaining as blocks.
- No expectation that users edit the book shell directly.

## Target Model

The user-facing content model should be simple:

- **Posts**: essays and occasional writing.
- **Pages**: stable narrative content such as About, Contact/Coda, Blog, and possibly Now.
- **Projects**: a future `dsg_project` content type or site-core plugin entity.
- **Theme settings**: cover subtitle, edition metadata, contact links, and other small site-wide strings.

The theme composes the book experience from those sources.

## Phase 1: Migration Spike

Convert the shell from FSE templates to classic PHP templates while preserving the current frontend as closely as possible.

Scope:

- Add `header.php`, `footer.php`, `front-page.php`, `single.php`, `page.php`, and `index.php`.
- Keep the current reader CSS and JavaScript.
- Keep the current homepage content sources for now.
- Remove the need to edit the shell in the Site Editor.
- Do not add a Projects custom post type yet.

Acceptance criteria:

- Front page, single posts, and pages render correctly on desktop and mobile.
- Normal post/page editing still works in wp-admin.
- The frontend no longer depends on Site Editor template parts.
- Unsupported custom block warnings are no longer part of the primary authoring flow.

## Phase 2: Homepage Content Model

Replace hardcoded template sections and dynamic block bridges with clear content sources.

Scope:

- About chapter pulls from the canonical About page.
- Essays chapter queries recent Posts.
- Coda chapter pulls from a Contact/Coda page or small theme settings.
- Works temporarily pulls from the existing Projects page or a transitional helper.

Acceptance criteria:

- Homepage content is managed from obvious WordPress screens.
- Template files contain rendering logic, not editable content blobs.
- Users do not need to understand block comments or Custom HTML to update homepage content.

## Phase 3: Projects Model

Add a durable Projects model after the shell migration is stable.

Recommended shape:

- Register `dsg_project` in a small site-core plugin rather than the theme.
- Add fields for project URL, summary, status, featured flag, grouping, and manual order.
- Query featured projects for the homepage Works chapter.
- Use normal project archive/detail views if useful later.

Acceptance criteria:

- Project entries are individually editable.
- The Works chapter is generated from structured project data.
- The old Projects page can become an archive intro, a draft, or a redirect target after migration.

## Phase 4: Authoring Polish

Make the editor experience feel intentional for writers.

Scope:

- Editor styles for Posts and Pages.
- Optional block patterns for article openings, notes, and coda sections.
- Keep or refine inline formats for footnotes, highlights, and definitions.
- Consider allowed-block guidance only if the editor feels too open-ended.

Acceptance criteria:

- Writing an essay feels like writing, not assembling layout.
- Editing stable pages is straightforward.
- Theme-specific affordances are named clearly and appear only where useful.

## Open Questions

- Should small site-wide strings live in the Customizer, a theme options page, or `theme.json`/template constants?
- Should Projects be implemented as a tiny sibling plugin immediately after Phase 1, or should the existing Projects page bridge remain briefly?
- How much of the current ebook chrome should appear in editor styles versus frontend only?
- Should old FSE templates remain as compatibility fallbacks during migration or be removed once PHP templates are complete?

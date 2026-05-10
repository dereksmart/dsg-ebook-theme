# Content Structure Plan

Last checked against staging with the WordPress REST API on 2026-05-10.

## Current State

- The homepage is now a theme-composed reader experience, not normal page content.
- Published pages are `about`, `projects`, `blog`, `about-2`, and `home`.
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

Until `dsg_project` exists, the theme can keep falling back to the current `projects` page, but it should render that page as a simple reader list rather than card columns.

## Migration Steps

1. Clean up the reader chrome and render the current Projects page as a linear section.
2. Add a sibling `dsg-site-core` plugin for durable site content types.
3. Register `dsg_project`, `project_area`, and the project meta fields.
4. Migrate each current card from the Projects page into a Project post via REST.
5. Replace the Projects page fallback with a `dsg/projects-chapter` dynamic block.
6. Set duplicate/legacy pages such as `about-2` and old `home` to draft after confirming nothing links to them.


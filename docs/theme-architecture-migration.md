# Theme Architecture Plan

Last updated: 2026-05-11.

## Decision

Keep this as a WordPress block theme, but make it a real purpose-built reader theme instead of a pile of editable template HTML.

The previous classic/hybrid PHP migration spike was reverted. The lesson from that spike still matters: PHP-owned settings were too rigid, but raw template HTML is also too fragile. The target is a block theme with first-class custom blocks, sensible patterns, good editor previews, and structured content sources.

The theme should feel like an ereader on the frontend and like a clear WordPress editing experience in the backend.

## Why

Full Site Editing is still useful here, but only if the custom reader pieces are real blocks.

- Header and footer can remain template parts.
- The homepage can remain a block template or pattern.
- Posts and Pages can stay in Gutenberg.
- Global styles and editor styles are valuable for a reader theme.
- Template editing becomes manageable once theme-specific pieces have block controls and previews.

The remaining problems come from implementation details:

- A few small ornaments still use raw HTML in templates.
- Some PHP internals still use the old `dsg_ebook_*` function/localStorage names after the theme rename.
- Project data is embedded in one Page instead of modeled as reusable content.
- The Projects page parser is useful as a temporary bridge, but it should not shape the future content model.

## Product Direction

The site should borrow from traditional ereader UX without pretending the web is a fixed-page device.

Prioritize:

- Reader settings: font family, text size, line height, page width, light/dark/sepia, and reset.
- Reading progress: percent, estimated time left, and chapter/article progress.
- Resume reading: remember last scroll position locally per post/page.
- Contents: generated section links on the homepage and article heading TOCs where useful.
- Chapter navigation: next/previous post flow that feels like moving through chapters.
- Keyboard and mobile gestures: arrow-key navigation on desktop, mobile edge/swipe navigation that does not fight native scrolling.
- Reading-mode polish: quieter chrome while scrolling, restored chrome on movement/focus, reduced-motion support.
- Inline authoring formats: keep footnote, highlight, and definition tools.
- Share/citation affordance for essays, if it can stay subtle.

Avoid for now:

- A full fixed-page pagination engine. Lightweight page-curl transition affordances are acceptable, but posts should remain scrollable web documents.
- Reader-generated notes/highlights unless they are intentionally local-only or backed by a real persistence plan.
- Large settings pages for content that should be Posts, Pages, Projects, or block attributes.

## Target Theme Shape

Current structure:

- `parts/header.html`: top reader/status chrome.
- `parts/footer.html`: bottom progress chrome.
- `templates/front-page.html`: canonical homepage composition assembled from reader blocks and section patterns.
- `templates/single.html`: essay reading template.
- `templates/page.html`: stable page reading template.
- `blocks/book-cover/`: cover block.
- `blocks/contents/`: generated/manual contents block.
- `blocks/reader-header/`: top reader/status chrome.
- `blocks/reader-footer/`: bottom progress chrome.
- `blocks/page-chapter/`: pulls a selected Page into a homepage chapter.
- `blocks/projects-chapter/`: pulls project data, initially via the Projects page bridge.
- `blocks/essays-chapter/`: pulls recent Posts into the homepage Essays chapter.
- `blocks/essay-navigation/`: previous/next essay flow.

Block implementation should use normal WordPress block conventions:

- `block.json` per block.
- JS editor registration.
- PHP `render_callback` for dynamic output.
- Inspector controls for attributes such as source page, chapter label, heading, subtitle, and display options.
- Server-rendered editor preview where the frontend output depends on WordPress content.
- Editor-facing fallback states when a source page or project source is missing.

## Content Model

Use WordPress content types by editorial job:

- **Posts**: essays and occasional writing.
- **Pages**: stable narrative content such as About, Blog, Contact/Coda, and possibly Now.
- **Projects**: future `dsg_project` content type in a small site-core plugin.
- **Block attributes**: section labels, chapter labels, display options, and local presentation choices.
- **Global styles/theme.json**: colors, typography, spacing, and style variations.

Do not use PHP theme settings as the main content-management surface. They are too hidden and too rigid for this theme.

## Projects Model

Projects should eventually move out of the current Projects page and into a small sibling plugin.

Recommended plugin shape:

- Register `dsg_project`.
- Register `project_area` taxonomy for groups such as Automattic, Side Projects, AI, Experiments.
- Add fields for project URL, summary, status, featured flag, and manual order.
- Query featured projects for the homepage Works chapter.
- Keep normal project body content available for future project archive/detail views.

Until that exists, `dsg/projects-chapter` can remain a bridge that reads the existing Projects page. The bridge should be treated as transitional.

## Roadmap

### Done: Real Block Registration

The main custom blocks are now real editor-facing blocks with `block.json`, JS editor registration, PHP render callbacks, and editor previews:

- `dsg/book-cover`
- `dsg/contents`
- `dsg/reader-header`
- `dsg/reader-footer`
- `dsg/page-chapter`
- `dsg/projects-chapter`
- `dsg/essays-chapter`
- `dsg/essay-navigation`

The Site Editor should no longer show unsupported custom block notices for the homepage reader blocks.

### Done: Homepage Template Cleanup

The homepage is now mostly composed from reader blocks rather than one large pattern or raw HTML.

- `templates/front-page.html` is now the canonical git-owned homepage composition.
- `dsg/book-cover` and `dsg/contents` replace the cover and table-of-contents raw template markup.
- `dsg/reader-header` and `dsg/reader-footer` replace the header/footer Custom HTML blocks.
- Essays now uses `dsg/essays-chapter` instead of inline Query markup in the front page template.
- Coda now uses `dsg/page-chapter` and pulls editable content from the `coda` Page.

Remaining cleanup:

- Decide homepage template editing boundaries: locked, partially locked, or simply pattern-seeded.
- Replace the remaining ornament-only Custom HTML blocks in `templates/single.html` and `templates/page.html` only if it becomes annoying in the editor.

### In Progress: Ereader UX Polish

The reader now has:

- Header/footer reader chrome.
- Font size and theme controls.
- Better reading-time/progress behavior for homepage, posts, and pages.
- Previous/next essay navigation.
- Desktop keyboard navigation and mobile swipe/edge navigation with a lightweight page-curl affordance.

Remaining scope:

- Simplify the reader settings panel by removing low-value line-height and page-width controls from the visible UI.
- Keep text size, theme, and reset controls.
- Consider sepia only if it fits the palette without cluttering the panel.
- Defer local scroll-position resume unless returning to essays feels bad in real use.
- Later follow-up: make sure the page-curl gesture stays quiet, accessible, and reduced-motion friendly.

Acceptance criteria:

- Reader controls are understandable without explanation.
- Settings affect the full reading experience consistently.
- Mobile and desktop chrome do not crowd the content.
- Progress and resume behavior work across the main templates.

### Next: Projects Content Model

Goal: make Works structured and reusable.

Scope:

- Add sibling `dsg-site-core` plugin.
- Register `dsg_project`, `project_area`, and project fields.
- Migrate current Projects page cards into project posts.
- Update `dsg/projects-chapter` to query structured project content.

Acceptance criteria:

- Project entries are individually editable.
- Works chapter is generated from structured project data.
- Old Projects page can become an archive intro, draft, or redirect target.

### In Progress: Authoring Polish

Goal: make writing and page editing feel intentional.

Progress:

- Editor styles now mirror the reader styling for custom blocks and common core post blocks.
- Fixture posts cover normal writing blocks, media/embed blocks, code/table blocks, and wide/full-width blocks.
- Code snippets, tables, captions, embeds, Cover, Media & Text, and background Group bands have reader-specific handling.

Remaining scope:

- Optional patterns for article openings, notes, and coda/contact sections.
- Keep/refine inline footnote, highlight, and definition formats.
- Consider allowed-block guidance only if the editor feels too open-ended.

Acceptance criteria:

- Writing an essay feels like writing, not layout assembly.
- Stable pages are straightforward to maintain.
- Theme-specific affordances are clearly named and appear only where useful.

## Rename Note

The repo directory, theme stylesheet metadata, package scripts, and local tooling now use `dsg-ereader-theme`.

Some PHP internals and localStorage keys still use older `dsg_ebook_*` / `dsg-ebook-*` names. Treat that as a mechanical cleanup task, not architecture work. Preserve backward compatibility for existing reader preferences if those keys are renamed.

Important rename caveat: changing the WordPress theme directory slug can disconnect Site Editor customizations stored under the old slug. Prefer canonical templates and patterns in git over preserving ad hoc Site Editor edits unless there is a specific customization worth migrating.

## Current Next Steps

1. Decide homepage template locking/editing boundaries.
2. Simplify reader controls by removing line-height and page-width from the visible UI.
3. Start the sibling `dsg-site-core` plugin when ready to model Projects as real content.
4. Keep testing against fixture posts first, then synced staging/live content as regression data.

Later follow-up:

- Reduced-motion/accessibility pass for mobile gestures and the page-curl affordance.
- Local scroll-position resume, only if the current progress/footer behavior is not enough.
- Ornament-only template HTML cleanup, only if the editor friction is noticeable.

Do not restart the classic PHP migration. That direction was intentionally abandoned.

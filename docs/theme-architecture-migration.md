# Theme Architecture Plan

Last updated: 2026-05-10.

## Decision

Keep this as a WordPress block theme, but make it a real purpose-built reader theme instead of a pile of editable template HTML.

The previous classic/hybrid PHP migration spike was reverted. The lesson from that spike still matters: PHP-owned settings were too rigid, but the current block-theme shell is too raw. The target is a block theme with first-class custom blocks, sensible patterns, good editor previews, and structured content sources.

The theme should feel like an ereader on the frontend and like a clear WordPress editing experience in the backend.

## Why

Full Site Editing is still useful here, but only if the custom reader pieces are real blocks.

- Header and footer can remain template parts.
- The homepage can remain a block template or pattern.
- Posts and Pages can stay in Gutenberg.
- Global styles and editor styles are valuable for a reader theme.
- Template editing becomes manageable once theme-specific pieces have block controls and previews.

The current problems come from implementation details:

- Structural elements such as cover metadata, table of contents markup, ornaments, and footer details are partly raw Custom HTML.
- `dsg/page-chapter` and `dsg/projects-chapter` are server render helpers, not mature editor blocks.
- Unsupported custom block notices make the Site Editor feel broken.
- Project data is embedded in one Page instead of modeled as reusable content.

## Product Direction

The site should borrow from traditional ereader UX without pretending the web is a fixed-page device.

Prioritize:

- Reader settings: font family, text size, line height, page width, light/dark/sepia, and reset.
- Reading progress: percent, estimated time left, and chapter/article progress.
- Resume reading: remember last scroll position locally per post/page.
- Contents: generated section links on the homepage and article heading TOCs where useful.
- Chapter navigation: next/previous post flow that feels like moving through chapters.
- Keyboard and mobile gestures: arrow-key navigation on desktop, careful swipe support later if it does not fight native scrolling.
- Reading-mode polish: quieter chrome while scrolling, restored chrome on movement/focus, reduced-motion support.
- Inline authoring formats: keep footnote, highlight, and definition tools.
- Share/citation affordance for essays, if it can stay subtle.

Avoid for now:

- Fake paginated page-turning. It is expensive on the web and likely to create responsive, accessibility, and scroll-restoration bugs.
- Reader-generated notes/highlights unless they are intentionally local-only or backed by a real persistence plan.
- Large settings pages for content that should be Posts, Pages, Projects, or block attributes.

## Target Theme Shape

Recommended structure after the theme rename:

- `parts/header.html`: top reader/status chrome.
- `parts/footer.html`: bottom progress chrome.
- `templates/front-page.html`: assembled from reader blocks and/or a homepage pattern.
- `templates/single.html`: essay reading template.
- `templates/page.html`: stable page reading template.
- `patterns/homepage-reader.php`: default homepage composition.
- `blocks/book-cover/`: cover block.
- `blocks/contents/`: generated/manual contents block.
- `blocks/page-chapter/`: pulls a selected Page into a homepage chapter.
- `blocks/projects-chapter/`: pulls project data, initially via the Projects page bridge.
- `blocks/coda/`: optional; use if Coda needs controls beyond a normal Page chapter.

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

## Phase Plan

### Phase 1: Real Block Registration

Goal: make the current block theme feel legitimate in the editor.

Scope:

- Add real block registration for existing `dsg/page-chapter` and `dsg/projects-chapter`.
- Use `block.json`, editor JS, PHP render callbacks, and server-rendered previews.
- Give each block clear inspector controls.
- Remove unsupported block notices from the Site Editor.
- Keep frontend rendering as close as possible to the current design.

Acceptance criteria:

- Site Editor no longer says the site does not support `dsg/page-chapter` or `dsg/projects-chapter`.
- Users can select each custom block and understand what it does.
- Source page, chapter label, heading, and subtitle can be edited without raw HTML.
- Missing source content produces a useful editor message, not a broken-looking block.

### Phase 2: Homepage Pattern Cleanup

Goal: reduce raw Custom HTML and make the homepage easier to understand.

Scope:

- Create a canonical `patterns/homepage-reader.php`.
- Replace raw HTML sections with purpose-built blocks or clean core blocks.
- Keep cover/contents/coda editable as blocks, not PHP settings.
- Decide whether the front page template should be locked, partially locked, or simply pattern-seeded.

Acceptance criteria:

- Editing the homepage feels like editing reader sections, not raw implementation markup.
- The default pattern can recreate the homepage from git.
- Template markup remains readable and maintainable.

### Phase 3: Ereader UX Polish

Goal: make the reader controls feel intentional and durable.

Scope:

- Refine reader settings panel.
- Add line-height and page-width controls if they improve readability.
- Add sepia if it fits the palette.
- Persist per-page reading position locally.
- Improve progress behavior across homepage, posts, and pages.
- Add next/previous chapter navigation for posts.

Acceptance criteria:

- Reader controls are understandable without explanation.
- Settings affect the full reading experience consistently.
- Mobile and desktop chrome do not crowd the content.
- Progress and resume behavior work across the main templates.

### Phase 4: Projects Content Model

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

### Phase 5: Authoring Polish

Goal: make writing and page editing feel intentional.

Scope:

- Editor styles for Posts, Pages, and custom blocks.
- Optional patterns for article openings, notes, and coda/contact sections.
- Keep/refine inline footnote, highlight, and definition formats.
- Consider allowed-block guidance only if the editor feels too open-ended.

Acceptance criteria:

- Writing an essay feels like writing, not layout assembly.
- Stable pages are straightforward to maintain.
- Theme-specific affordances are clearly named and appear only where useful.

## Rename Note

The user plans to rename the theme before the next architecture pass.

Expected target name: `dsg-ereader-theme`.

The repo directory and local tooling now use `dsg-ereader-theme`. Some PHP internals still use the older `dsg_ebook_*` names; treat that as a mechanical cleanup task, not architecture work.

Important rename caveat: changing the WordPress theme directory slug can disconnect Site Editor customizations stored under the old slug. Prefer canonical templates and patterns in git over preserving ad hoc Site Editor edits unless there is a specific customization worth migrating.

## Next Session Pickup

Start here after the rename:

1. Confirm the renamed repo/theme is clean with `git status --short`.
2. Confirm WordPress sees it as a block theme with `wp_is_block_theme()`.
3. Inventory existing custom block renderers in `functions.php`.
4. Implement Phase 1 for `dsg/page-chapter` and `dsg/projects-chapter`.
5. Verify the Site Editor no longer shows unsupported block notices.

Do not restart the classic PHP migration. That direction was intentionally abandoned.

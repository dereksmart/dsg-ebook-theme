# Theme Roadmap

Last updated: 2026-05-11.

This is the canonical planning document for `dsg-ereader-theme`. Keep it short, current, and ordered by what should happen next.

## Direction

- Keep this as a WordPress block theme.
- Build a real reader-shaped site, not a classic PHP shell and not a pile of raw template HTML.
- Use purpose-built custom blocks for reader sections, chrome, and dynamic content.
- Use fixture content to design the target editing/reading experience.
- Use synced staging/live content only as regression data.
- Keep Projects as a temporary page bridge until a sibling site-core plugin owns structured project content.

## Design Direction

- The visual model is a quiet Kindle-style reader: e-ink palette, literary typography, fixed reader chrome, generous margins, and restrained decoration.
- The metaphor should be strong but not gimmicky. Borrow progress, contents, chapters, subtle page movement, footnotes, highlights, and reading controls; do not fake a device at the expense of normal web reading.
- Interactions should feel delightful and quiet: page-curl gestures, progress feedback, popovers, and highlights should help someone consume the content, not compete with it.
- The site should still feel personal. Editorial details, coda/contact copy, footnotes, definitions, and highlights are part of the voice.
- Projects and essays should stay scannable. Reader mood should not turn every section into undifferentiated prose.

## Current State

- The active theme workstream is `dsg-ereader-theme`.
- `templates/front-page.html` is the canonical homepage composition.
- Homepage sections are real blocks: cover, contents, page chapters, projects bridge, essays chapter, reader header/footer.
- Single posts have reader chrome, reading progress, previous/next essay navigation, keyboard navigation, and mobile swipe/edge navigation with a lightweight page-curl affordance.
- Editor-facing fixture posts cover common writing blocks, media/embed blocks, code/table blocks, and wide/full-width blocks.
- Inline authoring formats exist for footnote, highlight, and definition.

## Next Work

1. Decide homepage template editing boundaries.

   Determine whether `templates/front-page.html` should be locked, partially locked, or left editable. The goal is to protect the reader structure without making normal content edits frustrating.

2. Simplify reader controls.

   Remove visible line-height and page-width controls from the reader settings UI. Keep the useful controls: text size, theme, and reset. The authored design should stay tuned by the theme, not by a crowded settings panel.

3. Start the Projects content model.

   Create a sibling `dsg-site-core` plugin when ready. Projects should be their own `dsg_project` content type, not regular Posts with a category, because they need custom fields/embeds and eventually their own reader-style previous/next navigation. The plugin should eventually register `dsg_project`, `project_area`, and project fields such as URL, summary, status, featured flag, and manual order. Until then, `dsg/projects-chapter` remains a temporary bridge over the current Projects page.

4. Keep fixture-first coverage current.

   Add or adjust fixture content only when a real block/content shape exposes a gap. Do not overfit the theme to the current live Projects page or staging content shape.

## Later Follow-Ups

- Reduced-motion/accessibility pass for mobile gestures and the page-curl affordance.
- Decide whether highlights remain author-authored editorial marks only, or whether reader-created local highlights should exist.
- Local scroll-position resume, only if the current progress/footer behavior is not enough.
- Ornament-only template HTML cleanup, only if it causes editor friction.
- Optional patterns for article openings, notes, and coda/contact sections.
- Share/citation affordance for essays, if it can stay subtle.

## Reference Notes

- Content model: Posts are essays/writing. Pages are stable narrative chapters. Projects should become `dsg_project` records in a sibling plugin so they can be queried, embedded, and navigated as their own reader flow. Block attributes should hold section labels and presentation choices.
- Fixture workflow: `npm run env:seed` resets local pages/posts and creates target UX fixtures. `npm run env:seed:staging` syncs staging-shaped content for regression checks.
- Current staging/live content note: `about` is the canonical author chapter; `about-2` appears to be duplicate legacy content; the current `projects` page is a temporary source.
- Rename FYI: the theme slug is now `dsg-ereader-theme`. Some internal PHP/localStorage names still say `dsg_ebook` or `dsg-ebook`; clean them up mechanically later and preserve reader preference compatibility if keys change.
- Do not restart the classic PHP migration. That direction was intentionally abandoned.

# Authoring the portable starter

The starter is self-contained and uses bundled reveal.js (MIT license retained in `vendor/LICENSE`). No CDN, Node runtime, Python package or RoboEden file is needed to build it: `build.py` uses the Python standard library. Browser checking optionally uses Playwright.

Neutral examples are shown in [template-layouts.png](template-layouts.png). Report-specific media and numbers are not included in the starter.

## Editable source

`deck.json` has `title` and `slides`. Text supports `**bold**`; all ordinary text is escaped. `notes` becomes a reveal.js speaker note. Page numbers are generated from the final order.

| Type | Useful fields | Behavior |
| --- | --- | --- |
| `cover` | `title`, `subtitle`, `author`, `date` | Minimal cover; rule below subtitle |
| `question` | `title` | Centered question, no title rule |
| `closing` | `title`, `invite` | Centered name and invitation |
| `bullets` | `title`, `items`, `reveal: "click"` | One short bullet per click; omit `reveal` to show all |
| `cards` | `cards: [{title,value,caption,click}]`, `reveal` | Equal four-card grid; explicit `click` selects order |
| `comparison` | `cards: [{title,media}]` | Two centered names and visuals |
| `media` | `media`, optional `shrink_note` | Large media; click shrinks and moves it before caption appears |
| `media-focus` | `media`, `motion_key`, `compact`, `annotation` | Matched large/compact views across adjacent pages |
| `pipeline` | Four `stages: [{title,items,color}]` | Each click shows one complete stage; grouped elements appear together |
| `overview` | Three `cards: [{key,title,color}]`, `focus_key` | Title may be a two-line array |
| `detail` | `focus_key`, `panel_title`, two `cards: [{title,items,color}]` | Matched expansion; single-line panel title, two click reveals |
| `code` | `filename`, `text_file` or `text`, optional `scroll_ms` | Full dark monospace pane; auto-scroll stops on exit |
| `custom` | `html_file` or `html` | Trusted author-created HTML/SVG for project-specific layouts |

The built-in types are examples, not a restriction on the user's requested diagram. Extend `build.py` or use `custom` when a new layout materially improves the result. Keep per-deck adaptations in the deck copy. Do not hardcode a research repository into the canonical skill.

## Media and code

A media object uses `kind: "image"` or `"video"`, `src`, and `alt`. Shared videos need the same `id` on each page. Local paths are relative to `deck.json`; build embeds bytes into the output HTML. HTTP/data URLs are retained as URLs and may require network access. Missing local media is a build error, not a silent broken image.

`media/demo.mp4` is explicitly synthetic and shows a timer; it is not an experiment. `media/illustration.svg` is an illustrative diagram. Replace them for real reports. Remove unused sample assets from final project copies when appropriate.

Keep both views when asked for dual-camera recordings. Extract action/task intervals from actual step/frame mappings; record source, scope, status, crop, speed and duration in a provenance file. Playback simulation time is not wall-clock runtime. Full-task success needs a full-task result, not one successful skill. Keep unsuccessful/unavailable slots empty when requested.

For prompts, place the entire text in `text_file`. A saved request and current static instructions are different sources; label them in notes rather than claiming an exact historical combined prompt. Set `scroll_ms` to an actual duration (e.g. 8500 ms + 600 ms entry pause for finishing within 10 s). Avoid tiny unreadable text just to fit the complete prompt on one screen.

For costs, separate calendar elapsed time, active work and runtime. Prefer a first-push reflog when asked for first remote submission, rather than substituting the first commit timestamp. Break runtime into measured non-overlapping wall-time components; label the residual “Other / unmeasured.” Quota percentage is not dollar expenditure; keep user-reported plan/usage assumptions in notes.

## New custom diagrams

Use native inline SVG for small/medium program and system diagrams, not an image-generator dependency. Put diagrams in `<svg class="slide-diagram" viewBox="0 0 1280 720">`. Use `<image>` or `<foreignObject>` for real pictures/video, preserving correspondence and source identity. Avoid uncontrolled reuse of `id` values across inline SVGs; give clip paths/markers page-local prefixes.

Keep labels at a readable size by adjusting layout and selectively condensing minor details. A complex flow should retain its decisions, retries and failure exits; do not arbitrarily merge all branches into a linear pipeline. A supplementary complete graph/source manifest can preserve details omitted from the visible slide.

To merge panels into a unified library, keep the final geometry in its destination page, use stable keys to match module groups, and animate old-to-new translations/scales. Backgrounds may merge separately; reveal newly added structural content after the movement. Avoid cloning hidden ancestors or leaking temporary video clones.

## Review and delivery

Open `template.html` for the ready-to-review archetypes. `scripts/new_deck.py` copies the complete starter and the builder into a new directory; it refuses to overwrite nonempty directories. Then edit `deck.json` and build `slides.html`.

Optional check:

```bash
NODE_PATH=/path/to/node_modules node /path/to/skill/scripts/check_deck.cjs /absolute/path/slides.html
```

Use the bundled Node/Playwright paths from the environment's dependency loader when available. Inspect representative rendered pages in addition to browser checks. No check can decide whether a figure actually supports a scientific claim.

The skill lives in the user-selected custom collection. Refer to its absolute `SKILL.md` path in future tasks if the client has not discovered it. Do not claim Template Gallery registration or automatic global discovery.

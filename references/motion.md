# Motion distilled from the reference deck

The defaults describe the user's presentation style, not universal restrictions on other tasks.

## Click stages

Separate “one click per stage” from “sequential appearances within a click.” Removing subgroup delays must not reduce the number of clicks. Elements sharing `data-fragment-index` enter together; explicit `--reveal-delay` is reserved for a requested within-click sequence. Preserve the established order when editing an existing page.

Reveal fragments are hidden until `.visible`. Check the **fragment** class as well as visibility when deciding whether video should play; final overview copies may retain layout classes without being real fragments.

## Matched content

Use ordinary fade at unrelated boundaries; use geometry motion only for a matched pair. If a page has `data-transition="none"`, it must not accidentally cause unrelated incoming/outgoing boundaries to hard-cut. The runtime chooses the mode per navigation using `beforeslidechange`.

For related media views, native reveal.js auto-animation can preserve elements with the same `data-id` and `data-auto-animate-id`. Existing title rules and page numbering remain static.

For an expanded focus frame, map the destination rectangle back to the old rectangle:

```text
sx = old.width / new.width
sy = old.height / new.height
dx = old.x - new.x * sx
dy = old.y - new.y * sy
from: translate(dx,dy) scale(sx,sy)
to: identity
```

Use origin `(0,0)` in the 1280×720 SVG coordinates. Time the new detail body after the frame settles (about 0.9 s), then its 400 ms entrance. Do not add a second fade to a persistent element already moving.

During focus folding, the user's latest convention is: internal content disappears immediately; frame and title shrink. If a title lands on two lines, keep the source heading single-line until the fold starts. Measure each word's original SVG glyph position, clone just those words, move/scale them independently to the destination baselines, and replace them with the real final label only after matching it exactly. The starter does this in both expansion and folding.

For a caption under a shrinking diagram/media group: movement ~750 ms, caption delay ~900 ms, then fade/up ~400 ms. Preserve the same media nodes rather than creating new videos.

## Playback and cancellation

- Same recording across pages: stable `data-id`; save outgoing time before pausing and restore incoming time after metadata is ready. Run after reveal.js navigation handling so its automatic pause does not override playback.
- Hidden fragments: no playback; play when shown, stop when hidden. Do not let hidden duplicate media race with a shared timestamp.
- Fullscreen preview: pause the original, start the preview at its time, restore the preview's current time to the original on exit. Resume only if its slide is still current and it was playing.
- Scope delayed callbacks to a navigation epoch/current page. Cancel RAFs/timers and remove temporary clones on navigation and completion. A scroll animation must stop on exit and reset on re-entry.
- Rapid next/back clicks must not leave target labels permanently hidden, duplicate frames, playing hidden media, or revived old callbacks.

## Observable checks

1. First entry: no premature fragments/media.
2. One click: only the intended group appears; subgroup delays match the request.
3. Mid-movement: source content has continuity, no unintended duplicate/fading title.
4. Settled state: exact alignment, no hidden inline targets or leftover clones.
5. Reverse navigation: correct frame/title movement and shared video continuity.
6. Fullscreen open/close: no slide advancement; time remains continuous.
7. Fast navigation: stale effects do not reappear.

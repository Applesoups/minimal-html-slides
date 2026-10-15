---
name: minimal-html-slides
description: Create or edit concise English HTML presentations in Wenjing's minimal white-and-black style, with diagrams, staged reveals, smooth focus transitions, and continuous video playback. Use for internal progress reports and reusable HTML slide templates; output landscape HTML rather than PPTX unless the user asks otherwise.
---

# Minimal HTML slides

Use this skill for this user's slide style. Current user instructions override these defaults. Keep it independent of any research repository or subject matter.

## Start or continue

- For an existing deck, inspect its source and current rendered page, then edit that source. Preserve completed content, established click stages, and video identity.
- For a new deck, use the portable starter in [assets/template](assets/template). `template.html` is a ready-to-open example; `deck.json` is editable source.
- Create the user's deck in their requested output directory, keeping this skill's canonical starter unchanged during ordinary report work:

```bash
python3 /absolute/path/to/minimal-html-slides/scripts/new_deck.py /absolute/path/to/new-deck
cd /absolute/path/to/new-deck
python3 build.py deck.json --output slides.html
```

- Start from the requested scope. If the user supplies one page at a time, implement that page and let them inspect it. Correct spelling, capitalization and basic English grammar automatically. Do not rewrite scientific meaning without evidence.
- Use [references/authoring.md](references/authoring.md) for slide types, media, custom SVG, code panes, evidence and delivery. Read [references/motion.md](references/motion.md) before modifying staged or matched animations.

## Visual system

- English; white background; black text; very few words. Prefer short phrases, diagrams and real visuals. Full prompt/code text is an intentional exception: keep it complete and scrollable.
- 1280 × 720, landscape. Main titles 36 px at `(80, 65)`; thin rule at `y=124`. Body typically 28–30 px, module labels about 18–24 px. Use selective bold emphasis.
- Center question and closing pages; omit their title rule. Default closing name 56 px, invitation 42 px. Keep typography consistent across pages; adapt to actual content rather than shrinking everything to fit.
- Diagrams use light solid fills, rounded corners and thin gray connectors. Use decision diamonds and explicit branches when presenting program control flow.
- Reuse accurate images/video from source evidence where helpful. Use functional schematics when no real output exists and keep that distinction in speaker notes. Do not fabricate success demonstrations or silently replace a requested object/task.

## Interaction and motion

- Clicking blank slide space advances a fragment or page. Media clicks open a viewport-filling preview; ×, Esc or the backdrop closes it. Keep media interactions separate from navigation.
- Ordinary page changes fade. Related views move/scale persistent elements instead of disappearing and reappearing.
- New content enters with a 400 ms ease-out fade and subtle 10 px upward motion. Preserve the user's click groups; elements within one click appear together by default. Apply sequential delays only when explicitly requested or needed after a preceding motion completes.
- Expand/fold frames over roughly 850–900 ms. Reveal new detail content after the frame settles. For advanced/action-style folding, internal contents disappear at fold start; frame and title shrink back.
- A single-line heading may split into independently moving words *during folding* to land on a two-line card. Do not split the original detail-page heading merely to simplify its animation.
- Shared videos use a stable `data-id`. Preserve playback position on page navigation and on preview open/close. Start hidden media when revealed; pause outgoing/hidden media. Cancel animation timers/clones on navigation.
- When a diagram/media group shrinks upward and gains a caption, show the caption after the movement, not during it. The starter's `shrink_note` implements this pattern.

## Check and deliver

Build and render the modified pages; click through the actual reveal stages and adjacent page transitions. Check backward navigation, media enlargement/exit, ongoing playback, and fast navigation during custom motion. Inspect text fit, image correspondence and final settled states. Use the optional browser checker in [scripts/check_deck.cjs](scripts/check_deck.cjs) when Playwright is available; it reports real browser issues rather than proving the design is attractive.

Keep a brief `speaker-hints.md` when useful: a few lines per page, technical caveats/provenance there rather than cluttering the slide. Verify links. Delete disposable screenshots/test copies after consolidating needed previews. Preserve original evidence and final editable source.

Return the HTML and any requested notes. Explain only relevant limits. A standalone HTML should work offline. Start a LAN server only when requested; bind the host's verified LAN address, serve the intended output folder, and test the actual URL. Do not publish or register/install this skill globally just because a deck was created.

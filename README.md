# Trip 01 Bali

Compact offline trip planner rebuilt from a Traveloka saved-list snapshot, with embedded thumbnails, Google-review context, AI access notes, comparison guidance, a custom note column, and local archive support.

## What is included

- `trip-curated.html`
  Standalone planner with embedded thumbnails, saved views, saved lists, Google review labels, `Insights`, `Comparison`, a rightmost `Custom Note` column, per-row archive buttons, and export buttons for `HTML`, `HTM`, `PDF`, and `PNG`.
- `8fd62a39-514e-472c-ad51-2f8d48898bd3.htm`
  Original saved page snapshot used as a fallback image source.
- `data/`
  Extracted live snapshot data, Google-place cache, and enriched planner data.
- `scripts/`
  Traveloka extractor, Google-place cache extractor, builder, UI runtime, styles, and vendored export libraries.

## Main behavior

- Column order is `Location`, `Category`, `Insights`, `Comparison`, `List`, `Custom Note`.
- Default sorting is `Location > Category > List Name`.
- Each row has an archive button beside the checklist.
  Archived rows disappear from the default `Active` view and can be restored from the `Status` filter.
- Thumbnails are embedded as `data:image/...` values so the planner works without hotlinking Traveloka images at runtime.
- Each row includes:
  - Google Maps label with rating/count when Google exposed a usable place match
  - AI access note, people-summary, walk/slope/stairs/transport facts, and five percentage scores
  - comparison guidance against similar saved-list alternatives
- The `Custom Note` column is editable.
  Notes are stored in browser local storage while you type.
  Use `Save Planner HTML` in the toolbar to download a new standalone planner file with the current note text and archive state embedded into the HTML itself.
- The toolbar is non-sticky.

## Rebuild

```bash
node scripts/extract_google_place_cache.mjs
node scripts/build_trip_assets.mjs
```

Notes:

- `scripts/extract_google_place_cache.mjs` uses the Playwriter Chrome extension connection and writes `data/google_place_cache.json`.
- If the Google cache already exists, the extractor resumes only missing rows. Use `--refresh` to rebuild the full cache or `--limit=20` for smaller batches.
- The builder consumes the cached Google data plus the Traveloka snapshot and emits the standalone HTML.

## Open locally

Direct open:

```bash
xdg-open trip-curated.html
```

Local server:

```bash
python3 -m http.server 8787 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8787/trip-curated.html`.

## Source data notes

- Live row data comes from the extracted Traveloka saved-list snapshot in `data/live_snapshot.json`.
- Google-place enrichment comes from `data/google_place_cache.json`.
- Location/category/insight/comparison enrichment is built into the generator.
- Thumbnail fallback order is:
  live snapshot image, saved `htm` snapshot image, direct Traveloka image override/page metadata.

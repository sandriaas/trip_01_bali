# Trip 01 Bali

Compact offline trip planner rebuilt from a Traveloka saved-list snapshot.

## What is included

- `trip-curated.html`
  Standalone planner with embedded thumbnails, saved views, saved lists, and export buttons for `HTML`, `HTM`, `PDF`, and `PNG`.
- `8fd62a39-514e-472c-ad51-2f8d48898bd3.htm`
  Original saved page snapshot used as a fallback image source.
- `data/`
  Extracted live snapshot data plus enriched planner data.
- `scripts/`
  Extractor, builder, UI runtime, styles, and vendored export libraries.

## Main behavior

- Column order is `Location`, `Category`, `List`.
- Default sorting is `Location > Category > List Name`.
- Thumbnails are embedded as `data:image/...` values so the planner works without hotlinking Traveloka images at runtime.
- The toolbar is non-sticky.

## Rebuild

```bash
node scripts/build_trip_assets.mjs
```

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
- Location/category enrichment is built into the generator.
- Thumbnail fallback order is:
  live snapshot image, saved `htm` snapshot image, direct Traveloka image override/page metadata.

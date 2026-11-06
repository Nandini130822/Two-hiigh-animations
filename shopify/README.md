# TWO HIIGH try-on section for Shopify

A scroll try-on carousel as an Online Store 2.0 section. The model stands in the middle; on each scroll the piece he is wearing slides off and the next one slides on. No apps and no JavaScript libraries.

## Files

```
sections/
  two-hiigh-tryon.liquid        the section (markup + theme editor settings)
assets/
  two-hiigh-tryon.css           styles
  two-hiigh-tryon.js            scroll logic
  tryon-body.webp               built-in image: the model without a piece
  tryon-worn1..5.webp           built-in images: each piece as worn
  tryon-flat1..5.webp           built-in images: flat product shots
```

## Install

1. Copy `sections/two-hiigh-tryon.liquid` into the theme's `sections/` folder.
2. Copy everything in `assets/` into the theme's `assets/` folder (13 files). The file names must stay as they are.
3. In the theme editor, open the template that should show it, choose **Add section → TWO HIIGH try-on**, and save.

With Shopify CLI, from the theme folder:

```bash
shopify theme push --only sections/two-hiigh-tryon.liquid --only "assets/two-hiigh-tryon.*" --only "assets/tryon-*"
```

The section adds itself with its 5 pieces and built-in images, so it works straight after step 3.

## Theme editor settings

**Section**

| Setting | What it does |
|---|---|
| Small label, Heading line 1 and 2, Text under the heading | The text on the left |
| Heading level | H1, H2, H3 or paragraph. Default is H2, so the page keeps a single H1 |
| Counter label | The word in front of the number, bottom left ("Piece 01") |
| Sticky header height (desktop / mobile) | Space left at the top for a sticky header. Set both to 0 if the header is not sticky |
| Scroll distance per piece | How much scrolling each piece takes. Higher feels slower |
| Model without a piece | Optional upload that replaces the built-in model image |
| Font | "Same as the theme" (default) or "Boogaloo (Google Fonts)" |
| Background, Text | Colours |

**Piece block** (up to 8)

| Setting | What it does |
|---|---|
| Name | Used as the image description |
| Built-in images | Which built-in set (1 to 5) to use for any image left empty |
| Piece as worn / Flat product shot | Upload to replace the built-in images for this piece |

## Things to check in the theme

1. **`overflow` on a parent.** The section pins with `position: sticky`. If a parent element has `overflow: hidden`, `overflow: auto` or `overflow-x: hidden`, it will not pin. Many themes set `overflow-x: hidden` on `body` or a main wrapper; change that to `overflow-x: clip`, which keeps the same look and does not break sticky.
2. **Sticky header height.** Set the two header-height settings to the real height of the theme's sticky header, so the label at the top is not hidden behind it.
3. **Smooth-scroll libraries.** If the theme uses a scroll library (Lenis, Locomotive Scroll and similar) that replaces native scrolling, the section's one-piece-per-swipe handling will conflict with it. Exclude this section from the library or turn the library off on this template.
4. **Font.** With "Same as the theme" the section uses whatever font the theme applies to the page. If the store font is Boogaloo, nothing else is needed. Choose "Boogaloo (Google Fonts)" only if the theme does not load Boogaloo itself.

## Adding or replacing a piece

All images share one canvas (800 × 1165 px), so they line up:

- **Model without a piece** (one image for the whole section): head, arms, plain vest and jeans, transparent background.
- **Piece as worn** (per piece): only the piece, cut out exactly as he wears it in a photo of the same pose, transparent background.
- **Flat product shot** (per piece): the product on a transparent background, placed roughly where he wears it.

A "piece as worn" image laid over the model image must look like him wearing that piece. Keep the vest on the model image smaller than every piece, or it will show around a piece's edges.

## How it was checked

- Shopify Theme Check (`shopify theme check`, CLI 3.70): **no offenses**.
- The schema is valid JSON; every setting used in the Liquid is defined, and every defined setting is used.
- The Liquid was rendered with a Liquid engine (LiquidJS, with stand-ins for Shopify's `asset_url`, `image_url` and `stylesheet_tag`) in three configurations: default, heavily customised (3 pieces, uploaded images, other colours and text, H1) and no pieces. The rendered pages were run in Chrome at desktop and phone size: no console errors, no missing images, correct piece count and scroll length.
- Theme editor events (`shopify:section:load`, `shopify:block:select`) were simulated: the section re-initialises after a re-render, and selecting a piece block scrolls to that piece.

It has **not** been installed in a real Shopify store, so check it once in the theme editor and on a phone after installing. The four points under "Things to check in the theme" are the ones that depend on the theme.

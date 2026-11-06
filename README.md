# TWO HIIGH: scroll try-on carousel

A scroll animation in plain HTML, CSS and JS with **no libraries and no Shopify**, so it works on any website. All text uses the site font, **Boogaloo**.

**Try-on carousel** (`jacket-carousel/`): the model stands in the middle. On each scroll, the piece he's wearing slides off his body and the next one slides on (01 → 05: three tees and two sleeveless tees). Pieces waiting at the sides look exactly as they do on him, front only. One swipe moves exactly one piece, and if scrolling stops in between, it finishes the move by itself. The section stays pinned on screen for about 5 screen-heights of scrolling, then the page scrolls on normally.

> The jacket-zip animation ("TWO HIIGH" behind the opening jacket, with the hero video) is removed for now. It's saved in git history at commit `65a570b`, so it can be added back exactly as it was.

## Files

```
jacket-carousel/
  jacket-carousel.css
  jacket-carousel.js
  section.html             ← HTML to paste into your page
  assets/  body.webp (the model without a piece), front.webp (his forearms and hands, drawn over the pieces), worn1–5.webp (each piece as worn, front only)
index.html                 ← demo page with the carousel and the site nav
```

## Adding it to your website

1. Copy the `jacket-carousel` folder into your website project, next to the page that gets the animation.
2. Add these to that page:

**In `<head>`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Boogaloo&display=swap" rel="stylesheet">
<link rel="stylesheet" href="jacket-carousel/jacket-carousel.css">
```

**In the body, where the section should appear:** paste everything from `jacket-carousel/section.html`.

**Just before `</body>`:**
```html
<script src="jacket-carousel/jacket-carousel.js"></script>
```

If the folder ends up somewhere else (for example `/assets/`), change these paths and the `src=` paths in the pasted HTML to match.

When you later replace these files with a newer version, replace the HTML, CSS and JS together, and add a version to the links (for example `jacket-carousel.js?v=2`) so browsers don't pair an old cached script with new HTML.

### If your site is built with…

- **WordPress:** upload the folder to your theme (or the Media Library). Paste the section into a *Custom HTML* block and add the CSS/JS links in the theme header and footer, or with a plugin like *WPCode*. Use the full URLs of the uploaded files in the `src=` attributes.
- **Webflow / Wix / Framer:** upload the images to the site's assets. Paste the section into an *Embed* element and replace the `src=` paths with the asset URLs. Put the CSS inside `<style>…</style>` in the page's head code, and the JS inside `<script>…</script>` in its footer code.
- **React / Next.js:** put `assets/` under `public/jacket-carousel/`, import the CSS, render the section's markup as JSX (`class` → `className`), and load the JS once after mount, for example with `<Script src="…" />` in Next.js.

## Customising

| Want to change | Where |
|---|---|
| Scroll length | `--jc-length: 600vh;` in `jacket-carousel.css` (about 1 screen-height per piece) |
| Header height it leaves room for | `--jc-top: 64px;` in `jacket-carousel.css` (set to `0` if your site has no fixed header) |
| Font | `font-family` on `.jc` in `jacket-carousel.css` |
| Smoothness | `SMOOTHING` at the top of `jacket-carousel.js` (lower = floatier) |
| Time between steps | `WHEEL_LOCK_MS` at the top of `jacket-carousel.js` |
| How soon a stopped scroll snaps to a piece | `SNAP_DELAY_MS` at the top of `jacket-carousel.js` |
| Heading and tagline text | `.jc__eyebrow` and `.jc__copy` in the pasted HTML |

## Changing the pieces

All images share one 800 × 1165 canvas so they line up:

- `body.webp`: the model without a piece (head, arms, plain vest, jeans), transparent background. One image, used for every piece.
- `front.webp`: only his forearms and hands, cut from `body.webp`. It is drawn over the pieces, so a piece can be a whole shape and still sit behind his hands.
- `wornN.webp`: only piece N, cut out exactly as he wears it in the photo, completed where his hands were in front

`wornN` laid over `body.webp` must look like him wearing piece N. Because the body never changes, his arms and hands stay the same while pieces slide on and off. To add or remove a piece, add or remove its `<div class="jc__item">` in the HTML, update the `05` in `.jc__counter-total`, and adjust `--jc-length` (about 100vh per piece, plus 100vh).

## Common problems

- **The section doesn't stick or pin:** a parent element probably has `overflow: hidden` or `overflow: auto`, which breaks `position: sticky`. Remove it from the section's parent elements.
- **Images don't show:** a path is wrong. Open the browser's DevTools (F12) → *Console* and look for 404 errors.
- **Testing locally:** opening `index.html` by double-clicking works, or run a small local server in the folder:

```bash
python -m http.server 5173
```

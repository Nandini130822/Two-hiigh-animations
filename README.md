# TWO HIIGH: scroll animations

A scroll animation in plain HTML, CSS and JS with **no libraries and no Shopify**, so it works on any website. All text uses the site font, **Boogaloo**.

**Jacket Collection carousel** (`jacket-carousel/`): the model sits in the middle and each scroll step swaps to the next piece (01 → 05: three tees and two tanks). The section stays pinned on screen for about 5 screen-heights of scrolling, then the page scrolls on normally.

> The jacket-zip animation ("TWO HIIGH" behind the opening jacket, with the hero video) is removed for now. It's saved in git history at commit `65a570b`, so it can be added back exactly as it was.

## Files

```
jacket-carousel/
  jacket-carousel.css
  jacket-carousel.js
  section.html             ← HTML to paste into your page
  assets/  model-vest.webp, tee1–5.webp (worn layer), tee1–5-back.webp (back collar + label)
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
| Time between jacket steps | `WHEEL_LOCK_MS` at the top of `jacket-carousel.js` |

## Common problems

- **The section doesn't stick or pin:** a parent element probably has `overflow: hidden` or `overflow: auto`, which breaks `position: sticky`. Remove it from the section's parent elements.
- **Images don't show:** a path is wrong. Open the browser's DevTools (F12) → *Console* and look for 404 errors.
- **Testing locally:** opening `index.html` by double-clicking works, or run a small local server in the folder:

```bash
python -m http.server 5173
```
